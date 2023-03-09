window.Twitch.ext.onAuthorized((auth) => {

    initialize();
});

const SaveState = {
    Undetermined: 1,
    NoneSaved: 2,
    Saved: 3,
    PendingChanges: 4
}

function updateConfigOnTwitchConfigService(configData){
    //config version string must match the extension configuration Capabilities
    window.Twitch.ext.configuration.set("broadcaster", "config_v1", JSON.stringify(configData));
    console.log("updateConfigOnTwitchConfigService finished");

    var savedConfig = window.Twitch.ext.configuration.broadcaster;
    console.log("savedConfig: ");
    console.log(savedConfig);
}

function saveConfigData(){
    console.log("saving config data");

    var configData = {}
    configData["sliceAndDiceDataFileShareLink"]=$('input[id=sliceAndDiceDataFileShareLink]').val();
    configData["extensionRefreshTime"]=$('input[id=extensionRefreshTime]').val();

    console.log("configData:");
    console.log(configData);

    updateConfigOnTwitchConfigService(configData);
    setStatus(SaveState.Saved);
}

function initialize(){
    console.log("initializing");
    var broadcasterConfig = window.Twitch.ext.configuration.broadcaster;
    setStatus(SaveState.Undetermined);


    if(broadcasterConfig){
        setStatus(SaveState.Saved)
        var broadcasterConfigJson = JSON.parse(broadcasterConfig.content);

        $('input[id=sliceAndDiceDataFileShareLink]').val(broadcasterConfigJson["sliceAndDiceDataFileShareLink"]);
        $('input[id=extensionRefreshTime]').val(broadcasterConfigJson["extensionRefreshTime"]);
    } else {
        setStatus(SaveState.NoneSaved);
    }

}

function setStatus(saveState){
    var configStatusText = "Config Status: ";
    switch (saveState) {
      case SaveState.Undetermined:
        configStatusText += "config state unknown (likely internal error)";
        break;
      case SaveState.NoneSaved:
        configStatusText += "none saved (extension will not work until you save config)";
        break;
      case SaveState.Saved:
         configStatusText += "saved (you may close this window)";
        break;
      case SaveState.PendingChanges:
        configStatusText += "pending update (submit to apply changes)";
        break;
      default:
        configStatusText += "unknown state (" + saveState + ") - likely a developer error with this page.";
    }
    $("#status").text(configStatusText);
}

$(function(){
    console.log("config page loaded");

    //TODO: might see if doing a folder junction avoids the OneDrive sync delay better than the hardlink

    //Cannot initialize here.  see https://discuss.dev.twitch.tv/t/config-js-twitch-configuration-broadcaster-undefined/37745/3

    $("#submitFormButton").click(function(){ saveConfigData(); });

    $("#configurationForm").submit(function(event){
        console.log("submitting configurationForm");
        event.preventDefault();
    })

    $("#configurationForm :input").change(function() {
       setStatus(SaveState.PendingChanges)
    });
})