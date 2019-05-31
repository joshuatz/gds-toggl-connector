import 'google-apps-script';
import * as auth from './auth';
import { TogglApi } from './toggl';

/**
 * @author Joshua Tzucker
 * Note: @override is used to denote function that is required and expected by connector implementation
 */

interface schemaRequest {
    "configParams" : object,
    "scriptParams" : object
}

/**
 * Some app-wide constants
 */
var AUTH_HELP_URL = 'https://toggl.com/app/profile';
var TOGGL_API_BASE = 'https://www.toggl.com/api/v8';
var APIKEY_STORAGE = 'dscc.key';

/**
 * MAIN - Setup globals
 */
// init connector
var cc = DataStudioApp.createCommunityConnector();
// Create global instance of toggl api class
export var togglApiInst = new TogglApi(auth.getUserApiKey());

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
function getSchema(request:schemaRequest) {
    return {schema : getFields().build()};
}