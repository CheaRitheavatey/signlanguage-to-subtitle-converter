// Hand landmark indices for key positions
const LANDMARK_INDICES = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_TIP: 8,
  MIDDLE_TIP: 12,
  RING_TIP: 16,
  PINKY_TIP: 20,
  INDEX_PIP: 6,
  MIDDLE_PIP: 10,
  RING_PIP: 14,
  PINKY_PIP: 18,
};

// Detection thresholds
const DETECTION_THRESHOLDS = {
  FINGER_EXTENDED: 0.1,
  LETTER_O_MAX_DIST: 0.03,
  LETTER_V_MIN_DIST: 0.05,
  WAVE_MIN_MOVEMENT: 0.2,
  ILY_MIN_DIST: 0.15
};

export class SignLanguageProcessor {
  constructor() {
    this.gestureHistory = [];
    this.prevPositions = [];
    this.historySize = 5;
  }

  // Calculate Euclidean distance between two landmarks
  calculateDistance(point1, point2) {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Check if finger is extended
  isFingerExtended(landmarks, tipIndex, pipIndex) {
    const tip = landmarks[tipIndex];
    const pip = landmarks[pipIndex];
    const wrist = landmarks[LANDMARK_INDICES.WRIST];
    
    const tipToWrist = this.calculateDistance(tip, wrist);
    const pipToWrist = this.calculateDistance(pip, wrist);
    
    return tipToWrist > pipToWrist + DETECTION_THRESHOLDS.FINGER_EXTENDED;
  }

  // Main gesture detection function
  detectGesture(landmarks) {
    const extendedFingers = {
      thumb: this.isThumbExtended(landmarks),
      index: this.isFingerExtended(landmarks, LANDMARK_INDICES.INDEX_TIP, LANDMARK_INDICES.INDEX_PIP),
      middle: this.isFingerExtended(landmarks, LANDMARK_INDICES.MIDDLE_TIP, LANDMARK_INDICES.MIDDLE_PIP),
      ring: this.isFingerExtended(landmarks, LANDMARK_INDICES.RING_TIP, LANDMARK_INDICES.RING_PIP),
      pinky: this.isFingerExtended(landmarks, LANDMARK_INDICES.PINKY_TIP, LANDMARK_INDICES.PINKY_PIP),
    };

    // ASL Letters
    if (this.isLetterA(extendedFingers)) return { name: 'A', confidence: 0.85, landmarks };
    if (this.isLetterB(extendedFingers)) return { name: 'B', confidence: 0.88, landmarks };
    if (this.isLetterC(landmarks, extendedFingers)) return { name: 'C', confidence: 0.82, landmarks };
    if (this.isLetterD(extendedFingers)) return { name: 'D', confidence: 0.86, landmarks };
    if (this.isLetterE(extendedFingers)) return { name: 'E', confidence: 0.84, landmarks };
    if (this.isLetterF(landmarks, extendedFingers)) return { name: 'F', confidence: 0.87, landmarks };
    if (this.isLetterG(extendedFingers)) return { name: 'G', confidence: 0.83, landmarks };
    if (this.isLetterH(extendedFingers)) return { name: 'H', confidence: 0.85, landmarks };
    if (this.isLetterI(extendedFingers)) return { name: 'I', confidence: 0.89, landmarks };
    if (this.isLetterL(extendedFingers)) return { name: 'L', confidence: 0.87, landmarks };
    if (this.isLetterO(landmarks, extendedFingers)) return { name: 'O', confidence: 0.85, landmarks };
    if (this.isLetterU(extendedFingers)) return { name: 'U', confidence: 0.86, landmarks };
    if (this.isLetterV(landmarks, extendedFingers)) return { name: 'V', confidence: 0.88, landmarks };
    if (this.isLetterW(extendedFingers)) return { name: 'W', confidence: 0.84, landmarks };
    if (this.isLetterY(extendedFingers)) return { name: 'Y', confidence: 0.87, landmarks };

    // Words and Phrases
    if (this.isHello(extendedFingers)) return { name: 'Hello', confidence: 0.90, landmarks };
    if (this.isThankYou(landmarks, extendedFingers)) return { name: 'Thank you', confidence: 0.88, landmarks };
    if (this.isPlease(extendedFingers)) return { name: 'Please', confidence: 0.85, landmarks };
    if (this.isYes(extendedFingers)) return { name: 'Yes', confidence: 0.87, landmarks };
    if (this.isNo(landmarks, extendedFingers)) return { name: 'No', confidence: 0.86, landmarks };
    if (this.isILoveYou(landmarks, extendedFingers)) return { name: 'I Love You', confidence: 0.92, landmarks };
    if (this.isHowAreYou(landmarks)) return { name: 'How are you?', confidence: 0.89, landmarks };

    return { name: 'Unknown', confidence: 0.3, landmarks };
  }

  isThumbExtended(landmarks) {
    const thumbTip = landmarks[LANDMARK_INDICES.THUMB_TIP];
    const thumbIP = landmarks[3];
    const wrist = landmarks[LANDMARK_INDICES.WRIST];
    
    const tipToWrist = this.calculateDistance(thumbTip, wrist);
    const ipToWrist = this.calculateDistance(thumbIP, wrist);
    
    return tipToWrist > ipToWrist + DETECTION_THRESHOLDS.FINGER_EXTENDED;
  }

  // ASL Letter Detection Methods
  isLetterA(fingers) {
    return !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky && fingers.thumb;
  }

  isLetterB(fingers) {
    return fingers.index && fingers.middle && fingers.ring && fingers.pinky && !fingers.thumb;
  }

  isLetterC(landmarks, fingers) {
    const thumbTip = landmarks[LANDMARK_INDICES.THUMB_TIP];
    const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
    const distance = this.calculateDistance(thumbTip, indexTip);
    return distance > 0.05 && distance < 0.15;
  }

  isLetterD(fingers) {
    return fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky && fingers.thumb;
  }

  isLetterE(fingers) {
    return !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky && !fingers.thumb;
  }

  isLetterF(landmarks, fingers) {
    const thumbTip = landmarks[LANDMARK_INDICES.THUMB_TIP];
    const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
    const distance = this.calculateDistance(thumbTip, indexTip);
    return distance < 0.05 && fingers.middle && fingers.ring && fingers.pinky;
  }

  isLetterG(fingers) {
    return fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky && !fingers.thumb;
  }

  isLetterH(fingers) {
    return fingers.index && fingers.middle && !fingers.ring && !fingers.pinky && !fingers.thumb;
  }

  isLetterI(fingers) {
    return !fingers.index && !fingers.middle && !fingers.ring && fingers.pinky && !fingers.thumb;
  }

  isLetterL(fingers) {
    return fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky && fingers.thumb;
  }

  isLetterO(landmarks, fingers) {
    const thumbTip = landmarks[LANDMARK_INDICES.THUMB_TIP];
    const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
    const distance = this.calculateDistance(thumbTip, indexTip);
    return distance < DETECTION_THRESHOLDS.LETTER_O_MAX_DIST;
  }

  isLetterU(fingers) {
    return fingers.index && fingers.middle && !fingers.ring && !fingers.pinky && !fingers.thumb;
  }

  isLetterV(landmarks, fingers) {
    const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
    const middleTip = landmarks[LANDMARK_INDICES.MIDDLE_TIP];
    const distance = this.calculateDistance(indexTip, middleTip);
    return fingers.index && fingers.middle && !fingers.ring && !fingers.pinky && 
           distance > DETECTION_THRESHOLDS.LETTER_V_MIN_DIST;
  }

  isLetterW(fingers) {
    return fingers.index && fingers.middle && fingers.ring && !fingers.pinky && !fingers.thumb;
  }

  isLetterY(fingers) {
    return !fingers.index && !fingers.middle && !fingers.ring && fingers.pinky && fingers.thumb;
  }

  // Common word detection methods
  isHello(fingers) {
    return fingers.index && fingers.middle && fingers.ring && fingers.pinky && fingers.thumb;
  }

  isThankYou(landmarks, fingers) {
    const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
    return indexTip[1] < 0.3 && fingers.index && fingers.middle && fingers.ring && fingers.pinky;
  }

  isPlease(fingers) {
    return fingers.index && fingers.middle && fingers.ring && fingers.pinky && fingers.thumb;
  }

  isYes(fingers) {
    return !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky && fingers.thumb;
  }

  isNo(landmarks, fingers) {
    const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
    const middleTip = landmarks[LANDMARK_INDICES.MIDDLE_TIP];
    const distance = this.calculateDistance(indexTip, middleTip);
    return fingers.index && fingers.middle && distance < DETECTION_THRESHOLDS.LETTER_O_MAX_DIST;
  }

  isILoveYou(landmarks, fingers) {
    const pinkyThumbDist = this.calculateDistance(
      landmarks[LANDMARK_INDICES.PINKY_TIP],
      landmarks[LANDMARK_INDICES.THUMB_TIP]
    );
    return fingers.pinky &&
           fingers.index && 
           !fingers.middle && 
           !fingers.ring &&
           fingers.thumb &&
           pinkyThumbDist > DETECTION_THRESHOLDS.ILY_MIN_DIST;
  }

  isHowAreYou(landmarks) {
    const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
    this.prevPositions.push(indexTip);
    
    if (this.prevPositions.length > 10) {
      this.prevPositions.shift();
      
      const xMovements = this.prevPositions.map(p => p[0]);
      const xRange = Math.max(...xMovements) - Math.min(...xMovements);
      return xRange > DETECTION_THRESHOLDS.WAVE_MIN_MOVEMENT;
    }
    return false;
  }

  // Process MediaPipe results with smoothing
  processResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      return null;
    }

