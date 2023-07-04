# Talking Notes

Please note that this project was created for the [Plug into AI with AI21 Hackathon 2023](https://lablab.ai/event/plug-into-ai-with-ai21) by team [infinitely-same](https://lablab.ai/event/plug-into-ai-with-ai21/infinitely-same). Future work may be done on this project, but it is not a priority at the moment.

## Description

A chrome extension that lets you talk back to your Google Keep Notes using AI21 Jumbo models. Ask questions, suggestions, and have a conversation with your notes.

## 💻 Installation

0. **(Pre-requisite)** Install [Node.js](https://nodejs.org/en/download/) and add it to your path

1. Clone the repository
2. Go to AI21 studio and create an account
3. Go to Your Profile -> [API Keys](https://studio.ai21.com/account/api-key) and copy your API key
4. Create a `.env` file in the root directory and add the following variables:

```env
API_KEY=<YOUR_API_KEY>
```

5. Install dependencies

```bash
npm install
```

6. Build the project. This will create a `dist` directory

```bash
npm run build
```

7. Go to [`chrome://extensions/`](chrome://extensions/) in your browser
8. Turn on developer mode
9. Click on `Load unpacked` and select the `dist` directory inside the cloned repository

## 📈 Usage

1. Go to [Google Keep](https://keep.google.com/)

2. Click on the extension icon
3. Type in your question and click on the send button
4. The extension will show you the response from the AI model
5. You may tweak the response by regenerating it using the `Regenerate` button next to the response. You may also add creativity or relevance to the response using the reload buttons below.

<!-- ## Screenshots
![Demo](https://user-images.githubusercontent.com/24846546/137637421-0b5b7b0a-0b0a-4b0a-8b0a-0b0b0b0b0b0b.gif) -->

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please refer to the [Contribution Guide](CONTRIBUTING.md) for more information.

## 💡 Authors

- [Anikate De](https://www.github.com/Anikate-De)
- [Bhavyaa](https://www.github.com/andbhavyaa)

## 🙇 Acknowledgements

- [AI21](https://www.ai21.com/)
- [lablab.ai](https://www.lablab.ai/)
- [Plug into AI with AI21 Hackathon 2023](https://lablab.ai/event/plug-into-ai-with-ai21)

## 📝 License

[MIT](LICENSE)
