import React, { useState, useEffect, useRef } from 'react';
import AIAvatar from './AIAvatar';
import VoiceRecorder from './VoiceRecorder';
import io from 'socket.io-client';

const InterviewRoom = ({ questions, resumeAnalysis, language, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [responses, setResponses] = useState([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const socketRef = useRef(null);

  const texts = {
    english: {
      welcome: "Welcome to your AI interview! I'll be asking you questions based on your resume.",
      questionProgress: "Question {current} of {total}",
      startInterview: "Start Interview",
      nextQuestion: "Next Question",
      finishInterview: "Finish Interview",
      speaking: "AI is speaking...",
      listening: "Click to record your answer",
      recording: "Recording... Click to stop",
      processingAnswer: "Processing your answer..."
    },
    hindi: {
      welcome: "आपके AI इंटरव्यू में आपका स्वागत है! मैं आपके रिज्यूमे के आधार पर आपसे सवाल पूछूंगा।",
      questionProgress: "प्रश्न {current} में से {total}",
      startInterview: "इंटरव्यू शुरू करें",
      nextQuestion: "अगला प्रश्न",
      finishInterview: "इंटरव्यू समाप्त करें",
      speaking: "AI बोल रहा है...",
      listening: "अपना उत्तर रिकॉर्ड करने के लिए क्लिक करें",
      recording: "रिकॉर्डिंग... रोकने के लिए क्लिक करें",
      processingAnswer: "आपका उत्तर प्रोसेस हो रहा है..."
    }
  };

  const t = texts[language];

  useEffect(() => {
    socketRef.current = io();
    
    socketRef.current.on('interview-started', (data) => {
      console.log('Interview session started');
    });

    socketRef.current.on('ai-response', (data) => {
      console.log('AI response:', data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      setIsAISpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsAISpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    speakText(t.welcome);
    setTimeout(() => {
      speakText(questions[0]);
    }, 3000);
    
    socketRef.current.emit('start-interview', {
      resumeAnalysis,
      language
    });
  };

  const handleResponse = (audioBlob, transcript) => {
    const newResponse = {
      question: questions[currentQuestionIndex],
      answer: transcript || "Audio response recorded",
      audio: audioBlob,
      timestamp: new Date().toISOString()
    };
    
    setResponses([...responses, newResponse]);
    
    socketRef.current.emit('user-response', {
      questionIndex: currentQuestionIndex,
      answer: transcript,
      nextQuestion: questions[currentQuestionIndex + 1] || null
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeout(() => {
        speakText(questions[nextIndex]);
      }, 500);
    } else {
      finishInterview();
    }
  };

  const finishInterview = () => {
    speakText(language === 'english' 
      ? "Thank you for completing the interview. Good luck!" 
      : "इंटरव्यू पूरा करने के लिए धन्यवाद। शुभकामनाएं!"
    );
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  if (!interviewStarted) {
    return (
      <div className="interview-room">
        <div className="interview-setup">
          <AIAvatar isActive={false} />
          <div className="setup-content">
            <h2>{t.welcome}</h2>
            <div className="resume-summary">
              <h3>
                {language === 'english' ? 'Resume Analysis:' : 'रिज्यूमे विश्लेषण:'}
              </h3>
              <div className="skills-detected">
                <strong>
                  {language === 'english' ? 'Skills Detected:' : 'कौशल मिले:'}
                </strong>
                <ul>
                  {Object.entries(resumeAnalysis.skills)
                    .filter(([skill, detected]) => detected)
                    .map(([skill]) => (
                      <li key={skill}>{skill.charAt(0).toUpperCase() + skill.slice(1)}</li>
                    ))}
                </ul>
              </div>
            </div>
            <p>
              {t.questionProgress
                .replace('{current}', '1')
                .replace('{total}', questions.length)}
            </p>
            <button onClick={startInterview} className="primary-button">
              {t.startInterview}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-room">
      <div className="interview-header">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <p className="question-counter">
          {t.questionProgress
            .replace('{current}', currentQuestionIndex + 1)
            .replace('{total}', questions.length)}
        </p>
      </div>

      <div className="interview-content">
        <AIAvatar isActive={isAISpeaking} />
        
        <div className="question-section">
          <div className="current-question">
            <h3>{questions[currentQuestionIndex]}</h3>
          </div>
          
          {isAISpeaking && (
            <div className="ai-status">
              <div className="speaking-indicator"></div>
              <p>{t.speaking}</p>
            </div>
          )}
        </div>

        <div className="response-section">
          <VoiceRecorder
            onResponse={handleResponse}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            language={language}
            disabled={isAISpeaking}
          />
          
          <div className="interview-controls">
            <button 
              onClick={nextQuestion}
              disabled={isAISpeaking}
              className="secondary-button"
            >
              {currentQuestionIndex === questions.length - 1 ? t.finishInterview : t.nextQuestion}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;