    const landmarks = results.multiHandLandmarks[0].map(landmark => [
      landmark.x,
      landmark.y,
      landmark.z
    ]);

    const gesture = this.detectGesture(landmarks);
    
    // Add to history for smoothing
    this.gestureHistory.push(gesture);
    if (this.gestureHistory.length > this.historySize) {
      this.gestureHistory.shift();
    }

    return this.getSmoothGesture();
  }

  // Get the most consistent recent gesture
  getSmoothGesture() {
    if (this.gestureHistory.length === 0) {
      return { name: 'Unknown', confidence: 0, landmarks: [] };
    }

    const gestureCounts = {};
    
    this.gestureHistory.forEach(gesture => {
      if (!gestureCounts[gesture.name]) {
        gestureCounts[gesture.name] = { count: 0, confidence: 0 };
      }
      gestureCounts[gesture.name].count++;
      gestureCounts[gesture.name].confidence += gesture.confidence;
    });

    let bestGesture = 'Unknown';
    let bestScore = 0;

    Object.entries(gestureCounts).forEach(([name, data]) => {
      const avgConfidence = data.confidence / data.count;
      const score = data.count * avgConfidence;
      
      if (score > bestScore) {
        bestScore = score;
        bestGesture = name;
      }
    });

    const avgConfidence = gestureCounts[bestGesture]?.confidence / gestureCounts[bestGesture]?.count || 0;
    
    return {
      name: bestGesture,
      confidence: Math.min(avgConfidence, 0.95),
      landmarks: this.gestureHistory[this.gestureHistory.length - 1]?.landmarks || []
    };
  }

  clearHistory() {
    this.gestureHistory = [];
    this.prevPositions = [];
  }
}