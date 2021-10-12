import { togglApiInst } from './main';
import { TogglApi } from './toggl';

/**
 * @author Joshua Tzucker
 * @file auth.ts
 */

// https://developers.google.com/datastudio/connector/reference#setcredentials
interface credentialRequestCb {
    userPass: {
        username: string;
        password: string;
    };
    userToken: {
        username: string;
        token: string;
    };
    key: string;
}

/**
 * @override - https://developers.google.com/datastudio/connector/auth#getauthtype
 */
function getAuthType() {
    // Enum
    let authTypes = cc.AuthType;
    // Return auth AuthType
    return cc.newAuthTypeResponse().setAuthType(authTypes.KEY).setHelpUrl(AUTH_HELP_URL).build();
}

/**
 * @override - https://developers.google.com/datastudio/connector/auth#resetauth
 */
function resetAuth() {
    PropertiesService.getUserProperties().deleteProperty(APIKEY_STORAGE);
}

function getUserApiKey() {
    let key: string | null = PropertiesService.getUserProperties().getProperty(APIKEY_STORAGE);
    return key;
}

/**
 * @override - https://developers.google.com/datastudio/connector/auth#isauthvalid
 */
function isAuthValid() {
    return validateKey(getUserApiKey());
}

function validateKey(authKey: string | null) {
    if (authKey) {
        Logger.log(authKey);
        var tempInst = new TogglApi(authKey);
        // Make a call to /me as simple test of auth authValidity
        var response = tempInst.getBasicAcctInfo();
        return response.success;
    }
    return false;
}

/**
 * @override - https://developers.google.com/datastudio/connector/auth#setcredentials
 * NOTE: This is very special func - is a callback that gets triggered once user saves credential through UI
 */
function setCredentials(request: credentialRequestCb) {
    let key = request.key;
    if (!validateKey(key)) {
        return {
            errorCode: 'INVALID_CREDENTIALS'
        };
    }
    PropertiesService.getUserProperties().setProperty(APIKEY_STORAGE, key);
    // Update global
    togglApiInst.setAuthToken(key);
    return {
        errorCode: 'NONE'
    };
}

export { getUserApiKey };
