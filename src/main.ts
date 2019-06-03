import 'google-apps-script';
import {getUserApiKey} from './auth';
import { TogglApi } from './toggl';

/**
 * @author Joshua Tzucker
 * Note: @override is used to denote function that is required and expected by connector implementation
 */

interface SchemaRequest {
    "configParams" : object,
    "scriptParams" : object
}

interface FieldObjNameOnly {
    "name" : string
}
interface GetDataRequest {
    "configParams": object,
    "scriptParams": {
        "sampleExtraction": boolean,
        "lastRefresh": string
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

interface DataReturnObjSchema {
    "name" : string,
    "dataType": string
}
interface GetDataReturnObj {
    "schema" : Array<DataReturnObjSchema>,
    "rows" : Array<DataReturnObjRow>,
    "cachedData" : boolean
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
 */
function getConfig() {
	// Get config obj provided by gds-connector
	let config = cc.getConfig();

	// Set config general info
	config.newInfo()
		.setId('instructions')
        .setText('Configure the connector for Toggl');
    
    config.setDateRangeRequired(true);

	// Make sure to return the built config
	return config.build();
}

/**
 * @override
 */
function getFields(){
    let fields = cc.getFields();
    let types = cc.FieldType;
    let aggregations = cc.AggregationType;

    fields
        .newDimension()
        .setId('day')
        .setName('Date')
        .setType(types.YEAR_MONTH_DAY);

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
 */
function getData(request:GetDataRequest){
    let returnData: GetDataReturnObj = {
        "cachedData" : false,
        "schema" : [
            {
                "name" : "",
                "dataType" : ""
            }
        ],
        "rows" : [
            {
                "values" : []
            }
        ]
    }
    let lastRefreshedTime:Date = new Date(request.scriptParams.lastRefresh);
    let dateRangeStart:Date = new Date(request.dateRange.startDate);
    let dateRangeEnd:Date = new Date(request.dateRange.endDate);

    // @TODO
    return returnData;
}