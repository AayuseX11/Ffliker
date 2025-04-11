// Free Fire Liker API
// This is a demonstration API for educational purposes

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage for demonstration (in production, use a database)
const users = {};
const transactions = {};

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Free Fire Liker API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #ff5722;
          }
          code {
            background: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
          }
          .endpoint {
            margin-bottom: 20px;
            padding: 15px;
            border-left: 4px solid #ff5722;
            background: #fff9f7;
          }
        </style>
      </head>
      <body>
        <h1>Free Fire Liker API</h1>
        <p>Welcome to the Free Fire Liker API. This API allows you to send likes to Free Fire accounts.</p>
        
        <h2>Available Endpoints:</h2>
        <div class="endpoint">
          <h3>Send Likes (URL Parameters)</h3>
          <p><code>GET /uid=YOURUID&amount=100</code></p>
          <p>Example: <code>/uid=123456789&amount=100</code></p>
        </div>
        
        <div class="endpoint">
          <h3>Send Likes (POST)</h3>
          <p><code>POST /api/send-likes</code></p>
          <p>Request body:</p>
          <pre><code>{
  "uid": "123456789",
  "amount": 100
}</code></pre>
        </div>
        
        <div class="endpoint">
          <h3>Check Status</h3>
          <p><code>GET /api/status/:transactionId</code></p>
        </div>
        
        <div class="endpoint">
          <h3>User Stats</h3>
          <p><code>GET /api/user/:uid</code></p>
        </div>
      </body>
    </html>
  `);
});

// Send likes endpoint
app.post('/api/send-likes', (req, res) => {
  const { uid, amount } = req.body;
  
  // Validation
  if (!uid || !amount) {
    return res.status(400).json({
      status: 'error',
      message: 'UID and amount are required'
    });
  }
  
  if (uid.length < 5 || uid.length > 20) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid UID format'
    });
  }
  
  if (amount < 1 || amount > 1000) {
    return res.status(400).json({
      status: 'error',
      message: 'Amount must be between 1 and 1000'
    });
  }
  
  // Create a new transaction
  const transactionId = uuidv4();
  const transaction = {
    id: transactionId,
    uid,
    amount,
    status: 'processing',
    created: new Date(),
    completed: null
  };
  
  transactions[transactionId] = transaction;
  
  // Update user likes (create user if doesn't exist)
  if (!users[uid]) {
    users[uid] = {
      uid,
      totalLikes: 0,
      transactions: []
    };
  }
  
  users[uid].transactions.push(transactionId);
  
  // Simulate processing time (will be completed when status is checked)
  setTimeout(() => {
    transaction.status = 'completed';
    transaction.completed = new Date();
    users[uid].totalLikes += amount;
  }, 5000);
  
  res.status(200).json({
    status: 'success',
    message: 'Likes are being processed',
    data: {
      transactionId,
      uid,
      amount
    }
  });
});

// Check status endpoint
app.get('/api/status/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  
  if (!transactions[transactionId]) {
    return res.status(404).json({
      status: 'error',
      message: 'Transaction not found'
    });
  }
  
  const transaction = transactions[transactionId];
  
  res.status(200).json({
    status: 'success',
    data: transaction
  });
});

// User stats endpoint
app.get('/api/user/:uid', (req, res) => {
  const { uid } = req.params;
  
  if (!users[uid]) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
  
  const user = users[uid];
  
  res.status(200).json({
    status: 'success',
    data: {
      uid: user.uid,
      totalLikes: user.totalLikes,
      transactionCount: user.transactions.length
    }
  });
});

// Direct URL endpoint for sending likes (format: /uid=123456789&amount=100)
app.get(/^\/uid=([^&]+)&amount=(\d+)$/, (req, res) => {
  const uid = req.params[0];
  const amount = parseInt(req.params[1]);
  
  // Validation
  if (!uid) {
    return res.status(400).json({
      status: 'error',
      message: 'UID is required'
    });
  }
  
  if (uid.length < 5 || uid.length > 20) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid UID format'
    });
  }
  
  if (isNaN(amount) || amount < 1 || amount > 1000) {
    return res.status(400).json({
      status: 'error',
      message: 'Amount must be between 1 and 1000'
    });
  }
  
  // Create a new transaction
  const transactionId = uuidv4();
  const transaction = {
    id: transactionId,
    uid,
    amount,
    status: 'processing',
    created: new Date(),
    completed: null
  };
  
  transactions[transactionId] = transaction;
  
  // Update user likes (create user if doesn't exist)
  if (!users[uid]) {
    users[uid] = {
      uid,
      totalLikes: 0,
      transactions: []
    };
  }
  
  users[uid].transactions.push(transactionId);
  
  // Simulate processing time (will be completed when status is checked)
  setTimeout(() => {
    transaction.status = 'completed';
    transaction.completed = new Date();
    users[uid].totalLikes += amount;
  }, 5000);
  
  res.status(200).json({
    status: 'success',
    message: 'Likes are being processed',
    data: {
      transactionId,
      uid,
      amount
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
