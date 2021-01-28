# gds-toggl-connector
## Unofficial Google Data Studio connector for Toggl Timer
![Demo](demo.gif "Demo")
## Project page
[https://joshuatz.com/projects/marketing/google-data-studio-toggl-time-tracker-connector](https://joshuatz.com/projects/marketing/google-data-studio-toggl-time-tracker-connector)

## What is this?
This is a custom Google Data Studio connector to pull in time entries and summary information from [Toggl](https://toggl.com/), the online time tracking software.

## Installation process for users
### Installing via Sideloading
As I have decided not to pursue publishing this as a partner connector, the way to currently install this is via sideloading - unless you fork this project and publish it as a partner connector yourself.

> For why I'm not pursuing publishing as a partner connector: I'm not interested in jumping through the hoops that Google has added, and am not thrilled with how they have handled the open-source publishing situation.

Sideloading is actually fairly easy, and once you go through the initial steps, it works just as if it were a real published connector.

> 🤔 "What is sideloading?" - *Sideloading* usually refers to installing applications directly via binaries or other offline files, instead of through official channels. In this context, I'm using it to refer to the process of loading in a Data Studio connector via your own private Google Apps Script project, instead of [the official Connector Gallery](https://datastudio.google.com/data)

#### Side-loading Steps:
> If you are comfortable working with CLIs, a lot of these steps could be expedited by using [clasp](https://developers.google.com/apps-script/guides/clasp).

1. Create a new blank Google Apps Script project
     - Follow the steps outlined in the official docss - ["Creating and deleting projects"](https://developers.google.com/apps-script/guides/projects#creating_and_deleting_projects)
     - Clasp: [`clasp create` command](https://github.com/google/clasp#create)
2. Now you need the "build" files from this project to add to your project
     - If you want to use the pre-built files, you can snag them from [`/build` in this repo](./build).
     - If you are comfortable with the CLI and want to build the files yourself, init this repo, and run `npm run build`, then copy files from `/build`
3. Upload the files to your Apps Script project
     - Manually: Copy and paste the contents of each file into a file that you create in your project with the same filename:
         - `/build/main.js`
         - `/build/appsscript.json`
         - You can skip the other files in this directory
     - Clasp: modify `/build/.clasp.json` to match your project ID, then `cd build`, and then use `clasp push`
4. Publish / create a deployment
     - The steps to do this depend on which version of the IDE you are using: [see docs](https://developers.google.com/apps-script/concepts/deployments)
         - I believe the type should be `add-on`
     - Clasp: See ["deploy" docs](https://github.com/google/clasp#deploy)
5. Once you have a deployment, you are ready to start using it!
     - Main docs
         - ["Use and test a Community Connector"](https://developers.google.com/datastudio/connector/use)
     - If you are only using it for yourself, this step should be pretty easy - the connector should auto-install when you click the deployment link, or you can manually copy and paste the deployment ID
     - If you want to share the deployment with other users (without publicly publishing the connector), you have two main options:
         - Use ["Direct Links"](https://developers.google.com/datastudio/connector/direct-links) (newer feature)
         - Make the script shared, and pass around the deploy ID for manual use

### Connector Configuration
Users must provide just a few details when setting up the connector for the first time:
 - Authentication:
     - User's API token is required. It can be obtained at the bottom of [https://toggl.com/app/profile](https://toggl.com/app/profile).
 - General configuration
     - Workspace: This is a space that a user belongs to in Toggl, that is used to separate accounts into logical "workspaces".
         - As long as the authentication step succeeded, you should be able to pick which workspace you want to pull data from by selecting it from the dropdown in the connector config section
     - Pre-filter billable: All data return by the connector will only be for billable entries, as opposed to both billable and non-billable. The benefit to the user would be that if they only care about billable time, they want have to keep adding filters to all their reports/widgets to keep non-billable time out.

## Build Process
You might have noticed that I wrote this using TypeScript. At the moment, I'm not using Clasp or TS2GAS to do the conversion from TS to GAS (Google Apps Script) - I'm just using a highly customized setup of tsconfig and a "pre-transpilation" build step that prepares my code for the TS compiler.

Currently, the flow is TS -> Formatter (prep-ts.js) (removes import and export statements) -> Formatter (prep-ts.js) (Concatenation of multiple TS files into single TS intermediate file) -> TSC (TypeScript Compiler) (with single TS intermediate file as input) -> Polyfill adder (add-polyfill.js) (Inlines any polyfill files, such as es6-promises, into top of TSC single output JS file).

Clasp has been setup in the final /build folder, so it will push the final transpiled JS. "npm run build-push" will execute this entire workflow.

## Tests
Tests are ran locally using Jest, in combination with ts-jest, using `npm run test`. I'm currently working on mocking some GAS environment stuff so that more methods can be tested locally.

## TODO List
 - High Priority
     - Check for possible timezone issues
 - Everything else
     - Better way of invalidating cache (global cache keys?)
     - Try to refactor getData() into more split out functions
     - Currency converters?

## Atrribution
 - Logo
     - "Iconoteka - Timeline Icon", By Oleg Turbaba, [link](https://www.iconfinder.com/icons/3507754/iconoteka_time_timeline_icon)
        - Creative Commons, Attribution, 3.0
        - [full license](https://creativecommons.org/licenses/by/3.0/legalcode)