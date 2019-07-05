/**
 * @author Joshua Tzucker
 * @file toggl-types.ts - Some common interfaces for Toggl API - requests and responses
 * Should correlate with https://github.com/toggl/toggl_api_docs
 */

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
export interface TogglDetailedReportRequestParams extends TogglReportRequestParams {
    order_fields?: "date"|"description"|"duration"|"user",
    page: number
}

// https://github.com/toggl/toggl_api_docs/blob/master/reports/summary.md
export interface TogglSummaryReportRequestParams extends TogglReportRequestParams {
    order_fields?: "title"|"duration"|"amount"
    grouping?: "projects"|"clients"|"users"
    subgrouping?: "time_entries"|"tasks"|"projects"|"users",
    subgrouping_ids?: boolean,
    grouped_time_entry_ids?: boolean
}

// https://github.com/toggl/toggl_api_docs/blob/master/reports/weekly.md
export interface TogglWeeklyReportRequestParams extends TogglReportRequestParams {
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
export interface TogglWeeklyProjectGroupedEntry {
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

export interface TogglWeeklyUserGroupedEntry {
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
    data: Array<TogglWeeklyProjectGroupedEntry|TogglWeeklyUserGroupedEntry>
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
    time: number,
    total_currencies: null|[{
        currency: string|null,
        amount: number|null
    }],
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