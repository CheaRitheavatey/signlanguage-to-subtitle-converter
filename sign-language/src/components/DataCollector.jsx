import { useEffect, useRef, useState } from 'react';
import { CLASS_LABELS } from '../utils/labelMaps';

// You already have useCamera/useMediaPipeDetection; we just need the stream of landmarks
export default function DataCollector({ useCamera, useMediaPipeDetection }) {
  const { videoRef, startCamera } = useCamera();
  const { startDetection, onFrame } = useMediaPipeDetection();
  const [currentLabel, setCurrentLabel] = useState(CLASS_LABELS[0]);
  const [frames, setFrames] = useState([]);   // current sequence buffer
  const [samples, setSamples] = useState([]); // all sequences
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    startCamera();
    startDetection(videoRef.current);
    onFrame((lm) => {
      // lm: { left: [{x,y,z}*21] | null, right: [{x,y,z}*21] | null, t: Date.now() }
      if (!recording) return;
      setFrames(f => [...f, lm]);
    });
  }, []);

  function startSeq() {
    setFrames([]);
    setRecording(true);
  }
  function stopSeq() {
    setRecording(false);
    if (frames.length > 8) { // keep only meaningful sequences
      setSamples(s => [...s, { label: currentLabel, seq: frames }]);
    }
  }

  function download() {
    const blob = new Blob([JSON.stringify({ samples }, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'asl_sequences.json';
    a.click();
  }

  return (
    <div className="p-4 space-y-3">
      <video ref={videoRef} autoPlay muted playsInline className="w-96 border rounded" />
      <div className="flex gap-2">
        <select value={currentLabel} onChange={e=>setCurrentLabel(e.target.value)}>
          {CLASS_LABELS.map(c => <option key={c}>{c}</option>)}
        </select>
        <button onClick={startSeq}>Start sequence</button>
        <button onClick={stopSeq}>Stop & save</button>
        <button onClick={download}>Download dataset</button>
      </div>
      <div>Samples: {samples.length}</div>
      <div>Recording: {recording ? 'YES' : 'no'}</div>
      <p className="text-sm opacity-70">
        Tip: record ~20 sequences per label, 0.8–1.5s each, from different angles.
      </p>
    </div>
  );
}
