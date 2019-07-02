import 'google-apps-script';
import './helpers';
import { Converters, myConsole } from './helpers';
import { responseTemplate, TogglDetailedReportRequestParams, TogglSummaryReportRequestParams, TogglWeeklyReportRequestParams } from './toggl-types';

/**
 * @author Joshua Tzucker
 * @file toggl.ts
 */

// Handy aliases
type httpResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

export enum usedTogglResponseTypes {
    TogglDetailedReportResponse,
    TogglWeeklyReportResponse,
    TogglSummaryReportResponse
}
export enum usedToggleResponseEntriesTypes {
    TogglDetailedEntry,
    TogglWeeklyProjectGroupedEntry,
    TogglWeeklyUserGroupedEntry,
    TogglSummaryEntry
}

export class TogglApi {
    private _authToken: string;
    private _userAgent: string;
    private readonly _userApiBase: string = 'https://www.toggl.com/api/v8';
    private readonly _reportApiBase: string = 'https://toggl.com/reports/api/v2';
    
    constructor(authToken:string|null='',userAgent:string|null=APP_USER_AGENT){
        this._authToken = (authToken || '');
        this._userAgent = (userAgent || APP_USER_AGENT);
    }
    static getResponseTemplate(success:boolean=false, raw:object={}){
        let response:responseTemplate = {
            success: success,
            raw: raw
        }
        return response;
    }
    static readonly endpoints = {
        user : {
            me_simple: "/me?with_related_data=false",
            me_full:  "/me?with_related_data=true",
            workspaces : "/workspaces"
        },
        reports : {
            weekly : "/weekly",
            detailed: "/details",
            summary: "/summary"
        }
    }
    static delaySync(ms:number){
        // This should be blocking/sync by default
        Utilities.sleep(ms);
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
        let url: string = this._userApiBase + TogglApi.endpoints.user.me_simple;
        try {
            let apiResponse: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(url,this._getAuthHeaders());
            return TogglApi.parseJsonResponse(apiResponse);
        }
        catch (e){
            Logger.log(e);
            return TogglApi.getResponseTemplate(false);
        }
    }
    getDetailsReportAllPages(workspaceId:number,since:Date,until:Date,startPage?:number,filterToBillable?:boolean){
        filterToBillable = typeof(filterToBillable)==='boolean' ? filterToBillable : false;
        // @TODO limit number of pages requested? Return userError if exceeded?
        myConsole.log('starting getDetailsReportAllPages');
        let currPage = (startPage || 1);
        let done = false;
        try {
            let startResult = this.getDetailedReport(workspaceId,since,until,currPage);
            //myConsole.log(startResult);
            // Need to check for pagination...
            if (startResult.success && startResult.raw['per_page'] && startResult.raw['total_count']){
                let numPerPage:number = startResult.raw['per_page'];
                let fetchedNum:number = numPerPage * currPage;
                let totalCount:number = startResult.raw['total_count'];
                let resultArr:Array<any> = startResult.raw['data'];
                if (fetchedNum < totalCount){
                    // Need to make request for next page.
                    // make sure to be aware of toggl 1 req/sec advice
                    let finalResult = TogglApi.getResponseTemplate(true);
                    myConsole.log('getDetailsReportAllPages - starting pagination');
                    while (!done){
                        TogglApi.delaySync(1000);
                        currPage++;
                        myConsole.log('Current Page = ' + currPage);
                        let currResult = this.getDetailedReport(workspaceId,since,until,currPage,filterToBillable);
                        if (currResult.success && Array.isArray(currResult.raw['data'])){
                            fetchedNum = numPerPage * currPage;
                            done = (fetchedNum < totalCount);
                            // Concat arrays
                            resultArr = resultArr.concat(currResult.raw['data']);
                        }
                        else {
                            done = true;
                        }
                    }
                    // Return result with array modified to include concatenated results from pages
                    finalResult.raw = resultArr;
                    return finalResult;
                }
                else {
                    done = true;
                    myConsole.log({'message':'Detailed Report - only single page of results'});
                    return startResult;
                }
            }
            else {
                done = true;
                myConsole.log('API did not return paging results');
                return startResult;
            }
        }
        catch (e){
            myConsole.log(e);
            throw(e);
        }
    }
    getDetailedReport(workspaceId:number,since:Date,until:Date,page?:number,filterToBillable?:boolean){
        filterToBillable = typeof(filterToBillable)==='boolean' ? filterToBillable : false;
        let filterToBillableString:'yes'|'both'|'no' = filterToBillable==true ? 'yes' : 'both';
        let currPage = (page || 1);
        let requestParams: TogglDetailedReportRequestParams = {
            workspace_id: workspaceId,
            user_agent: this._userAgent,
            since: since,
            until: until,
            page: currPage,
            billable: filterToBillableString
        }
        let url:string = this._reportApiBase + TogglApi.endpoints.reports.detailed;
        url = TogglApi.requestParamsToQueryString(requestParams,url);
        try {
            let apiResponse: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(url,this._getAuthHeaders());
            // @TODO refactor to use typed results (:TogglDetailedReportResponse)
            let result = TogglApi.parseJsonResponse(apiResponse);
            return result;
        }
        catch (e){
            myConsole.error(e);
            throw(e);
        }
    }
    getSummaryReport(workspaceId:number,since:Date,until:Date,grouping:'projects'|'clients'|'users'='projects',subgrouping:'time_entries'|'tasks'|'projects'|'users'='time_entries',filterToBillable?:boolean){
        filterToBillable = typeof(filterToBillable)==='boolean' ? filterToBillable : false;
        let filterToBillableString:'yes'|'both'|'no' = filterToBillable==true ? 'yes' : 'both';
        let requestParams: TogglSummaryReportRequestParams = {
            workspace_id: workspaceId,
            user_agent: this._userAgent,
            since: since,
            until: until,
            grouping: grouping,
            subgrouping: subgrouping,
            billable: filterToBillableString
        }
        // Check for valid combinations - subgrouping cannot be same as grouping
        if (grouping===subgrouping){
            cc.newDebugError()
                .setText('Invalid combination of grouping and subgrouping in getSummaryReport request')
                .throwException();
            return TogglApi.getResponseTemplate(false);
        }
        let url:string = this._reportApiBase + TogglApi.endpoints.reports.summary;
        url = TogglApi.requestParamsToQueryString(requestParams,url);
        try {
            let apiResponse: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(url,this._getAuthHeaders());
            let result = TogglApi.parseJsonResponse(apiResponse);
            return result;
        }
        catch (e){
            myConsole.error(e);
            throw(e);
        }
    }
    getWeeklyReport(){
        // @TODO
    }
    getWorkspaceIds(){
        let url:string = this._userApiBase + TogglApi.endpoints.user.workspaces;
        try {
            let apiResponse: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(url,this._getAuthHeaders());
            let result = TogglApi.parseJsonResponse(apiResponse);
            return result;
        }
        catch (e){
            myConsole.error(e);
            throw(e);
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
                    // @TODO start back-off procedure and delay/sleep until ready
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
    /**
     * Simple wrapper around parsing JSON response from API with try/catch
     * @param response {object} - {success:bool, data: responseJson}
     */
    static parseJsonResponse(response: httpResponse){
        let parsed = TogglApi.getResponseTemplate();
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
        parsed.raw = json;
        return parsed;
    }
    /**
     * A helper function to turn key/value pairs object into stringified query string for GET endpoint
     * @param requestParams A set of key/value pairs that correspond to a given toggl endpoint and are accepted as querystring params to control the response.
     */
    static requestParamsToQueryString(requestParams:TogglDetailedReportRequestParams|TogglSummaryReportRequestParams|TogglWeeklyReportRequestParams,urlToAppendTo?:string){
        let finalQueryString = '';
        let finalResult = '';
        let index = 0;
        for (let key in requestParams){
            let val = requestParams[key];
            let stringifiedVal:string = '';
            // Date
            if (typeof(val.getTime)==='function'){
                stringifiedVal = Converters.formatDateForTogglApi(val);
            }
            // Array
            else if (Array.isArray(val)){
                // Toggl uses comma sep vals, to calling Array.toString() should be fine.
                stringifiedVal = val.toString();
            }
            // boolean
            else if (typeof(val)==='boolean'){
                // Toggl accepts boolean as string, not binary, so keep to "true" or "false"
                stringifiedVal = val.toString();
            }
            else if(typeof(val)==='number'){
                stringifiedVal = val.toString();
            }
            else if (typeof(val)==='string'){
                stringifiedVal = val;
            }
            else {
                // This should not get hit, but just in case...
                stringifiedVal = val.toString();
            }
            // Actually join together
            if (index > 0){
                finalQueryString += '&';
            }
            finalQueryString += key + '=' + encodeURI(stringifiedVal);
            index++;
        }
        if (urlToAppendTo){
            if (/\?/.test(urlToAppendTo)){
                finalResult = urlToAppendTo + '&' + finalQueryString;
            }
            else {
                finalResult = urlToAppendTo + '?' + finalQueryString;
            }
        }
        else {
            finalResult = finalQueryString;
        }
        return finalResult;
    }
}
