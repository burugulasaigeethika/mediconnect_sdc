# MediConnect Local Deployment Guide

This guide explains how to run the full MediConnect stack using Docker, including the new integrations: **Redis**, **RabbitMQ**, **Elasticsearch**, and **Celery (Python)**.

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

## Quick Start

1.  **Start all services**:
    ```bash
    docker-compose up --build
    ```
    This will start:
    - Node.js Backend (Port 5000)
    - Python Celery Worker (Background Tasks)
    - Redis (Cache & Queue)
    - RabbitMQ (Message Broker)
    - Elasticsearch (Search Engine)
    - Kibana (Search UI - Port 5601)
    - Frontend (Port 3000)

2.  **Verify Services**:
    - **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
    - **RabbitMQ Dashboard**: [http://localhost:15672](http://localhost:15672) (User: `guest`, Pass: `guest`)
    - **Kibana**: [http://localhost:5601](http://localhost:5601)

## New Features

### 1. Background Tasks (Celery + Python)
The Node.js backend can now offload tasks to the Python worker.
- **Trigger Report**: `POST /api/reports/monthly/background`
    - This sends a message to RabbitMQ.
    - The Python worker (`celery_worker/`) picks it up and processes it.
    - Check terminal logs to see "Generating monthly report..." from the python service.

### 2. Search (Elasticsearch)
Doctors are automatically indexed.
- **Search API**: `GET /api/search/doctors?query=Cardiologist`
    - Full-text search on name, email, and specialization.

## Useful Commands

| Action | Command |
| :--- | :--- |
| **Stop All** | `docker-compose down` |
| **View Logs** | `docker-compose logs -f` |
| **Check Celery** | `docker-compose logs -f celery_worker` |
| **Check Node** | `docker-compose logs -f backend` |
