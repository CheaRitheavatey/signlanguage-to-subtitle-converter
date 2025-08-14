// train model in browser
import * as tf from '@tensorflow/tfjs';
import { CLASS_LABELS } from '../utils/labelMaps';
import { toFeatures } from '../utils/signLanguageProcessor';
import { useState } from 'react';

const T = 24;        // frames per sequence
const F = 126;       // features per frame (both hands)

function buildModel(numClasses) {
  const input = tf.input({shape:[T, F]});
  let x = tf.layers.conv1d({filters:64, kernelSize:3, padding:'same', activation:'relu'}).apply(input);
  x = tf.layers.conv1d({filters:64, kernelSize:3, padding:'same', activation:'relu'}).apply(x);
  x = tf.layers.bidirectional({layer: tf.layers.lstm({units:64, returnSequences:true})}).apply(x);
  x = tf.layers.globalMaxPool1d().apply(x);
  x = tf.layers.dropout({rate:0.3}).apply(x);
  const out = tf.layers.dense({units:numClasses, activation:'softmax'}).apply(x);
  const model = tf.model({inputs:input, outputs:out});
  model.compile({optimizer: tf.train.adam(1e-3), loss:'categoricalCrossentropy', metrics:['accuracy']});
  return model;
}

export default function Trainer(){
  const [status, setStatus] = useState('Load your dataset JSON from DataCollector');

  async function onLoadDataset(e){
    const file = e.target.files[0];
    const txt = await file.text();
    const raw = JSON.parse(txt); // {samples:[{label, seq: [frame...] }]}
    // 1) slice to fixed length T, center-crop or pad
    const X = [], y = [];
    for (const s of raw.samples){
      const frames = s.seq;
      if (frames.length < 8) continue;
      // uniform sampling to exactly T frames
      const idxs = Array.from({length:T}, (_,i)=> Math.floor(i*(frames.length-1)/(T-1)));
      const featSeq = idxs.map(k => toFeatures(frames[k]));
      X.push(featSeq);
      const onehot = Array(CLASS_LABELS.length).fill(0);
      onehot[CLASS_LABELS.indexOf(s.label)] = 1;
      y.push(onehot);
    }
    const xT = tf.tensor3d(X);       // [N, T, F]
    const yT = tf.tensor2d(y);       // [N, C]

    const model = buildModel(CLASS_LABELS.length);
    setStatus(`Training on ${X.length} sequences...`);
    await model.fit(xT, yT, {
      epochs: 25,
      batchSize: 16,
      shuffle: true,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (ep, logs)=> setStatus(`epoch ${ep+1}: acc=${logs.acc?.toFixed(3)} val=${logs.val_acc?.toFixed(3)}`)
      }
    });

    setStatus('Saving model...');
    await model.save('downloads://asl-seq-model'); // downloads model.json & weights.bin
    xT.dispose(); yT.dispose(); model.dispose();
    setStatus('Done. Move the files into /public/models/asl/');
  }

  return (
    <div className="p-4 space-y-3">
      <input type="file" accept="application/json" onChange={onLoadDataset}/>
      <div>{status}</div>
      <ol className="list-decimal pl-6 text-sm opacity-70">
        <li>Collect ~20 sequences per class (0.8–1.5s each).</li>
        <li>Load JSON here and train.</li>
        <li>After download, create <code>/public/models/asl/</code> and place files there.</li>
      </ol>
    </div>
  );
}
