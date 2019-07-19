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
                        let _id = '';
                        let _text = '';
                        let infoObj: GoogleAppsScript.Data_Studio.Info = {
                            setId: function(id:string): GoogleAppsScript.Data_Studio.Info {
                                _id = id;
                                return infoObj;
                            },
                            setText: function(text:string): GoogleAppsScript.Data_Studio.Info {
                                _text = text;
                                return infoObj;
                            }
                        }
                        return infoObj;
                    },
                    newOptionBuilder: function(): GoogleAppsScript.Data_Studio.OptionBuilder {
                        let optionBuilderObj: GoogleAppsScript.Data_Studio.OptionBuilder = {
                            setLabel: function(label:string){
                                return optionBuilderObj;
                            },
                            setValue: function(value:string){
                                return optionBuilderObj;
                            }
                        }
                        return optionBuilderObj;
                    },
                    newSelectMultiple: function(): GoogleAppsScript.Data_Studio.SelectMultiple {
                        let selectMultipleObj: GoogleAppsScript.Data_Studio.SelectMultiple = {
                            addOption: function(optionBuilder:GoogleAppsScript.Data_Studio.OptionBuilder){
                                return selectMultipleObj;
                            },
                            setAllowOverride: function(allowOverride:boolean){
                                return selectMultipleObj;
                            },
                            setHelpText: function(helpText: string){
                                return selectMultipleObj;
                            },
                            setId: function(id:string){
                                return selectMultipleObj;
                            },
                            setName: function(name:string){
                                return selectMultipleObj;
                            }
                        }
                        return selectMultipleObj;
                    },
                    newSelectSingle: function(): GoogleAppsScript.Data_Studio.SelectSingle {
                        let selectSingleObj: GoogleAppsScript.Data_Studio.SelectSingle = {
                            addOption: function(optionBuilder: GoogleAppsScript.Data_Studio.OptionBuilder){
                                return selectSingleObj;
                            },
                            setAllowOverride: function(allowOverride: boolean){
                                return selectSingleObj;
                            },
                            setHelpText: function(helpText: string){
                                return selectSingleObj;
                            },
                            setId: function(id: string){
                                return selectSingleObj;
                            },
                            setName: function(name: string){
                                return selectSingleObj;
                            }
                        }
                        return selectSingleObj;
                    },
                    newTextArea: function(): GoogleAppsScript.Data_Studio.TextArea {
                        let textAreaObj: GoogleAppsScript.Data_Studio.TextArea = {
                            setAllowOverride: function(allowOverride: boolean){
                                return textAreaObj;
                            },
                            setHelpText: function(helpText: string){
                                return textAreaObj;
                            },
                            setId: function(id: string){
                                return textAreaObj;
                            },
                            setName: function(name: string){
                                return textAreaObj;
                            },
                            setPlaceholder: function(placeholder: string){
                                return textAreaObj;
                            },
                        }
                        return textAreaObj;
                    },
                    // Identical signature to newTextArea
                    newTextInput: function(): GoogleAppsScript.Data_Studio.TextInput {
                        let textInputObj: GoogleAppsScript.Data_Studio.TextInput = {
                            setAllowOverride: function(allowOverride: boolean){
                                return textInputObj;
                            },
                            setHelpText: function(helpText: string){
                                return textInputObj;
                            },
                            setId: function(id: string){
                                return textInputObj;
                            },
                            setName: function(name: string){
                                return textInputObj;
                            },
                            setPlaceholder: function(placeholder: string){
                                return textInputObj;
                            },
                        }
                        return textInputObj;
                    },
                    printJson: function(): string {
                        // @TODO
                        return '{}';
                    },
                    setDateRangeRequired: function(dateRangeRequired:boolean): GoogleAppsScript.Data_Studio.Config {
                        return _this;
                    }
                }
            },
            getFields: function(): GoogleAppsScript.Data_Studio.Fields {
                return {
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

