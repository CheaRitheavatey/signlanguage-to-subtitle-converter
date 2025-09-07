const express = require('express');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 8080;

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id'
});
const bucket = storage.bucket('sign-bucket1');

// Middleware
app.use(cors());
app.use(express.json());

// Multer for handling file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Routes

// Get all available words in the dataset
app.get('/api/words', async (req, res) => {
  try {
    console.log('Fetching word list...');
    const file = bucket.file('wlasl_class_list.txt');
    const [contents] = await file.download();
    const words = contents.toString().split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0);
    
    res.json({ 
      words, 
      count: words.length,
      message: 'Word list retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching words:', error);
    res.status(500).json({ 
      error: 'Failed to fetch word list',
      details: error.message 
    });
  }
});

// Get random sample videos for testing
app.get('/api/sample-videos', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    console.log(`Fetching ${limit} sample videos...`);
    
    const [files] = await bucket.getFiles({
      prefix: 'videos/',
      maxResults: limit * 2 // Get more to filter out directories
    });
    
    const videoFiles = files
      .filter(file => file.name.endsWith('.mp4'))
      .slice(0, limit)
      .map(file => ({
        id: file.name.replace('videos/', '').replace('.mp4', ''),
        name: file.name,
        url: `https://storage.googleapis.com/sign-bucket1/${file.name}`
      }));
    
    res.json({ 
      videos: videoFiles,
      count: videoFiles.length
    });
  } catch (error) {
    console.error('Error fetching sample videos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sample videos',
      details: error.message 
    });
  }
});

// Get specific video by ID
app.get('/api/video/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const fileName = `videos/${videoId}.mp4`;
    
    console.log(`Fetching video: ${fileName}`);
    
    const file = bucket.file(fileName);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Stream the video file
    res.setHeader('Content-Type', 'video/mp4');
    file.createReadStream().pipe(res);
    
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({ 
      error: 'Failed to stream video',
      details: error.message 
    });
  }
});

// Search videos by partial ID or get random videos
app.get('/api/videos/search', async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    console.log(`Searching videos with query: ${query}, limit: ${limit}`);
    
    const [files] = await bucket.getFiles({
      prefix: 'videos/',
      maxResults: 1000 // Get more files to search through
    });
    
    let videoFiles = files.filter(file => file.name.endsWith('.mp4'));
    
    if (query) {
      videoFiles = videoFiles.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Shuffle and limit results
    const shuffled = videoFiles.sort(() => 0.5 - Math.random());
    const limited = shuffled.slice(0, parseInt(limit));
    
    const results = limited.map(file => ({
      id: file.name.replace('videos/', '').replace('.mp4', ''),
      name: file.name,
      url: `https://storage.googleapis.com/sign-bucket1/${file.name}`
    }));
    
    res.json({ 
      videos: results,
      count: results.length,
      totalFound: videoFiles.length
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({ 
      error: 'Failed to search videos',
      details: error.message 
    });
  }
});

// Upload and analyze sign video (placeholder for ML integration)
app.post('/api/analyze-sign', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }
    
    console.log('Analyzing uploaded video...');
    
    // TODO: Integrate ML model here
    // For now, return mock response
    const mockPredictions = [
      { word: 'hello', confidence: 0.95 },
      { word: 'world', confidence: 0.87 },
      { word: 'sign', confidence: 0.82 }
    ];
    
    res.json({
      success: true,
      predictions: mockPredictions,
      topPrediction: mockPredictions[0],
      subtitle: mockPredictions[0].word,
      message: 'Analysis complete (mock data)'
    });
    
  } catch (error) {
    console.error('Error analyzing video:', error);
    res.status(500).json({ 
      error: 'Failed to analyze video',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    bucket: 'sign-bucket1'
  });
});

// Dataset info endpoint
app.get('/api/dataset-info', async (req, res) => {
  try {
    console.log('Fetching dataset info...');
    
    const [files] = await bucket.getFiles({ prefix: 'videos/' });
    const videoCount = files.filter(file => file.name.endsWith('.mp4')).length;
    
    // Get word list count
    const wordFile = bucket.file('wlasl_class_list.txt');
    const [wordExists] = await wordFile.exists();
    let wordCount = 0;
    
    if (wordExists) {
      const [contents] = await wordFile.download();
      wordCount = contents.toString().split('\n')
        .filter(word => word.trim().length > 0).length;
    }
    
    res.json({
      dataset: 'WLASL Processed',
      totalVideos: videoCount,
      totalWords: wordCount,
      bucketName: 'sign-bucket1',
      status: 'ready'
    });
    
  } catch (error) {
    console.error('Error fetching dataset info:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dataset info',
      details: error.message 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Sign Language API server running on port ${port}`);
  console.log(`📊 Dataset: WLASL in bucket 'sign-bucket1'`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});