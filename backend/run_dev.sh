#!/bin/bash
cd "$(dirname "$0")"
# Uses the existing duolingo.db if present so progress persists across restarts.
# Delete duolingo.db manually if you want to reseed from scratch.
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
