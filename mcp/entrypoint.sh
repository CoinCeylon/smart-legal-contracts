#!/bin/sh
export CHROMA_TELEMETRY_ENABLED=false

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000