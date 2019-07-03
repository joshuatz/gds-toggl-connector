import 'google-apps-script';
import {getUserApiKey} from './auth';
import { TogglApi, usedTogglResponseTypes, usedToggleResponseEntriesTypes } from './toggl';
import { Converters, recurseFromString, myConsole, DateUtils, Exceptions, CacheWrapper } from './helpers';
import { responseTemplate } from './toggl-types';

/**
 * @author Joshua Tzucker
 * @file main.ts
 * Note: @override is used to denote function that is required and expected by connector implementation
 * REMINDER: DO NOT USE 'GoogleAppsScript' in a way that will force it to show up in generated JS. Should only be used as interface; does not actually exist as obj in GAS online.
 *      - That is why I have called some enums at the start and stored as var, so they can be referenced instead
 * @TODO - How to deal with currency?
 *      - I could always return USD, and leave it up to user to know what their Toggl setting is and convert on their own...
 *      - I have to tell GDS the currency in advance, so if I wanted it to be dynamic based on Toggl setting, I would have to make double API calls...
 *      - Messy but reliable option: make a field for every single currency Toggl might return, and then map based on response
 * @TODO - Implement caching
 * @TODO - handle "alltime" query?
 */

 /**
  * make sure to grab enum from DataStudioApp, not GoogleAppsScript, since that won't exist in GAS online
  */
let fieldTypeEnum = DataStudioApp.createCommunityConnector().FieldType;
// https://developers.google.com/datastudio/connector/reference#defaultaggregationtype
let aggregationTypeEnum = DataStudioApp.createCommunityConnector().AggregationType;

interface SchemaRequest {
    "configParams" : object,
    "scriptParams" : object
}

interface FieldObjNameOnly {
    "name" : string
}
/**
 * https://developers.google.com/datastudio/connector/reference#request_example_3
 * Note: Fields correspond to names provided by getSchema/getFields
 */
interface GetDataRequest {
    "configParams"?: {
        [index:string]: any
    },
    "scriptParams"?: {
        "sampleExtraction"?: boolean,
        "lastRefresh"?: string
    },
    "dateRange": {
        "startDate": string,
        "endDate": string
    },
    "fields": Array<FieldObjNameOnly>
}

interface DataReturnObjRow {
    "values" : Array<any>
}

interface GetDataReturnObj {
    "schema" : Array<{}>|Array<DataStudioFieldBuilt>,
    "rows" : Array<DataReturnObjRow>,
    "cachedData" : boolean
}

// https://developers.google.com/datastudio/connector/reference#datatype
enum DataStudioSchemaDataType {
    'STRING',
    'NUMBER',
    'BOOLEAN'
}

// https://developers.google.com/datastudio/connector/semantics
// This should be an obj output, per field, as result of Fields.build()
interface DataStudioFieldBuilt {
    dataType: DataStudioSchemaDataType,
    name: string,
    label: string,
    descrption?: string,
    isDefault?: boolean,
    semantics: {
        conceptType: 'DIMENSION'|'METRIC',
        semanticType: GoogleAppsScript.Data_Studio.FieldType,
        semanticGroup?: GoogleAppsScript.Data_Studio.FieldType,
        isReaggregatable?: boolean
    }
}

/**
 * Some app-wide constants
 */
const AUTH_HELP_URL:string = 'https://toggl.com/app/profile';
const APIKEY_STORAGE:string = 'dscc.key';
const IS_DEBUG:boolean = true;
const APP_USER_AGENT:string = 'https://github.com/joshuatz/gds-toggl-connector'
const VALUE_FOR_NULL:any = '';

/**
 * MAIN - Setup globals
 */
// init connector
var cc = DataStudioApp.createCommunityConnector();
// Create global instance of toggl api class
var USER_API_TOKEN = getUserApiKey();
export var togglApiInst = new TogglApi(USER_API_TOKEN);

/**
 * @override
 * This is used by Data Studio to build the configuration UI screen that the user enters settings on first run
 */
