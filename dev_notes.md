# To whom it may concern
If you find yourself looking at this code, I apologize in advance.  I don't really know what I'm doing with webdevelopment and JS/JQuery


# TODO
Consider changing it to display curses data when hovering over the settings icon (and have the data show in large window from that area) instead of bottom right.

Consider getting rid of all the stuff that makes hover mouse events avoid the edge of the screen to avoid showing things when fullscreen with mouse at edge.  It makes it slightly ugly and adds a lot of complexity, and isn't really necessary with the movement-based hiding.
This is a moot point if switching to the Setting UI area instead of bottom right.

Should really handle that elements change size and positioning based on resolution/fullscreen/scaling setting. Probably should add config settings for this, and then scale and position things in the overlay based on those settings.
Also if not 16:9 resolution then twitch adds black bar below/above, should ideally handle that too.
For not just add a Known Issues section.
Could also look to simplify by just having a hoverover of larger areas for like the settings area, the heroes are, the enemies area (these probably are easier to write algorithms to handle than each specific item's location.)

Minor issue where after updating data, it immediately does another cursesAndBlessingsHoverTarget mouseenter > updateData call.  But it's within a second so won't fetch data again.

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

## Test cases
1. When user hovers over the stream, then borders appear showing locations of context data areas
1. When user enters hover over a context data area, then context data content appears
1. When user enters hover over a context data area for the first time, then context data is updated
1. When user re-enters hover over a context data area, and time elapsed since last update > min refresh time per user setting, then context data is updated
1. When user doesn't move mouse while hovering over stream window, and a short time passes (slightly longer if context data content is displayed vs just the area borders), then the overlay disappears after a short time
1. When user moves mouse out of stream window, then the overlay disappears (known bug on moving mouse out of bottom of window)
1. When user moves mouse to edge of screen when stream is fullscreen, then the overlay disappears

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

# Steps for updating UserGuide pages on github pages  (https://pages.github.com/)
1. View what all pages are at https://kalaniehukai.github.io/SliceAndDiceDataDisplayTwitchExtension/public/userGuide/index.html
2. In the github repro, open each file to view the contents (this seems to then update the reference that github pages caches or something)

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

## Fonts
    //Perfect DOS VGA 437
    //   https://www.dafont.com/font-comment.php?file=perfect_dos_vga_437
    //   Using this in the icon images
    //   This is indicated to be free for whatever use with no license .  See https://www.dafont.com/font-comment.php?file=perfect_dos_vga_437 and also the txt file in the distribution
    //   Included Thank You for this.
    //DOS/V re. ANK16
    //   https://int10h.org/oldschool-pc-fonts/fontlist/font?dos-v_re_ank16
    //   If using custom fonts for the data display in the future, this might be a good one.
    //   This is licensed under CC BY-SA 4.0 which is one way compatible with GPLv3.  Just needs appropriate attribution if used.  See https://int10h.org/oldschool-pc-fonts/readme/#legal_stuff
