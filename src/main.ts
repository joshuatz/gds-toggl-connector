import 'google-apps-script';
import {getUserApiKey} from './auth';
import { TogglApi, TogglDetailedReportResponse,TogglSummaryReportResponse,TogglDetailedEntry, TogglStandardReportResponse,TogglSummaryEntry, usedTogglResponseTypes, usedToggleResponseEntriesTypes } from './toggl';
import { Converters, recurseFromString } from './helpers';

/**
 * @author Joshua Tzucker
 * Note: @override is used to denote function that is required and expected by connector implementation
 */

 // Handy aliases
 let fieldTypeEnum = GoogleAppsScript.Data_Studio.FieldType;

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
    "configParams"?: object,
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
var AUTH_HELP_URL = 'https://toggl.com/app/profile';
var APIKEY_STORAGE = 'dscc.key';
var IS_DEBUG:boolean = true;
var APP_USER_AGENT: string = 'https://github.com/joshuatz/gds-toggl-connector'
/**
 * MAIN - Setup globals
 */
// init connector
var cc = DataStudioApp.createCommunityConnector();
// Create global instance of toggl api class
export var togglApiInst = new TogglApi(getUserApiKey());

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
    config.newTextInput()
        .setId('workspaceId')
        .setName('Toggl Workspace ID')
        .setHelpText('Numerical ID for your workspace')
        .setPlaceholder('123456');

    // Allow pre-filtering to just billable time
    config.newCheckbox()
        .setId('prefilterBillable')
        .setName('Pre-filter Billable')
        .setHelpText('Pre-filter all reports to just "billable" time (as configured in Toggl)');

    // Require date range to be sent with every data request
    config.setDateRangeRequired(true);

	// Make sure to return the built config
	return config.build();
}

/**
 * To keep things clean and help with type checking, I'm maintaining a list of fields separately from getFields that will be used on both ends - prepping the fields and parsing return data
 */
interface fieldMapping {
    id: string,
    dimension: boolean,
    name: string,
    description?: string,
    type: GoogleAppsScript.Data_Studio.FieldType
    togglMapping?: {
        fields: {
            TogglDetailedEntry?: Array<string>,
            TogglProjectGroupedEntry?: Array<string>,
            TogglUserGroupedEntry?: Array<string>,
            TogglSummaryEntry?: Array<string>
        },
        formatter?: Function
    }
}
let myFields: {[index:string]:fieldMapping} = {
    // Default date/time dimensions
    day: {
        dimension: true,
        id: 'day',
        name: 'Date',
        type: fieldTypeEnum.YEAR_MONTH_DAY,
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['start']
            },
            formatter: (date:string)=>{
                return Converters.formatDateForGds(date,fieldTypeEnum.YEAR_MONTH_DAY);
            }
        }
    },
    startedAtHour: {
        dimension: true,
        id: 'startedAtHour',
        name: 'Started At - Hour',
        type: fieldTypeEnum.YEAR_MONTH_DAY_HOUR,
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['start']
            },
            formatter: (date:string)=>{
                return Converters.formatDateForGds(date,fieldTypeEnum.YEAR_MONTH_DAY_HOUR);
            }
        }
    },
    // Projects
    projectId: {
        dimension: true,
        id: 'projectId',
        name: 'Project ID',
        description: 'Numerical ID generated by Toggl for each project',
        type: fieldTypeEnum.NUMBER,
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['pid'],
                TogglProjectGroupedEntry: ['pid'],
                TogglUserGroupedEntry: ['details.pid'],
                TogglSummaryEntry: ['pid']
            }
        }
    },
    projectName: {
        dimension: true,
        id: 'projectName',
        name: 'Project Name',
        description: 'Your project name',
        type: fieldTypeEnum.TEXT
    },
    // Clients
    clientId: {
        dimension: true,
        id: 'clientId',
        name: 'Client ID',
        description: 'Numerical ID generated by Toggl for each client',
        type: fieldTypeEnum.NUMBER
    },
    clientName: {
        dimension: true,
        id: 'clientName',
        name: 'Client Name',
        description: 'Client Name',
        type: fieldTypeEnum.TEXT
    },
    // Billing Info
    billableMoneyTotal: {
        dimension: false,
        id: 'billableMoneyTotal',
        name: 'Total Billable Amount',
        description: 'Total Billable Amount in Configured Currency',
        type: fieldTypeEnum.CURRENCY_USD
    },
    billableTimeTotal: {
        dimension: false,
        id: 'billableTimeTotal',
        name: 'Total Billable Hours',
        description: 'Total Billable Time, as configured in Toggl',
        type: fieldTypeEnum.DURATION
    },
    isBillable: {
        dimension: false,
        id: 'isBillable',
        name: 'Is Billable',
        description: 'Whether given entry was marked as billable',
        type: fieldTypeEnum.BOOLEAN
    },
    // Time
    time: {
        dimension: false,
        id: 'time',
        name: 'Time',
        description: 'Logged Time',
        type: fieldTypeEnum.DURATION
    }
}

