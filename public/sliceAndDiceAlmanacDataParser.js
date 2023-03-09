var almanacCursesDataJson;
var almanacBlessingsDataJson


//Will return as json with relevant keys
function lookupAlmanacCurseOrBlessingTypeAndCostAndDescription( curseOrBlessingId ){
    var curseOrBlessingDataFormattedInAlmanac = lookupAlmanacCurseOrBlessingRawDataWithType(curseOrBlessingId);
    var type = curseOrBlessingDataFormattedInAlmanac.type;
    var cost = curseOrBlessingDataFormattedInAlmanac.data[1].f;
    var description =  curseOrBlessingDataFormattedInAlmanac.data[2].v;

    return { 'type':type, 'cost':cost, 'description':description};


}

//Get the json directly as formatted in the almanac, and the type
function lookupAlmanacCurseOrBlessingRawDataWithType( curseOrBlessingId ){
    console.log("lookupAlmanacCurseOrBlessingDescription - for curseOrBlessingId: " + curseOrBlessingId);

    //TODO: cleanup all the copy/paste for identical logic of curse vs blessing.

    //Doesn't matter that this is saved off for local file, but if fetch from remote it should be like this.
    if(!almanacCursesDataJson){
        console.log('lookupAlmanacCurseOrBlessingDescription - calling fetchAlmanacCurseDataJson');
        fetchAlmanacCursesDataJson();
        console.log(almanacCursesDataJson);
    }

    if(!almanacBlessingsDataJson){
        console.log('lookupAlmanacCurseOrBlessingDescription - calling fetchAlmanacBlessingsDataJson');
        fetchAlmanacBlessingsDataJson();
        console.log(almanacBlessingsDataJson);
    }

    //Note - the trim is because some data like 'Osteoporosis ' was entered with extra whitespace in the almanac
    var matchingCurseDataRows = almanacCursesDataJson.table.rows.filter(row => (row.c[0].v.trim().toLowerCase() == curseOrBlessingId.trim().toLowerCase()));
    console.log("matchingCurseDataRows: ");
    console.log(matchingCurseDataRows);

    //Note - the trim is because some data like 'Osteoporosis ' was entered with extra whitespace in the almanac
    var matchingBlessingDataRows = almanacBlessingsDataJson.table.rows.filter(row => (row.c[0].v.trim().toLowerCase() == curseOrBlessingId.trim().toLowerCase()));
    console.log("matchingBlessingDataRows: ");
    console.log(matchingBlessingDataRows);

    var matchingCurseDataRowsLength = matchingCurseDataRows ? matchingCurseDataRows.length : 0;
    var matchingBlessingDataRowsLength = matchingBlessingDataRows ? matchingBlessingDataRows.length : 0;
    var totalMatchingRows = matchingCurseDataRowsLength + matchingBlessingDataRowsLength;
    console.log("matchingCurseDataRowsLength:" + matchingCurseDataRowsLength);
    console.log("matchingBlessingDataRowsLength:" + matchingBlessingDataRowsLength);
    console.log("totalMatchingRows:" + totalMatchingRows);

    if(totalMatchingRows < 1){
        throw "Could not find matching Curse or Blessing Data Row found for curseOrBlessingId '" + curseOrBlessingId + "' (Could be a bug or missing data)";
    }

    if(totalMatchingRows > 1){
        throw "Multiple matching Curse or Blessing Data Rows found for curseOrBlessingId '" + curseOrBlessingId + "' (This is definitely a bug)";
    }

    var matchingCurseOrBlessingData;
    var type;

    if(matchingCurseDataRowsLength == 1){
        matchingCurseOrBlessingData = matchingCurseDataRows[0].c;
        type = "Curse";
    } else if  (matchingBlessingDataRowsLength == 1){
        matchingCurseOrBlessingData = matchingBlessingDataRows[0].c;
        type = "Blessing";
    } else {
        throw "Illegal code state when getting values of  matching Curse or Blessing Data Rows for curseOrBlessingId '" + curseOrBlessingId + "' - confirmed that there was exactly 1 matching curse or blessing, but then length of each array was not 1 (This is definitely a bug)";
    }
    return { "type":type, "data":matchingCurseOrBlessingData};
}


/*
    This requires the data file being available locally.
    And it's in a hacky way where that local file sets a variable sliceAndDiceAlmanacCursesData with the json data string.
    See dev_notes.md about why it was done this way.
    See dev_notes.md for instructions if it needs to be updated.
    Ideally would fetch this from google docs.  However it's not possible without using google APIs and registering as a google cloud app.
*/
function fetchAlmanacCursesDataJson(){
    almanacCursesDataJson = JSON.parse(sliceAndDiceAlmanacCursesData);
}

function fetchAlmanacBlessingsDataJson(){
    almanacBlessingsDataJson = JSON.parse(sliceAndDiceAlmanacBlessingsData);
}