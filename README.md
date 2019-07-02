# gds-toggl-connector
# Work in progress, probably about 80% done.
## Unofficial Google Data Studio connector for Toggl Timer

@TODO Add image demos here

@TODO Add link to full project post here

This is a custom Google Data Studio connector to pull in time entries and summary information from [Toggl](https://toggl.com/), the online time tracking software.

## Installation process for users
@TODO provide live production version link

Users must provide just a few details when setting up the connector for the first time:
 - Authentication:
     - User's API token is required. It can be obtained at the bottom of [https://toggl.com/app/profile](https://toggl.com/app/profile).
 - General configuration
     - Workspace: This is a space that a user belongs to in Toggl, that is used to separate accounts into logical "workspaces".
     - Pre-filter billable: All data return by the connector will only be for billable entries, as opposed to both billable and non-billable. The benefit to the user would be that if they only care about billable time, they want have to keep adding filters to all their reports/widgets to keep non-billable time out.

## Build Process
You might have noticed that I wrote this using TypeScript. At the moment, I'm not using Clasp or TS2GAS to do the conversion from TS to GAS (Google Apps Script) - I'm just using a highly customized setup of tsconfig and a "pre-transpilation" build step that prepares my code for the TS compiler.

Currently, the flow is TS -> Formatter (prep-ts.js) (removes import and export statements) -> Formatter (prep-ts.js) (Concatenation of multiple TS files into single TS intermediate file) -> TSC (TypeScript Compiler) (with single TS intermediate file as input) -> Polyfill adder (add-polyfill.js) (Inlines any polyfill files, such as es6-promises, into top of TSC single output JS file).

## TODO List
 - High Priority
     - Fill out appsscript.json
     - Implement caching
     - Resolve possible timezone issues
 - Everything else:
     - Add tests
     - Try to refactor getData() into more split out functions
 - Optional:
     - Setup clasp, but only with final output JS file (should be pretty easy to setup)
