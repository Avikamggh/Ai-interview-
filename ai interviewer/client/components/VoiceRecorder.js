import React, { useState, useRef, useEffect } from 'react';

const VoiceRecorder = ({ onResponse, isRecording, setIsRecording, language, disabled }) => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);

  const texts = {
    english: {
      startRecording: 'Click to Record Answer',
      recording: 'Recording... Click to Stop',
      processing: 'Processing...',
      playback: 'Play Recording',
      submit: 'Submit Answer',
      typeAnswer: 'Or type your answer here...',
      submitTyped: 'Submit Typed Answer'
    },
    hindi: {
      startRecording: 'उत्तर रिकॉर्ड करने के लिए क्लिक करें',
      recording: 'रिकॉर्डिंग... रोकने के लिए क्लिक करें',
      processing: 'प्रोसेसिंग...',
      playback: 'रिकॉर्डिंग चलाएं',
      submit: 'उत्तर सबमिट करें',
      typeAnswer: 'या यहां अपना उत्तर टाइप करें...',
      submitTyped: 'टाइप किया गया उत्तर सबमिट करें'
    }
  };

  const t = texts[language];
  const [typedAnswer, setTypedAnswer] = useState('');

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'hindi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, [language]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const handleRecordingToggle = () => {
    if (disabled) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    }
  };

  const submitResponse = () => {
    if (audioBlob || transcript || typedAnswer) {
      setIsProcessing(true);
      onResponse(audioBlob, transcript || typedAnswer);
      
      // Reset state
      setTimeout(() => {
        setAudioBlob(null);
        setTranscript('');
        setTypedAnswer('');
        setIsProcessing(false);
      }, 1000);
    }
  };

  const submitTypedAnswer = () => {
    if (typedAnswer.trim()) {
      setIsProcessing(true);
      onResponse(null, typedAnswer);
      
      setTimeout(() => {
        setTypedAnswer('');
        setIsProcessing(false);
      }, 1000);
    }
  };

  return (
    <div className="voice-recorder">
      <div className="recording-section">
        <button
          onClick={handleRecordingToggle}
          disabled={disabled || isProcessing}
          className={`record-button ${isRecording ? 'recording' : ''} ${disabled ? 'disabled' : ''}`}
        >
          <div className="record-icon">
            {isRecording ? '⏹️' : '🎤'}
          </div>
          <span>
            {isProcessing ? t.processing : 
             isRecording ? t.recording : t.startRecording}
          </span>
        </button>

        {isRecording && (
          <div className="recording-indicator">
            <div className="pulse"></div>
            <span>Recording...</span>
          </div>
        )}
      </div>

      {transcript && (
        <div className="transcript-section">
          <h4>Transcribed Answer:</h4>
          <p className="transcript-text">{transcript}</p>
        </div>
      )}

      {audioBlob && (
        <div className="playback-section">
          <button onClick={playRecording} className="playback-button">
            🔊 {t.playback}
          </button>
          <button onClick={submitResponse} className="submit-button primary-button">
            {t.submit}
          </button>
        </div>
      )}

      <div className="typed-answer-section">
        <textarea
          value={typedAnswer}
          onChange={(e) => setTypedAnswer(e.target.value)}
          placeholder={t.typeAnswer}
          disabled={disabled || isProcessing}
          rows="4"
          className="answer-textarea"
        />
        {typedAnswer.trim() && (
          <button 
            onClick={submitTypedAnswer} 
            className="submit-typed-button primary-button"
            disabled={isProcessing}
          >
            {t.submitTyped}
          </button>
        )}
      </div>

      {isProcessing && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <span>{t.processing}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;