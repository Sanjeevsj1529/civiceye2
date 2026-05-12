import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Trash2, ChevronRight, X } from 'lucide-react';

interface CameraModalProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error("Camera access denied", err);
        setError("Camera access denied. Please check permissions.");
      }
    }
    setupCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-dark-950/90 backdrop-blur-md p-4"
    >
      <div className="relative w-full max-w-lg bg-dark-900 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        {error ? (
          <div className="p-12 text-center">
            <X size={48} className="text-brand-rose mx-auto mb-4" />
            <p className="text-white font-bold mb-6">{error}</p>
            <button onClick={onClose} className="px-6 py-2 bg-white/10 text-white rounded-xl">Close</button>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-[3/4] object-cover bg-black" />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute bottom-8 left-0 w-full flex items-center justify-center gap-8">
              <button onClick={onClose} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
                <Trash2 size={24} />
              </button>
              <button 
                onClick={takePhoto} 
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group"
              >
                <div className="w-14 h-14 rounded-full bg-white group-active:scale-90 transition-transform" />
              </button>
              <div className="w-14" /> {/* Spacer */}
            </div>
            
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-black/40 text-white hover:bg-black/60">
              <X size={20} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
