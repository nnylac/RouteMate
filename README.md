# RouteMate

RouteMate is a microservices-based transport platform that supports route planning, fare comparison, card management, transactions, arrival timings, notifications, and ride-hailing integrations.

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
* Node.js
* npm
* Docker Desktop
* Git

## 1. Setting Up
Clone the repo and install dependencies:
```bash
git clone https://github.com/nnylac/RouteMate
cd routemate
npm install
```

## 2. Start Infrastructure Services
This project uses Docker Compose to run shared infrastructure such as databases and message brokers.

# Reset containers and volumes
Use this if you want a clean restart:
```bash
docker compose down -v
```

# Start containers in detached mode
```bash
docker compose up -d
```

## 3. Environment Variables
Create the required .env files inside each app folder if they do not already exist.
Example for apps/transaction-service/.env:
```bash
PORT=3011

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=transaction_service_db
```


```bash
PORT=3010

MONGO_URI=mongodb://<MONGO_USER>:<MONGO_PASSWORD>@localhost:27017/route_cache_db?authSource=admin
```

## 4. Start Backend Services
```bash
# to start all services
npm run start:all

# to start one service only
nest start <service-name>

# example
nest start transaction-service
```

