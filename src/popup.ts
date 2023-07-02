// sends a message to the background script to check if the user is on Google Keep
// this is fired as soon as the popup is opened

chrome.runtime.sendMessage({
    message: "popupOpened"
}, (response) => {

    // display the appropriate UI based on the response
    if (response.onGoogleKeep) {
        document.getElementsByClassName("initial-content")[0].classList.remove("hidden");
        document.getElementsByClassName("conversation-content")[0].classList.add("hidden");
        document.getElementsByClassName("error-content")[0].classList.add("hidden");
        document.getElementsByClassName("question-controls")[0].classList.remove("hidden");
    } else {
        document.getElementsByClassName("initial-content")[0].classList.add("hidden");
        document.getElementsByClassName("conversation-content")[0].classList.add("hidden");
        document.getElementsByClassName("error-content")[0].classList.remove("hidden");
        document.getElementsByClassName("question-controls")[0].classList.add("hidden");
    }
});

document.getElementsByTagName('input')[0].addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        (document.getElementsByClassName("sendButton")[0] as HTMLButtonElement).click();
    }
});

document.getElementsByClassName("sendButton")[0].addEventListener("click", (event) => {

    chrome.runtime.sendMessage(
        {
            message: "scrapeGoogleKeep"
        }, (response) => {

            var precontext = 'Using the given text as Context, answer the following question: \n'
            var question = (document.getElementsByTagName('input')[0] as HTMLInputElement).value.trim();

            var entireText = precontext + 'Context:' + response + '\nQuestion:' + question + '\nAnswer:';

            // configure the UI to show the conversational view
            document.getElementsByClassName("initial-content")[0].classList.add("hidden");
            document.getElementsByClassName("conversation-content")[0].classList.remove("hidden");
            document.getElementById("question-text")!.innerHTML = question;
            document.getElementById("answer-text")!.innerHTML = "Loading...";
            document.getElementsByClassName("classic")[0].classList.add("hidden");
            document.getElementsByClassName("regenerate-controls-header")[0].classList.add("hidden");
            document.getElementsByClassName("creative")[0].classList.add("hidden");
            document.getElementsByClassName("relevant")[0].classList.add("hidden");

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

                // update the UI with the answer
                var answer = respString.completions[0].data.text;
                document.getElementById("answer-text")!.innerHTML = answer;
                document.getElementsByClassName("classic")[0].classList.remove("hidden");
                document.getElementsByClassName("regenerate-controls-header")[0].classList.remove("hidden");
                document.getElementsByClassName("creative")[0].classList.remove("hidden");
                document.getElementsByClassName("relevant")[0].classList.remove("hidden");
                
            });
            return;
        });

});

document.getElementsByClassName("classic")[0].addEventListener("click", (event) => {
    (document.getElementsByClassName("sendButton")[0] as HTMLButtonElement).click();
});

