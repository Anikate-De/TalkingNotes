// function that decodes the escape sequence in the notes
function decodeEscapeSequence(str: string): string {

    // convert hex code to characters
    return str.replace(/\\x([0-9A-Fa-f]{2})/g, function () {
        return String.fromCharCode(parseInt(arguments[1], 16));
    });
};

// function that scrapes the notes from the Google Keep webpage
function scrapeGoogleKeep(): any {
    var res: string = '';
    var all = document.getElementsByTagName("*");

    // loops all the elements inside the webpage to find all readable text
    // this extracts all the notes from the webpage
    for (var i = 0, max = all.length; i < max; i++) {
        var innerText = (all[i] as HTMLElement).textContent;
        if (innerText === null || innerText === undefined || innerText === '') {
            continue;
        }
        // trim the text and add it to the result
        res += innerText.trim() + '\n';
    }
    res = decodeEscapeSequence(res);

    // the following code extracts only the useful portions from the results
    // this is done to create a JSON Object that will be used to traverse the notes
    var startingIndex = res.indexOf('loadChunk(JSON.parse(') + 22;
    var endingIndex = res.indexOf('}]\')', startingIndex) + 2;
    res = res.substring(startingIndex, endingIndex);


    // parse the JSON object (here, an array of notes data)
    var json = JSON.parse(res);

    // traverse the JSON array to extract the notes
    var text = '';

    for (var i = 0; i < json.length; i++) {
        var obj = json[i];

        // check if the note is a text note
        if (obj.text) {

            // if the current NODE has a parent NODE (i.e., a NODE for the title)
            // then traverse the JSON array to find the corresponding title and add it to the result
            if (obj.parentServerId) {
                for (var j = 0; j < json.length; j++) {
                    if (json[j].serverId == obj.parentServerId) {
                        if (json[j].title.trim() != '') {
                            text += json[j].title + ': ';
                        }
                    }
                }
            }

            // add the text to the result
            text += obj.text.trim() + '\n';
        }
    }

    // return the final plaintext result
    return text.trim();
}

// function that scrapes the notes from the Google Keep webpage
// listens for messages from the popup, i.e., when the user clicks on the submit button
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "scrapeGoogleKeep") {
        (async function () {

            let queryOptions = { active: true, lastFocusedWindow: true };
            let [tab] = await chrome.tabs.query(queryOptions);

            var resp = await chrome.scripting.executeScript({
                target: { tabId: tab.id ?? -1 },
                func: scrapeGoogleKeep,
                args: []
            });

            sendResponse(resp[0].result);
        })();

        // return true to indicate that the response will be sent asynchronously
        return true;
    } else if (request.message === "popupOpened") {
        (async function () {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                sendResponse({ onGoogleKeep: tabs[0].url?.includes("keep.google.com") });
            });
        })();

        // return true to indicate that the response will be sent asynchronously
        return true;
    }
});