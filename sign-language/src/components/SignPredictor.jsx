import React, { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const SECONDS_BETWEEN_CAPTURE = 0.15; // capture every 150ms

export default function SignPredictor() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [prediction, setPrediction] = useState(null);
  const [have, setHave] = useState(0);
  const clientIdRef = useRef(null);

  // create or load client id
  useEffect(() => {
    let id = localStorage.getItem("clientId");
    if (!id) {
      id = self.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
      localStorage.setItem("clientId", id);
    }
    clientIdRef.current = id;
  }, []);

  useEffect(() => {
    async function start() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // canvas
      const canvas = document.createElement("canvas");
      canvas.width = 224;
      canvas.height = 224;
      canvasRef.current = canvas;

      intervalRef.current = setInterval(async () => {
        try {
          const ctx = canvas.getContext("2d");
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            const fd = new FormData();
            fd.append("file", blob, "frame.jpg");

            const res = await fetch(`${API_URL}/predict`, {
              method: "POST",
              headers: {
                "X-Client-Id": clientIdRef.current
              },
              body: fd,
            });

            if (!res.ok) return;
            const data = await res.json();
            // data: {word, confidence, status, have}
            setPrediction(data.word ? `${data.word} (${(data.confidence*100).toFixed(1)}%)` : null);
            setHave(data.have || 0);
          }, "image/jpeg", 0.8);
        } catch (err) {
          console.error("send error:", err);
        }
      }, SECONDS_BETWEEN_CAPTURE * 1000);
    }
    

    start();

    

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div style={{display:"flex", flexDirection:"column", gap:10}}>
      <video ref={videoRef} style={{width:480, height:360}} autoPlay playsInline muted />
      <div>
        <strong>Prediction:</strong> {prediction ?? "—"}
      </div>
      <div>
        <strong>Frames collected:</strong> {have} / 30
      </div>
      <div style={{color:"#888", fontSize:12}}>Backend: {API_URL}</div>
    </div>
  );
}
