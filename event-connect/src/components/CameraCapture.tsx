import React, { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photoDataUrl: string) => void;
  onClose: () => void;
  facingMode?: 'user' | 'environment';
}

export default function CameraCapture({ onCapture, onClose, facingMode = 'user' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.warn('Error accessing camera with specific facingMode:', err);
        try {
          // Fallback to any available camera
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
        } catch (fallbackErr: any) {
          console.error('Error accessing any camera:', fallbackErr);
          setError(fallbackErr.message || 'Could not access camera. Please ensure you have granted permission.');
        }
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Stop the stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700">
          <X size={24} />
        </button>
      </div>
      
      {error ? (
        <div className="text-white text-center p-4">
          <p className="mb-6">{error}</p>
          <div className="flex flex-col gap-4 items-center">
            <label className="px-6 py-3 bg-indigo-600 rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors font-medium">
              Upload Photo Instead
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      onCapture(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            <button onClick={onClose} className="px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors font-medium">
              Go Back
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <button
              onClick={handleCapture}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 bg-indigo-600 rounded-full" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
