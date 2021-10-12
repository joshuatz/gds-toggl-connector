import { aggregationTypeEnum } from './gds-types';
import { Converters } from './helpers';
import { fieldTypeEnum } from './gds-types';

/**
 * To keep things clean and help with type checking, I'm maintaining a list of fields separately from getFields that will be used on both ends - prepping the fields and parsing return data
 */

export interface fieldMapping {
    id: string;
    name: string;
    description?: string;
    formula?: string;
    togglMapping?: {
        fields: {
            [index: string]: Array<string> | undefined;
            TogglDetailedEntry?: Array<string>;
            TogglWeeklyProjectGroupedEntry?: Array<string>;
            TogglWeeklyUserGroupedEntry?: Array<string>;
            TogglSummaryEntry?: Array<string>;
        };
        formatter?: Function;
    };
    semantics: {
        conceptType: 'DIMENSION' | 'METRIC';
        semanticType: GoogleAppsScript.Data_Studio.FieldType;
        semanticGroup?: GoogleAppsScript.Data_Studio.FieldType;
        aggregationType?: GoogleAppsScript.Data_Studio.AggregationType;
        isReaggregatable?: boolean;
    };
}

export const myFields: { [index: string]: fieldMapping } = {
    // Default date/time dimensions
    day: {
        id: 'day',
        name: 'Date',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['start']
            },
            formatter: (date: string) => {
                return Converters.formatDateForGds(date, fieldTypeEnum.YEAR_MONTH_DAY);
            }
        },
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY
        }
    },
    startedAtHour: {
        id: 'startedAtHour',
        name: 'Started At - Hour',
        description: 'The hour / time at which the time entry was started at',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['start']
            },
            formatter: (date: string) => {
                return Converters.formatDateForGds(date, fieldTypeEnum.YEAR_MONTH_DAY_HOUR);
            }
        },
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY_HOUR
        }
    },
    endedAtHour: {
        id: 'endedAtHour',
        name: 'Ended At - Hour',
        description: 'The hour / time at which the time entry ended',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY_HOUR
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['end']
            },
            formatter: (date: string) => {
                return Converters.formatDateForGds(date, fieldTypeEnum.YEAR_MONTH_DAY_HOUR);
            }
        }
    },
    // Main Time Entry stuff (title, id, etc.)
    entryId: {
        id: 'entryId',
        name: 'Entry ID',
        description: 'Numerical ID auto-generated by Toggl per entry',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['id']
            }
        }
    },
    entryCount: {
        id: 'entryCount',
        name: 'Entry Count',
        description: 'Sum of all (unique) time entries',
        formula: 'COUNT_DISTINCT($entryId)',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.NUMBER
        }
    },
    entryDescription: {
        id: 'entryDescription',
        name: 'Entry Description / Title',
        description: 'Entry Description / Title. Not required by Toggl',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['description']
            }
        }
    },
    // Task Entry
    taskId: {
        id: 'taskId',
        name: 'Task ID',
        description: 'Task ID, only available on paid accounts',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['tid']
            }
        }
    },
    // Projects
    projectId: {
        id: 'projectId',
        name: 'Project ID',
        description: 'Numerical ID generated by Toggl for each project',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['pid'],
                TogglWeeklyProjectGroupedEntry: ['pid'],
                TogglWeeklyUserGroupedEntry: ['details.pid'],
                TogglSummaryEntry: ['pid']
            }
        },
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER
        }
    },
    projectCount: {
        id: 'projectCount',
        name: 'Project Count',
        description: 'Count of Unique Projects',
        formula: 'COUNT_DISTINCT($projectId)',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.NUMBER
        }
    },
    projectName: {
        id: 'projectName',
        name: 'Project Name',
        description: 'Your project name',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['project'],
                TogglWeeklyProjectGroupedEntry: ['title.project'],
                TogglSummaryEntry: ['title.project']
            }
        }
    },
    // Clients
    clientId: {
        id: 'clientId',
        name: 'Client ID',
        description: 'Numerical ID generated by Toggl for each client',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER
        },
        togglMapping: {
            fields: {
                // Client ID is only returned in reports explicitly grouped by client - e.g. summary
                TogglSummaryEntry: ['cid']
            }
        }
    },
    clientName: {
        id: 'clientName',
        name: 'Client Name',
        description: 'Client Name',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['client'],
                TogglWeeklyProjectGroupedEntry: ['title.client'],
                TogglSummaryEntry: ['title.client']
            }
        }
    },
    // Billing Info
    billableMoneyTotal: {
        id: 'billableMoneyTotal',
        name: 'Total Billable Amount',
        description: 'Total Billable Amount in Configured Currency',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.CURRENCY_USD
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['billable'],
                TogglSummaryEntry: ['totalBillingSum']
            },
            formatter: Converters.formatCurrencyForGds
        }
    },
    billableTimeTotal: {
        id: 'billableTimeTotal',
        name: 'Total Billable Hours',
        description: 'Total Billable Time, as configured in Toggl',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.DURATION
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['billableTime'],
                TogglSummaryEntry: ['totalBillingTime']
            },
            formatter: (duration: number) => {
                return Converters.togglDurationToGdsDuration(duration);
            }
        }
    },
    isBillable: {
        id: 'isBillable',
        name: 'Is Billable',
        description: 'Whether given entry was marked as billable',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.BOOLEAN
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['is_billable']
            },
            formatter: Converters.forceBoolean
        }
    },
    billingRate: {
        id: 'billingRate',
        name: 'Billing Rate',
        description: 'Billing Rate',
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.CURRENCY_USD,
            isReaggregatable: true,
            aggregationType: aggregationTypeEnum.AVG
        },
        togglMapping: {
            fields: {
                TogglSummaryEntry: ['avgBillingRate']
            },
            formatter: Converters.formatCurrencyForGds
        }
    },
    // !!! - Time Field - !!!
    time: {
        id: 'time',
        name: 'Time',
        description: 'Logged Time',
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['dur'],
                TogglSummaryEntry: ['time']
            },
            formatter: (duration: number) => {
                return Converters.togglDurationToGdsDuration(duration);
            }
        },
        semantics: {
            conceptType: 'METRIC',
            semanticType: fieldTypeEnum.DURATION
        }
    },
    // User Info
    userId: {
        id: 'userId',
        name: 'User ID',
        description: 'Numerical User ID, autogenerated by Toggl',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.NUMBER,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['uid']
            }
        }
    },
    userName: {
        id: 'userName',
        name: 'User Name',
        description: 'Your Toggl User Name',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.TEXT,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['user']
            }
        }
    },
    // Meta info
    updatedAt: {
        id: 'updatedAt',
        name: 'Updated At - Hour',
        description: 'When the time entry was last edited',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.YEAR_MONTH_DAY_HOUR,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['updated']
            },
            formatter: (date: string) => {
                return Converters.formatDateForGds(date, fieldTypeEnum.YEAR_MONTH_DAY_HOUR);
            }
        }
    },
    useStop: {
        id: 'useStop',
        name: 'Use Stop',
        description: 'If the stop time is saved on the entry',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: fieldTypeEnum.BOOLEAN,
            isReaggregatable: false
        },
        togglMapping: {
            fields: {
                TogglDetailedEntry: ['use_stop']
            }
        }
    }
    // @TODO - Add "tags"
};
