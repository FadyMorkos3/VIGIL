# VIGIL – AI-Powered Surveillance System

VIGIL is a real-time surveillance demonstration platform that uses advanced AI models to detect violence, car crashes, and count people in video feeds. It features a Python/Flask backend that runs AI inference and a modern React/Vite frontend for live monitoring.

---

## 🚀 Quick Start

### Prerequisites
*   **Python 3.8+** (Add to PATH)
*   **Node.js 16+** (Add to PATH)
*   **PowerShell** (for the unified startup script)

### Run the System
The easiest way to start VIGIL is using the included PowerShell script, which checks environments, installs dependencies, and launches both servers.

```powershell
.\start-vigil.ps1
```

This will launch:
1.  **Backend API**: `http://127.0.0.1:5000`
2.  **Frontend Dashboard**: `http://localhost:3000`

---

## 🏗️ Architecture

### AI & Backend (`/backend`)
*   **Framework**: Flask with Socket.IO for real-time updates.
*   **Inference Engine** (`backend/ai/inference.py`):
    *   **Violence Detection**: MobileNet-Clip based model.
    *   **Crash Detection**: MobileNetV2-LSTM hybrid model.
    *   **People Counting**: YOLOv8 model.
*   **Simulator** (`backend/services/camera_simulator.py`): Simulates live patterns by rotating video clips on a loop.

### Frontend (`/Vigil Surveillance App Design - Figma`)
*   **Framework**: React (Vite).
*   **Design**: Modern dark-mode UI with "glassmorphism" aesthetics.
*   **Features**:
    *   Live camera grid.
    *   Real-time incident alerts.
    *   Interactive dashboard for security personnel.

---

## ⚙️ Configuration

You can tune the system's sensitivity in `backend/config.py`:

| Setting | Default | Description |
|---------|---------|-------------|
| `VIOLENCE_THRESHOLD` | 0.70 | Confidence required to flag violence. High precision mode. |
| `ACCIDENT_THRESHOLD` | 0.10 | Confidence required to flag crashes. Tuned for demo sensitivity. |
| `DEFAULT_CAMERAS` | 12 Cams | List of active camera IDs. |
| `MODEL_PATHS` | - | Paths to `.pt` and `.pth` model weights. |

### Camera Types
Cameras are assigned specific detection roles in `config.py`:
*   **Violence Cameras**: `CAM-042`, `CAM-128`, `CAM-089`, `CAM-156`
*   **Crash Cameras**: `CAM-283`, `CAM-074`, `CAM-195`, `CAM-267`

---

## 🛠️ Troubleshooting

**"Frontend folder not found" error:**
Ensure the folder `Vigil Surveillance App Design - Figma` exists in the root. The startup script expects this exact name.

**Backend starts but no videos play:**
Check that the `Videos/` directory contains standard MP4 files. The system expects videos to be organized in subfolders or directly in the root of `Videos/`.

**"Module not found" errors:**
Manually install backend dependencies:
```bash
pip install -r requirements.txt
```

---

## 📂 Project Structure

```
├── backend/                  # Flask API & AI Logic
│   ├── app.py                # Main entry point
│   ├── ai/                   # Inference scripts (inference.py, etc.)
│   ├── services/             # Simulator, Incident Management
│   └── config.py             # System constants
├── Vigil Surveillance.../    # React/Vite Frontend
│   ├── src/                  # React components
│   └── package.json          # Frontend dependencies
├── Videos/                   # Source clips for simulation
├── start-vigil.ps1           # Verified startup script
└── requirements.txt          # Python dependencies
```

