const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Multer configuration for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

// Predefined questions based on skills and experience
const questionBank = {
  technical: {
    javascript: [
      "Can you explain what closures are in JavaScript?",
      "What is the difference between let, const, and var?",
      "How do you handle asynchronous operations in JavaScript?",
      "Explain the concept of hoisting in JavaScript.",
      "What are arrow functions and how do they differ from regular functions?"
    ],
    python: [
      "What are decorators in Python and how do you use them?",
      "Explain the difference between lists and tuples in Python.",
      "How do you handle exceptions in Python?",
      "What is the Global Interpreter Lock (GIL) in Python?",
      "Explain list comprehensions in Python with examples."
    ],
    react: [
      "What are React hooks and why are they useful?",
      "Explain the virtual DOM concept in React.",
      "How do you manage state in a React application?",
      "What is the difference between functional and class components?",
      "How do you handle side effects in React?"
    ],
    nodejs: [
      "What is the event loop in Node.js?",
      "How do you handle file operations in Node.js?",
      "Explain middleware in Express.js.",
      "What are streams in Node.js and when would you use them?",
      "How do you handle errors in Node.js applications?"
    ],
    database: [
      "What is the difference between SQL and NoSQL databases?",
      "Explain database normalization and its benefits.",
      "What are database indexes and how do they improve performance?",
      "How would you optimize a slow database query?",
      "Explain ACID properties in database transactions."
    ],
    frontend: [
      "What is responsive web design and how do you implement it?",
      "Explain the box model in CSS.",
      "What are CSS preprocessors and their advantages?",
      "How do you ensure cross-browser compatibility?",
      "What is progressive web app (PWA)?"
    ],
    backend: [
      "What is RESTful API design and its principles?",
      "How do you handle authentication and authorization?",
      "Explain microservices architecture.",
      "What is caching and how do you implement it?",
      "How do you ensure API security?"
    ]
  },
  behavioral: [
    "Tell me about a challenging project you worked on.",
    "How do you handle tight deadlines and pressure?",
    "Describe a time when you had to learn a new technology quickly.",
    "How do you approach problem-solving in your work?",
    "Tell me about a time you disagreed with a team member.",
    "Describe a situation where you had to debug a complex issue.",
    "How do you stay updated with new technologies?",
    "Tell me about a time you received constructive criticism.",
    "Describe your experience working in a team environment.",
    "How do you prioritize tasks when working on multiple projects?"
  ],
  general: [
    "Why are you interested in this type of role?",
    "What are your career goals for the next 5 years?",
    "How do you stay updated with new technologies?",
    "What motivates you in your work?",
    "Tell me about yourself and your background.",
    "What do you consider your greatest professional achievement?",
    "How do you handle work-life balance?",
    "What type of work environment do you prefer?",
    "Why are you looking for a new opportunity?",
    "What are your salary expectations?"
  ]
};

// Hindi translations
const hindiQuestions = {
  technical: {
    javascript: [
      "क्या आप बता सकते हैं कि JavaScript में closures क्या हैं?",
      "let, const, और var के बीच क्या अंतर है?",
      "आप JavaScript में asynchronous operations को कैसे handle करते हैं?",
      "JavaScript में hoisting की concept को समझाएं।",
      "Arrow functions क्या हैं और वे regular functions से कैसे अलग हैं?"
    ],
    python: [
      "Python में decorators क्या हैं और आप उन्हें कैसे उपयोग करते हैं?",
      "Python में lists और tuples के बीच अंतर बताएं।",
      "आप Python में exceptions को कैसे handle करते हैं?",
      "Python में Global Interpreter Lock (GIL) क्या है?",
      "Python में list comprehensions को examples के साथ समझाएं।"
    ],
    react: [
      "React hooks क्या हैं और वे क्यों उपयोगी हैं?",
      "React में virtual DOM की concept को समझाएं।",
      "आप React application में state को कैसे manage करते हैं?",
      "Functional और class components के बीच क्या अंतर है?",
      "आप React में side effects को कैसे handle करते हैं?"
    ],
    nodejs: [
      "Node.js में event loop क्या है?",
      "आप Node.js में file operations को कैसे handle करते हैं?",
      "Express.js में middleware को समझाएं।",
      "Node.js में streams क्या हैं और आप उन्हें कब उपयोग करेंगे?",
      "आप Node.js applications में errors को कैसे handle करते हैं?"
    ],
    database: [
      "SQL और NoSQL databases के बीच क्या अंतर है?",
      "Database normalization और इसके benefits को समझाएं।",
      "Database indexes क्या हैं और वे performance को कैसे improve करते हैं?",
      "आप एक slow database query को कैसे optimize करेंगे?",
      "Database transactions में ACID properties को समझाएं।"
    ],
    frontend: [
      "Responsive web design क्या है और आप इसे कैसे implement करते हैं?",
      "CSS में box model को समझाएं।",
      "CSS preprocessors क्या हैं और उनके advantages क्या हैं?",
      "आप cross-browser compatibility कैसे ensure करते हैं?",
      "Progressive web app (PWA) क्या है?"
    ],
    backend: [
      "RESTful API design और इसके principles क्या हैं?",
      "आप authentication और authorization को कैसे handle करते हैं?",
      "Microservices architecture को समझाएं।",
      "Caching क्या है और आप इसे कैसे implement करते हैं?",
      "आप API security कैसे ensure करते हैं?"
    ]
  },
  behavioral: [
    "मुझे एक challenging project के बारे में बताएं जिस पर आपने काम किया था।",
    "आप tight deadlines और pressure को कैसे handle करते हैं?",
    "एक समय के बारे में बताएं जब आपको जल्दी कोई नई technology सीखनी पड़ी।",
    "आप अपने काम में problem-solving को कैसे approach करते हैं?",
    "किसी समय के बारे में बताएं जब आप team member से disagree हुए थे।",
    "एक situation के बारे में बताएं जब आपको कोई complex issue debug करना पड़ा।",
    "आप नई technologies के साथ कैसे updated रहते हैं?",
    "किसी समय के बारे में बताएं जब आपको constructive criticism मिली।",
    "Team environment में काम करने के अपने experience के बारे में बताएं।",
    "जब आप multiple projects पर काम कर रहे हों तो tasks को कैसे prioritize करते हैं?"
  ],
  general: [
    "आप इस प्रकार के role में क्यों interested हैं?",
    "अगले 5 सालों के लिए आपके career goals क्या हैं?",
    "आप नई technologies के साथ कैसे updated रहते हैं?",
    "आपके काम में आपको क्या motivate करता है?",
    "अपने बारे में और अपने background के बारे में बताएं।",
    "आप अपनी सबसे बड़ी professional achievement क्या मानते हैं?",
    "आप work-life balance को कैसे handle करते हैं?",
    "आप किस प्रकार के work environment को prefer करते हैं?",
    "आप नई opportunity क्यों ढूंढ रहे हैं?",
    "आपकी salary expectations क्या हैं?"
  ]
};

