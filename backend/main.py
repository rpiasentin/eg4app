# eg4app backend/main.py
# Minimal FastAPI app that wraps the EG4 control logic (placeholder)
# Run with:  uvicorn backend.main:app --port 8000 --reload
import asyncio, os, time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="EG4 Float Control Backend")

class Voltages(BaseModel):
    absorb: float
    float: float

# In-memory defaults; the real logic will update these
CURRENT_ABSORB = float(os.environ.get("DEFAULT_ABSORB", 58.2))
CURRENT_FLOAT = float(os.environ.get("DEFAULT_FLOAT", 55.2))

# In-memory action log (keeps a list of actions taken)
ACTION_LOG = []

@app.get("/api/status")
async def status():
    # placeholder data – replace with real inverter poll
    return {
        "absorb_voltage": CURRENT_ABSORB,
        "float_voltage": CURRENT_FLOAT,
        "battery_voltage": 56.3,
        "timestamp": asyncio.get_event_loop().time(),
    }

@app.post("/api/setpoints")
async def setpoints(v: Voltages):
    global CURRENT_ABSORB, CURRENT_FLOAT
    CURRENT_ABSORB = v.absorb
    CURRENT_FLOAT = v.float
    # Log the action
    ACTION_LOG.append({
        "timestamp": time.time(),
        "action": "setpoints_updated",
        "absorb": v.absorb,
        "float": v.float
    })
    # TODO: push to inverter via cloud API
    return {"message": "Setpoints updated"}

@app.get("/api/history")
async def history():
    # placeholder: return synthetic 24‑hour data
    import random
    now = time.time()
    return [
        {"t": now - i * 360, "v": 55 + random.random()}
        for i in range(240)
    ]

@app.get("/api/actions")
async def actions():
    # Return the 100 most recent actions
    return ACTION_LOG[-100:]
