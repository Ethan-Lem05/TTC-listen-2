class AudioProcessor extends AudioWorkletProcessor {

    constructor(options) {
        super();

        this.websocket = null
        this.sampleRate = optins.processorOptions.sampleRate
        this.bufferSize = options.processorOptions.bufferSize
        this.audioBuffer = new Float32Array(this.bufferSize)

        // Set up message handler
        this.port.onmessage = (event) => {
            if(event.data.type === "initialize"){
                console.log(event.data.text)
            }
            if(event.data.type === 'websocket-open') {
                this.websocket = event.data.socket; // Set the WebSocket instance
            }
            
        };
    }

    process(inputs, outputs, parameters) {

        //establish an FFT
        fft = new FFT(windowSize)

        // assuming inputs is a monoaudio input (1 channel)
        const input = inputs[0]; // Get the first input channel
        
        
        
        // Check if the WebSocket is open
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.audioBuffer.set(audioData)
            // Send audio data as a binary message
            this.websocket.send({type:'audio-data-send', data:this.audioBuffer});
        }

        return true; // Keep the processor alive
    }
}
