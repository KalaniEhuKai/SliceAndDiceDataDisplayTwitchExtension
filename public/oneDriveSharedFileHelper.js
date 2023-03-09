
//takes in the link that a person copies after sharing a file in OneDrive
async function getOneDriveSharedFileContents(sharedFileLink){
    var fileRestGetUrl = await getOneDriveSharedFileDownloadUrl(sharedFileLink);
    var file = await fetch(fileRestGetUrl);
    return await file.text();
}

async function getOneDriveSharedFileDownloadUrl(oneDriveSharedFileUrl){
    //See https://stackoverflow.com/questions/36015295/downloading-a-publicly-shared-file-from-onedrive
    //See https://learn.microsoft.com/en-us/onedrive/developer/rest-api/api/shares_get?view=odsp-graph-online
    //See https://stackoverflow.com/questions/27068647/onedrive-cors-download-in-javascript
    //See https://github.com/microsoftgraph/microsoft-graph-docs/issues/43
    //See https://learn.microsoft.com/en-us/onedrive/developer/rest-api/resources/shareddriveitem?view=odsp-graph-online
    //See https://github.com/microsoftgraph/msgraph-sdk-javascript/issues/16
    //See https://learn.microsoft.com/en-us/graph/api/driveitem-get-content?view=graph-rest-1.0&tabs=javascript

    console.log("getOneDriveSharedFileRestApiUrl- oneDriveSharedFileUrl: " + oneDriveSharedFileUrl);

    var base64EncodedSharedFileUrl = btoa(oneDriveSharedFileUrl);
    console.log("getOneDriveSharedFileRestApiUrl- base64EncodedSharedFileUrl: " + base64EncodedSharedFileUrl);

    var base64EncodedSharedFileUrlEndsWithEquals = base64EncodedSharedFileUrl.endsWith('=');
    var base64EncodedSharedFileUrlWithoutEndingEquals = base64EncodedSharedFileUrlEndsWithEquals ? base64EncodedSharedFileUrl.slice(0, -1) : base64EncodedSharedFileUrl;

    console.log("getOneDriveSharedFileRestApiUrl- base64EncodedSharedFileUrlWithoutEndingEquals: " + base64EncodedSharedFileUrlWithoutEndingEquals);

    var unPaddedBase64SharedFileUrl = base64EncodedSharedFileUrlWithoutEndingEquals.replace(/\//g,'_').replace(/\+/g,'-');
    console.log("getOneDriveSharedFileRestApiUrl- unPaddedBase64SharedFileUrl: " + unPaddedBase64SharedFileUrl);

    var oneDriveSharedDriveItemInfoRestPath = "https://api.onedrive.com/v1.0/shares/u!" +  unPaddedBase64SharedFileUrl + "/driveItem";//?select=id,@microsoft.graph.downloadUrl";
    console.log("getOneDriveSharedFileRestApiUrl- oneDriveSharedDriveItemInfoRestPath: " + oneDriveSharedDriveItemInfoRestPath);

    var oneDriveSharedDriveItemInfoResponse = await fetch(oneDriveSharedDriveItemInfoRestPath);
    console.log("getOneDriveSharedFileRestApiUrl- oneDriveSharedDriveItemInfoResponse: ");
    console.log(oneDriveSharedDriveItemInfoResponse);

    var oneDriveSharedDriveItemInfoJson = await oneDriveSharedDriveItemInfoResponse.json();
    //console.log("getOneDriveSharedFileRestApiUrl- oneDriveSharedDriveItemInfoJson: ");
    //console.log(oneDriveSharedDriveItemInfoJson);

    var oneDriveSharedDriveItemCorsDownloadUrl = oneDriveSharedDriveItemInfoJson['@content.downloadUrl'];
    //console.log("getOneDriveSharedFileRestApiUrl- oneDriveSharedDriveItemCorsDownloadUrl: " + oneDriveSharedDriveItemCorsDownloadUrl);

    return oneDriveSharedDriveItemCorsDownloadUrl;
}