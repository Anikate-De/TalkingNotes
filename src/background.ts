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
    var startingIndex = res.indexOf('loadChunk(JSON.parse(') + 22;
    var endingIndex = res.indexOf('}]\')', startingIndex) + 2;
    res = res.substring(startingIndex, endingIndex);


    // parse and return the JSON object (here, an array of notes data)
    return JSON.parse(res);
}

document.getElementsByTagName('input')[0].addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        (document.getElementsByClassName("sendButton")[0] as HTMLButtonElement).click();
    }
});

document.getElementsByClassName("sendButton")[0].addEventListener("click", async (event) => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    chrome.scripting.executeScript({
        target: { tabId: tab.id ?? -1 },
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

        var precontext = 'Using the given text as Context, answer the following question: \n'
        var question = (document.getElementsByTagName('input')[0] as HTMLInputElement).value.trim();

        var entireText = precontext + 'Context:' + text + '\nQuestion:' + question + '\nAnswer:';

        // configure the UI to show the conversational view
        document.getElementsByClassName("initial-content")[0].classList.add("hidden");
        document.getElementsByClassName("conversation-content")[0].classList.remove("hidden");
        document.getElementById("question-text")!.innerHTML = question;
        document.getElementById("answer-text")!.innerHTML = "Loading...";

        // send the request to the AI21 API
        fetch("https://api.ai21.com/studio/v1/j2-mid/complete", {
            headers: {
                "Authorization": "Bearer " + process.env.API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "prompt": entireText,
                "numResults": 1,
                "maxTokens": 200,
                "temperature": 0.7,
                "topKReturn": 0,
                "topP": 1,
                "countPenalty": {
                    "scale": 0,
                    "applyToNumbers": false,
                    "applyToPunctuations": false,
                    "applyToStopwords": false,
                    "applyToWhitespaces": false,
                    "applyToEmojis": false
                },
                "frequencyPenalty": {
                    "scale": 0,
                    "applyToNumbers": false,
                    "applyToPunctuations": false,
                    "applyToStopwords": false,
                    "applyToWhitespaces": false,
                    "applyToEmojis": false
                },
                "presencePenalty": {
                    "scale": 0,
                    "applyToNumbers": false,
                    "applyToPunctuations": false,
                    "applyToStopwords": false,
                    "applyToWhitespaces": false,
                    "applyToEmojis": false
                },
                "stopSequences": []
            }),
            method: "POST"
        }).then((response) => {
            return response.json();
        }).then((respString) => {
            var answer = respString.completions[0].data.text;
            console.log(answer);
            document.getElementById("answer-text")!.innerHTML = answer;
        });
        return;
    });
});
