const express = require('express');
const fs = require('fs');
var cors = require('cors');

const app = express();

let serverUrl = 'http://localhost:8000';

if (process.env.SERVER_URL) {
  serverUrl = process.env.SERVER_URL;
}

app.use(cors());

// Middleware to modify JavaScript files
app.use((req, res, next) => {
  const filePath = __dirname + req.url;

  // Check if the requested file is a JavaScript file
  if (filePath.endsWith('.js')) {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        // Handle file read error
        console.error(err);
        return res.status(500).end();
      }

      // Modify the JavaScript file
      const modifiedData = data.replace(
        'const serverUrl = null;',
        `const serverUrl = '${serverUrl}';`
      );

      // Set the content type to JavaScript
      res.setHeader('Content-Type', 'application/javascript');

      // Send the modified JavaScript file
      res.send(modifiedData);
    });
  } else {
    // For other file types, proceed as usual
    next();
  }
});

app.use(express.static('public'));

// Define routes
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.get('/auth', (req, res) => {
  res.sendFile('auth.html');
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
