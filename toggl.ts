
/**
 * @author Joshua Tzucker
 */

class ToggleApi {
    private _authToken: string;
    constructor(authToken:string,apiBase:string=TOGGL_API_BASE){
        this._authToken = authToken;
    }
    private _responseTemplate: object = {
        success: <boolean> false,
        data: <object> {}
    }
    static readonly endpoints: object = {
        "me_simple": <string> "/me?with_related_data=false",
        "me_full": <string> "/me?with_related_data=true"
    }
    private readonly _authedFetchOptions: object = {
        "headers": <object> {
            "Content-Type" : <string> 'application/json',
            "Authorization" : <string> 'REPLACEME'
        }
    }
    assembleAuthHeader(){
        return Utilities.base64Encode('Basic ' + (this._authToken + ':api_token'));
    }
    setAuthToken(authToken:string){
        this._authToken = authToken;
    }
}


