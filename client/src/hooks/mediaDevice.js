import React, { useEffect, useState } from "react";

function useAudio(recording) {
    const [audioStream, setAudioStream] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const setUpDevice = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
    }, [recording]); // Removed audioStream from the dependency array

    return [audioStream, error];
}

export default useAudio;