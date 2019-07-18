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
            FieldType: {"YEAR":0,"YEAR_QUARTER":1,"YEAR_MONTH":2,"YEAR_WEEK":3,"YEAR_MONTH_DAY":4,"YEAR_MONTH_DAY_HOUR":5,"QUARTER":6,"MONTH":7,"WEEK":8,"MONTH_DAY":9,"DAY_OF_WEEK":10,"DAY":11,"HOUR":12,"MINUTE":13,"DURATION":14,"COUNTRY":15,"COUNTRY_CODE":16,"CONTINENT":17,"CONTINENT_CODE":18,"SUB_CONTINENT":19,"SUB_CONTINENT_CODE":20,"REGION":21,"REGION_CODE":22,"CITY":23,"CITY_CODE":24,"METRO":25,"METRO_CODE":26,"LATITUDE_LONGITUDE":27,"NUMBER":28,"PERCENT":29,"TEXT":30,"BOOLEAN":31,"URL":32,"HYPERLINK":33,"IMAGE":34,"IMAGE_LINK":35,"CURRENCY_AED":36,"CURRENCY_ALL":37,"CURRENCY_ARS":38,"CURRENCY_AUD":39,"CURRENCY_BDT":40,"CURRENCY_BGN":41,"CURRENCY_BOB":42,"CURRENCY_BRL":43,"CURRENCY_CAD":44,"CURRENCY_CDF":45,"CURRENCY_CHF":46,"CURRENCY_CLP":47,"CURRENCY_CNY":48,"CURRENCY_COP":49,"CURRENCY_CRC":50,"CURRENCY_CZK":51,"CURRENCY_DKK":52,"CURRENCY_DOP":53,"CURRENCY_EGP":54,"CURRENCY_ETB":55,"CURRENCY_EUR":56,"CURRENCY_GBP":57,"CURRENCY_HKD":58,"CURRENCY_HRK":59,"CURRENCY_HUF":60,"CURRENCY_IDR":61,"CURRENCY_ILS":62,"CURRENCY_INR":63,"CURRENCY_IRR":64,"CURRENCY_ISK":65,"CURRENCY_JMD":66,"CURRENCY_JPY":67,"CURRENCY_KRW":68,"CURRENCY_LKR":69,"CURRENCY_LTL":70,"CURRENCY_MNT":71,"CURRENCY_MVR":72,"CURRENCY_MXN":73,"CURRENCY_MYR":74,"CURRENCY_NOK":75,"CURRENCY_NZD":76,"CURRENCY_PAB":77,"CURRENCY_PEN":78,"CURRENCY_PHP":79,"CURRENCY_PKR":80,"CURRENCY_PLN":81,"CURRENCY_RON":82,"CURRENCY_RSD":83,"CURRENCY_RUB":84,"CURRENCY_SAR":85,"CURRENCY_SEK":86,"CURRENCY_SGD":87,"CURRENCY_THB":88,"CURRENCY_TRY":89,"CURRENCY_TWD":90,"CURRENCY_TZS":91,"CURRENCY_UAH":92,"CURRENCY_USD":93,"CURRENCY_UYU":94,"CURRENCY_VEF":95,"CURRENCY_VND":96,"CURRENCY_YER":97,"CURRENCY_ZAR":98},
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
            getConfig: function(): GoogleAppsScript.Data_Studio.Config {
                build: function(): any {
                    //
                },
                newCheckbox: function(): GoogleAppsScript.Data_Studio.Checkbox {
                    //
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
                }
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

