const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { decodeJSON } = require("./middleware.js");

const app = express();
const port = 5000;

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
    res.send("hello world!");
});

wss.on('connection', (ws) => {
    console.log("client connected");

    ws.on('message', (message) => {
        // Parse the message if it's a string

        const { type, data } = decodeJSON(message);

        switch (type) {
            case "audio-segment":
                // Process the audio data
                console.log("Received audio segment");
                // sftf.process(data); // Uncomment and implement this function
                break;
            case "test":
                console.log(data);
                break;
            default:
                console.warn("Unknown message type:", type);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

wss.on('close', () => {
    console.log("WebSocket server closed gracefully");
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});