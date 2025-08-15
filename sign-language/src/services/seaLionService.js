// Sea Lion AI Service for Natural Language Processing
class SeaLionService {
  constructor() {
    this.apiUrl = 'https://api.sea-lion.ai/v1'; // Sea Lion API endpoint
    this.apiKey = process.env.API_KEY;
    this.model = 'aisingapore/Llama-SEA-LION-v3.5-8B-R'; // Sea Lion model
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  async generateFluentSentence(detectedSigns, context = {}) {
    if (!this.apiKey) {
      throw new Error('Sea Lion API key not set');
    }

    const prompt = this.buildPrompt(detectedSigns, context);

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert sign language interpreter. Convert detected sign language gestures into natural, fluent sentences. Maintain the meaning while ensuring grammatical correctness.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.3,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return this.processNLPResult(result);
    } catch (error) {
      console.error('Sea Lion API error:', error);
      return {
        fluentText: this.fallbackGeneration(detectedSigns),
        confidence: 0.5,
        error: error.message
      };
    }
  }

  buildPrompt(detectedSigns, context) {
    const signList = detectedSigns.map(sign => 
      `${sign.sign} (confidence: ${Math.round(sign.confidence * 100)}%)`
    ).join(', ');

    const contextInfo = context.language ? `Target language: ${context.language}. ` : '';
    const timeInfo = context.timeframe ? `Time context: ${context.timeframe}. ` : '';

    return `${contextInfo}${timeInfo}Convert these detected sign language gestures into a natural, fluent sentence: ${signList}

Please:
1. Create grammatically correct sentences
2. Maintain the intended meaning
3. Use natural language flow
4. Consider the sequence and timing of signs
5. Fill in reasonable connecting words if needed

Detected signs: ${signList}`;
  }

  processNLPResult(result) {
    if (result.choices && result.choices.length > 0) {
      const generatedText = result.choices[0].message.content.trim();
      
      return {
        fluentText: generatedText,
        confidence: this.calculateConfidence(result),
        usage: result.usage,
        model: result.model
      };
    }

    return {
      fluentText: '',
      confidence: 0,
      error: 'No text generated'
    };
  }

  calculateConfidence(result) {
    // Calculate confidence based on response quality indicators
    if (result.choices && result.choices[0]) {
      const choice = result.choices[0];
      let confidence = 0.7; // Base confidence
      
      // Adjust based on finish reason
      if (choice.finish_reason === 'stop') {
        confidence += 0.2;
      }
      
      // Adjust based on text length (reasonable responses)
      const textLength = choice.message.content.length;
      if (textLength > 10 && textLength < 200) {
        confidence += 0.1;
      }
      
      return Math.min(confidence, 1.0);
    }
    
    return 0.5;
  }

  fallbackGeneration(detectedSigns) {
    // Simple fallback when API is unavailable
    if (detectedSigns.length === 0) {
      return '';
    }

    const words = detectedSigns.map(sign => sign.sign.toLowerCase());
    
    // Basic grammar rules for common patterns
    if (words.includes('hello')) {
      return 'Hello there!';
    }
    
    if (words.includes('how are you')) {
      return 'How are you doing?';
    }
    
    if (words.includes('thank you')) {
      return 'Thank you very much.';
    }
    
    if (words.includes('please')) {
      return 'Please help me.';
    }
    
    if (words.includes('yes')) {
      return 'Yes, I agree.';
    }
    
    if (words.includes('no')) {
      return 'No, I disagree.';
    }

    if (words.includes('bye')) {
      return 'Goodbye, see you later!';
    }

    if (words.includes('good')) {
      return 'That is good.';
    }
    
    // Default: join words with basic grammar
    return this.basicGrammarJoin(words);
  }

  basicGrammarJoin(words) {
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase() + words[0].slice(1) + '.';
    }
    
    if (words.length === 2) {
      return `${words[0].charAt(0).toUpperCase() + words[0].slice(1)} ${words[1]}.`;
    }
    
    // For longer sequences, add basic connectors
    const connectors = ['and', 'then', 'also'];
    let result = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    
    for (let i = 1; i < words.length; i++) {
      if (i === words.length - 1) {
        result += ` and ${words[i]}`;
      } else {
        const connector = connectors[Math.floor(Math.random() * connectors.length)];
        result += ` ${connector} ${words[i]}`;
      }
    }
    
    return result + '.';
  }

  // Translate to different languages
  async translateText(text, targetLanguage) {
    const prompt = `Translate the following text to ${targetLanguage}: "${text}"`;
    
    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate text accurately to ${targetLanguage} while maintaining natural flow.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.2
        })
      });

      const result = await response.json();
      return result.choices[0].message.content.trim();
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }
}

export const seaLionService = new SeaLionService();