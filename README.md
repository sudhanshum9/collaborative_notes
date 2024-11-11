# Collaborative Notes Application

A modern, real-time collaborative note-taking platform built with Django and React that enables seamless multi-user editing and viewing of shared notes.

## Key Features

- Real-time collaborative editing powered by Django Channels and PostgreSQL
- Secure user authentication and role-based authorization 
- Comprehensive note management (create, edit, share, delete)
- Smart email notifications for important updates
- Cross-origin resource sharing (CORS) enabled
- Containerized with Docker for simplified deployment
- Team collaboration and workspace management
- Note categorization and organization
- Rich text editing capabilities

## Tech Stack

### Backend Architecture
- Django 4.2 - Modern Python web framework
- Django REST Framework - Powerful API development
- Django Channels - WebSocket support for real-time features
- PostgreSQL - Robust database with real-time capabilities
- Redis - In-memory data structure store
- Docker - Containerization and orchestration

### Frontend Development
- React 18 - UI component library
- Axios - HTTP client
- TailwindCSS - Utility-first CSS framework
- WebSocket API - Real-time communication

## Prerequisites

- Docker Engine 20.10+ and Docker Compose v2+
- Python 3.9 or higher
- PostgreSQL 13+
- Node.js 16+ and npm

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/sudhanshum9/collaborative_notes.git
   cd collaborative_notes
   ```

2. Set up environment variables:
   ```bash
   cp deployment/.env.example deployment/.env
   # Configure the .env file with your settings
   ```

3. Build and launch with Docker:
   ```bash
   docker-compose -f deployment/docker-compose.yml up --build
   ```

4. Access the application:
   - Frontend App: http://localhost:3000
   - Backend API: http://localhost:8000
   - WebSocket Server: ws://localhost:8001
   - PostgreSQL Database: localhost:5431

## Configuration
Required environment variables in `deployment/.env`:
