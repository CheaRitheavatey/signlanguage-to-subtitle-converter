# ✋ Sign Language to Subtitle

This project uses **OpenCV**, **cvzone**, and a custom **TensorFlow/Keras model** to detect a single hand from a webcam feed and classify it into one of several common **ASL (American Sign Language)** words.
It runs entirely on your computer with real-time predictions.

---

## 📸 Demo

> ![alt text](image-1.png)

---

### 🔗 Link to Demo

- Demo Link: https://chearitheavatey.github.io/signlanguage-to-subtitle-converter/

---

## 🚀 Features

- Real-time webcam hand detection using [cvzone HandTrackingModule](https://github.com/cvzone/cvzone).
- Classification of 24 common ASL words with a trained **`.h5`** model.
- Live preview of:

  - **Camera Feed** – shows your hand in real time.
  - **Cropped Hand** – focused region of the detected hand.
  - **White Background** – normalized square image used for classification.

- Simple and lightweight Python implementation.

---

## 📂 Project Structure

```
.
├─ gather_data             # Trained Keras/TensorFlow model
├─ gui                     # Simple GUI (Tkinter)
├─ main.py                 # Main application (OpenCV + cvzone)
├─ model                   # Pretrained model and label file
│  ├─ sign_model.h5        # Trained Keras model
│  └─ label.txt            # Class labels
├─ requirements.txt        # Python dependencies
└─ README.md               # This file
```

---

## 🛠️ Tech Stack

| Library              | Purpose                              |
| -------------------- | ------------------------------------ |
| **OpenCV**           | Webcam access, image preprocessing   |
| **cvzone**           | Easy hand detection & bounding boxes |
| **TensorFlow/Keras** | Model training & inference           |
| **NumPy**            | Image manipulation and math          |

---

### 💡 Future Ideas

- Add multi-hand detection.
- Support continuous sign sentence recognition.
- Build a web interface (React/FastAPI or Streamlit) for deployment.
- Expand to other sign languages in Southeast Asia.
- Integrate with speech synthesis for real-time translation.

---
