/**
 * @fileoverview Hello to those at at Mercury! I thought that since you allow me to upload anything, I'll take sometime to show you a current project I am working on. 
 * I couldn't attach the tests so I thought I'd just share with you a part of the server code. It is a current work in progress but essentially it is a data pipeline for 
 * moving audio data through a series of processing steps in order to extract frequency data in real-time. 
 * The server is built using Node.js and Express and uses the WebSocket protocol to communicate with clients. 
 * The server receives audio data from the client, and then processes the data using the fluent-ffmpeg library to convert the audio data from WebM format to PCM format.
 * I am currently training an LSTM AI model in PyTorch that will be able to take the frequency data and identify hostile language and violence. 
 * This project is used for listening in on conversations in public spaces and alerting authorities when it detects a threat,
 * especially on subway systems where violence is quite prevalent where I live here in Toronto.
 * 
 * @requires express
 * @requires http
 * @requires ws
 * @requires ./middleware.js
 * @requires fs
 * @requires fluent-ffmpeg
 * @requires console
 * 
 * @constant {Object} app - The Express application instance.
 * @constant {number} port - The port number on which the server listens.
 * @constant {Object} server - The HTTP server created from the Express app.
 * @constant {Object} wss - The WebSocket server attached to the HTTP server.
 * 
 * @function app.get('/') - Handles HTTP GET requests to the root URL and responds with "hello world!".
 * 
 * @event WebSocketServer#connection - Fired when a new WebSocket connection is established.
 * @param {WebSocket} ws - The WebSocket connection instance.
 * 
 * @event WebSocket#message - Fired when a message is received from the client.
 * @param {string|Buffer} message - The message received from the client.
 * 
 * @event WebSocket#close - Fired when the WebSocket connection is closed.
 * 
 * @event WebSocket#error - Fired when an error occurs on the WebSocket connection.
 * 
 * @event WebSocketServer#close - Fired when the WebSocket server is closed gracefully.
 * 
 * @function server.listen - Starts the HTTP server and listens on the specified port.
 * @param {number} port - The port number on which the server listens.
 * @param {Function} callback - The callback function executed when the server starts listening.
 */
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { decodeJSON } = require("./middleware.js");
const fs = require("fs")
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const { error, assert } = require("console");
const e = require("express");
const { Stream, PassThrough } = require("stream");

const app = express();
const port = 5000;

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

/***********  helper functions  ********/
const setUpModelInput = () => {
    const output = new WritableStream({
        write(chunk) {
            console.log(chunk);
        }
    });

    return output;
}

const setUpConversionPipeline = (ws, output) => {
    //create PCM buffer and overflow container
    const pcmBufferSize = 128;
    const pcmBuffer = new ArrayBuffer(pcmBufferSize)
    const overflow = []

    const handleFreqConversion = (chunk) => {
        if (!chunk || !(chunk instanceof Uint8Array) ) {
            console.log("Error: chunk not in right format")
            return;
        }
        //add the chunk to the overflow buffer
        overflow.push(...chunk);
       
        //ensure that the overflow isn't less than the current buffer size 
        if(overflow.length() > pcmBufferSize) {
            pcmBuffer.set(overflow.slice(0,pcmBufferSize))
            overflow.splice(0, pcmBufferSize);
        } 
   
        //convert the pcmBuffer in binary to pcmBuffer in 32 bit floating point numbers 
        const pcmInts = []
        for(let i = 0; i < pcmBuffer.length-8; i += 8) {
            let binaryNum = pcmBuffer.slice(i,i+8)
            let num = parse(0,8)
        }
   
        //perform a STFT using a buffer of previous data and current data 
        //import model to analyze incoming data
        // No need to return the chunk here
        return chunk;
    }

    // Create a write stream to convert WebM to PCM
    const webMWriteStream = new PassThrough();

    const conversion = ffmpeg(webMWriteStream)
    .inputFormat('webm')
    .audioCodec('pcm_u8')
    .on('error', (err) => {
        console.error('Error processing audio:', err);
        ws.send(JSON.stringify({ error: "Error processing audio" }));
    })
    .on('end', () => {
        console.log('Audio processing finished');
    });

    conversion.pipe(output)
        .on('data', handleFreqConversion)
        .on('end', () => {
            console.log("WebM PCM conversion pipe closed.");
        });

    conversion.on('end', () => {
        console.log('Conversion completed');
        ws.close(); // Optionally close the WebSocket if needed
    });

    return webMWriteStream;
}

const decodeAudioData = (binaryStr) => {
    const byteArray = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        byteArray[i] = binaryStr.charCodeAt(i);
    }
    return byteArray;
};

/*******  controllers ********/

function handleAudioSegment(ws, data, converter) {
    try { 

        // Process the incoming audio data in the form of byte encoded WebM data
        if (!Buffer.isBuffer(data) && typeof data === 'string') {
            const chunk = decodeAudioData(data)
            //convert data from webM to PCM data in real-time
            converter.write(chunk);
            console.log("converted chunk")
        } else {
            console.error('Invalid audio data format:', typeof data);
            ws.send(JSON.stringify({ error: "Invalid audio data format" }));
        }
    } catch (error) {
        console.log(error)
    }
}

/***********handlers**********/
function handleClose() {
    console.log('Client disconnected');
}

function handleError(error) {
    console.error('WebSocket error:', error);
}

function handleMessage(ws, message, converter) {
    const { type, data } = decodeJSON(message);

    switch (type) {
        case "audio-segment":
            handleAudioSegment(ws, data, converter);
            break;
        case "test":
            console.log(data);
            break;
        default:
            console.warn("Unknown message type:", type);
            break;
    }
}
/***********wss handlers**********/
wss.on('connection', (ws) => {
    console.log("client connected");
    //set up conversion pipeline
    const setUpModelInput = new WritableStream();
    const converter = setUpConversionPipeline(ws, output);

    ws.on('message', (message) => handleMessage(ws, message, converter));
    ws.on('close', handleClose);
    ws.on('error', handleError);
});

wss.on('close', () => {
    //gracefully close the pipeline
    modelInput.close();
    output.close();
    converter.close();
    //close the websocket server
    console.log("WebSocket server closed gracefully");
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});