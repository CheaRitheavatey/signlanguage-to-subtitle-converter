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
    backgroundColor: 'black',
    color: 'white',
    padding: '0.1rem',
    borderRadius: '12px 12px 0 0',
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
          <b>Problem</b>: Many hearing impaired people is having a hard time communicating with other people. <br />
          <b>Goal</b>: This is why this will convert from sign language to subtitles. <br />
          <b>Current</b>: Video demo is provided below, the camera can be test. right now it is only able to detect a few word and alphabet as a proof of concept<br />
         <b>Future plan</b>: <br />
            1. use pre-train dataset for common word use in sign language <br />
            2. incorporate SEA-LION ai to make the subtitle fluent and understandable <br />
            3. incorporate SEA-LION ai to make the subtitle not only availble in English but khmer and more.
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

      {/* <footer style={footerStyle}>
        &copy; 2025 Sign Language Converter Project
      </footer> */}
    </div>
  );
};

export default About;
