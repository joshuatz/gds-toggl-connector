import 'google-apps-script';
/**
 * @author Joshua Tzucker
 * @file toggl.ts
 */

// Handy aliases
type httpResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;
export class TogglApi {
    private _authToken: string;
    private _apiBase: string;
    
    constructor(authToken:string|null='',apiBase:string=TOGGL_API_BASE){
        this._authToken = (authToken || '');
        this._apiBase = apiBase;
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
    private readonly _authedFetchOptions = {
        "headers": <object> {
            "Content-Type" : <string> 'application/json',
            "Authorization" : <string> this.assembleAuthHeader()
        }
    }
    getBasicAcctInfo(){
        let url: string = this._apiBase + TogglApi.endpoints.me_simple;
        let apiResponse: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(url,this._authedFetchOptions);
        return TogglApi.parseJsonResponse(apiResponse);
    }
    assembleAuthHeader(){
        return Utilities.base64Encode('Basic ' + (this._authToken + ':api_token'));
    }
    setAuthToken(authToken:string){
        this._authToken = authToken;
    }
    static checkResponseValid(response: httpResponse){
        let validResponse: boolean = true;
        let validAuth: boolean = true;
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
            auth: validAuth
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