function getConfig() {
	// Get config obj provided by gds-connector
    let config = cc.getConfig();

    // Set config general info
	config.newInfo()
        .setId('instructions')
        .setText('Configure the connector for Toggl');

    // Require workspace ID (necessary for all report API calls)
    // Get list of workspace IDs that the user has access to
    let foundWorkspaces = false;
        try {
            let workspaceResponse = togglApiInst.getWorkspaceIds();
            if (workspaceResponse.success && Array.isArray(workspaceResponse.raw)){
                let workspaceArr:any[] = workspaceResponse.raw;
                let workspaceSelectConfigField = config.newSelectSingle()
                    .setId('workspaceId')
                    .setName('Toggl Workspace')
                    .setHelpText('Select the Workspace to pull data from')
                    .setAllowOverride(false);
                for (let x=0; x<workspaceArr.length; x++){
                    let currWorkspace = workspaceArr[x];
                    workspaceSelectConfigField.addOption(config.newOptionBuilder().setLabel(currWorkspace.name).setValue(currWorkspace.id.toString()));
                }
                foundWorkspaces = true;
            }
        }
        catch (e){
            foundWorkspaces = false;
        }
    if (!foundWorkspaces){
        // Fallback to plain text field
        config.newTextInput()
            .setId('workspaceId')
            .setName('Toggl Workspace ID')
            .setHelpText('Numerical ID for your workspace')
            .setPlaceholder('123456');
    }

    // Allow pre-filtering to just billable time
    config.newCheckbox()
        .setId('prefilterBillable')
        .setName('Pre-filter Billable')
        .setHelpText('Pre-filter all reports to just "billable" time (as configured in Toggl)');

    // OPTIONAL: allow users to use a connector instance specific auth/api token, instead of the user-global AUTH that is stored in PropertiesService per user. This is the only way I can see to allow users to connect multiple Toggl accounts within a single Google account login
    config.newTextInput()
        .setId('configApiToken')
        .setName('API Token')
        .setHelpText('Use this if you need to connect multiple Toggl accounts / logins, within a single Google account. This will override the Authentication flow that you see the first time you connect this source, and allow you to keep a unique account linked per connector. PLEASE DO NOT USE UNLESS ABSOLUTELY NECESSARY - this is less secure than the default authentication setting.')
        .setPlaceholder('abc123');

    // Require date range to be sent with every data request
    config.setDateRangeRequired(true);

	// Make sure to return the built config
	return config.build();
}

/**
 * To keep things clean and help with type checking, I'm maintaining a list of fields separately from getFields that will be used on both ends - prepping the fields and parsing return data
 */
