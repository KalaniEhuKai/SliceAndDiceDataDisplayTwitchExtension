var broadcasterConfigData;

var lastUpdatedTime = 0;

var isContextDataDisplayed = false;

var isInContext

var mouseNotMovingTimerHandle;

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

    //trigger initial update - uncomment this if want to always do a refresh immediately when extension is loaded instead of based on user interaction
    //updateData();
}

async function updateData(){
    console.log("updateData called");

    var now = new Date();
    console.log("now" + now);
    var doUpdate = hasMinimumRefreshTimeHasElapsedSinceLastUpdate(now);

    if(doUpdate){
        console.log("***** updating data *****");
        updateLastUpdatedTime(now)

        clearDataDisplay();

        var sliceAndDiceData = await getOneDriveSharedFileContents(broadcasterConfigData["sliceAndDiceDataFileShareLink"]);

        var cursesAndBlessingsHtml = await getCursesAndBlessingsDisplayHtml(sliceAndDiceData);

        updateCursesAndBlessingsElement(cursesAndBlessingsHtml);
    }else {
        console.log("updateData called but minimum refresh time has not elapsed");
    }

    //update again based on timer - uncomment this if want to always do a refresh automatically based on a time period instead of based on user interaction
    //setTimeout(updateData, broadcasterConfigData["minimumRefreshTimePerUser"] * 1000);
}

function hasMinimumRefreshTimeHasElapsedSinceLastUpdate(currentTime){
    var minimumRefreshTimePerUserInMs = broadcasterConfigData["minimumRefreshTimePerUser"] * 1000;
    var elapsedTime = Math.floor(currentTime - lastUpdatedTime);
    console.log("elapsed time since last update: " + elapsedTime/1000)

    if ( elapsedTime > minimumRefreshTimePerUserInMs ) {
        return true;
    } else {
        return false;
    }
}

function updateLastUpdatedTime(currentTime){
    lastUpdatedTime = currentTime;
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
        		    var curseOrBlessingCostAndDescription = lookupAlmanacCurseOrBlessingTypeAndCostAndDescription(curseOrBlessing);
        		    var curseOrBlessingCostMarker = curseOrBlessingCostAndDescription.type == "Curse" ? "" : "-";
        		    cursesAndBlessingsDisplayHtml += "[" + curseOrBlessingCostMarker + curseOrBlessingCostAndDescription.cost + "]: ";
        		    cursesAndBlessingsDisplayHtml += curseOrBlessingCostAndDescription.description;
        		  }catch(err){
        		    cursesAndBlessingsDisplayHtml += curseOrBlessing + " (DATA_NOT_FOUND)";
        			console.log("Warning: could not find AlmanacCurseDescription for curseOrBlessing '" +  curseOrBlessing + "' due to err: " + err);
        			console.log(err); //For things like TypeError which have a call stack
        			couldntFindACurseDescription = true;
        		  }
          		  //cursesAndBlessingsDisplayText += "<small><i> &nbsp&nbsp&nbsp (" + curseOrBlessing + ") </i></small>";

        		  cursesAndBlessingsDisplayHtml += "</p>";
        		});

        		if(couldntFindACurseDescription){
        			recordProcessingIssue("Warning: Could not find at least one description for a curse/blessing.  This could be a bug in this page, or the extension developer may need to update the almanac file contents.  Browser Console log should have more details.");
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

function updateCursesAndBlessingsElement(cursesAndBlessingsHtml){
    $("#cursesAndBlessingsContent").html(cursesAndBlessingsHtml);
}

function clearDataDisplay(){
    console.log("clearDataDisplay called");
    //Shouldn't really clear data, that just causes strobing for viewer.  Should probably add a spinner icon while processing...
    //$("#cursesAndBlessings").html("<p>Data update pending...</p>");
    //$("#processingIssues").html("");
}



function initializeAllShowHideElements(){
    $('#cursesAndBlessingsContent').hide();
}

function startShowContentHoverAreas(){
    console.log("startShowContentHoverAreas");
    showCursesAndBlessingsHoverIndicator();
}
function stopShowContentHoverAreas(){
    console.log("stopShowContentHoverAreas");
    hideCursesAndBlessingsHoverIndicator();
}
function startShowCursesAndBlessings(){
    isContextDataDisplayed = true;
    hideCursesAndBlessingsHoverIndicator(); //ideally could get the events to handle this calling stopShowContentHoverAreas automatically
    $('#cursesAndBlessingsContent').show();
    updateData();
}
function stopShowCursesAndBlessings(){
    isContextDataDisplayed = false;
    showCursesAndBlessingsHoverIndicator(); //ideally could get the events to handle this calling startShowContentHoverAreas automatically
    $('#cursesAndBlessingsContent').hide();
    //TODO there's still an issue since this goes to edge of page that if people move mouse out directly from here that it won't dissapear.
    //Probably need to keep variables to see if still inside the entire page without borders to give space on outside, and maybe no do the propagating elements thing
    //Or maybe need to go back to :hover on entire page to put it in a certain state, and then all the mouse outs etc are based on overall state (assuming :hover works better
}

function unHideEverything(){
    $('#entirePageExceptEdge').show();
}

function showCursesAndBlessingsHoverIndicator(){
    $('#cursesAndBlessingsContentContainer').css('border-style', 'solid');
}

function hideCursesAndBlessingsHoverIndicator(){
    $('#cursesAndBlessingsContentContainer').css('border-style', 'none');
}

function bindAllMouseHoverEvents(){
    console.log("bindAllMouseHoverEvents");

    $('#entirePageExceptEdge')
    .on('mouseenter', function (event) {
        event.stopPropagation();
        console.log("entirePageExceptEdge mouseenter");
        startShowContentHoverAreas();
    })
    .on('mouseleave', function (event) {
        event.stopPropagation();
        console.log("entirePageExceptEdge mouseleave");
        stopShowContentHoverAreas();
    });

  $('#cursesAndBlessingsHoverTarget')
    .on('mouseenter', function (event) {
        event.stopPropagation();
        console.log("cursesAndBlessingsHoverTarget mouseenter");
        startShowCursesAndBlessings();
    })
    .on('mouseleave', function (event) {
        //event.stopPropagation();
        console.log("cursesAndBlessingsHoverTarget mouseleave");
        stopShowCursesAndBlessings();
    });

    //There's an issue (seems related to twitch player controls) where moving mouse out bottom of video window
    //doesn't trigger mouseout/mouseleave events correctly.
    //Therefore we want a backup in case things haven't been hidden properly after moving mouse off of video.
    //Set a timer to hide everything if mouse isn't moving
    $('#entirePage').mousemove(function(){
        $('#entirePageExceptEdge').show();
        clearTimeout(mouseNotMovingTimerHandle);
        var timeoutTime = isContextDataDisplayed ? 5000 : 2000;

        console.log('setting mouseNotMovingTimer for ' + timeoutTime);
        mouseNotMovingTimerHandle = setTimeout(function(){
            $('#entirePageExceptEdge').hide();
        },timeoutTime);
    });
}


// MAIN FUNCTION

$(async function() {
    console.log('video_overlay page loaded');

     //Cannot initialize here.  see https://discuss.dev.twitch.tv/t/config-js-twitch-configuration-broadcaster-undefined/37745/3

    //register element events here

    initializeAllShowHideElements();

    bindAllMouseHoverEvents();
});
