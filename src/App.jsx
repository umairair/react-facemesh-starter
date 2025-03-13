import { useEffect, useState, useRef } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs';

function App() {
  const [detector, setDetector] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize detector and webcam
  useEffect(() => {
    async function initDetector() {
      await tf.setBackend('webgl');
      
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: "tfjs", 
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh", 
      };

      try {
        const tfdetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        setDetector(tfdetector);  
        console.log("Detector initialized successfully!");

        const startWebcam = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;

            videoRef.current.onloadedmetadata = () => {
              console.log("Webcam initialized successfully!");
              videoRef.current.play().then(() => {
                setIsInitialized(true); 
              }).catch((err) => {
                console.error("Error playing video:", err);
              });
            };
          } catch (err) {
            console.error('Error accessing webcam:', err);
          }
        };
    
        startWebcam();
      } catch (error) {
        console.error("Error initializing detector:", error);
      }
    }

    initDetector();
  }, []);

  async function processFrames() {
    if (!isInitialized || !detector) return;
    alert("open console to see live data");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    const detectFaces = async () => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const faces = await detector.estimateFaces(imageData);
        console.log(faces);
  
      } catch (error) {
        console.error("Error processing frame:", error);
      }
      requestAnimationFrame(detectFaces);
    };
  
    detectFaces(); 
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        className={`cursor-pointer border-2 p-4 text-2xl ${
          isInitialized ? 'hover:bg-sky-300' : 'opacity-50 cursor-not-allowed animate-pulse'
        }`}
        onClick={processFrames}
        disabled={!isInitialized}
      >
        {isInitialized? 'Start Processing' : 'Loading...'}
      </button>

      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;
