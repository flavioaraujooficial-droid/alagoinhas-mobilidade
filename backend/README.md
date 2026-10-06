# De Passagem API MVP

## Local

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Abra: http://127.0.0.1:8000/docs

## Teste sem dependências

```bash
python main.py
```

## Render

Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Endpoints principais:

- `/health`
- `/tests/rules`
- `/pricing/city-ride`
- `/pricing/return-fee`
- `/rides/create`
- `/rides/{ride_id}/match`
- `/demo/seed-driver`
- `/demo/foz`
