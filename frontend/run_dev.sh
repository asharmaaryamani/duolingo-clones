#!/bin/bash
cd "$(dirname "$0")"
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
fi
npm run dev
