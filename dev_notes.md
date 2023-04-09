# To whom it may concern
If you find yourself looking at this code, I apologize in advance.  I don't really know what I'm doing with webdevelopment and JS/JQuery


# TODO

Confirm that 2nd MSFT OneNote account works

Change it to refresh data on user interaction rather than timer.

Consider getting rid of all the stuff that makes hover mouse events avoid the edge of the screen to avoid showing things when fullscreen with mouse at edge.  It makes it slightly ugly and adds a lot of complexity, and isn't really necessary with the movement-based hiding.

Change it so that actionable errors are displayed in 'processingIssues' view in the overlay, rather than having streamer troubleshooting say to view console log.

# Steps for testing:
1. Zip all of the local files (extension content)
1. Go to extension developer page https://dev.twitch.tv/console/extensions/
1. Click Manage for the extension
1. Select the version
1. Go to Status tab and make sure it's Local Test
1. Go to Files tab
1. Choose files and upload the zip
1. If changing the entry point file, make sure to update Asset Hosting tab 
1. If you want to change between displaying as component vs panel on the stream, update on https://dashboard.twitch.tv/u/<your_username>/extensions/manage and select the dropdown like Component 1 
1. Go to Status tab and switch to Hosted Test
1. Start stream
1. Make sure to end stream and set Status to Local Test when done

# Steps for updating SliceAndDiceAlmanacCursesData / SliceAndDiceAlmanacBlessingsData:
To export newer versions of the file:
1. Download the data file from https://docs.google.com/spreadsheets/d/1QeTmPwCAOJCBKy5VgKhupcLrtSFuFa0fPT_zuShv3M8/gviz/tq?tqx=out:json&sheet=Curses (or sheet=Blessings)
2. Rename it SliceAndDiceAlmanacCursesData.js
3. Remove the text at the start of the file before the first { 
    1. like /*O_o*/ google.visualization.Query.setResponse(
4. Replace what you removed with var sliceAndDiceAlmanacCursesData = '  
    1. so it should now be like var sliceAndDiceAlmanacCursesData = '{"version":"...
    2. (or var sliceAndDiceAlmanacCursesData ...) 
5. Remove the text at the end of the file after the last }
    1. like );
6. Replate what you removed with ';
    1. so it should not be like };
7. Replace '\n' with '\\n' everywhere in the file


# References:

https://dev.twitch.tv/docs/tutorials/extension-101-tutorial-series/config-service/

https://github.com/sonia145/extensions-101/tree/step-2

https://github.com/abdullahmorrison/AlveusTwitchExtension/blob/main/public/index.html

https://dev.twitch.tv/docs/extensions/reference/#helper-configuration

https://discuss.dev.twitch.tv/t/how-does-config-js-work-and-how-to-set-it-up/36758/2



# Investigation Notes

## Trying to get almanac file from google docs
    //Could use REST google APIs as per https://developers.google.com/sheets/api/reference/rest
    //But given that v3 is deprecated, that would require creating a developer KeyID which I don't really want to do at this point...
    //instead found that it can just be exported
    //See https://stackoverflow.com/a/59546623 and https://stackoverflow.com/questions/33713084/download-link-for-google-spreadsheets-csv-export-with-multiple-sheets
    //This would look like the following
    //var cursesSheetJson = fetch("https://docs.google.com/spreadsheets/d/1QeTmPwCAOJCBKy5VgKhupcLrtSFuFa0fPT_zuShv3M8/gviz/tq?tqx=out:json&sheet=Curses");
    //BUT This doesn't work right due to CORS issue due to google not enabling it since 2014... https://stackoverflow.com/a/28484404 , https://issuetracker.google.com/issues/36759302	
    //So either need to just download the file locally, or would need to create an API key for this
    //I dont really want to create a google cloud project, so just going to download locally
    //Also, did a bit of an ugly hack where the curses data json is actually a js file which sets a variable to a big json blob, rather than just having actual json data in .json file.
    //Did this since I was also working with this stuff in a local html page without a  webserer.  Just leaving it since it's simple even if maintenance problem.
   
## Trying to get it so that hover area will not extend to page edge, but the content will
    //Most importantly, don't position elments that aren't parent/child at the same location. They just fight for who wins and events get messed up.
    //mouseover/mouseout get triggered when over/out of the element AND its children.  So if child extends past parent, then so does the mouse events area.