export interface fieldMapping {
    id: string,
    dimension: boolean,
    name: string,
    description?: string,
    togglMapping?: {
        fields: {
            [index:string]: Array<string>|undefined,
            TogglDetailedEntry?: Array<string>,
            TogglWeeklyProjectGroupedEntry?: Array<string>,
            TogglWeeklyUserGroupedEntry?: Array<string>,
            TogglSummaryEntry?: Array<string>
        },
        formatter?: Function
    },
    semantics: {
        conceptType: 'DIMENSION'|'METRIC',
        semanticType: GoogleAppsScript.Data_Studio.FieldType,
        semanticGroup?: GoogleAppsScript.Data_Studio.FieldType,
        aggregationType?: GoogleAppsScript.Data_Studio.AggregationType
        isReaggregatable?: boolean
    }
}
let myFields: {[index:string]:fieldMapping} = {
    // Default date/time dimensions
    day: {
        dimension: true,
        id: 'day',
        name: 'Date',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['start']
            },
            formatter: (date:string)=>{
                return Converters.formatDateForGds(date,fieldTypeEnum.YEAR_MONTH_DAY);
            }
        },
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY
        }
    },
    startedAtHour: {
        dimension: true,
        id: 'startedAtHour',
        name: 'Started At - Hour',
        description: 'The hour / time at which the time entry was started at',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['start']
            },
            formatter: (date:string)=>{
                return Converters.formatDateForGds(date,fieldTypeEnum.YEAR_MONTH_DAY_HOUR);
            }
        },
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY_HOUR
        }
    },
    endedAtHour: {
        dimension: true,
        id: 'endedAtHour',
        name: 'Ended At - Hour',
        description: 'The hour / time at which the time entry ended',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY_HOUR
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['end']
            },
            formatter: (date:string)=>{
                return Converters.formatDateForGds(date,fieldTypeEnum.YEAR_MONTH_DAY_HOUR);
            }
        }
    },
    // Main Time Entry stuff (title, id, etc.)
    entryId: {
        dimension: true,
        id: 'entryId',
        name: 'Entry ID',
        description: 'Numerical ID auto-generated by Toggl per entry',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['id']
            }
        }
    },
    entryDescription: {
        dimension: true,
        id: 'entryDescription',
        name: 'Entry Description / Title',
        description: 'Entry Description / Title. Not required by Toggl',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['description']
            }
        }
    },
    // Task Entry
    taskId: {
        dimension: true,
        id: 'taskId',
        name: 'Task ID',
        description: 'Task ID, only available on paid accounts',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['tid']
            }
        }
    },
    // Projects
    projectId: {
        dimension: true,
        id: 'projectId',
        name: 'Project ID',
        description: 'Numerical ID generated by Toggl for each project',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['pid'],
                TogglWeeklyProjectGroupedEntry: ['pid'],
                TogglWeeklyUserGroupedEntry: ['details.pid'],
                TogglSummaryEntry: ['pid']
            }
        },
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER
        }
    },
    projectName: {
        dimension: true,
        id: 'projectName',
        name: 'Project Name',
        description: 'Your project name',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['project'],
                TogglWeeklyProjectGroupedEntry: ['title.project'],
                TogglSummaryEntry: ['title.project']
            }
        }
    },
    // Clients
    clientId: {
        dimension: true,
        id: 'clientId',
        name: 'Client ID',
        description: 'Numerical ID generated by Toggl for each client',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER
        },
        togglMapping: {
            fields: {
                // Client ID is only returned in reports explicitly grouped by client - e.g. summary
                TogglSummaryEntry: ['cid']
            }
        }
    },
    clientName: {
        dimension: true,
        id: 'clientName',
        name: 'Client Name',
        description: 'Client Name',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['client'],
                TogglWeeklyProjectGroupedEntry: ['title.client'],
                TogglSummaryEntry: ['title.client']
            }
        }
    },
    // Billing Info
    billableMoneyTotal: {
        dimension: false,
        id: 'billableMoneyTotal',
        name: 'Total Billable Amount',
        description: 'Total Billable Amount in Configured Currency',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.CURRENCY_USD
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['billable'],
                TogglSummaryEntry: ['totalBillingSum']
            },
            formatter: Converters.formatCurrencyForGds
        }
    },
    billableTimeTotal: {
        dimension: false,
        id: 'billableTimeTotal',
        name: 'Total Billable Hours',
        description: 'Total Billable Time, as configured in Toggl',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.DURATION
        }
        // @TODO togglMapping
    },
    isBillable: {
        dimension: false,
        id: 'isBillable',
        name: 'Is Billable',
        description: 'Whether given entry was marked as billable',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.BOOLEAN
        }
        // @TODO togglMapping
    },
    billingRate: {
        dimension: false,
        id: 'billingRate',
        name: 'Billing Rate',
        description: 'Billing Rate',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.CURRENCY_USD,
            isReaggregatable: true,
            aggregationType: aggregationTypeEnum.AVG
        },
        togglMapping: {
            fields: {
                TogglSummaryEntry: ['avgBillingRate']
            },
            formatter: Converters.formatCurrencyForGds
        }
    },
    // !!! - Time Field - !!!
    time: {
        dimension: false,
        id: 'time',
        name: 'Time',
        description: 'Logged Time',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['dur'],
                TogglSummaryEntry: ['time']
            },
            formatter: (duration:number)=>{
                return Converters.togglDurationToGdsDuration(duration);
            }
        },
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.DURATION,
            isReaggregatable: true,
            aggregationType: aggregationTypeEnum.SUM
        }
    },
    // User Info
    userId: {
        dimension: true,
        id: 'userId',
        name: 'User ID',
        description: 'Numerical User ID, autogenerated by Toggl',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['uid']
            }
        }
    },
    userName: {
        dimension: true,
        id: 'userName',
        name: 'User Name',
        description: 'Your Toggl User Name',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['user']
            }
        }
    },
    // Meta info
    updatedAt: {
        dimension: false,
        id: 'updatedAt',
        name: 'Updated At - Hour',
        description: 'When the time entry was last edited',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY_HOUR,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['updated']
            },
            formatter: (date:string)=>{
                return Converters.formatDateForGds(date,fieldTypeEnum.YEAR_MONTH_DAY_HOUR);
            }
        }
    },
    useStop: {
        dimension: false,
        id: 'useStop',
        name: 'Use Stop',
        description: 'If the stop time is saved on the entry',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.BOOLEAN,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['use_stop']
            }
        }
    }
    // @TODO - Add "tags", and "rate" (from summary endpoint)
}