/**
 * Add a custom field to a connector
 * @param fieldsObj - an existing group of fields, generated through connector.getFields();
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
    if ('description' in fieldToAdd){
        chain.setDescription(fieldToAdd.description);
    }
    chain.setType(fieldToAdd.type);
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

    // Default date/time dimension
    addField(fields,myFields.day);
    addField(fields,myFields.startedAtHour);

    // Projects
    addField(fields,myFields.projectId);
    addField(fields,myFields.projectName);

    // Clients
    addField(fields,myFields.clientId);
    addField(fields,myFields.clientName);

    // Billing Info
    addField(fields,myFields.billableMoneyTotal);
    addField(fields,myFields.billableTimeTotal);
    addField(fields,myFields.isBillable);

    // Time
    addField(fields,myFields.time);

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
    Logger.log(request);
    console.log(request);

    // Grab fields off incoming request
    let types = cc.FieldType;
    let requestedFieldIds: Array<string> = request.fields.map(field=>field.name); // ['day','time','cost',...]
    let requestedFields: GoogleAppsScript.Data_Studio.Fields = getFields().forIds(requestedFieldIds);

    // Grab date stuff off incoming request
    let lastRefreshedTime:Date;
    if (typeof(request.scriptParams)==='object' && typeof(request.scriptParams.lastRefresh)==='string'){
        lastRefreshedTime = new Date(request.scriptParams.lastRefresh);
    }
    else {
        lastRefreshedTime = new Date(new Date().getTime() - (12*60*60*1000));
    }
    let dateRangeStart:Date = new Date(request.dateRange.startDate);
    let dateRangeEnd:Date = new Date(request.dateRange.endDate);

    // Certain things in what is requested can change how route used to retrieve data...
    let dateDimensionRequired:boolean = requestedFieldIds.indexOf('day')!==-1;
    let projectDimensionRequired:boolean = (requestedFieldIds.indexOf('projectId')!==-1||requestedFieldIds.indexOf('projectName')!==-1);
    let clientDimensionRequired:boolean = (requestedFieldIds.indexOf('clientId')!==-1||requestedFieldIds.indexOf('clientName')!==-1);

    let returnData: GetDataReturnObj = {
        "cachedData" : false,
        "schema" : requestedFields.build(),
        "rows" : [
            {
                "values" : [
                    '20170317','100'
                ]
            },
            {
                "values" : [
                    '20170318','2005523'
                ]
            }
        ]
    }
    console.log(returnData);
    console.log(JSON.stringify(requestedFields.build(),null,4));
    

    
    // @TODO
    return returnData;
}

/**
 * @override
 * @TODO - right now simply used to suppress errors that this func should exist
 */
function isAdminUser(){
    return false;
}

function mapTogglResponseToGdsFields(requestedFields:GoogleAppsScript.Data_Studio.Fields,requestedFieldIds:Array<string>,response:TogglDetailedReportResponse|TogglSummaryReportResponse,responseType:usedTogglResponseTypes,entryType:usedToggleResponseEntriesTypes,requestedGrouping?:"projects"|"clients"|"users"){

    let mappedData: Array<DataReturnObjRow> = [];

    // Loop over response entries
    for (let x=0; x<response.data.length; x++){
        let entry = response.data[x];
        let row: DataReturnObjRow = {
            values: []
        }

        // lets do some pre-processing
        if (responseType === usedTogglResponseTypes.TogglDetailedReportResponse){

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

        // Main matcher
        for (let x=0; x<requestedFieldIds.length; x++){
            let requestedFieldId = requestedFieldIds[x];

            // Make sure to pass *something* to GDS for every requested field!
            let valueToPass:any = null;

            if (requestedFieldId in myFields && 'togglMapping' in myFields[requestedFieldId]){
                let mapping = myFields[requestedFieldId].togglMapping;
                // Look up the individual field mappings
                if (entryType in mapping.fields){
                    // Iterate over field keys
                    let requiredKeysLength = mapping.fields[entryType].length;
                    let foundVals:Array<any> = [];
                    for (let x=0; x<mapping.fields[entryType].length; x++){
                        let val:any = recurseFromString(entry,mapping.fields[entryType][x]);
                        if (typeof(val)!=='undefined'){
                            foundVals.push(val);
                        }
                    }
                    if (foundVals.length > 0){
                        if ('formatter' in mapping){
                            valueToPass = mapping.formatter.apply(entry,foundVals);
                        }
                        else {
                            // Assume we only want first val
                            valueToPass = foundVals[0];
                        }
                    }
                }
            }

            // No matter what, push the value to the return row
            valueToPass = typeof(valueToPass)!=='undefined' ? valueToPass : null;
            row.values.push(valueToPass);
        }
        // Push the entire entry row to results
        mappedData.push(row);
    }
    return mappedData;
}

function extractPrimaryDimensions(requestedFields:GoogleAppsScript.Data_Studio.Fields){
    let dimensions = {

    }
}