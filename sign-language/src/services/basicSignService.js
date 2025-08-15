// Basic Sign Language Recognition Service - Proof of Concept
class BasicSignService {
  constructor() {
    // Simple vocabulary for proof of concept
    this.vocabulary = {
      'hello': {
        category: 'greeting',
        confidence: 0.85,
        description: 'Open hand waving motion'
      },
      'how are you': {
        category: 'question',
        confidence: 0.82,
        description: 'Pointing gesture followed by questioning expression'
      },
      'bye': {
        category: 'farewell',
        confidence: 0.88,
        description: 'Waving goodbye motion'
      },
      'good': {
        category: 'adjective',
        confidence: 0.86,
        description: 'Thumbs up or positive gesture'
      },
      'thank you': {
        category: 'courtesy',
        confidence: 0.84,
        description: 'Hand to chin, moving forward'
      },
      'please': {
        category: 'courtesy',
        confidence: 0.83,
        description: 'Circular motion on chest'
      },
      'yes': {
        category: 'response',
        confidence: 0.87,
        description: 'Nodding fist motion'
      },
      'no': {
        category: 'response',
        confidence: 0.85,
        description: 'Index and middle finger side to side'
      }
    };
  }

  // Simulate sign detection from video frame
  detectSignFromFrame(imageData) {
    // Simulate processing delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Randomly select a sign for demonstration
        const signs = Object.keys(this.vocabulary);
        const randomSign = signs[Math.floor(Math.random() * signs.length)];
        const signData = this.vocabulary[randomSign];
        
        // Add some randomness to confidence
        const confidence = signData.confidence + (Math.random() * 0.1 - 0.05);
        
        resolve({
          sign: randomSign,
          confidence: Math.max(0.5, Math.min(0.95, confidence)),
          category: signData.category,
          timestamp: Date.now()
        });
      }, 200); // Simulate processing time
    });
  }

  // Get vocabulary statistics
  getVocabularyStats() {
    const categories = {};
    Object.values(this.vocabulary).forEach(sign => {
      categories[sign.category] = (categories[sign.category] || 0) + 1;
    });

    return {
      totalWords: Object.keys(this.vocabulary).length,
      categories: Object.keys(categories).length,
      breakdown: categories
    };
  }

  // Check if a sign exists in vocabulary
  hasSign(sign) {
    return this.vocabulary.hasOwnProperty(sign.toLowerCase());
  }

  // Get sign information
  getSignInfo(sign) {
    return this.vocabulary[sign.toLowerCase()] || null;
  }
}

export const basicSignService = new BasicSignService();