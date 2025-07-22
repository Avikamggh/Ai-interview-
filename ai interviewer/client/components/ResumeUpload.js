import React, { useState } from 'react';
import axios from 'axios';

const ResumeUpload = ({ onResumeUploaded, language }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const texts = {
    english: {
      title: 'Upload Your Resume',
      subtitle: 'Upload your resume to get personalized interview questions',
      dragText: 'Drag and drop your resume here, or click to select',
      supportedFormats: 'Supported formats: PDF, DOCX',
      uploadButton: 'Start AI Interview',
      uploading: 'Processing your resume...',
      selectFile: 'Select File'
    },
    hindi: {
      title: 'अपना रिज्यूमे अपलोड करें',
      subtitle: 'व्यक्तिगत इंटरव्यू प्रश्न पाने के लिए अपना रिज्यूमे अपलोड करें',
      dragText: 'अपना रिज्यूमे यहां खींचें और छोड़ें, या चुनने के लिए क्लिक करें',
      supportedFormats: 'समर्थित प्रारूप: PDF, DOCX',
      uploadButton: 'AI इंटरव्यू शुरू करें',
      uploading: 'आपका रिज्यूमे प्रोसेस हो रहा है...',
      selectFile: 'फ़ाइल चुनें'
    }
  };

  const t = texts[language];

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && (selectedFile.type === 'application/pdf' || 
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a PDF or DOCX file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post('/api/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onResumeUploaded(response.data.analysis, response.data.questions);
    } catch (err) {
      setError('Failed to process resume. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="resume-upload">
      <div className="upload-container">
        <h2>{t.title}</h2>
        <p className="subtitle">{t.subtitle}</p>

        <div 
          className={`drop-zone ${file ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
        >
          <input
            type="file"
            id="resume-input"
            accept=".pdf,.docx"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          
          <div className="drop-zone-content">
            {file ? (
              <div className="file-selected">
                <div className="file-icon">📄</div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="drop-zone-empty">
                <div className="upload-icon">⬆️</div>
                <p>{t.dragText}</p>
                <label htmlFor="resume-input" className="select-file-button">
                  {t.selectFile}
                </label>
              </div>
            )}
          </div>
        </div>

        <p className="supported-formats">{t.supportedFormats}</p>

        {error && <div className="error-message">{error}</div>}

        <button 
          onClick={handleUpload}
          disabled={!file || uploading}
          className="upload-button primary-button"
        >
          {uploading ? t.uploading : t.uploadButton}
        </button>

        {uploading && (
          <div className="progress-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;