/**
 * Add a custom field to a connector
 * @param fieldsObj  - an existing group of fields, generated through connector.getFields();
 * @param fieldToAdd - New field to add to connector, following internal syntax
 */
function addField(fieldsObj:GoogleAppsScript.Data_Studio.Fields,fieldToAdd:fieldMapping){
    let chain:GoogleAppsScript.Data_Studio.Field;
    // @TODO
    if (fieldToAdd.dimension){
        chain = fieldsObj.newDimension();
    }
    else {
        chain = fieldsObj.newMetric();
    }
    chain.setId(fieldToAdd.id);
    chain.setName(fieldToAdd.name);
    if (typeof(fieldToAdd.description)==='string'){
        chain.setDescription(fieldToAdd.description);
    }
    chain.setType(fieldToAdd.semantics.semanticType);
    if (fieldToAdd.semantics.isReaggregatable && typeof(fieldToAdd.semantics.aggregationType)!=='undefined'){
        chain.setIsReaggregatable(true);
        chain.setAggregation(fieldToAdd.semantics.aggregationType);
    }
    return chain;
}

/**
 * @override
 * Kept as separate function from getSchema, so it can be reused with getData()
 * https://developers.google.com/datastudio/connector/reference#getschema
 * List of types: https://developers.google.com/datastudio/connector/reference#datatype
 */
function getFields(){
    let fields = cc.getFields();
    let types = cc.FieldType;
    let aggregations = cc.AggregationType;

    let fieldKeys = Object.keys(myFields);
    for (let x=0; x < fieldKeys.length; x++){
        addField(fields,myFields[fieldKeys[x]]);
    }

    return fields;
}

/**
 * @override
 */
function getSchema(request:SchemaRequest) {
    return {schema : getFields().build()};
}

/**
 * @override
 * https://developers.google.com/datastudio/connector/reference#getdata
 * Should return: https://developers.google.com/datastudio/connector/reference#response_3
 *   - Schema and rows should match in length (one should be the dimension used)
 *   - Response should match what was requested {request.fields}
 *   - Data types - https://developers.google.com/datastudio/connector/reference#semantictype
 * Notes:
 *   - Badly documented, but the array of field names [{name:"foobar"}] is misleading - they are not names, they are the original IDs of the fields...
 *        - Furthermore, schema should be the result of Fields.build(), which has specialized output that looks like this:
 *               // [{
 *               //     "dataType": "STRING",
 *               //     "name": "day",
 *               //     "label": "Date",
 *               //     "semantics": {
 *               //         "conceptType": "DIMENSION",
 *               //         "semanticType": "YEAR_MONTH_DAY"
 *               //     }
 *               // }, {
 *               //     "dataType": "STRING",
 *               //     "name": "time",
 *               //     "description": "Logged Time",
 *               //     "label": "Time",
 *               //     "semantics": {
 *               //         "isReaggregatable": true,
 *               //         "conceptType": "METRIC",
 *               //         "semanticType": "DURATION"
 *               //     }
 *               // }]
 *   - Rows is also confusing - instead of each column (dimension|metric) being an object with a values array that contains rows, it is that each row is an object with a values array that contains columns.
 */
