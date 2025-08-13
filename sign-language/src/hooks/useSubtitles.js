import { useState, useCallback, useRef } from 'react';

export const useSubtitles = (settings) => {
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const lastSignRef = useRef('');
  const timeoutRef = useRef(null);

  const processSignsToText = useCallback((signs, translateSign) => {
    if (signs.length === 0) return;
    
    const latestSign = signs[signs.length - 1];
    const translatedSign = translateSign(latestSign.sign);
    
    // Prevent duplicate consecutive signs
    if (translatedSign === lastSignRef.current) return;
    lastSignRef.current = translatedSign;
    
    // Update current subtitle
    setCurrentSubtitle(prev => {
      const newText = prev ? `${prev} ${translatedSign}` : translatedSign;
      return newText;
    });
    
    // Clear timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set timeout to finalize subtitle
    timeoutRef.current = setTimeout(() => {
      setCurrentSubtitle(current => {
        if (current) {
          const newSubtitle = {
            id: Date.now().toString(),
            text: current,
            startTime: Date.now() - 3000,
            endTime: Date.now(),
            confidence: latestSign.confidence,
          };
          
          setSubtitles(prev => [...prev.slice(-19), newSubtitle]);
          return '';
        }
        return current;
      });
    }, 3000);
  }, []);

  const exportSRT = useCallback(() => {
    const srtContent = subtitles.map((subtitle, index) => {
      const startTime = formatSRTTime(subtitle.startTime);
      const endTime = formatSRTTime(subtitle.endTime);
      
      return `${index + 1}\n${startTime} --> ${endTime}\n${subtitle.text}\n`;
    }).join('\n');
    
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitles_${new Date().toISOString().split('T')[0]}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [subtitles]);

  const clearSubtitles = useCallback(() => {
    setSubtitles([]);
    setCurrentSubtitle('');
    lastSignRef.current = '';
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    subtitles,
    currentSubtitle,
    processSignsToText,
    exportSRT,
    clearSubtitles,
  };
};

function formatSRTTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
  
  return `${hours}:${minutes}:${seconds},${milliseconds}`;
}