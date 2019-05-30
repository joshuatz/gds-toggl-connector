import 'google-apps-script';
import './main';
import './toggl';

/**
 * @author Joshua Tzucker
 */

/**
 * @override - https://developers.google.com/datastudio/connector/auth#getauthtype
 */
function getAuthType(){
    // Enum
    var authTypes = cc.AuthType;
    // Return auth AuthType
    return cc
        .newAuthTypeResponse()
        .setAuthType(authTypes.KEY)
        .setHelpUrl(AUTH_HELP_URL)
        .build();
}

/**
 * @override - https://developers.google.com/datastudio/connector/auth#resetauth
 */
function resetAuth(){
    PropertiesService.getUserProperties().deleteProperty(APIKEY_STORAGE);
}

/**
 * @override - https://developers.google.com/datastudio/connector/auth#isauthvalid
 */
function isAuthValid(){
    return validateKey(getUserApiKey());
}

function validateKey(authKey){
    var tempInst = new TogglApi(authKey);
    // Make a call to /me as simple test of auth authValidity
    var response = tempInst.getBasicAcctInfo();
    return response.valid;
}

/**
 * @override - https://developers.google.com/datastudio/connector/auth#setcredentials
 * NOTE: This is very special func - is a callback that gets triggered once user saves credential through UI
 */
function setCredentials(request){
    var key = request.key;
    if (!validateKey(key)){
        return {
            errorCode: 'INVALID_CREDENTIALS'
        }
    }
    UserProperties.getUserProperties().setProperty(APIKEY_STORAGE,key);
    // Update global
    togglApiInst.setAuthToken(key);
    return {
        errorCode : 'NONE'
    };
}

function getUserApiKey(){
    return PropertiesService.getUserProperties().getProperty(APIKEY_STORAGE);
}