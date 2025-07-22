import React, { useState, useEffect } from 'react';
import ResumeUpload from './components/ResumeUpload';
import InterviewRoom from './components/InterviewRoom';
import './App.css';

function App() {
  const [step, setStep] = useState('upload'); // 'upload', 'interview', 'complete'
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [language, setLanguage] = useState('english');

  const handleResumeUploaded = (analysis, questionSet) => {
    setResumeAnalysis(analysis);
    setQuestions(questionSet);
    setStep('interview');
  };

  const handleInterviewComplete = () => {
    setStep('complete');
  };

  const resetInterview = () => {
    setStep('upload');
    setResumeAnalysis(null);
    setQuestions(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Interview Platform</h1>
        <div className="language-selector">
          <button 
            onClick={() => setLanguage('english')} 
            className={language === 'english' ? 'active' : ''}
          >
            English
          </button>
          <button 
            onClick={() => setLanguage('hindi')} 
            className={language === 'hindi' ? 'active' : ''}
          >
            हिंदी
          </button>
        </div>
      </header>

      <main className="App-main">
        {step === 'upload' && (
          <ResumeUpload 
            onResumeUploaded={handleResumeUploaded}
            language={language}
          />
        )}

        {step === 'interview' && (
          <InterviewRoom
            questions={questions[language]}
            resumeAnalysis={resumeAnalysis}
            language={language}
            onComplete={handleInterviewComplete}
          />
        )}

        {step === 'complete' && (
          <div className="completion-screen">
            <h2>
              {language === 'english' 
                ? 'Interview Completed!' 
                : 'इंटरव्यू पूरा हुआ!'
              }
            </h2>
            <p>
              {language === 'english'
                ? 'Thank you for participating in the AI interview. Your responses have been recorded.'
                : 'AI इंटरव्यू में भाग लेने के लिए धन्यवाद। आपके उत्तर रिकॉर्ड किए गए हैं।'
              }
            </p>
            <button onClick={resetInterview} className="primary-button">
              {language === 'english' ? 'Start New Interview' : 'नया इंटरव्यू शुरू करें'}
            </button>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>
          {language === 'english' 
            ? 'Free AI Interview Platform - Practice and Improve Your Interview Skills'
            : 'मुफ्त AI इंटरव्यू प्लेटफॉर्म - अपने इंटरव्यू कौशल का अभ्यास करें और सुधारें'
          }
        </p>
      </footer>
    </div>
  );
}

export default App;