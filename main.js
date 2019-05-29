import 'google-apps-script';
/**
 * @author Joshua Tzucker
 */

var cc = DataStudioApp.createCommunityConnector();


function getAuth(){
    // Enum
    var authTypes = cc.AuthType;
    // Return auth AuthType
}

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

	// Make sure to return the built config
	return config.build();
}