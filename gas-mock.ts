/**
 * @author Joshua Tzucker
 * @file gas-mock.js
 * Attempts to mock / shim / polyfill GAS environment stuff (like UrlFetchApp)
 * @TODO build out, if necessary for tests (or delete if not)
 * If this gets useable enough, might be worth building out as its own lib/repo
 */

var DataStudioApp:GoogleAppsScript.Data_Studio.DataStudioApp = {
    createCommunityConnector: function(): GoogleAppsScript.Data_Studio.CommunityConnector {
        return {
            AggregationType: {
                AVG: 0,
                COUNT: 1,
                COUNT_DISTINCT: 2,
                MAX: 3,
                MIN: 4,
                SUM: 5,
                AUTO: 6,
                NO_AGGREGATION: 7
            },
            AuthType: {
                "NONE" : 0,
                "OAUTH2": 1,
                "USER_PASS": 2,
                "KEY": 3,
                "USER_TOKEN": 4
            },
            BigQueryParameterType: GoogleAppsScript.Data_Studio.BigQueryParameterType,
            FieldType: GoogleAppsScript.Data_Studio.FieldType,
            getConfig: function(): GoogleAppsScript.Data_Studio.Config {
                let _this = this;
                return {
                    build: function(): object {
                        return {};
                    },
                    newCheckbox: function(): GoogleAppsScript.Data_Studio.Checkbox {
                        return {
                            setAllowOverride: function(allowOverride: boolean): GoogleAppsScript.Data_Studio.Checkbox {
                                return this;
                            },
                            setHelpText: function(helpText: string): GoogleAppsScript.Data_Studio.Checkbox{
                                return this;
                            },
                            setId: function(id:string): GoogleAppsScript.Data_Studio.Checkbox {
                                return this;
                            },
                            setName: function(name:string): GoogleAppsScript.Data_Studio.Checkbox {
                                return this;
                            }
                        }
                    },
                    newInfo: function(): GoogleAppsScript.Data_Studio.Info {
                        //
                    },
                    newOptionBuilder: function(): GoogleAppsScript.Data_Studio.OptionBuilder {
                        //
                    },
                    newSelectMultiple: function(): GoogleAppsScript.Data_Studio.SelectMultiple {
                        //
                    },
                    newSelectSingle: function(): GoogleAppsScript.Data_Studio.SelectSingle {
                        //
                    },
                    newTextArea: function(): GoogleAppsScript.Data_Studio.TextArea {
                        //
                    },
                    newTextInput: function(): GoogleAppsScript.Data_Studio.TextInput {
                        //
                    },
                    printJson: function(): string {
                        //
                    },
                    setDateRangeRequired: function(dateRangeRequired:boolean): GoogleAppsScript.Data_Studio.Config {
                        return _this;
                    }
                }
            },
            getFields: function(): GoogleAppsScript.Data_Studio.Fields {
                asArray: function(): GoogleAppsScript.Data_Studio.Field[] {
                    //
                },
                build: function(): object[] {
                    //
                },
                forIds: function(ids: string[]): GoogleAppsScript.Data_Studio.Fields {
                    //
                },
                getDefaultDimension: function(): GoogleAppsScript.Data_Studio.Field {
                    //
                },
                getDefaultMetric: function(): GoogleAppsScript.Data_Studio.Field {
                    //
                },
                getFieldById: function(): GoogleAppsScript.Data_Studio.Field {
                    //
                },
                newDimension: function(): GoogleAppsScript.Data_Studio.Field {
                    //
                },
                newMetric: function(): GoogleAppsScript.Data_Studio.Field {
                    //
                },
                setDefaultDimension: function(fieldId: string): void {
                    //
                },
                setDefaultMetric: function(fieldId: string): void {
                    //
                }
            },
            newAuthTypeResponse: function(): GoogleAppsScript.Data_Studio.GetAuthTypeResponse {
                //
            },
            newBigQueryConfig: function(): GoogleAppsScript.Data_Studio.BigQueryConfig {
                //
            },
            newDebugError: function(): GoogleAppsScript.Data_Studio.DebugError {
                //
            },
            newUserError: function(): GoogleAppsScript.Data_Studio.UserError {
                //
            }
        }
    }
}

// PropertiesService = {
//     getUserProperties : function(){
//         return {
//             getProperty: function(input){
//                 return 'asfasfasdf';
//             }
//         }
//     }
// }