function getData(request:GetDataRequest){
    myConsole.log(request);

    let now:Date = new Date();
    let userCache:GoogleAppsScript.Cache.Cache = CacheService.getUserCache();

    // Grab fields off incoming request
    let unorderedRequestedFieldIds: Array<string> = request.fields.map(field=>field.name); // ['day','time','cost',...]
    let requestedFields: GoogleAppsScript.Data_Studio.Fields = getFields().forIds(unorderedRequestedFieldIds);
    let orderedRequestedFieldIds = requestedFields.asArray().map((field)=>{return field.getId()});

    // What the final result should look like
    let returnData: GetDataReturnObj = {
        "cachedData" : false,
        "schema" : requestedFields.build(),
        "rows" : []
    }

    // FLAG - request is missing required info
    let blocker:boolean = false;
    let blockerReason:string = '';

    // FLAG - is there a reason to avoid using cache?
    let avoidCache:boolean = false;
    let foundInCache:boolean = false;

    // Grab date stuff off incoming request
    let lastRefreshedTime:Date;
    if (typeof(request.scriptParams)==='object' && typeof(request.scriptParams.lastRefresh)==='string'){
        lastRefreshedTime = new Date(request.scriptParams.lastRefresh);
    }
    else {
        lastRefreshedTime = new Date(new Date().getTime() - (12*60*60*1000));
    }
    let dateRangeStart:Date = DateUtils.forceDateToStartOfDay(Converters.gdsDateRangeDateToDay(request.dateRange.startDate));
    let dateRangeEnd:Date = DateUtils.forceDateToEndOfDay(Converters.gdsDateRangeDateToDay(request.dateRange.endDate));
    
    // Avoid cache if either end of range is within 2 days of today - since users are more likely to have recently edited entries within that span
    if (DateUtils.getIsDateWithinXDaysOf(dateRangeStart,now,2) || DateUtils.getIsDateWithinXDaysOf(dateRangeEnd,now,2)){
        avoidCache = true;
    }
    

    // Certain things in what is requested can change how route used to retrieve data...
    let canUseDetailedReport = true;
    let canUseWeeklyProjectReport = true;
    let canUseWeeklyUserReport = true;
    let canUseSummaryReport = true;
    for (let x=0; x<orderedRequestedFieldIds.length; x++){
        let fieldId = orderedRequestedFieldIds[x];
        canUseDetailedReport = !canUseDetailedReport ? canUseDetailedReport : getIsFieldInResponseEntryType(fieldId,'TogglDetailedEntry');
        canUseWeeklyProjectReport = !canUseWeeklyProjectReport ? canUseWeeklyProjectReport : getIsFieldInResponseEntryType(fieldId,'TogglWeeklyProjectGroupedEntry');
        canUseWeeklyUserReport = !canUseWeeklyUserReport ? canUseWeeklyUserReport : getIsFieldInResponseEntryType(fieldId,'TogglWeeklyUserGroupedEntry');
        canUseSummaryReport = !canUseSummaryReport ? canUseSummaryReport :  getIsFieldInResponseEntryType(fieldId,'TogglSummaryEntry');
    }

    let dateDimensionRequired:boolean = orderedRequestedFieldIds.indexOf('day')!==-1;
    let projectDimensionRequired:boolean = (orderedRequestedFieldIds.indexOf('projectId')!==-1||orderedRequestedFieldIds.indexOf('projectName')!==-1);

    // Config options
    let workspaceId:number = -1;
    let prefilterBillable = false;

    // Extract config configParams
    if (request.configParams && typeof(request.configParams)==='object'){
        if (typeof(request.configParams['workspaceId'])!=='undefined'){
            try {
                workspaceId = parseInt(request.configParams['workspaceId'],10);
                if (workspaceId < 0){
                    blocker = true;
                    blockerReason = 'Workspace ID is invalid.';
                }
            }
            catch (e){
                blocker = true;
                blockerReason = 'Workspace ID is required for all requests!';
            }
        }
        else {
            blocker = true;
            blockerReason = 'Workspace ID is required for all requests!';
        }
        prefilterBillable = request.configParams['prefilterBillable'] == true;
        let connectorConfigApiToken = request.configParams['configApiToken'];
        if (typeof(connectorConfigApiToken)==='string' && connectorConfigApiToken.length > 0){
            // Update api instance to use connector specific API token
            togglApiInst.setAuthToken(connectorConfigApiToken);
        }
        else {
            // Revert back to global auth token
            togglApiInst.setAuthToken(USER_API_TOKEN);
        }
    }

    // Early return if anything is missing
    if (blocker){
        cc.newUserError()
            .setDebugText(blockerReason)
            .setText(blockerReason)
            .throwException();
        return false;
    }

    try {
        if (!dateDimensionRequired && canUseSummaryReport){
            // If dateDimensionRequired is false, and uses has requested project or client details, we can query the summary endpoint and group by project|client
            let grouping:'projects'|'clients' = (projectDimensionRequired ? 'projects' : 'clients');
            let res:responseTemplate = TogglApi.getResponseTemplate(false);
            let cacheKey:string = CacheWrapper.generateKeyFromInputs([workspaceId,dateRangeStart,dateRangeEnd,grouping,'time_entries',prefilterBillable]);
            if (!avoidCache){
                try {
                    let cacheValue:null|string = userCache.get(cacheKey);
                    if (cacheValue){
                        res = JSON.parse(cacheValue);
                        foundInCache = true;
                        myConsole.log('Used Cache!');
                    }
                }
                catch (e){
                    foundInCache = false;
                }
            }
            if (!foundInCache){
                res = togglApiInst.getSummaryReport(workspaceId,dateRangeStart,dateRangeEnd,grouping,'time_entries',prefilterBillable);
                myConsole.log('No cache used for response');
            }
            if (res.success){
                
                // Map to getData rows
                returnData.rows = mapTogglResponseToGdsFields(requestedFields,orderedRequestedFieldIds,dateRangeStart,dateRangeEnd,res.raw,usedTogglResponseTypes.TogglSummaryReportResponse,usedToggleResponseEntriesTypes.TogglSummaryEntry,grouping);
                if (!foundInCache && returnData.rows.length > 0){
                    // Cache results
                    userCache.put(cacheKey,JSON.stringify(res));
                }
                returnData.cachedData = foundInCache;
                return returnData;
            }
            else {
                return Exceptions.throwGenericApiErr();
            }
        }
        else if (!dateDimensionRequired && (canUseWeeklyProjectReport || canUseWeeklyUserReport)){
            // @TODO
            cc.newDebugError()
                .setText('getData request resulted in trying to use getWeeklyReport, which has not been built yet')
                .throwException();
        }
        else if (dateDimensionRequired || canUseDetailedReport){
            myConsole.log('dateDimensionRequired');
            // The only request type that a date dimension is the detailed report
            let res:responseTemplate = TogglApi.getResponseTemplate(false);
            let cacheKey:string = CacheWrapper.generateKeyFromInputs([workspaceId,dateRangeStart,dateRangeEnd,prefilterBillable]);
            if (!avoidCache){
                try {
                    let cacheValue:null|string = userCache.get(cacheKey);
                    if (cacheValue){
                        res = JSON.parse(cacheValue);
                        foundInCache = true;
                        myConsole.log('Used Cache!');
                    }
                }
                catch (e){
                    foundInCache = false;
                }
            }
            if (!foundInCache){
                res = togglApiInst.getDetailsReportAllPages(workspaceId,dateRangeStart,dateRangeEnd,prefilterBillable);
                myConsole.log('No cache used for response');
            }
            myConsole.log(res);
            if (res.success){
                // Map to getData rows
                returnData.rows = mapTogglResponseToGdsFields(requestedFields,orderedRequestedFieldIds,dateRangeStart,dateRangeEnd,res.raw,usedTogglResponseTypes.TogglDetailedReportResponse,usedToggleResponseEntriesTypes.TogglDetailedEntry);
                if (!foundInCache && returnData.rows.length > 0){
                    // Cache results
                    userCache.put(cacheKey,JSON.stringify(res));
                }
                returnData.cachedData = foundInCache;
                myConsole.log(returnData);
                return returnData;
            }
            else {
                return Exceptions.throwGenericApiErr();
            }
        }
        else {
            cc.newUserError()
                .setDebugText('No API call was made, could not determine endpoint based on dimensions requested')
                .setText('Invalid combination of dimensions')
                .throwException();
            myConsole.error('No API call was made, could not determine endpoint based on dimensions requested');
        }
    }
    catch (err){
        cc.newUserError()
            .setDebugText(err.toString())
            .setText('Something went wrong fetching from Toggl')
            .throwException();
        myConsole.error(err);
    }
}

