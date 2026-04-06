# RouteMate

RouteMate is a microservices-based public transport planning platform for commuters in Singapore. It supports route planning, fare comparison, ride-hailing aggregation, card management, transactions, arrival timings, and notifications — all routed through a Kong API Gateway with Prometheus and Grafana monitoring.

## Project Structure

```bash
routemate/
├─ package.json
├─ README.md
├─ .env                          # root env (copy from .env.example)
├─ .env.example                  # template — do not put real credentials here
├─ docker-compose.yml
├─ kong/
│  └─ kong.yml                   # Kong declarative config
├─ prometheus/
│  └─ prometheus.yml             # Prometheus scrape config
├─ grafana/
│  └─ provisioning/
│     └─ datasources/
│        └─ prometheus.yml       # Grafana auto-connects to Prometheus
├─ apps/
│  ├─ api-gateway/               # :3000
│  ├─ arrival-timing-service/    # :3013
│  ├─ card-orchestrator-service/ # :3001
│  ├─ card-service/              # :3002
│  ├─ fare-comparison-service/   # :3003
│  ├─ fare-service/              # :3004
│  ├─ maps-wrapper-service/      # :3005
│  ├─ notification-service/      # :3006
│  ├─ payment-wrapper-service/   # :3007
│  ├─ ride-hailing-aggregator-service/ # :3008
│  ├─ ride-hailing-wrapper-service/    # :3009
│  ├─ ride-hailing-mocked-api/   # :4000 (JSON Server)
│  ├─ route-cache-service/       # :3010
│  ├─ route-planner-orchestrator-service/ # :3014
│  ├─ transaction-service/       # :3011
│  └─ user-service/              # :3012
└─ frontend/
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Backend | NestJS (monorepo) |
| API Gateway | Kong (DB-less declarative mode) |
| Databases | PostgreSQL, MongoDB |
| Containerisation | Docker Compose |
| Messaging | RabbitMQ |
| Monitoring | Prometheus + Grafana |
| Mock APIs | JSON Server |

## Prerequisites

Make sure the following are installed before starting:

- Node.js (v18+)
- npm
- Docker Desktop
- Git

## 1. Setting Up

Clone the repo and install dependencies:

```bash
git clone https://github.com/nnylac/RouteMate
cd routemate
npm install
```

## 2. Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Then create a `.env` file inside each DB-dependent service folder:

```bash
# apps/api-gateway/.env
PORT=3000

# apps/card-orchestrator-service/.env
PORT=3001

# apps/card-service/.env
PORT=3002
MONGO_URI=mongodb://<user>:<password>@localhost:27017/card_service_db?authSource=admin

# apps/fare-service/.env
PORT=3004
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=<your_postgres_user>
POSTGRES_PASSWORD=<your_postgres_password>
POSTGRES_DB=fare_service_db

# apps/notification-service/.env
PORT=3006
MONGO_URI=mongodb://<user>:<password>@localhost:27017/notification_db?authSource=admin

# apps/route-cache-service/.env
PORT=3010
MONGO_URI=mongodb://<user>:<password>@localhost:27017/route_cache_db?authSource=admin

# apps/transaction-service/.env
PORT=3011
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=<your_postgres_user>
POSTGRES_PASSWORD=<your_postgres_password>
POSTGRES_DB=transaction_service_db

# apps/user-service/.env
PORT=3012
MONGO_URI=mongodb://<user>:<password>@localhost:27017/user_service_db?authSource=admin
```

> Services without a database (maps-wrapper, payment-wrapper, ride-hailing etc.) read their port from the root `.env` and do not need a per-service `.env`.

> **Never commit `.env` files.** They are listed in `.gitignore`.

## 3. Start Infrastructure (Docker)

Start all Docker containers (Kong, Prometheus, Grafana, MongoDB, PostgreSQL):

```bash
docker compose up -d
```

Reload Kong's config after any changes to `kong/kong.yml`:

```bash
curl -X POST http://localhost:8081/config -F config=@kong/kong.yml
```

Reset everything (wipes volumes and data):

```bash
docker compose down -v
docker compose up -d
```

## 4. Start Backend Services

```bash
# Start all services at once (recommended)
npm run start:all

# Start a single service
nest start <service-name> --watch

# Examples
nest start user-service --watch
nest start ride-hailing-aggregator-service --watch
```

## 5. Service URLs

All external traffic should go through Kong on port **8080**. Direct service ports are for local development only.

| Service | Kong URL | Direct Port |
|---|---|---|
| Ride-hailing quotes | `POST :8080/ridehail/quotes` | :3008 |
| Route planner search | `POST :8080/route-planner/search` | :3014 |
| Route planner routes | `GET :8080/route-planner/routes` | :3014 |
| Arrival timing | `GET :8080/arrival-timing` | :3013 |
| Maps routes | `GET :8080/maps/routes` | :3005 |
| User register | `POST :8080/user-service/register` | :3012 |
| User login | `POST :8080/user-service/login` | :3012 |
| Users | `GET :8080/user-service/users` | :3012 |
| Cards | `GET/POST :8080/card-service/cards` | :3002 |
| Card top-up | `PATCH :8080/card-service/cards/:id/topup` | :3002 |
| Transactions | `GET/POST :8080/transactions` | :3011 |
| Fare rules | `GET :8080/fare-service/rules` | :3004 |
| Fare calculate | `POST :8080/fare-service/calculate` | :3004 |
| Notifications | `GET :8080/notification-service/notifications` | :3006 |
| Route cache | `GET/POST :8080/route-cache` | :3010 |

## 6. Monitoring

| Tool | URL | Credentials |
|---|---|---|
| Kong Admin API | http://localhost:8081 | — |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3001 | admin / admin |

To view Kong metrics in Grafana, import dashboard ID **7424** (official Kong dashboard):
1. Open http://localhost:3001
2. Dashboards → New → Import
3. Enter ID `7424` → Load → select Prometheus datasource → Import

## 7. Daily Startup Checklist

```bash
# 1. Open Docker Desktop and wait for it to fully start

# 2. Start containers
docker compose up -d

# 3. Reload Kong config
curl -X POST http://localhost:8081/config -F config=@kong/kong.yml

# 4. Start all services
npm run start:all

# 5. Verify Kong is routing correctly
curl -X POST http://localhost:8080/ridehail/quotes \
  -H "Content-Type: application/json" \
  -d "{}"
```

## 8. Troubleshooting

**Kong not reachable (port 8080/8081 refused)**
→ Docker Desktop stopped. Reopen it, then run `docker compose up -d`.

**Service returning 502 Bad Gateway**
→ The NestJS service for that route isn't running. Run `npm run start:all`.

**Container name conflict on `docker compose up`**
```bash
docker rm -f route-mate-gateway my-mongo my-postgres
docker compose up -d
```

**Port already in use (EADDRINUSE)**
```bash
# Windows
taskkill /F /IM node.exe
npm run start:all

# Mac/Linux
pkill -f node
npm run start:all
```

**Mongo connection refused**
→ Check `docker ps | grep mongo` — make sure it shows `0.0.0.0:27017->27017/tcp`.
→ Check that `MONGO_URI` in per-service `.env` uses port `27017`.
