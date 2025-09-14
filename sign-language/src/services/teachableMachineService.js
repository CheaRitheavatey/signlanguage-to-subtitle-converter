// Google Teachable Machine Model Service
class TeachableMachineService {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.labels = [];
    this.modelPath = '/models/'; // Path to model files in public folder
  }

  // Load the Teachable Machine model
  async loadModel() {
    try {
      // Import TensorFlow.js
      const tf = await import('@tensorflow/tfjs');
      
      // Load the model from the public/models folder
      const modelUrl = `${this.modelPath}model.json`;
      this.model = await tf.loadLayersModel(modelUrl);
      

      const metadataRes = await fetch(`${this.modelPath}metadata.json`);
      const metadata = await metadataRes.json();
      this.labels = metadata.labels || metadata.class || []

      this.isLoaded = true;
      console.log('Teachable Machine model loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load Teachable Machine model:', error);
      this.isLoaded = false;
      return false;
    }
  }

  // Preprocess image for the model
  preprocessImage(canvas) {
    return new Promise((resolve) => {
      // Create a temporary canvas for preprocessing
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      // Set canvas size to match model input (usually 224x224 for Teachable Machine)
      tempCanvas.width = 224;
      tempCanvas.height = 224;
      
      // Draw and resize the image
      tempCtx.drawImage(canvas, 0, 0, 224, 224);
      
      // Get image data
      const imageData = tempCtx.getImageData(0, 0, 224, 224);
      resolve(imageData);
    });
  }

  // Convert ImageData to tensor
  async imageDataToTensor(imageData) {
    const tf = await import('@tensorflow/tfjs');
    
    // Convert to tensor and normalize
    const tensor = tf.browser.fromPixels(imageData)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(255.0)
      .expandDims(0);
    
    return tensor;
  }

  // Predict sign from canvas
  async predictSign(canvas) {
    if (!this.isLoaded || !this.model) {
      throw new Error('Model not loaded');
    }

    try {
      // Preprocess the image
      const imageData = await this.preprocessImage(canvas);
      const tensor = await this.imageDataToTensor(imageData);
      
      // Make prediction
      const predictions = await this.model.predict(tensor).data();
      
      // Clean up tensor
      tensor.dispose();
      
      // Process predictions
      return this.processPredictions(predictions);
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  // Process model predictions
  processPredictions(predictions) {
      // Load class labels from metadata (you'll need to implement this based on your model)
    const classLabels = this.labels.length ? this.labels : [];
    
    // Find the highest confidence prediction
    let maxConfidence = 0;
    let predictedClass = '';
    
    predictions.forEach((conf, i) => {
        if (conf > maxConfidence) {
            predictedClass = classLabels[i] || `Class_${i}`;
        }
        
    });
    // for (let i = 0; i < predictions.length; i++) {
    //   if (predictions[i] > maxConfidence) {
    //     maxConfidence = predictions[i];
    //     predictedClass = classLabels[i] || `Class_${i}`;
    //   }
    // }
    
    return {
      sign: predictedClass,
      confidence: maxConfidence,
      allPredictions: predictions.map((confidence, index) => ({
        class: classLabels[index] || `Class_${index}`,
        confidence: confidence
      }))
    };
  }

  // Get class labels from metadata
//   getClassLabels() {
//     // Default labels - this should be loaded from metadata.json
//     // You can modify this based on your actual model classes
//     return [
//       'hello',
//       'how are you',
//       'bye',
//       'good',
//       'thank you',
//       'please',
//       'yes',
//       'no'
//     ];
//   }

  // Load metadata from metadata.json
  async loadMetadata() {
    try {
      const response = await fetch(`${this.modelPath}metadata.json`);
      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error('Failed to load metadata:', error);
      return null;
    }
  }

  // Check if model is ready
  isModelReady() {
    return this.isLoaded && this.model !== null;
  }

  // Get model info
  getModelInfo() {
    if (!this.isLoaded) {
      return null;
    }

    return {
      inputShape: this.model.inputs[0].shape,
      outputShape: this.model.outputs[0].shape,
      isLoaded: this.isLoaded
    };
  }
}

export const teachableMachineService = new TeachableMachineService();