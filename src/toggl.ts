import 'google-apps-script';
import './helpers';
import { Converters } from './helpers';
import 'es6-promise';

/**
 * @author Joshua Tzucker
 * @file toggl.ts
 */

// Handy aliases
type httpResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

// Some toggl interfaces

/**
 * Request interfaces
 */
export interface TogglReportRequestParams {
    [index: string] : any,
    user_agent: string,
    workspace_id: number,
    since?: Date,
    until?: Date, // YYYY-MM-DD
    billable?: "both"|"yes"|"no",
    client_ids?: Array<number>|"0",
    project_ids?: Array<number>|"0",
    user_ids?: Array<number>,
    members_of_group_ids?: Array<number>,
    tag_ids?: Array<number>|"0",
    task_ids?: Array<number>|"0",
    time_entry_ids?: Array<number>,
    description?: string,
    without_description?: boolean,
    order_desc?: "on"|"off",
    distinct_rates?: "on"|"off",
    rounding?: "on"|"off",
    display_hours?: "minutes"|"decimal"
}

// https://github.com/toggl/toggl_api_docs/blob/master/reports/detailed.md
interface TogglDetailedReportRequestParams extends TogglReportRequestParams {
    order_fields?: "date"|"description"|"duration"|"user",
    page: number
}

// https://github.com/toggl/toggl_api_docs/blob/master/reports/summary.md
interface TogglSummaryReportRequestParams extends TogglReportRequestParams {
    order_fields?: "title"|"duration"|"amount"
    grouping?: "projects"|"clients"|"users"
    subgrouping?: "time_entries"|"tasks"|"projects"|"users"
}

// https://github.com/toggl/toggl_api_docs/blob/master/reports/weekly.md
interface TogglWeeklyReportRequestParams extends TogglReportRequestParams {
    order_field?: "title"|"day1"|"day2"|"day3"|"day4"|"day5"|"day6"|"day7"|"week_total"
    grouping?: "projects"|"users",
    calculate?: "time"|"earnings",
}

/**
 * Response Interfaces
 */

 // Wrapper interface
export interface responseTemplate {
    success:boolean;
    raw: {
        [index:string]: any;
    };
}
export interface TogglStandardReportResponse {
    total_grand: number|null,
    total_billable: number|null,
    total_currencies: null|[{
        currency: string|null,
        amount: number|null
    }];
}

export interface TogglDetailedEntry {
    [index:string] : any,
    id: number,
    pid: null|number,
    tid: null|number,
    uid: number,
    description: string,
    start: string,
    end: string,
    updated: string,
    dur: number,
    user: string,
    use_stop: boolean,
    client: null|string,
    project: null|string,
    project_color?: null|string,
    project_hex_color?: null|string,
    task: null|string,
    billable: null|number,
    is_billable: boolean,
    cur: null|string,
    tags: Array<string>
}
export interface TogglDetailedReportResponse extends TogglStandardReportResponse {
    data: Array<TogglDetailedEntry>
}

/**
 * Entry summary belong to a specific project. Returned by requests that request grouping by report
 */
export interface TogglProjectGroupedEntry {
    title : {
        client: null|string,
        project: null|string,
        color?: null|string,
        hex_color?: null|string
    },
    pid: null|number,
    totals: Array<null|number>,
    details: Array<{
        uid: null|number,
        title : {
            user: string
        },
        totals: Array<null|number>
    }>
}

export interface TogglUserGroupedEntry {
    title : {
        user: string
    },
    uid: number,
    totals: Array<null|number>,
    details: Array<{
        pid?: null|number,
        title: {
            client: null|string,
            project: null|string,
            color?: null|string,
            hex_color?: null|string
        },
        totals: Array<null|number>
    }>
}

export interface TogglWeeklyReportResponse extends TogglStandardReportResponse {
    data: Array<TogglProjectGroupedEntry|TogglUserGroupedEntry>
}

export interface TogglSummaryEntry {
    [index: string] : any,
    id: null|number,
    title: {
        project?: string,
        client?: string,
        user?: string
        color?: string,
        hex_color?: string
    },
    items: Array<{
        title: {
            project?: string,
            client?: string,
            user?: string,
            task?: string,
            time_entry?: string
        },
        time: number,
        cur:null|string,
        sum:null|number,
        rate:null|number
    }>
}
export interface TogglSummaryReportResponse extends TogglStandardReportResponse {
    data: Array<TogglSummaryEntry>
}

export enum usedTogglResponseTypes {
    TogglDetailedReportResponse,
    TogglWeeklyReportResponse,
    TogglSummaryReportResponse
}
export enum usedToggleResponseEntriesTypes {
    TogglDetailedEntry,
    TogglProjectGroupedEntry,
    TogglUserGroupedEntry,
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
            me_full:  "/me?with_related_data=true"
        },
        reports : {
            weekly : "/weekly",
            detailed: "/details",
            summary: "/summary"
        }
    }
    static delay(ms:number){
        return new Promise((resolve:Function,reject:Function)=>{
            Logger.log('Sleeping for ' + ms + ' ms');
            Utilities.sleep(ms);
            resolve(true);
        });
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
    async getDetailsReportAllPages(workspaceId:number,since:Date,until:Date,startPage?:number){
        let currPage = (startPage || 1);
        let done = false;
        try {
            let startResult = await this.getDetailedReport(workspaceId,since,until,currPage);
            // Need to check for pagination...
            if (startResult.success && startResult.raw['per_page'] && startResult.raw['total_count']){
                let numPerPage:number = startResult.raw['per_page'];
                let fetchedNum:number = numPerPage * currPage;
                let totalCount:number = startResult.raw['total_count'];
                let resultArr:Array<any> = startResult.raw['data'];
                let finalResult = TogglApi.getResponseTemplate(true);
                if (fetchedNum < totalCount){
                    // Need to make request for next page.
                    // make sure to be aware of toggl 1 req/sec advice
                    while (!done){
                        await TogglApi.delay(1000);
                        currPage++;
                        let currResult = await this.getDetailedReport(workspaceId,since,until,currPage);
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
                    return startResult;
                }
            }
            else {
                done = true;
                return startResult;
            }
        }
        catch (e){
            Logger.log(e);
            throw(e);
        }
    }
    async getDetailedReport(workspaceId:number,since:Date,until:Date,page?:number){
        let currPage = (page || 1);
        let requestParams: TogglDetailedReportRequestParams = {
            workspace_id: workspaceId,
            user_agent: this._userAgent,
            since: since,
            until: until,
            page: currPage
        }
        let url: string = this._reportApiBase + TogglApi.endpoints.reports.detailed;
        url = TogglApi.requestParamsToQueryString(requestParams,url);
        try {
            let apiResponse: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(url,this._getAuthHeaders());
            // @TODO refactor to use typed results (:TogglDetailedReportResponse)
            let result = TogglApi.parseJsonResponse(apiResponse);
            return result;
        }
        catch (e){
            Logger.log(e);
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
            let stringifiedVal:string;
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
            finalQueryString += key + '=' + encodeURI(val);
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
