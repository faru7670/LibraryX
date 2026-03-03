import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

const FaceScanner = ({ onFaceDetected, isScanning }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');

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
        let currentStream = null;

        const startVideo = async () => {
            if (!isScanning) return;
            try {
                // Get available cameras
                const mediaDevices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');
                setDevices(videoDevices);

                const constraints = {
                    video: {
                        ...(selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : {}),
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                currentStream = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                // Auto-select the active device in the dropdown if we didn't specify one
                if (!selectedDeviceId && stream.getVideoTracks().length > 0) {
                    const track = stream.getVideoTracks()[0];
                    const settings = track.getSettings();
                    if (settings.deviceId) {
                        setSelectedDeviceId(settings.deviceId);
                    }
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
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [modelsLoaded, isScanning, selectedDeviceId]);

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
        <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
            {devices.length > 1 && (
                <div className="mb-2">
                    <select
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        {devices.map((device, index) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${index + 1}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
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
        </div>
    );
};

export default FaceScanner;