/**
 * @override
 * @TODO - right now simply used to suppress errors that this func should exist
 */
function isAdminUser(){
    return false;
}

/**
 * Maps a Toggl API response to GDS formatted rows to return inside getData()
 * Things to note:
 *      - Everything needs to be aggregated by dimension and # needs to match; e.g. if GDS requests two dimensions (columns), only two data points per row should be returned, and no 2 rows should have the same value for the same dimension + metric combo (basically xy combo)
 * @param requestedFields 
 * @param requestedFieldIds 
 * @param requestedStart 
 * @param requestedEnd
 * @param response 
 * @param responseType 
 * @param entryType 
 * @param requestedGrouping 
 */
function mapTogglResponseToGdsFields(
    requestedFields:GoogleAppsScript.Data_Studio.Fields|null,
    requestedFieldIds:Array<string>,
    requestedStart:Date,
    requestedEnd:Date,
    response:{[index:string]:any},
    responseType:usedTogglResponseTypes,
    entryType:usedToggleResponseEntriesTypes,
    requestedGrouping?:"projects"|"clients"|"users") {
        
    // Need to get literal string key from enum
    let entryTypeStringIndex:string = usedToggleResponseEntriesTypes[entryType];
    let mappedData: Array<DataReturnObjRow> = [];
    response.data = Array.isArray(response.data) ? response.data : [];
    let entryArr = response.data;

    if (responseType === usedTogglResponseTypes.TogglSummaryReportResponse){
        // Each summary entry also contains a sub-array of entries that are grouped to that summary item. I am going to copy up and reaggregate certain values off that subarray, adding them to the parent entry
        // For example, one entry with three sub items would stay one entry, but have the averages of those three subitems added as new props
        for (let x=0; x<entryArr.length; x++){
            let entryBase = entryArr[x];
            if (Array.isArray(entryBase['items']) && entryBase.items.length > 0){
                let cBillingRate = 0;
                let totalBillingSum = 0;
                for (let s=0; s<entryBase.items.length; s++){
                    let subItem = entryBase.items[s];
                    totalBillingSum += typeof(subItem.sum)==='number' ? subItem.sum : 0;
                    cBillingRate += typeof(subItem.rate)==='number' ? subItem.rate : 0;
                }
                // Add calculated
                entryBase['avgBillingRate'] = cBillingRate / entryBase.items.length;
                entryBase['totalBillingSum'] = totalBillingSum;
            }
        }
    }


    let suppressedRowCount:number = 0;

    // Loop over response entries - [ROWS]
    for (let x=0; x<entryArr.length; x++){
        // Flag - suppress row being passed to GDS
        let suppressRow:boolean = false;

        let entry = entryArr[x];
        let row: DataReturnObjRow = {
            values: []
        }

        // lets do some pre-processing, per entry
        if (responseType === usedTogglResponseTypes.TogglDetailedReportResponse){
            // No special pre-processing required
        }
        else if (responseType === usedTogglResponseTypes.TogglSummaryReportResponse){
            // Summary reports can be grouped - and the ID field in response changes to match
            if (requestedGrouping==='projects'){
                entry['pid'] = entry.id;
            }
            else if (requestedGrouping==='clients'){
                entry['cid'] = entry.id;
            }
            else if (requestedGrouping==='users'){
                entry['uid'] = entry.id;
            }
        }
        else if (responseType === usedTogglResponseTypes.TogglWeeklyReportResponse){
            // @TODO ?
        }

        // Iterate over requested fields [COLUMNS]
        for (let x=0; x<requestedFieldIds.length; x++){
            let fieldMapping = myFields[requestedFieldIds[x]]; 

            // Make sure to pass *something* to GDS for every requested field!
            let valueToPass:any = null;
            if (fieldMapping){
                valueToPass = extractValueFromEntryWithMapping(entry,fieldMapping,entryTypeStringIndex);
            }

            if (fieldMapping.id ==='day' && fieldMapping.semantics.conceptType==='DIMENSION'){
                // !!! - Special - !!!
                // Sometimes Toggl will return entries that overlap days. This can lead to the dreaded "number of columns returned don't match requested" error from GDS if blinding returning a date that GDS did not actually request.
                
                if (typeof(fieldMapping.togglMapping)==='object'){
                    // Take care to make copy so not modifying reference
                    let augmentedMapping:fieldMapping = {
                        id: fieldMapping.id,
                        dimension: true,
                        name: fieldMapping.name,
                        semantics: fieldMapping.semantics,
                        togglMapping: {
                            fields: fieldMapping.togglMapping.fields,
                            formatter: (date:string)=>{
                                // Convert Toggl date to true Date Obj
                                // Note - Toggl includes Timezone with date ("start":"2019-06-28T18:54:50-07:00"), so remove it to make compatible with checking date range (with uses GMT)
                                let convertedDate:Date = new Date(date.replace(/(\d{4}-\d{2}-\d{2}T[^-]+-).*/,'$100:00'));
                                return convertedDate;
                            }
                        }
                    }
                    let fieldDate:Date = extractValueFromEntryWithMapping(entry,augmentedMapping,entryTypeStringIndex);
                    if (!DateUtils.getIsDateInDateTimeRange(fieldDate,requestedStart,requestedEnd)){
                        suppressRow = true;
                        suppressedRowCount++;
                    }
                }
            }
            row.values.push(valueToPass);
        }
        // Push the entire entry row to results
        if (!suppressRow){
            mappedData.push(row);
        }
    }

    if (suppressedRowCount > 0){
        myConsole.log('Suppressed ' + suppressedRowCount.toString() + ' rows based on misaligned date');
    }

    // Since Toggl might not return data for *every* date that GDS requested, should go back in and backfill...
    // @TODO

    return mappedData;
}

