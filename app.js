const listEl = document.getElementById('list');
const addForm = document.getElementById('addForm');
const addInput = document.getElementById('addInput');
const emptyState = document.getElementById('emptyState');
const countLabel = document.getElementById('countLabel');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const dateLabel = document.getElementById('dateLabel');

dateLabel.textContent = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const CHECK_SVG = `
<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
  <rect class="chk-box" x="2.5" y="2.5" width="21" height="21" rx="4" />
  <path class="chk-mark" d="M7 13.5 L11.5 18 L19 8.5" />
</svg>`;

async function api(path, options) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function render(todos) {
  listEl.innerHTML = '';
  const remaining = todos.filter((t) => !t.done).length;

  countLabel.textContent = `${remaining} left`;
  emptyState.classList.toggle('visible', todos.length === 0);

  for (const todo of todos) {
    listEl.appendChild(buildItem(todo));
  }
}

function buildItem(todo) {
  const li = document.createElement('li');
  li.className = `item${todo.done ? ' done' : ''}`;
  li.dataset.id = todo.id;

  const checkBtn = document.createElement('button');
  checkBtn.className = 'checkbox-btn';
  checkBtn.type = 'button';
  checkBtn.setAttribute('aria-label', todo.done ? 'Mark as not done' : 'Mark as done');
  checkBtn.innerHTML = CHECK_SVG;
  checkBtn.addEventListener('click', () => toggleTodo(todo));

  const text = document.createElement('div');
  text.className = 'item-text';
  text.contentEditable = 'true';
  text.spellcheck = false;
  text.textContent = todo.text;
  text.addEventListener('blur', () => {
    const value = text.textContent.trim();
    if (!value) {
      text.textContent = todo.text;
      return;
    }
    if (value !== todo.text) editTodo(todo, value);
  });
  text.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      text.blur();
    }
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.type = 'button';
  delBtn.setAttribute('aria-label', 'Delete task');
  delBtn.textContent = '✕';
  delBtn.addEventListener('click', () => deleteTodo(todo, li));

  li.append(checkBtn, text, delBtn);
  return li;
}

async function loadTodos() {
  try {
    const todos = await api('/api/todos');
    render(todos);
  } catch (err) {
    console.error(err);
  }
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = addInput.value.trim();
  if (!text) return;
  addInput.value = '';
  try {
    await api('/api/todos', { method: 'POST', body: JSON.stringify({ text }) });
    await loadTodos();
  } catch (err) {
    console.error(err);
  }
});

async function toggleTodo(todo) {
  try {
    await api(`/api/todos/${todo.id}`, {
      method: 'PUT',
      body: JSON.stringify({ done: !todo.done }),
    });
    await loadTodos();
  } catch (err) {
    console.error(err);
  }
}

async function editTodo(todo, text) {
  try {
    await api(`/api/todos/${todo.id}`, { method: 'PUT', body: JSON.stringify({ text }) });
    await loadTodos();
  } catch (err) {
    console.error(err);
  }
}

async function deleteTodo(todo, li) {
  li.classList.add('removing');
  try {
    await api(`/api/todos/${todo.id}`, { method: 'DELETE' });
    setTimeout(loadTodos, 160);
  } catch (err) {
    console.error(err);
    await loadTodos();
  }
}

clearDoneBtn.addEventListener('click', async () => {
  try {
    await api('/api/todos', { method: 'DELETE' });
    await loadTodos();
  } catch (err) {
    console.error(err);
  }
});

loadTodos();
