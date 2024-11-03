
const FFT = require("fft.js")

const prev = new ArrayBuffer(128)
const current = new ArrayBuffer(128)

const hannWindow = (clip) => {
    const window = new Float32Array(clip.length());
    for (let i = 0; i < length; i++) {
        window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (clip.length() - 1)));
    }
    
    return map(clip, (sample, i) => sample*window[i])
}

const process = (clip) => {
    //take the clip, 

}

module.exports({process})