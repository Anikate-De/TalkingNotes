// function that decodes the escape sequence in the notes
function decodeEscapeSequence(str: string): string {

    // convert hex code to characters
    return str.replace(/\\x([0-9A-Fa-f]{2})/g, function () {
        return String.fromCharCode(parseInt(arguments[1], 16));
    });
};

// function that scrapes the notes from the page
function scrapeNotes(): any {
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
    var startingIndex = res.lastIndexOf('loadChunk(JSON.parse(') + 22;
    var endingIndex = res.lastIndexOf('\"snapshot\":{}}}]') + 16;
    res = res.substring(startingIndex, endingIndex);

    // parse and return the JSON object (here, an array of notes data)
    return JSON.parse(res);
}

// add an onTap listener to test the extension's functionality
// this will later be replaced with a popup for user interaction
chrome.action.onClicked.addListener((tab) => {

    chrome.scripting.executeScript({
        target: { tabId: tab.id ? tab.id : -1 },
        func: scrapeNotes,
        args: []
    }).then(result => {

        // handle the result from scrape notes
        var json = result[0].result;

        // log the root JSON array to the console for debugging
        console.log(json);

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
        text = text.trim();

        // log the plaintext result to the console for debugging
        // this value will later be sent to the AI21 API for content generation
        console.log(text);

        return;
    });
});