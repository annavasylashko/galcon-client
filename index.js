const express = require('express');
const app = express();

app.use(
  express.static('public', {
    extensions: ['html', 'htm'],
  })
);

// Define routes
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.get('/auth', (req, res) => {
  res.sendFile('./public/auth.html');
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
