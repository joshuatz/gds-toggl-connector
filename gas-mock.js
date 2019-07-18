/**
 * @author Joshua Tzucker
 * @file gas-mock.js
 * Attempts to mock / shim / polyfill GAS environment stuff (like UrlFetchApp)
 * @TODO build out, if necessary for tests (or delete if not)
 */

DataStudioApp = {
    createCommunityConnector: function(){ return {
        FieldType: 'foobar',
        AggregationType: {
            "SUM" : "SUM"
        },
        getConfig: function(){
            return {
                newSelectSingle
            }
        }
    }}
}
PropertiesService = {
    getUserProperties : function(){
        return {
            getProperty: function(input){
                return 'asfasfasdf';
            }
        }
    }
}