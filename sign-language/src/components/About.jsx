import React from 'react';

const About = () => {
  const videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";

  return (
    <div className="about-container">
      <header className="about-header">
        <h2>About: Sign Language to Subtitle Converter</h2>
        <p>Real-time sign language to multilingual translation</p>
      </header>

      <div className="about-section">
        <p className="about-paragraph">
          Our project addresses the critical communication barrier faced by the hearing impaired community. 
          Using computer vision and SEA-LION AI technology, we're developing a real-time system that 
          converts sign language into fluent, multilingual subtitles - making everyday communication more accessible.
        </p>

        <div className="feature-list">
          <div className="feature-item">
            <h3>Current Capabilities</h3>
            <ul>
              <li>Real-time alphabet (with accuracy %) and basic word recognition</li>
              <li>Proof-of-concept demonstration available</li>
              <li>Webcam compatible interface</li>
            </ul>
          </div>
          
          <div className="feature-item">
            <h3>Technology Plan On Using</h3>
            <ul>
              <li>Pre-trained sign language datasets (Hugging Face, Kaggle, or other)</li>
              <li>Computer vision processing</li>
              <li>SEA-LION AI for language processing</li>
            </ul>
          </div>
          
          <div className="feature-item">
            <h3>Future Roadmap</h3>
            <ul>
              <li>Expanded vocabulary recognition</li>
              <li>Multilingual translation (English, Khmer, etc.)</li>
              <li>Context-aware sentence generation</li>
            </ul>
          </div>
        </div>

        <div className="video-wrapper">
          <iframe
            className="video-iframe"
            src={videoUrl}
            allowFullScreen
            title="Sign Language Translation Demo"
          ></iframe>
        </div>

        <p>GitHub Link: <a href='https://github.com/CheaRitheavatey/signlanguage-to-subtitle-converter'>Here</a></p>

        <p className="about-paragraph italic-text">
          We hope to expand this project to demonstrates the solutions that
          could potentially be compatible with applications in education, customer service, and daily communication.
        </p>
      </div>
    </div>
  );
};

export default About;