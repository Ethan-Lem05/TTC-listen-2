const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const sftf = require("./sftf.js");

const app = express();
const port = 5000;
const sftf = new sftf(1024,512)

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

app.get('/', (req, res) => {
    res.send("hello world!");
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        let type = message.type

        switch(type) {
            case type === "audio-segment":
                sftf.process(message.data)
            case type === "test":
                console.log(message.data)
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