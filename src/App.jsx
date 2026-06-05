import * as cocossd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

import Webcam from "react-webcam";
import "./App.css";
const App = () =>
{
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const detectionIntervalRef = useRef(null); // Ref to control the interval
    const [isDetecting, setIsDetecting] = useState(false); // State for detection status
    const [hasPermission, setHasPermission] = useState(false); // Camera permission state
    const [facingMode, setFacingMode] = useState("user"); // Camera facing mode
    // Main function to load the model
    const runCoco = async () =>
    {
        const net = await cocossd.load(); // Load the COCO-SSD model
        console.log("Model loaded");
        detectionIntervalRef.current = net; // Store the loaded model in the ref
    };

    const detect = async (net) =>
    {
        // Check data is available
        if (
            typeof webcamRef.current == "undefined" ||
            webcamRef.current == null ||
            webcamRef.current.video.readyState !== 4
        )
            return
        // Get Video Properties
        const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        // Set video width and height
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        // Set canvas dimensions
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        // Detect objects
        const obj = await net.detect(video);
        console.log(obj);

        // Draw detections on the canvas
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, videoWidth, videoHeight); // Clear previous detections
        drawDetections(obj, ctx); // Draw new detections

    };

    // Function to draw bounding boxes on the canvas
    const drawDetections = (detections, ctx) =>
    {
        detections.forEach((detection) =>
        {
            const [x, y, width, height] = detection.bbox;
            const color = detection.class === "dog" ? "green" : "red"
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.font = "2rem Arial"
            ctx.strokeRect(x, y, width, height); // Draw bounding box
            ctx.fillStyle = 'black';

            ctx.fillText(
                `${detection.class} (${(detection.score * 100).toFixed(2)}%)`,
                x,
                y > 10 ? y - 5 : y + 10
            ); // Add label
        });
    };

    // Start detection loop
    const startDetection = () =>
    {
        if (!isDetecting && detectionIntervalRef.current) {
            setIsDetecting(true);
            detectionIntervalRef.current.interval = setInterval(() =>
            {
                detect(detectionIntervalRef.current);
            }, 100); // Adjust interval for detection speed
        }
    };

    // Stop detection loop
    const stopDetection = () =>
    {
        if (isDetecting) {
            setIsDetecting(false);
            clearInterval(detectionIntervalRef.current.interval);
            console.log("Detection stopped");
        }
    };
    // Function to request camera permissions
    const requestCameraPermission = async () =>
    {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode, // Front camera
                },
            });
            if (webcamRef.current) {
                webcamRef.current.srcObject = stream;
            }
            setHasPermission(true); // Update permission state
            runCoco(); // Load the model after permission is granted
        } catch (err) {
            console.error("Camera access denied or unavailable:", err);
            alert("Unable to access camera. Please check permissions.");
        }
    };

    return <div className="App">
        <header className="App-header" >
            <AnimatePresence mode="wait">
                {isDetecting &&
                    <motion.div hidden={{
                        x: -1000,
                        opacity: 1,
                        width: '0%',
                        height: '0%',
                        overflow: 'hidden'
                    }} animate={{ x: 0, opacity: 1, width: '100%', height: '100%', overflow: 'hidden' }}
                        exit={{ x: 1000, opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <Webcam
                            ref={webcamRef}
                            muted={true}
                            className="webcam"

                        />
                        <canvas
                            ref={canvasRef}

                        />
                        <button
                            type="button"
                            className="flip-camera-btn"
                            aria-label="Flip camera"
                            title="Flip camera"
                            onClick={() =>
                            {
                                // toggle between front ("user") and back ("environment") camera
                                setFacingMode(facingMode === "user" ? "environment" : "user");
                            }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2-3h2l2 3h5a2 2 0 0 1 2 2v3.34" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36" />
                                <polyline points="23 4 23 10 17 10" />
                            </svg>
                        </button>

                    </motion.div>
                }
            </AnimatePresence>
            <div>
                {!hasPermission && (
                    <button onClick={requestCameraPermission}>Allow Camera</button>
                )}
                {hasPermission && (
                    <>
                        <button onClick={startDetection} disabled={isDetecting}>
                            Start Detection
                        </button>
                        <button onClick={stopDetection} disabled={!isDetecting}>
                            Stop Detection
                        </button>
                    </>
                )}
            </div>
        </header>
    </div>
};

export default App;
