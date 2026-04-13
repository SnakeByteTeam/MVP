# MVP

Guida rapida per scaricare e avviare l'applicativo in locale.

## Requisiti
1. `node.js` 24.x
2. `npm` 11.x
3. `Docker` con `Docker Compose`

Verifica:

```bash
node --version
npm --version
docker --version
docker compose version
```

## Avvio rapido

### 1) Clona il repository

```bash
git clone https://github.com/SnakeByteTeam/MVP.git
cd MVP
```

### 2) Controlla il file ambiente

Nella root deve esserci il file `.env`.

Maggiori dettagli nel Manuale utente.

### 4) Avvia i servizi Docker

```bash
docker compose up -d --build
```

Quando i container sono pronti, apri:

- `http://localhost`

## Stop servizi

```bash
docker compose down
```

Reset completo (anche volume database):

```bash
docker compose down -v
```

### Test backend

```bash
cd backend
npm install
npm test
npm run test:e2e
npm run test unit
npm run test integration
```

### Test frontend

```bash
cd frontend
npm install
npm test
npm test:unit
npm test:integration
npm run e2e
```

## Troubleshooting

1. `http://localhost` non risponde.
   Verifica che i container `database`, `server`, `nginx` siano in esecuzione con `docker compose ps`.

2. Errore sulle variabili ambiente.
   Controlla il file `.env` nella root e la presenza delle variabili d'ambiente.

3. Il backend parte ma non si connette al DB.
   Attendi l'healthcheck del database oppure riavvia con `docker compose up --build`.
