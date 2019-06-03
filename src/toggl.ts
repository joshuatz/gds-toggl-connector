import 'google-apps-script';
/**
 * @author Joshua Tzucker
 * @file toggl.ts
 */

// Handy aliases
type httpResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;
export class TogglApi {
    private _authToken: string;
    private readonly _userApiBase: string = 'https://www.toggl.com/api/v8';
    private readonly _reportApiBase: string = 'https://toggl.com/reports/api/v2';
    
    constructor(authToken:string|null=''){
        this._authToken = (authToken || '');
    }
    static responseTemplate = class {
        success: boolean;
        data: object;
        constructor(success:boolean=false, data:object={}){
            this.success = success;
            this.data = data;
        }
    }
    static readonly endpoints = {
        me_simple: "/me?with_related_data=false",
        me_full:  "/me?with_related_data=true"
    }

    private _getAuthHeaders(){
        return {
            "headers": <object> {
                "Content-Type" : <string> 'application/json',
                "Authorization" : <string> this.assembleAuthHeader()
            }
        }
    }
    getBasicAcctInfo(){
        let url: string = this._userApiBase + TogglApi.endpoints.me_simple;
        Logger.log(this._getAuthHeaders());
        try {
            let apiResponse: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(url,this._getAuthHeaders());
            return TogglApi.parseJsonResponse(apiResponse);
        }
        catch (e){
            Logger.log(e);
            return new TogglApi.responseTemplate();
        }
    }
    assembleAuthHeader(){
        return 'Basic ' + Utilities.base64Encode(this._authToken + ':api_token');
    }
    setAuthToken(authToken:string){
        this._authToken = authToken;
    }
    static checkResponseValid(response: httpResponse){
        let validResponse: boolean = true;
        let validAuth: boolean = true;
        let rateLimited: boolean = false;
        if (typeof(response.getResponseCode)!=='function'){
            validResponse = false;
        }
        else {
            if (response.getResponseCode() !== 200){
                validResponse = false;
                if (response.getResponseCode() === 403){
                    // Forbidden
                    validAuth = false;
                }
                else if (response.getResponseCode() === 429){
                    // Rate limited
                    rateLimited = true;
                }
            }
        }
        if (typeof(response.getContentText)!=='function'){
            validResponse = false;
        }
        else {
            if (response.getContentText().length < 3){
                validResponse = false;
            }
        }
        return {
            valid: validResponse,
            auth: validAuth,
            rateLimited: rateLimited
        }
    }
    static parseJsonResponse(response: httpResponse){
        let parsed = new TogglApi.responseTemplate;
        let json: object = {};
        let valid: boolean = this.checkResponseValid(response).valid;
        if (valid){
            try {
                json = JSON.parse(response.getContentText('utf-8'));
            }
            catch (e){
                valid = false;
            }
        }
        parsed.success = valid;
        parsed.data = json;
        return parsed;
    }
}
