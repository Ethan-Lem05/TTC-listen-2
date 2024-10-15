import FFT from "fft.js"

class AudioProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        
        this.overlap = 0.5;
        this.websocket = null;
        this.sampleRate = options.processorOptions.sampleRate;
        this.bufferSize = options.processorOptions.bufferSize;
        this.audioBuffer = new Float32Array(this.bufferSize);

        this.currentBuffer = new Float32Array(this.bufferSize);
        this.prevBuffer = new Float32Array(this.bufferSize);

        // Set up message handler
        this.port.onmessage = (event) => {
            if (event.data.type === "initialize") {
                console.log(event.data.text);
            }
            if (event.data.type === 'websocket-open') {
                this.websocket = event.data.socket; // Set the WebSocket instance
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[1][0]; // Assuming single-channel (mono) input

        if (!input) {
            return true; // No input data available
        }

        if (this.prevBuffer.length === 0) {
            this.prevBuffer.set(input);
        } else {
            this.currentBuffer.set(input);

            // Calculate the midpoint for overlap
            const mid = Math.floor(this.overlap * this.bufferSize);

            // Concatenate the buffers with overlap
            this.audioBuffer.set(this.prevBuffer.slice(mid), 0);
            this.audioBuffer.set(this.currentBuffer.slice(0, mid), this.bufferSize - mid);

            // Update the previous buffer for the next iteration
            this.prevBuffer.set(this.currentBuffer);
        }

        // Check if the audio buffer is ready for FFT
        if (this.audioBuffer.length > 0) {
            const windowedBuffer = this.applyHannWindow(this.audioBuffer);

            // Perform the FFT (ensure you have an FFT library available)
            const fftResult = this.performFFT(windowedBuffer);

            // Send the transformed data through the WebSocket
            if (this.websocket) {
                this.websocket.send(JSON.stringify({ type: "audio-segment", data: fftResult }));
            }
        }

        return true; // Keep the processor alive
    }

    applyHannWindow(data) {
        return data.map((value, index) => {
            return value * (0.5 * (1 - Math.cos((2 * Math.PI * index) / (data.length - 1))));
        });
    }

    performFFT(buffer) {
        // Placeholder function for FFT - you will need to implement or import an FFT library
        // Example: using 'fft.js' or a similar library to perform FFT
        const fft = new FFT(buffer.length); // Ensure to import or implement this FFT class
        return fft.forward(buffer);
    }
}

registerProcessor('audio-processor', AudioProcessor);