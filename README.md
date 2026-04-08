# RouteMate

RouteMate is a microservices-based public transport planning platform for commuters in Singapore. It supports route planning, fare comparison, ride-hailing aggregation, card management, transactions, arrival timings, and notifications — all routed through a Kong API Gateway with Prometheus and Grafana monitoring.

## Project Structure

```bash
routemate/
├─ package.json
├─ README.md
├─ apps/
│  ├─ api-gateway/
│  ├─ arrival-timing-service/
│  ├─ card-orchestrator-service/
│  ├─ card-service/
│  ├─ fare-comparison-service/
│  ├─ fare-service/
│  ├─ maps-wrapper-service/
│  ├─ notification-service/
│  ├─ payment-wrapper-service/
│  ├─ ride-hailing-aggregator-service/
│  ├─ ride-hailing-wrapper/
│  ├─ route-cache-service/
│  ├─ transaction-service/
│  └─ user-service/
├─ frontend/
```

## Tech Stack
Frontend: React + Typescript
Backend: NestJS
Databases: PostgreSQL and MongoDB
Containerisation: Docker Compose
Messaging: RabbitMQ

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
```


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
| Grafana | http://localhost:3015 | admin / admin |

To view Kong metrics in Grafana, import dashboard ID **7424** (official Kong dashboard):
1. Open http://localhost:3015
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

# to start one service only
nest start <service-name>

# example
nest start transaction-service
```