// Extract text from PDF
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract text from DOCX
async function extractTextFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to extract text from DOCX');
  }
}

// Analyze resume and extract skills
function analyzeResume(resumeText) {
  const text = resumeText.toLowerCase();
  
  const skills = {
    javascript: /javascript|js|node\.?js|react|angular|vue|jquery/i.test(text),
    python: /python|django|flask|pandas|numpy|fastapi/i.test(text),
    react: /react|jsx|redux|next\.?js/i.test(text),
    nodejs: /node\.?js|express|npm|backend/i.test(text),
    database: /sql|mysql|postgresql|mongodb|database|redis/i.test(text),
    frontend: /html|css|frontend|ui|ux|bootstrap|tailwind/i.test(text),
    backend: /backend|api|server|microservices|rest/i.test(text)
  };

  const experience = {
    years: extractYearsOfExperience(text),
    level: getExperienceLevel(text)
  };

  return { skills, experience, fullText: resumeText };
}

function extractYearsOfExperience(text) {
  const matches = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i);
  return matches ? parseInt(matches[1]) : 0;
}

function getExperienceLevel(text) {
  if (/senior|lead|principal|architect|manager/i.test(text)) return 'senior';
  if (/mid|intermediate|experienced/i.test(text)) return 'mid';
  return 'junior';
}

// Generate interview questions based on resume analysis
function generateInterviewQuestions(analysis, language = 'english') {
  const questions = [];
  const questionSet = language === 'hindi' ? hindiQuestions : questionBank;
  
  // Add general questions first
  questions.push(...questionSet.general.slice(0, 2));
  
  // Add technical questions based on detected skills
  Object.keys(analysis.skills).forEach(skill => {
    if (analysis.skills[skill] && questionSet.technical[skill]) {
      questions.push(...questionSet.technical[skill].slice(0, 2));
    }
  });
  
  // Add behavioral questions
  questions.push(...questionSet.behavioral.slice(0, 3));
  
  // If we don't have enough questions, add more general ones
  while (questions.length < 8) {
    const remaining = questionSet.general.slice(2);
    questions.push(...remaining.slice(0, 8 - questions.length));
  }
  
  return questions.slice(0, 8); // Limit to 8 questions
}

// Routes
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = fs.readFileSync(req.file.path);
    let resumeText;

    if (req.file.mimetype === 'application/pdf') {
      resumeText = await extractTextFromPDF(buffer);
    } else {
      resumeText = await extractTextFromDOCX(buffer);
    }

    const analysis = analyzeResume(resumeText);
    const englishQuestions = generateInterviewQuestions(analysis, 'english');
    const hindiQuestions = generateInterviewQuestions(analysis, 'hindi');

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      analysis,
      questions: {
        english: englishQuestions,
        hindi: hindiQuestions
      }
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Socket.io for real-time interview
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('start-interview', (data) => {
    console.log('Interview started for:', socket.id);
    socket.emit('interview-started', { 
      message: 'Interview session initialized',
      sessionId: socket.id 
    });
  });

  socket.on('user-response', (data) => {
    console.log('User response received:', data.questionIndex);
    
    // Process user response and generate feedback
    const responses = [
      'Thank you for your answer.',
      'That\'s a good point.',
      'Interesting perspective.',
      'I understand your approach.',
      'Thank you for sharing that.'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const response = {
      feedback: randomResponse,
      nextQuestion: data.nextQuestion || null,
      questionIndex: data.questionIndex
    };
    
    socket.emit('ai-response', response);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve React app for any other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client/build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend not built. Please run: cd client && npm run build' 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
  console.log(`📁 Make sure to build the client first: cd client && npm run build`);
});