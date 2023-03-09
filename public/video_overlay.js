var broadcasterConfigData;

window.Twitch.ext.onAuthorized(function(auth) {
  //console.log('The JWT that will be passed to the EBS is', auth.token);
  //console.log('The channel ID is', auth.channelId);

  initialize();
});

async function initialize(){
    var broadcasterConfig = window.Twitch.ext.configuration.broadcaster;

    if(broadcasterConfig){
        broadcasterConfigData = JSON.parse(broadcasterConfig.content);
    } else {
        throw "extension has not been configured by broadcaster and will not work.  Shouldn't be able to get here based on twitch supposed to not show if no config saved.";
    }

    //trigger initial update
    update();
}

async function update(){
    console.log("***** update *****");

    clearDataDisplay();

    var sliceAndDiceData = await getOneDriveSharedFileContents(broadcasterConfigData["sliceAndDiceDataFileShareLink"]);

    var cursesAndBlessings = await getCursesAndBlessingsDisplayHtml(sliceAndDiceData);

    displayData(cursesAndBlessings);

    setTimeout(update, broadcasterConfigData["extensionRefreshTime"] * 1000);
}

function getCursesAndBlessingsDisplayHtml(sliceAndDiceData){
        /*
            TODO: would be cleaner to have this method generate a json blob, and another method to format the information to display.
            Also this logic should probably be in a separate js
        */

        try{
              var couldntFindACurseDescription = false;

              var dataParser = new SliceAndDiceDataFileParser(sliceAndDiceData);

              var curseAndBlessingList = dataParser.getCurseAndBlessingList();

              var cursesAndBlessingsDisplayHtml = "";

        	  if(!curseAndBlessingList || curseAndBlessingList.length == 0) {
        	    cursesAndBlessingsDisplayHtml += "None";
        	  }
        	  else {
                curseAndBlessingList.forEach(function(curseOrBlessing) {
        		  //cursesAndBlessingsDisplayText += curseOrBlessing;
        		  //cursesAndBlessingsDisplayText += " => "
        		  cursesAndBlessingsDisplayHtml += "<p>";
        		  try{
        		    cursesAndBlessingsDisplayHtml += lookupAlmanacCurseDescription(curseOrBlessing);
        		  }catch(err){
        		    cursesAndBlessingsDisplayHtml += curseOrBlessing + "(DESCRIPTION_NOT_FOUND)";
        			console.log("Warning: could not find AlmanacCurseDescription for curseOrBlessing '" +  curseOrBlessing + "' due to err:" + err);
        			console.log(err); //For things like TypeError which have a call stack
        			couldntFindACurseDescription = true;
        		  }
          		  //cursesAndBlessingsDisplayText += "<small><i> &nbsp&nbsp&nbsp (" + curseOrBlessing + ") </i></small>";

        		  cursesAndBlessingsDisplayHtml += "</p>";
        		});

        		if(couldntFindACurseDescription){
        			recordProcessingIssue("Warning: Could not find at least one description for a curse/blessing.  This could be a bug in this page, or you may need to update the SliceAndDiceAlmanacCursesData file contents.  Browser Console log should have more details.  To update the Almanac data, view this page's source and look for ***HOW TO UPDATE ALMANAC CURSES DATA***");
        		}
        	  }

                console.log("returning cursesAndBlessingsDisplayHtml:");
                console.log(cursesAndBlessingsDisplayHtml);
        	    return cursesAndBlessingsDisplayHtml;
        	}
        	catch(err) {
        		var errorMessage = "ERROR occurred in getting data (" + err + "). This could be a bug in the page, or incorrect usage.  Browser Console log should have more details.";
        		console.log(errorMessage);
        		console.log(err); //For things like TypeError which have a call stack
        		recordProcessingIssue(errorMessage);
        	}
}

//TODO: should figure out best way to display processing issues  Can display it on the extension, but it's really stuff the streamer would have to pay attention to, not the viewer.
function recordProcessingIssue(processingIssue){
    // $("#processingIssues").html($("#processingIssues").html() + "<br/>" + processingIssue);
    console.log("PROCESSING_ISSUE: " + processingIssue);
}

function displayData(cursesAndBlessingsHtml){
    $("#cursesAndBlessings").html(cursesAndBlessingsHtml);
}

function clearDataDisplay(){
    //Shouldn't really clear data, that just causes strobing for viewer.  Should probably add a spinner icon while processing...
    //$("#cursesAndBlessings").html("<p>Data update pending...</p>");
    //$("#processingIssues").html("");
}



function initializeAllShowHideElements(){
    //$('#cursesAndBlessingsContainer').hide();
    $('#cursesAndBlessings').hide();
}

function onMouseHoverEnterEntirePageExceptBorders(){
    $('#cursesAndBlessingsContainer').css('border', '3px solid blue');
}
function onMouseHoverOutEntirePageExceptBorders(){
    $('#cursesAndBlessingsContainer').css('border', '');
}
function onMouseHoverEnterCursesAndBlessings(){
    $('#cursesAndBlessingsContainer').css('border', '');
    $('#cursesAndBlessings').show();
}
function onMouseHoverOutCursesAndBlessings(){
    $('#cursesAndBlessingsContainer').css('border', '3px solid blue');
    $('#cursesAndBlessings').hide();
    //TODO there's still an issue since this goes to edge of page that if people move mouse out directly from here that it won't dissapear.
    //Probably need to keep variables to see if still inside the entire page without borders to give space on outside, and maybe no do the propagating elements thing
    //Or maybe need to go back to :hover on entire page to put it in a certain state, and then all the mouse outs etc are based on overall state (assuming :hover works better
}


$(async function() {
    console.log('video_overlay page loaded');

     //Cannot initialize here.  see https://discuss.dev.twitch.tv/t/config-js-twitch-configuration-broadcaster-undefined/37745/3

    //register element events here

    initializeAllShowHideElements();

    $('#entirePageExceptBorders')
    .on('mouseover', function (event) {
        event.stopPropagation();
        onMouseHoverEnterEntirePageExceptBorders();
    })
    .on('mouseout', function (event) {
        event.stopPropagation();
        onMouseHoverOutEntirePageExceptBorders();
    });

      $('#cursesAndBlessingsContainer')
        .on('mouseover', function (event) {
            event.stopPropagation();
            onMouseHoverEnterCursesAndBlessings();
        })
        .on('mouseout', function (event) {
            event.stopPropagation();
            onMouseHoverOutCursesAndBlessings();
        });
});
