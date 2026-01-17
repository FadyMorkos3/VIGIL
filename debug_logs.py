
import re

log_file = "backend_video_fix.log"
try:
    with open(log_file, "r", encoding="utf-16", errors="ignore") as f:
        lines = f.readlines()
        
    serve_lines = [line.strip() for line in lines if ("[VIDEO SERVE]" in line and ("not found" in line or "Invalid" in line))]
    
    print(f"Found {len(serve_lines)} ERROR log entries for video serving:")
    for line in serve_lines[-20:]:  # Last 20
        # Try to extract the path if possible, or just print the line
        if "Invalid" in line:
            print(f"FULL LINE: {line}")
        
except Exception as e:
    print(f"Error reading log: {e}")
