// About.jsx
import React from 'react';

const About = () => {
  const videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Replace with your demo video URL

  const containerStyle = {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '0 1rem',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
  };

  const headerStyle = {
    textAlign: 'center',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '1rem',
    borderRadius: '8px 8px 0 0',
  };

  const paragraphStyle = {
    lineHeight: 1.6,
    fontSize: '1.1rem',
    marginBottom: '2rem',
  };

  const videoWrapperStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
  };

  const iframeStyle = {
    width: '100%',
    maxWidth: '720px',
    height: '405px',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  };

  const footerStyle = {
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#f1f1f1',
    fontSize: '0.9rem',
    color: '#555',
    borderRadius: '0 0 8px 8px',
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1>About This Project</h1>
      </header>

      <main>
        <p style={paragraphStyle}>
          This project is a real-time Sign Language Converter that uses computer vision and AI to detect hand gestures
          and translate them into readable subtitles. It allows users to communicate more easily with deaf or hard-of-hearing
          individuals by converting sign language into fluent text and even translating it into different languages.
        </p>

        <div style={videoWrapperStyle}>
          <iframe
            style={iframeStyle}
            src={videoUrl}
            allowFullScreen
            title="Video Demo"
          ></iframe>
        </div>
      </main>

      <footer style={footerStyle}>
        &copy; 2025 Sign Language Converter Project
      </footer>
    </div>
  );
};

export default About;
