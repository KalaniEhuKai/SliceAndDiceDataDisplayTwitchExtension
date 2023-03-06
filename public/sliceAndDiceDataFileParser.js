class SliceAndDiceDataFileParser {

    constructor(sliceAndDiceDataFileContents) {
        this.dataFileContents = sliceAndDiceDataFileContents;
        this.dataFileContentsAsXml = $.parseXML(sliceAndDiceDataFileContents);
    }

    getCurseAndBlessingList(){
        //Making some assumptions here based on the limited runs I've tested that this json schema will be applicable for all run modes
        //TODO: should add some error handling if the json doesn't have the expected schema.
        var curseAndBlessingList = this.getCurrentRunData().d.m;
        console.log("parseCurseAndBlessingListText -  curseAndBlessingList: ");
        console.log(curseAndBlessingList);

        var curseAndBlessingListCleanedUp = [];
        curseAndBlessingList.forEach(curseOrBlessing => curseAndBlessingListCleanedUp.push( this.removeSquareBracketsStuff(curseOrBlessing)));
        console.log("parseCurseAndBlessingListText -  curseAndBlessingListCleanedUp: ");
        console.log(curseAndBlessingListCleanedUp);
        return curseAndBlessingListCleanedUp;
    }

    //Might look like
    //Add [purple]Goblin[cu]
    //rather than
    //Add Goblin
    removeSquareBracketsStuff(stringThatMightHaveSquareBracketsStuff){
        return stringThatMightHaveSquareBracketsStuff.replace(/\[.*?\]/g, '');
    }

    getCurrentRunData() {
        //SaveFile XML looks like  <properties><entry key="_mode_of_current_run">currentRunDataJson</entry><entry key="stats">...</entry><entry key="settings">...</entry><entry key="run_history">...</entry></properties>

        var currentRunMode = this.getCurrentRunModeName();

        var currentRunDataJsonText;

        //'this' gets different scope within the each, so need to define a reference to the instance.
        var thisSliceAndDiceDataFileParserInstance = this;

        $(this.dataFileContentsAsXml).find('entry').each(function() {
            var keyAttribute = $(this).attr('key');
            console.log("findCurrentRunXmlNodeInnerText - found entry with keyAttribute " + keyAttribute);

            if(keyAttribute == thisSliceAndDiceDataFileParserInstance.translateCurrentRunModeNameToXmlEntryKeyValue(currentRunMode).toLowerCase()){
                currentRunDataJsonText = $(this).text();
                //found the right entry, exit loop
                console.log("findCurrentRunXmlNodeInnerText - found matching entry (" + keyAttribute + ")");
                return false;
            }
        });

        if (!currentRunDataJsonText){
            throw "Could not find data for current run (entry xml).  Could be a bug in this page, or there might not be a run started for the selected mode (" + currentRunMode + ").";
        }

        return JSON.parse(currentRunDataJsonText);
    }

    getCurrentRunModeName(){
        //Relevant portion of saveFile looks like <entry key="settings">...,"lastMode":"Shortcut",...</entry>
    	var settingsEntryXml =  $(this.dataFileContentsAsXml).find("entry[key='settings']");
    	var settingsEntryDataJson = JSON.parse(settingsEntryXml.text());
    	console.log(settingsEntryDataJson);
    	var currentRunModeName = this.removeSquareBracketsStuff(settingsEntryDataJson.lastMode);
    	console.log("getCurrentRunModeName - found currentRunModeName: " + currentRunModeName);
    	return currentRunModeName;
      }

    translateCurrentRunModeNameToXmlEntryKeyValue(currentRunModeName){
        switch(currentRunModeName) {
            case "Cursed":
                return "curse2";
                break;
            case "Blursed":
                return "curse-easy";
                break;
            default:
                return currentRunModeName;
        }
    }

}