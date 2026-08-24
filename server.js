const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'todos.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- storage helpers -------------------------------------------------

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function readTodos() {
  ensureStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed to read todos, resetting store:', err);
    return [];
  }
}

function writeTodos(todos) {
  ensureStore();
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(todos, null, 2), 'utf8');
  fs.renameSync(tmpFile, DATA_FILE);
}

// --- API ---------------------------------------------------------------

app.get('/api/todos', (req, res) => {
  res.json(readTodos());
});

app.post('/api/todos', (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'text is required' });

  const todos = readTodos();
  const todo = {
    id: crypto.randomUUID(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
  };
  todos.unshift(todo);
  writeTodos(todos);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const todos = readTodos();
  const idx = todos.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });

  if (typeof req.body.done === 'boolean') todos[idx].done = req.body.done;
  if (typeof req.body.text === 'string' && req.body.text.trim()) {
    todos[idx].text = req.body.text.trim();
  }
  writeTodos(todos);
  res.json(todos[idx]);
});

app.delete('/api/todos/:id', (req, res) => {
  const todos = readTodos();
  const next = todos.filter((t) => t.id !== req.params.id);
  if (next.length === todos.length) return res.status(404).json({ error: 'not found' });
  writeTodos(next);
  res.status(204).end();
});

app.delete('/api/todos', (req, res) => {
  // clear completed only, unless ?all=true
  const clearAll = req.query.all === 'true';
  const todos = readTodos();
  const next = clearAll ? [] : todos.filter((t) => !t.done);
  writeTodos(next);
  res.json(next);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  ensureStore();
  console.log(`Chalkboard To-Do listening on port ${PORT}`);
});
