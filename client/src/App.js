import './App.css';
import useAudio from './hooks/mediaDevice';
import React, { useState, useEffect } from 'react';

const serverPort = 'ws://localhost:5000';

function encodeJSON (json) {
    const jsonString = JSON.stringify(json);
    const encoder = new TextEncoder();
    return encoder.encode(jsonString);
}

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, audioError] = useAudio(isRecording);
  const [error, setError] = useState(null);
  const [ws, setWS] = useState(null); // Properly initialize WebSocket state
  const [recorder, setRecorder] = useState(null); // Store the MediaRecorder instance

  // Effect hook to initialize recording when audioStream is available
  useEffect(() => {
    if (audioStream && isRecording) {
      initializeRecording();
    }
  }, [audioStream, isRecording]);

  const initializeRecording = () => {
    if (audioStream) {
      const mediaRecorder = new MediaRecorder(audioStream);

      mediaRecorder.ondataavailable = (event) => {
        console.log("sending data...")
        if (event.data.size > 0 && ws && ws.readyState === WebSocket.OPEN) {
            const test = { type: "test", data: "hello" };
            
            ws.send(encodeJSON(test)); // Send audio data to WebSocket server
        }
      };

      mediaRecorder.onstop = () => {
        setIsRecording(false);
      };

      setRecorder(mediaRecorder);
      mediaRecorder.start(1000); // Start recording with 1-second chunks
    }
  };

  const createWSConn = () => {
    const socket = new WebSocket(serverPort);

    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    socket.onmessage = (event) => {
      console.log('Message from server:', event.data);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
      setError(error.message);
    };

    setWS(socket);
  };

  const handleStartRecording = () => {
    createWSConn(); // Establish WebSocket connection before starting the recording
    setIsRecording(true); // Trigger audio stream request through the useAudio hook
  };

  const handleStopRecording = () => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop(); // Stop the MediaRecorder if it's recording
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close(); // Close WebSocket connection if open
    }
    setIsRecording(false);
  };

  // Handle audio errors
  if (audioError) {
    setError(audioError.message);
  }

  return (
    <div>
      <div className="header">
        <h2>By Ethan Lem</h2>
        <h2 className="GitHub-Link"><a href=""> GitHub </a></h2>
      </div>
      <div className="app">
        <h1 id="header">TTC Listen</h1>
        <h2 id="explanation">Click here to start recording...</h2>
        <button
          id="recording-button"
          className={!isRecording ? "recording-button" : "recording"}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        {error && <p id="error-text" className="error-text">{error}</p>}
      </div>
    </div>
  );
}

export default App;
