# VIGIL – Live CCTV Demo (Single Guide)

VIGIL is a real-time surveillance demo that simulates 12 cameras, rotates 5-second clips, and runs real PyTorch AI (MobileNet) on every rotation to flag violence. This single README replaces all other docs.

---

## TL;DR: Run the Demo (3 Steps)

```bash
# 1) Verify environment
python check_demo_setup.py

# 2) Start backend
python backend/app.py

# 3) Open dashboard
http://127.0.0.1:5000/pages/admin_dashboard.html
```

You’ll see 12 feeds. Videos change every ~7s. Violence turns a card red and creates an incident.

---

## How It Works

- **Rotation loop (every ~7s):** For each camera, pick a random video (85% normal, 15% violence), run AI, store `{event, confidence, latency_ms, video}`.
- **Frontend poll (every 3s):** `/api/live-status` returns all camera states. The dashboard sets `<video src>`, updates confidence, and paints red on violence.
- **Incidents:** Violence triggers an incident entry with camera, time, confidence, and video link.

Architecture at a glance:
```
Browser (polls 3s) ---> /api/live-status ---> camera states
Browser (videos)  <--- /videos/<path>     ---> MP4 clips (5s)

Background thread (simulator):
  every 7s per camera:
    - select video (violence or normal)
    - run MobileNet inference
    - update camera state
```

---

## File Map (only the essentials)

```
backend/app.py                 # Flask app; starts simulator; APIs
backend/services/camera_simulator.py  # NEW: rotation + inference loop
backend/services/camera_manager.py    # Camera state store
backend/config.py              # Thresholds, camera list
Videos/violence/*.mp4          # 5s clips (violence)
Videos/no_violence/*.mp4       # 5s clips (normal)
js/admin_dashboard_live_monitor.js    # Frontend polling + video wiring
css/admin_dashboard_live_monitor.css  # Alert (red) styling already done
check_demo_setup.py            # Env/video/model checker
test_demo_system.py            # 11-step test suite
```

---

## Configuration (no code rewrites needed)

| Setting | Default | Where | Notes |
|---------|---------|-------|-------|
| Rotation interval | 7 s | `backend/services/camera_simulator.py` | `rotation_interval` controls how often videos change |
| Violence probability | 0.15 | `backend/services/camera_simulator.py` | `violence_probability` sets % of violence clips |
| Violence cooldown | 15 s | `backend/services/camera_simulator.py` | Per-camera cooldown between violence alerts |
| Detection threshold | 0.95 | `backend/config.py` | `VIOLENCE_THRESHOLD` strictness; lower for more alerts |

Examples:
- More alerts: set `violence_probability=0.40`, `VIOLENCE_THRESHOLD=0.90`.
- Fewer alerts: set `violence_probability=0.05`, `VIOLENCE_THRESHOLD=0.98`.
- Lighter CPU: set `rotation_interval=10`.

---

## Runbook

1) **Start backend**: `python backend/app.py` (Flask + simulator).
2) **Open dashboard**: `http://127.0.0.1:5000/pages/admin_dashboard.html`.
3) **Watch**: videos swap every ~7s; red cards on violence; incidents appear.

Health checks:
```bash
curl http://127.0.0.1:5000/                        # backend up
curl http://127.0.0.1:5000/api/live-status | python -m json.tool
curl http://127.0.0.1:5000/api/simulator-stats | python -m json.tool
```

---

## API Reference (demo scope)

- **GET /api/live-status** → `[ { camera_id, video, event, confidence, model, latency_ms, last_update, status } ]`
- **GET /api/simulator-stats** → `{ running, inferences_run, rotation_interval, violence_probability, cameras_monitored }`
- **GET /videos/<path>** → serves MP4 clips (e.g., `videos/violence/clip_001.mp4`).
- **POST /api/process-demo**, **POST /api/process-batch**, **POST /api/process-video** → legacy demo triggers (unchanged).

---

## Performance Expectations

- Inference: 80–150 ms per video (MobileNet, CPU).
- Cycle: ~7 s rotation + ~100 ms inference → ~7.1 s per camera.
- Memory: ~500 MB (models loaded).
- CPU: ~40–60% during inference.
- Network: ~30 KB per `/api/live-status` poll.

---

## Troubleshooting (quick fixes)

| Issue | Fix |
|-------|-----|
| No videos load | Ensure `Videos/violence/` and `Videos/no_violence/` have 5s MP4s |
| No violence alerts | Lower `VIOLENCE_THRESHOLD` to 0.90; raise `violence_probability` to 0.30 |
| Slow inference | Increase `rotation_interval` to 10; close other heavy apps |
| Inference module missing | `pip install torch opencv-python flask flask-cors numpy` |
| Frontend stale | Hard refresh browser (Ctrl+F5); check `/api/live-status` responses |
| Videos stutter | Ensure clips are exactly 5.0s (use ffmpeg `-t 5`) |

---

## Testing

- **Full suite:** `python test_demo_system.py` (11 tests: env, API, inference running, video serving, dashboard checks).
- **Quick checks:**
  - `python check_demo_setup.py` (env/videos/models sanity)
  - `curl http://127.0.0.1:5000/api/simulator-stats` (inferences should increase every ~7s)

---

## Demo Script (talk track)

1) Start backend; show console logs (simulator starting).
2) Open dashboard Live Monitor: 12 feeds playing.
3) Point out video swap every ~7s; confidence badges.
4) Wait for a red card (violence) → highlight alert + incident.
5) Show `/api/simulator-stats` (inference count climbing).
6) Emphasize: real PyTorch inference, not mocked.

---

## Notes & Constraints

- This is a demo: no RTSP/WebRTC; videos are local 5s clips.
- AI contract lives in `inference.py`; swap models without touching routes/JS.
- Frontend JS/CSS already wired for alerts; no edits needed unless broken.

---

## When the “Real AI” Arrives

Your change surface is minimal:
- Update model weights/logic in `backend/ai/inference.py`.
- Keep the API contract `{ event, confidence, model, latency_ms, timestamp }` intact.

Everything else stays frozen.
