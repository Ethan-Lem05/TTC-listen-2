import React, { useEffect, useState } from "react";

function useAudio(recording) {
    const [audioStream, setAudioStream] = useState(null);
    const [error, setError] = useState(null);
    const [audioDevices, setAudioDevices] = useState(null);

    useEffect(() => {
        async function setUpDevice() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setAudioStream(stream); // return the first audio track 
                //TODO: add pop up to select audio tracks
            } catch (err) {
                setError(err);
            }
        }

        async function listAudioInputDevices() {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');

            audioInputs.forEach((device, index) => {
                console.log(`${index}: ${device.label} (ID: ${device.deviceId})`);
            });

            return audioInputs; // Returns an array of audio input devices
        }

        if (recording) {
            setUpDevice();
            listAudioInputDevices().then(devices => {
                setAudioDevices(devices);
            });
            console.log(audioStream);
        } else if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
            setAudioStream(null);
        }

    }, [recording]);

    return [audioStream, error, audioDevices];
}

export default useAudio;
