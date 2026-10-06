# De Passagem Operacional MVP

Pacote inicial para GitHub/Render.

## Estrutura

- `backend/`: API FastAPI com fallback Python puro.
- `frontend/`: interface React/Vite conectada à API.

## Backend local

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Abrir: http://127.0.0.1:8000/docs

## Frontend local

```bash
cd frontend
npm install
npm run dev
```

## Render Backend

Crie um Web Service usando a pasta `backend`.

- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Render Frontend

Crie um Static Site usando a pasta `frontend`.

- Build: `npm install && npm run build`
- Publish directory: `dist`
- Environment: `VITE_API_BASE_URL=https://sua-api.onrender.com`

## Política central

- Sem tarifa dinâmica.
- Tarifas arredondadas.
- Corrida compartilhada popular.
- Operação territorial assistida.
- Área escolar com aluno protegido dentro da escola.
- Taxa de retorno protegida apenas com app online.
