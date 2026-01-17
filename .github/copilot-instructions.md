
# VIGIL Production Codebase Guide (2026)

## System Overview

VIGIL is a real-time, production-grade surveillance platform with:
- **React (Vite) Frontend**: Modern UI, live camera grid, incident/notification center, dark/light mode, video modals.
- **Flask Backend**: REST APIs, real AI model inference (violence, crash, people counting), strict offline mode, video serving.
- **AI Models**: MobileNet/X3D (violence), MobileNetV2-LSTM (crash), YOLOv8 (people counting). No demo/mock inference.
- **Video Dataset**: `Videos/` folder, organized by type, served via `/videos/<path>` endpoint.

## Key Components

- `backend/app.py`: Flask app, all API endpoints, video serving, offline mode, login.
- `backend/services/camera_simulator.py`: Rotates videos, runs real model inference, creates incidents (blocked in offline mode).
- `backend/ai/inference.py`: Unified entry for all AI models.
- `backend/services/incident_storage.py`: Thread-safe incident registry, deduplication.
- `backend/services/camera_manager.py`: Camera state, video assignment, thread safety.
- `Vigil Surveillance App Design - Figma/`: React (Vite) frontend, all UI/UX logic.

## Data Flow

1. **Frontend** polls `/api/live-status` every 3s for camera state and video URLs.
2. **Backend** returns camera objects: `{ camera_id, video, event, confidence, model, latency_ms, last_update, status }`.
3. **Frontend** renders live grid, incident/notification modals, and plays videos via `/videos/<path>` URLs.
4. **Simulator Thread** (per camera):
   - Rotates video (random, weighted by config)
   - Runs real model inference (violence, crash, people)
   - Updates camera state
   - If confidence > threshold, creates incident (unless in offline mode)

## Configuration

- `backend/config.py`:
  - `VIOLENCE_THRESHOLD`, `ACCIDENT_THRESHOLD`: Set detection sensitivity.
  - `DEFAULT_CAMERAS`: List of camera IDs.
- `camera_simulator.py` args:
  - `rotation_interval`: Seconds between video changes.
  - `violence_probability`: Probability of violence video.
  - `violence_cooldown_per_camera`: Cooldown before same camera can alert again.

## API Endpoints

- `GET /api/live-status`: All camera states, video URLs.
- `GET /api/incidents`: All incidents (for incident/notification center).
- `POST /api/offline-mode`: Toggle strict offline mode (blocks all incidents/notifications).
- `GET /videos/<path>`: Serves video files for frontend.
- `POST /auth/login`: User login (demo or real, as configured).

## Project Conventions

1. **Video URLs**: Always use `/videos/...` relative paths in frontend.
2. **Thread Safety**: All state/incident changes use `threading.Lock()`.
3. **Confidence**: 0.0-1.0 in backend, 0-100% in frontend.
4. **Strict Offline Mode**: When enabled, no incidents or notifications are created, regardless of model output.
5. **No Demo/Mock**: All inference uses real model code; demo fallback is removed.
6. **Notification/Incident Center**: Only violence and crash create notifications; people count is shown with violence if detected.
7. **UI/UX**: All modals, video players, and analytics are theme-aware and responsive.

## Common Tasks

- **Change Alert Sensitivity**: Lower `VIOLENCE_THRESHOLD` or `ACCIDENT_THRESHOLD` in `config.py`.
- **Add New Video Type**: Add folder to `Videos/`, update `camera_manager.py` and `camera_simulator.py`.
- **Add New Model**: Add detector in `backend/ai/`, import in `inference.py`, update simulator logic.
- **Extend Incident Metadata**: Edit `incident_storage.py` and update frontend incident/notification logic.
- **Debug Video Issues**: Ensure `/videos/<path>` route is present in `app.py` and video files exist in `Videos/`.

## Debugging & Testing

- **Backend**: Run `python backend/app.py` (should print "Simulator started").
- **Frontend**: Run `npm run dev` in `Vigil Surveillance App Design - Figma/`.
- **Health Checks**:
  - `curl http://127.0.0.1:5000/api/live-status`
  - `curl http://127.0.0.1:5000/api/incidents`
- **No Incidents/Notifications?**
  - Check offline mode (should be OFF for alerts)
  - Check model weights in `backend/models/`
  - Check video URLs in `/api/live-status` and `/api/incidents`

## When Adding Features

- **Backend**: Add endpoints in `app.py`, wrap state changes with locks, update config as needed.
- **Frontend**: Update React components in `Vigil Surveillance App Design - Figma/src/`, use `/videos/...` for all video sources, ensure theme support.

---
This guide is tailored for the 2026 VIGIL production system: React (Vite) frontend, Flask backend, real AI models, strict offline mode, and robust video/incident/notification logic. No demo or mock inference is present.

## Critical Configuration

Edit `backend/config.py` to tune the system:

