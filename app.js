const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const app = express();
const port = process.env.PORT || 3000;
const chatEmitter = new EventEmitter();

// ✅ Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Responds with plain text
 */
function respondText(req, res) {
  res.type('text/plain').send('hi');
}

/**
 * Responds with JSON
 */
function respondJson(req, res) {
  res.json({ text: 'hi', numbers: [1, 2, 3] });
}

/**
 * Responds with the input string in various formats
 */
function respondEcho(req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

/**
 * Serves up the chat.html file
 */
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
}

/**
 * Handles incoming chat messages
 */
function respondChat(req, res) {
  const { message } = req.query;
  if (message) {
    chatEmitter.emit('message', message);
  }
  res.end();
}

/**
 * Handles Server-Sent Events (SSE) for real-time chat updates
 */
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = (message) => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// ✅ Route Handlers
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// ✅ Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});