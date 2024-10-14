import './App.css';
import useAudio from './hooks/mediaDevice';
import React, {useState, createContext, useEffect} from "react"
import AudioProcessor from 'AudioProcessor'

const GlobalContext = createContext();
const serverPort = 'ws://localhost:5000'

function App() {
  //states
  const [isRecording, setIsRecording] = useState(false); 
  const [audioStream, audioError] = useAudio(isRecording);
  const [socket, setSocket] = useState(null)
  const [error, setError] = useState(null)

  //event listeners
  function startRecording() {
    setIsRecording(!isRecording)
   }

  // use effects 

  //open socket on recording
  useEffect(() => {
    if (!isRecording) return;

    const ws = new WebSocket(serverPort);

    ws.onopen = () => {
      console.log('WebSocket connection opened');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      console.log('Message from server:', event.data);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setSocket(null);
    };

    ws.onerror = (error) => {
      setError(error);
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };

  }, [isRecording]);

  useEffect( async () => {
    //demorgans law
    if(!(isRecording && audioStream && socket)) {
      return
    }

    let audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('AudioProcessor.js');

    let source = audioContext.createMediaStreamSource(stream);
    let node = AudioWorkletNode(audioContext, 'AudioProcessor', {
      processorOptions: {
        sampleRate: audioContext.sampleRate,
        bufferSize: 1024
      }
    })
    
    source.connect(node)

    // Listen for messages from the audio worklet processor
    workletNode.port.onmessage = (event) => {
      console.log('Message from worklet:', event.data);
  };

    // Send a message to the audio worklet processor
    workletNode.port.postMessage({ type: 'initialize', text: 'initializing port...' });
    //send a message to the thread with the websocket attached 
    workletNode.port.postMessage({type: 'websocket-open', socket: socket})

  }, [isRecording, audioStream, socket])

  //set error
  useEffect(() => {
    setError (audioError)
  }, [audioError])

  return (
    <GlobalContext.Provider value={{isRecording, setIsRecording}}>
      <div className="header">
        <h2>By Ethan Lem</h2>
        <h2 className="GitHub-Link"><a href=""> GitHub </a></h2>
      </div>
      <div className="app">
        <h1 id="header"> TTC Listen </h1>
        <h2 id="explanation"> Click here to start recording...  </h2>
        <button id="recording-button" className={ !isRecording ? "recording-button" : "recording"} onClick={startRecording}> Start Recording </button>
        <p id="error-text" className="error-text"> {error} </p>
      </div>
    </GlobalContext.Provider>
  )
}

export default App;