| Setting | Default | Impact |
|---------|---------|--------|
| `VIOLENCE_THRESHOLD` | 0.90 | Min confidence to flag violence (lower = more alerts) |
| `ACCIDENT_THRESHOLD` | 0.80 | Min confidence for crash detection |
| `DEFAULT_CAMERAS` | 12 cameras | Camera list (CAM-042, CAM-128, etc.) |

Edit `backend/services/camera_simulator.py` constructor args:

| Setting | Default | Impact |
|---------|---------|--------|
| `rotation_interval` | 7 | Seconds between video changes per camera |
| `violence_probability` | 0.15 | Probability of selecting violence video (0.0-1.0) |
| `violence_cooldown_per_camera` | 15 | Seconds before same camera can alert again |

## Key File Patterns

### Adding AI Detection

All models inherit from `backend.ai` pattern. To add a new detector:

1. Create `backend/ai/new_detector.py` with `detect_new_feature(video_path)` function returning:
   ```python
   {
       "event": "feature_name",
       "confidence": float,
       "model": str,
       "latency_ms": int,
       "timestamp": float
   }
   ```

2. Import in `backend/ai/inference.py` and add to `__all__`

3. Reference in `camera_simulator.py` rotation logic

### Camera State Management

- `backend/services/camera_manager.py` - Maintains `_camera_states` dict (thread-safe, locked with `_lock`)
- Uses `get_camera_state()`, `update_camera_inference()`, `rotate_camera_video()` functions
- Frontend requests via `/api/live-status` returns all 12 camera objects

### Incident Deduplication

Incidents are **automatically merged** if same camera/type fires within 40 seconds (`_update_window_seconds` in `incident_storage.py`). This prevents spam from rapid detections. Manual editing required if behavior needs adjustment.

## Testing & Development Workflows

### Verify Environment
```bash
python check_demo_setup.py  # Checks videos, models, dependencies
```

### Run Full Test Suite
```bash
python test_demo_system.py  # 11-step integration test
```

### Start Backend Only
```bash
python backend/app.py  # Starts Flask + simulator thread
```

### Health Checks (while running)
```bash
curl http://127.0.0.1:5000/                      # Backend alive
curl http://127.0.0.1:5000/api/live-status       # Current camera states
curl http://127.0.0.1:5000/api/simulator-stats   # Inference stats
```

## API Reference (Essential Endpoints)

- `GET /api/live-status` → Returns all 12 camera states with video paths, confidence, event type
- `GET /api/simulator-stats` → Returns simulator metadata (running status, inference count, rotation interval)
- `POST /api/demo-bookings` → Stores demo booking requests
- `GET /videos/<path>` → Serves MP4 files (e.g., `/videos/violence/clip_001.mp4`)

## Project-Specific Conventions

1. **Video Paths**: Always relative to project root, e.g., `videos/violence/clip_001.mp4`, not absolute
2. **Thread Safety**: All state updates use `threading.Lock()` (see `camera_manager.py`, `incident_storage.py`)
3. **Confidence Ranges**: Always 0.0-1.0 (as decimals), converted to percentages (0-100) in frontend/API
4. **Timestamp Fields**: Store both `timestamp` (Unix epoch) and `timestamp_human` (readable string)
5. **Model Names**: Use identifiers like `"mobilenet_clip"`, `"x3d_s"` from `config.MODEL_PATHS`

## Common Modifications

### Increase Alert Frequency
- `backend/config.py`: Set `VIOLENCE_THRESHOLD = 0.75` (lower = more sensitive)
- `camera_simulator.py`: Set `violence_probability = 0.40` (higher = more violence videos)

### Slow Down Rotation
- `camera_simulator.py`: Set `rotation_interval = 10` (seconds)

### Add Custom Video Folder
1. Create `Videos/new_type/` with MP4 files
2. Add to `camera_manager.py` `load_video_dataset()` and globals
3. Update `camera_simulator.py` rotation logic to use new folder

### Extend Incident Metadata
- Edit `incident_storage.py` `add_incident()` function to include new fields
- Update frontend `js/admin_dashboard_incidents.js` to render new fields

## Debugging Tips

- **Simulator Not Running**: Check `python backend/app.py` console for "Simulator started" message
- **Videos Not Loading**: Verify `Videos/` folder exists with `.mp4` files; run `python check_demo_setup.py`
- **No AI Alerts**: Confirm model files exist in `backend/models/`; check `VIOLENCE_THRESHOLD` isn't too high
- **Frontend Frozen**: Browser console for JS errors; verify `/api/live-status` returns valid JSON
- **Thread Errors**: Look for `Lock` errors in console; check `_lock` usage in manager/storage files

## When Adding Features

- **New Endpoints**: Follow pattern in `backend/app.py` (route → service function → return JSON)
- **State Changes**: Wrap with `_lock` when modifying `_camera_states` or `_incidents`
- **Frontend Updates**: Modify `js/admin_dashboard_live_monitor.js` polling/rendering logic, not individual page files
- **New Configs**: Add to `backend/config.py`, document in this file's "Critical Configuration" section
