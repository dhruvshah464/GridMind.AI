<div align="center">
  
# ⚡ GridMind.AI

**The Autonomous Energy Intelligence Operating System**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Python FastAPI](https://img.shields.io/badge/FastAPI-0.100-teal?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.0-black?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=flat-square&logo=postgresql)](https://neon.tech/)

GridMind.AI is an advanced, multi-layered artificial intelligence platform designed to optimize electricity consumption, predict load demand, and automate financial savings for grid operators and hardware owners.

[Explore Architecture](#architecture) • [Getting Started](#getting-started) • [Features](#features)

</div>

---

## 🚀 Overview

This is no ordinary dashboard—**GridMind.AI is a real-time decision engine.**

Built with an Apple/Stripe-inspired engineered UI, GridMind synthesizes multiple data inputs (IoT telemetry, weather conditions, dynamic grid tariffs, and user behavior curves) to generate highly confident energy control actions. Whether it's shifting an HVAC load to an off-peak tariff window, or delaying EV charging during an anomaly, GridMind operates autonomously to protect grid integrity and reduce utility bills.

### 🧠 The Intelligence Pipeline

To guarantee reliability, we utilize a **4-Layer Intelligence Engine**:

1. **Machine Learning Layer (FastAPI):** Python-powered Scikit-Learn RandomForest models operating on 5 key features (hour, day of week, temperature, solar radiation, and load moving average) to predict future energy curves.
2. **Heuristic & Context Layer (Node.js):** Cross-references the ML prediction with real-time grid constraints, weather data (via OpenWeatherMap), and user behavioral patterns.
3. **Decision & LLM Layer:** If strict grid rules don't cover a complex edge case, GridMind falls back to a dual-LLM chain (OpenAI GPT-4o-mini natively with Google Gemini 1.5 Flash as a fallback) to structurally reason through complex energy scenarios.
4. **Action & Logging Layer:** Persists all actions, anomalies, and financial projections via Prisma to a Neon PostgreSQL database—closing the feedback loop for future model retraining.

---

## 🧬 Architecture

```mermaid
graph TD;
    subgraph Client Application
        A[Next.js Frontend] -->|REST/WebSockets| B(Express API Gateway)
    end

    subgraph Intelligence Core
        B --> C{AI Engine runtime}
        C -->|1. Live Input| D[Adapter Layer: Telemetry/Weather]
        C -->|2. Inference| E[FastAPI ML Service]
        C -->|3. Reasoning| F[Dual LLM Engine]
    end

    subgraph Data & Persistence
        D --> Z[(Neon PostgreSQL)]
        C -->|Log Actions| Z
        E -->|Retraining Loop| Z
    end

    F -.->|Primary| O(OpenAI GPT-4o-mini)
    F -.->|Fallback| G(Google Gemini 1.5 Flash)
```

---

## 🛠️ Tech Stack

**Frontend (SaaS Interface):**

- React 18 & Next.js (App Router)
- Tailwind CSS (v4 Alpha)
- Custom GPU-accelerated motion systems (Framer Motion) & Glassmorphism design tokens
- Recharts for real-time telemetry visualization

**Backend (Coordination Engine):**

- Node.js & Express
- Prisma ORM (Neon Tech Serverless PostgreSQL)
- WebSocket (Socket.io) for live grid telemetry streams

**AI/ML Service (Prediction Brain):**

- Python 3.11 & FastAPI
- Pandas, Scikit-Learn
- IsolationForest (Anomaly Detection)
- RandomForestRegressor (Load Forecasting)

---

## ⚡ Getting Started

The platform runs as a distributed microservice architecture. You will need to start three distinct environments.

### 1. Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL Database URL (e.g., Neon.tech)

### 2. Environment Configuration

Create an `.env.local` file inside the `backend` directory.

```env
# /backend/.env.local
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your_super_secret_jwt_key_here"

# Intelligence Operators
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="AI..."
WEATHER_API_KEY="your_openweathermap_key"
```

### 3. Start the Platform

**Terminal 1: ML Microservice**

```bash
cd ai-service
pip install fastapi uvicorn pandas scikit-learn
uvicorn app:app --port 8000
```

**Terminal 2: Node AI Gateway**

```bash
cd backend
npm install
npx prisma db push   # Push schema to PostgreSQL
node server.js       # Starts on port 5001
```

**Terminal 3: UI Client**

```bash
cd frontend
npm install
npm run dev          # Starts on port 3000
```

Navigate to `http://localhost:3000` to access the GridMind.AI operations center.

---

## 💎 Premium Implementation Standards

- **Error Boundaries:** Distinct frontend segments (Simulator, AI Command Center, Charts) are fully isolated via strict React boundaries. If an ML node goes down, the rest of the application remains fully functional.
- **Dynamic Memoization:** Heavy data blocks are strictly memoized to prevent recursive cascading renders during active 12s WebSocket polling intervals.
- **Visual Intelligence:** The UI implements high-end Apple/Vercel standard glassmorphism, precise 4px grids, skeleton skeleton-preloading states, and layout transitions.

---

> _"The smartest grid is one that manages itself."_  
> **— Built by Dhruv Shah.**
