import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

const FaceScanner = ({ onFaceDetected, isScanning }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [error, setError] = useState(null);

    // Load face-api models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models'; // Ensure models are in public/models
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
            } catch (err) {
                console.error("Error loading models", err);
                setError("Failed to load facial recognition models.");
            }
        };
        loadModels();
    }, []);

    // Start video stream
    useEffect(() => {
        const startVideo = async () => {
            if (!isScanning) return;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing webcam", err);
                setError("Please allow webcam access to scan face.");
            }
        };

        if (modelsLoaded && isScanning) {
            startVideo();
        }

        return () => {
            // Cleanup video stream on unmount or when scanning stops
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [modelsLoaded, isScanning]);

    const handleVideoPlay = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !isScanning) return;

        let scanInterval;

        const detectFace = async () => {
            if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

            const detection = await faceapi.detectSingleFace(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (canvasRef.current && videoRef.current) {
                const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
                faceapi.matchDimensions(canvasRef.current, displaySize);

                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                if (detection) {
                    const resizedDetections = faceapi.resizeResults(detection, displaySize);
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                    faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);

                    // Pass the descriptor up to the parent component
                    if (onFaceDetected && detection.descriptor) {
                        // We use JSON.stringify(Array.from(descriptor)) when sending to server 
                        // because Float32Array doesn't stringify well over standard JSON
                        onFaceDetected(Array.from(detection.descriptor));

                        // Optional: Stop further scanning once a face is found 
                        // (depends on how the calling component mananages the "isScanning" prop)
                        clearInterval(scanInterval);
                    }
                }
            }
        };

        scanInterval = setInterval(detectFace, 500); // Check 2 times a second

        return () => clearInterval(scanInterval);
    }, [isScanning, onFaceDetected]);


    if (error) {
        return (
            <div className="bg-red-50 text-red-500 p-4 rounded-md">
                {error}
            </div>
        );
    }

    if (!modelsLoaded) {
        return <div className="text-gray-500 text-center p-4 min-h-[200px] flex items-center justify-center">Loading face recognition models...</div>;
    }

    return (
        <div className="relative w-full max-w-md mx-auto aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            {!isScanning ? (
                <p className="text-white z-10">Camera Paused</p>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        onPlay={handleVideoPlay}
                        autoPlay
                        muted
                        className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full object-cover z-10 pointer-events-none"
                    />
                </>
            )}
        </div>
    );
};

export default FaceScanner;
