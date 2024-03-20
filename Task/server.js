// Backend: server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_mysql_username',
  password: 'your_mysql_password',
  database: 'code_snippets_db'
});

db.connect((err) => {
  if (err) {
    console.log('MySQL connection error: ' + err.message);
    throw err;
  }
  console.log('Connected to MySQL database');
});

// Create table if not exists
const createTableQuery = `CREATE TABLE IF NOT EXISTS code_snippets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  code_language VARCHAR(50) NOT NULL,
  stdin TEXT NOT NULL,
  source_code TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

db.query(createTableQuery, (err, result) => {
  if (err) throw err;
  console.log('Code snippets table created or already exists');
});

// Route to handle form submission
app.post('/submit', (req, res) => {
  const { username, code_language, stdin, source_code } = req.body;
  const insertQuery = `INSERT INTO code_snippets (username, code_language, stdin, source_code) VALUES (?, ?, ?, ?)`;
  db.query(insertQuery, [username, code_language, stdin, source_code], (err, result) => {
    if (err) {
      console.log('Error inserting code snippet: ' + err.message);
      res.status(500).send('Error submitting code snippet');
    } else {
      res.status(200).send('Code snippet submitted successfully');
    }
  });
});

// Route to fetch all code snippets
app.get('/code-snippets', (req, res) => {
  const selectQuery = `SELECT username, code_language, stdin, LEFT(source_code, 100) AS source_code_preview, timestamp FROM code_snippets`;
  db.query(selectQuery, (err, result) => {
    if (err) {
      console.log('Error fetching code snippets: ' + err.message);
      res.status(500).send('Error fetching code snippets');
    } else {
      res.status(200).json(result);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
