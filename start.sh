#!/usr/bin/env bash
# VEGA Platform Launcher — macOS/Linux

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo ""
echo -e "${GREEN}  VEGA Security Platform${NC}"
echo "  ─────────────────────────"
echo ""

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Backend
echo -e "${YELLOW}[1/2] Starting Backend (FastAPI on :8000)...${NC}"
osascript -e "tell app \"Terminal\" to do script \"cd '$ROOT' && python -m uvicorn backend.api:app --reload\"" 2>/dev/null || \
  gnome-terminal -- bash -c "cd '$ROOT' && python -m uvicorn backend.api:app --reload" 2>/dev/null || \
  (cd "$ROOT" && python -m uvicorn backend.api:app --reload &)

sleep 2

# Frontend
echo -e "${YELLOW}[2/2] Starting Frontend (Vite on :5173)...${NC}"
osascript -e "tell app \"Terminal\" to do script \"cd '$ROOT/frontend' && npm run dev\"" 2>/dev/null || \
  gnome-terminal -- bash -c "cd '$ROOT/frontend' && npm run dev" 2>/dev/null || \
  (cd "$ROOT/frontend" && npm run dev &)

echo ""
echo -e "${GREEN}  Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}  Backend:  http://localhost:8000${NC}"
echo ""
