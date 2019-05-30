
/**
 * @author Joshua Tzucker
 */

var TogglApi = (function(){
    function TogglApiConstructor(authToken,apiBase){
        this.apiBase = typeof(apiBase)==='string' ? apiBase : TOGGL_API_BASE;
        this.authToken = authToken;
        this.responseTemplate = {
            success : false,
            data : {}
        };
        this.authedFetchOptions = {
            headers : {
                "Content-Type" : 'application/json',
                "Authorization" : this.assembleAuthHeader()
            }
        };
        this.endpoints = {
            "me_simple" : "/me?with_related_data=false",
            "me_full" : "/me?with_related_data=true"
        }
    }
    TogglApiConstructor.prototype.setAuthToken = function(authToken){
        this.authToken = authToken;
    }
    TogglApiConstructor.prototype.assembleAuthHeader = function(){
        return Utilities.base64Encode('Basic ' + (this.authToken + ':api_token'));
    }
    TogglApiConstructor.prototype.getBasicAcctInfo = function(){
        var url = this.apiBase + this.endpoints.me_simple;
        var apiResponse = UrlFetchApp.fetch(url,this.authedFetchOptions);
        return this.parseJsonResponse(apiResponse);
    }
    /**
     * Statics
     */
    TogglApiConstructor.checkResponseValid = function(httpResponseObj){
        var validResponse = true;
        var validAuth = true;
        if (typeof(httpResponseObj.getResponseCode)!=='function'){
            valid = false;
        }
        else {
            if (httpResponseObj.getResponseCode() !== 200){
                valid = false;
                if (httpResponseObj.getResponseCode() === 403){
                    // Forbidden
                    validAuth = false;
                }
            }
        }
        if (typeof(httpResponseObj.getContentText)){
            if (httpResponseObj.getContentText().length < 3){
                valid = false;
            }
        }
        return {
            valid : validResponse,
            auth : validAuth
        }
    }
    TogglApiConstructor.parseJsonResponse = function(httpResponseObj){
        var parsed = this.responseTemplate;
        var json = {};
        var valid = this.checkResponseValid(httpResponseObj).valid;
        if (valid){
            try {
                json = JSON.parse(httpResponseObj.getContentText('utf-8'));
            }
            catch (e){
                valid = false;
            }
        }
        parsed.valid = valid;
        parsed.data = json;
        return parsed;
    }
    return TogglApiConstructor;
}());

var t = new TogglApi('jljkjlkjlkjlkjljkjlklkjlkjlkj');
t.getBasicAcctInfo();

