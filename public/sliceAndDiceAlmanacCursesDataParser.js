var almanacCurseDataJson;

function lookupAlmanacCurseDescription( curseOrBlessingId ){
    console.log("lookupAlmanacCurseDescription - for curseOrBlessingId: " + curseOrBlessingId);

    if(!almanacCurseDataJson){
        console.log('lookupAlmanacCurseDescription - calling fetchAlmanacCurseDataJson');
        fetchAlmanacCurseDataJson();
        console.log(almanacCurseDataJson);
    }

    //Note - the trim is because some data like 'Osteoporosis ' was entered with extra whitespace in the almanac
    var matchingCurseDataRows = almanacCurseDataJson.table.rows.filter(row => (row.c[0].v.trim() == curseOrBlessingId));
    console.log("matchingCurseDataRows: ");
    console.log(matchingCurseDataRows);

    if(!matchingCurseDataRows || matchingCurseDataRows.length < 1){
        throw "Could not find matching Curse Data Row found for curseOrBlessingId '" + curseOrBlessingId + "' (Could be a bug or missing data)";
    }

    if(matchingCurseDataRows.length > 1){
        throw "Multiple matching Curse Data Rows found for curseOrBlessingId '" + curseOrBlessingId + "' (This is definitely a bug)";
    }

    var matchingCurseDescription = matchingCurseDataRows[0].c[2].v;
    return matchingCurseDescription;
}


/*
    This requires the data file being available locally.
    And it's in a hacky way where that local file sets a variable sliceAndDiceAlmanacCursesData with the json data string.
    See dev_notes.md about why it was done this way.
    See dev_notes.md for instructions if it needs to be updated.
    Ideally would fetch this from google docs.  However it's not possible without using google APIs and registering as a google cloud app.
*/
function fetchAlmanacCurseDataJson(){
    almanacCurseDataJson = JSON.parse(sliceAndDiceAlmanacCursesData);
}