/**
 * Extracts the value from a Toggl API response entry, and converts it based on the destination GDS column
 * @param entry {object} - An entry off a Toggl API response
 * @param fieldMapping {fieldMapping} - My stored mapping of fields. Should contain semantics
 * @param entryTypeStringIndex {string} - Toggl entry type enum, converted to string
 * @return {any} - always returns a value, with VALUE_FOR_NULL global being the placeholder if no mapping was found. GDS always expects a value in column
 */
function extractValueFromEntryWithMapping(entry:{[index:string]:any},fieldMapping:fieldMapping,entryTypeStringIndex:string){
    let extractedValue:any = VALUE_FOR_NULL;
    let togglMapping = fieldMapping.togglMapping;
    if (togglMapping){
        // Look up the individual field mappings
        // myConsole.log(entryTypeStringIndex);
        let fields = togglMapping.fields[entryTypeStringIndex];
        if (fields){
            // Iterate over field keys
            let foundVals:Array<any> = [];
            for (let x=0; x<fields.length; x++){
                let val:any = recurseFromString(entry,fields[x]);
                if (typeof(val)!=='undefined'){
                    foundVals.push(val);
                }
            }
            if (foundVals.length > 0){
                if ('formatter' in togglMapping && typeof(togglMapping['formatter'])==='function'){
                    extractedValue = togglMapping.formatter.apply(entry,foundVals);
                }
                else {
                    // Assume we only want first val
                    extractedValue = foundVals[0];
                }
            }
            else {
                Logger.log('No required fields were found for mapping of "' + fieldMapping.id + '"');
            }
        }
    }
    extractedValue = typeof(extractedValue)!=='undefined' ? extractedValue : VALUE_FOR_NULL;
    return extractedValue;
}

function testDateString(){
    let startString = '2019-06-28';
    let startDate:Date = new Date(startString);
    let forcedEnd:Date = DateUtils.forceDateToEndOfDay(startDate);
    let forcedStart:Date = DateUtils.forceDateToStartOfDay(startDate);
    let test:any = {
        input: startString,
        toString: startDate.toString(),
        toUTCString: startDate.toUTCString(),
        forceDateToStartOfDay: {
            toString: forcedStart.toString(),
            toUTCString: forcedStart.toUTCString()
        },
        forceDateToEndOfDay: {
            toString: forcedEnd.toString(),
            toUTCString: forcedEnd.toUTCString()
        }
    }
    myConsole.log(test);
}

/**
 * Check if a given field can be found in the interface for the given response entry type (from the API)
 */
function getIsFieldInResponseEntryType(fieldId:string,entryTypeStringIndex:string){
    let fieldMapping = myFields[fieldId].togglMapping;
    if (fieldMapping){
        return Array.isArray(fieldMapping.fields[entryTypeStringIndex]);
    }
    return false;
}