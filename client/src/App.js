import './App.css';
import React, { useState, useEffect } from 'react';

const serverPort = 'ws://localhost:5000';

function encodeJSON(json) {
  const jsonString = JSON.stringify(json);
  const encoder = new TextEncoder();
  return encoder.encode(jsonString);
}
function encodeAudioData(data) { 
  if (!(data instanceof Uint32Array)) {
    data = new Uint8Array(data);
  }
  return String.fromCharCode(...data);
}

function useAudio(recording) {
  const [audioStream, setAudioStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
      const setUpDevice = async () => {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: {
                  channelCount: 1,
              }});
              setAudioStream(stream);
          } catch (err) {
              console.error("Error accessing audio devices:", err);
              setError(err);
          }
      };

      if (recording) {
          setUpDevice();  // Set up device only if recording is true
      } else if (audioStream) {
          // Stop all audio tracks when not recording
          audioStream.getTracks().forEach(track => track.stop());
          setAudioStream(null);
      }

      // Clean up function to stop the stream
      return () => {
          if (audioStream) {
              audioStream.getTracks().forEach(track => track.stop());
          }
      };
  }, [recording]);

  return [audioStream, error];
}

function useWebSocket(url, isRecording, onError) {
  const [ws, setWS] = useState(null);

  useEffect(() => {

    if (!isRecording) {
      return;
    }
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    socket.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      if ('data' in eventData) {
        console.log('Message from server:', eventData.data);
      }
      if ('error' in eventData) {
      onError(eventData.error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
      console.log(error.message)
      onError(error.message);
    };

    setWS(socket);

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [isRecording]);

  return ws;
}

function useMediaRecorder(audioStream, isRecording, ws) {
  const [recorder, setRecorder] = useState(null);

  useEffect(() => {
    if (audioStream && isRecording) {
      const mediaRecorder = new MediaRecorder(audioStream);

      mediaRecorder.ondataavailable = async (event) => {
        let buffer = await event.data.arrayBuffer();
        const bufferString = encodeAudioData(buffer);
        if (event.data.size > 0 && ws && ws.readyState === WebSocket.OPEN) {
          const packet = { type: "audio-segment", data: bufferString };
          ws.send(encodeJSON(packet));
          console.log("sending data...");
        }
      };

      mediaRecorder.onstop = () => {
        setRecorder(null);
      };

      setRecorder(mediaRecorder);
      mediaRecorder.start(1000);
    }
  }, [audioStream, isRecording, ws]);

  return recorder;
}

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, audioError] = useAudio(isRecording);
  const [error, setError] = useState(null);

  const ws = useWebSocket(serverPort, isRecording, setError);

  const recorder = useMediaRecorder(audioStream, isRecording, ws);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    setIsRecording(false);
  };

  useEffect(() => {
    if (audioError) {
      setError(audioError.message);
    }
  }, [audioError]);

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
