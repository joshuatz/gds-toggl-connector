import 'google-apps-script';
import './auth';

/**
 * @author Joshua Tzucker
 * Note: @override is used to denote function that is required and expected by connector implementation
 */


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
var togglApiInst = new TogglApi(getUserApiKey());

/**
 * @override
 */
function getConfig() {
	// Get config obj provided by gds-connector
	var config = cc.getConfig();

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
    var fields = cc.getFields();
    var types = cc.FieldType;
    var aggregations = cc.AggregationType;

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
function getSchema(request) {
    return {schema : getFields().build()};
}