# Docker Setup

This project includes Docker configuration for both development and production environments, optimized for Azure Container Apps deployment.

## Quick Start

### Production Build
```bash
# Build and run the production container
docker-compose up --build

# Or build manually
docker build -t unihack-frontend .
docker run -p 4173:4173 unihack-frontend
```

### Development Build
```bash
# Run development environment with hot reload
docker-compose --profile dev up frontend-dev --build

# Or build manually
docker build -f Dockerfile.dev -t unihack-frontend-dev .
docker run -p 8080:8080 -v $(pwd):/app -v /app/node_modules unihack-frontend-dev
```

## Docker Files

- `Dockerfile` - Multi-stage production build using Vite preview
- `Dockerfile.dev` - Development build with hot reload
- `docker-compose.yml` - Container orchestration
- `.dockerignore` - Files to exclude from Docker context

## Features

### Production Dockerfile
- Multi-stage build for optimized image size
- Uses Bun for faster dependency installation and serving
- Vite preview server for production serving
- Optimized for Azure Container Apps deployment
- No additional web server needed

### Development Dockerfile
- Hot reload support
- Volume mounting for live code changes
- Development server configuration

## Azure Container Apps Deployment

This Dockerfile is optimized for Azure Container Apps:
- Uses Vite preview server (lightweight and efficient)
- Exposes port 4173
- No external dependencies like Nginx
- Multi-stage build for smaller image size

## Environment Variables

The application can be configured using environment variables:
- `NODE_ENV` - Set to 'production' or 'development'

## Ports

- Production: `4173` (Vite preview server)
- Development: `8080` (Vite dev server)

## Build Arguments

You can customize the build process using build arguments:

```bash
docker build --build-arg NODE_ENV=production -t unihack-frontend .
```
