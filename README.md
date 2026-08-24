# Chalkboard To-Do

A small, self-hosted to-do list. Node/Express backend, vanilla JS/CSS frontend,
data persisted to a JSON file on disk (no external database needed).

## Run with Docker Compose (recommended)

```bash
docker compose up --build
```

Then open http://localhost:3000

Data is stored in a named Docker volume (`todo-data`), so it survives
container restarts and rebuilds.

## Run with plain Docker

```bash
docker build -t chalkboard-todo .
docker run -p 3000:3000 -v todo-data:/app/data chalkboard-todo
```

## Run without Docker

```bash
npm install
npm start
```

Open http://localhost:3000. Data is written to `./data/todos.json`.

## API

| Method | Path              | Body                | Description                     |
|--------|-------------------|----------------------|----------------------------------|
| GET    | /api/todos        | –                    | List all todos                  |
| POST   | /api/todos        | `{ text }`           | Create a todo                   |
| PUT    | /api/todos/:id    | `{ done?, text? }`   | Update a todo                   |
| DELETE | /api/todos/:id    | –                    | Delete a todo                   |
| DELETE | /api/todos        | –                    | Clear completed (add `?all=true` to clear everything) |
| GET    | /api/health       | –                    | Health check                    |

## Config

Environment variables (set via `docker-compose.yml` or `docker run -e`):

- `PORT` — server port (default `3000`)
- `DATA_DIR` — where `todos.json` is stored (default `./data`, or `/app/data` in the container)
