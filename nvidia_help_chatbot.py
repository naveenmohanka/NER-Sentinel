"""
nvidia_help_chatbot.py
-----------------------
Standalone Microservice for In-App Navigation & System Help Assistant powered by NVIDIA NIM.
Runs on Port 5001 -- completely separate from your prediction LLM (llm_app.py on Port 8000 / 8001).

Zero dependency fallback included: uses standard library http.server if Flask is not installed.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler

NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY", "")
MODEL = "meta/llama-3.1-8b-instruct"

# Tailored system prompt matching our exact real dashboard routes & capabilities
SYSTEM_PROMPT = """
You are the official in-app AI Navigation & Help Assistant for "NER-Sentinel / resQVerse" -- 
the Multi-Satellite Disaster Intelligence & Early Warning Command Center for North East India (Sikkim, Assam, Meghalaya).

Your ONLY role is to guide the user across the app's features, explain where each tool is located, and how to use it.
You do NOT generate raw mathematical flood/landslide predictions yourself -- the app's dedicated NASA ML & LLM engine (llm_app.py) handles that.

Here are the EXACT pages and features available in the Web Dashboard:
1. Home Dashboard ("/") -> 
   - 3D WebGL Satellite & Himalayan Terrain Map of Gangtok and East Sikkim.
   - Dynamic Dijkstra Safe Evacuation Routes bypassing hazard perimeters.
   - One-Click GPS Geolocation & "Run AI Prediction & LLM Advisory" button.
   - Priority 1 Sector Analysis & NASA SMAP/SRTM/POWER telemetry cards.

2. Live Situation ("/live-situation") ->
   - Interactive 2D Google Street, Satellite Hybrid, and Terrain Map.
   - Real-time active incident pins (Ranipool Flood, NH-10 Debris Slide, Singtam Surge).
   - Search bar to locate any village or road in Sikkim.
   - Live tracking of deployed rescue teams (SDRF Sikkim Alpha, NDRF 1st Bn).

3. Risk Assessment ("/risk-assessment") ->
   - Micro-level 3D terrain analysis for Ranipool Basin (27.2789° N, 88.5944° E).
   - 450m Critical Inundation Buffer Zone.
   - Granular ground reports (GR-01 to GR-04) and hydrological runoff charts.

4. Report Hazard ("/report-hazard") ->
   - Field incident submission form for Landslides, Flash Floods, and Road Blockages.
   - GPS Auto-Capture button.
   - Directly triggers Bayes risk recalculations in the Spring Boot Risk Engine.

5. Response Coordination ("/response-coordination") ->
   - Inter-agency dispatch board for SDRF Sikkim, NDRF, BRO Project Swastik, and ITBP.
   - Live relief shelter capacities for Camp Gangtok Central, Camp Ranipool, and Camp Tadong.

6. Alerts & Status ("/alerts-status") ->
   - Multi-satellite disaster warning feed (RED ALERT, ORANGE WARNING, YELLOW WATCH).
   - Instant "Trigger Public Emergency SMS" broadcast button.

7. Settings ("/settings") ->
   - Command Officer Profile configuration.
   - Regional Language selection (English, Nepali, Hindi, Bengali, Assamese).
   - NASA SMAP & IMD rainfall trigger thresholds.
   - API endpoints configuration (Spring Boot & LLM).

Rules for your responses:
- If the user asks where to find something or how to perform an action, tell them the exact page name and navigation link.
- If asked for a disaster risk prediction, guide them to click "Run AI Prediction & LLM Advisory" on the Home page or submit a report at "/report-hazard".
- Keep answers concise, helpful, and professional.
- Reply in the same language the user writes in (English, Hindi, or Hinglish).
""".strip()


def query_nvidia_nim(message: str, history: list) -> str:
    """Sends prompt to NVIDIA NIM API with intelligent fallback if offline/no key."""
    if not NVIDIA_API_KEY:
        # Grounded intelligent rule-based navigation fallback
        msg_lower = message.lower()
        if "report" in msg_lower or "hazard" in msg_lower or "landslide" in msg_lower and "submit" in msg_lower:
            return "To report a disaster or road blockage, navigate to the ⚠️ **Report Hazard** page (`/report-hazard`). You can use the 'Capture My GPS' button and submit field incident details directly to the Risk Engine."
        elif "map" in msg_lower or "3d" in msg_lower or "satellite" in msg_lower:
            return "You can view the **3D Himalayan Terrain Map** on the **Home Dashboard** (`/`) with 3D Ridge, Valley, and 2D viewpoints. For the **Google Street & Satellite View**, visit the **Live Situation** page (`/live-situation`)."
        elif "sdrf" in msg_lower or "ndrf" in msg_lower or "camp" in msg_lower or "shelter" in msg_lower or "team" in msg_lower:
            return "You can coordinate rescue teams and check shelter occupancies (Camp Gangtok Central, Ranipool, Tadong) on the 👥 **Response Coordination** page (`/response-coordination`)."
        elif "alert" in msg_lower or "sms" in msg_lower or "broadcast" in msg_lower:
            return "Real-time multi-satellite disaster alerts and the Public Emergency SMS broadcast tool are located on the 🔔 **Alerts & Status** page (`/alerts-status`)."
        elif "language" in msg_lower or "nepali" in msg_lower or "hindi" in msg_lower or "profile" in msg_lower or "threshold" in msg_lower:
            return "You can change your language (English, Nepali, Hindi, Bengali, Assamese), officer profile, and NASA SMAP trigger thresholds on the ⚙️ **Settings** page (`/settings`)."
        elif "predict" in msg_lower or "risk" in msg_lower:
            return "To run real-time AI risk predictions for your location, go to the **Home Dashboard** (`/`), enter your coordinates (or click '📍 GPS My Location'), and press **🧠 Run AI Prediction & LLM Advisory**."
        else:
            return "I am your **NER-Sentinel Navigation Assistant**. You can ask me how to find the 3D Map, report a hazard, check evacuation shelters, dispatch rescue teams, or configure settings!"

    # Format messages for NVIDIA NIM
    trimmed_history = history[-6:] if isinstance(history, list) else []
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(trimmed_history)
    messages.append({"role": "user", "content": message})

    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.4,
        "top_p": 0.9,
        "max_tokens": 400,
        "stream": False
    }

    req = urllib.request.Request(
        NVIDIA_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {NVIDIA_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "NER-Sentinel-NVIDIA-Bot"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read().decode("utf-8"))
            reply = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return reply or "I could not generate a response. Please try again."
    except Exception as e:
        print(f"NVIDIA API request note: {e}")
        # Graceful fallback to rule-based navigation intelligence
        return query_nvidia_nim(message, [])


class ChatbotHTTPHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers(204)

    def do_GET(self):
        if self.path in ["/", "/health", "/api/health"]:
            self._set_cors_headers(200)
            res = {
                "service": "NER-Sentinel NVIDIA NIM Help Chatbot",
                "status": "ONLINE",
                "port": 5001,
                "nvidia_key_configured": bool(NVIDIA_API_KEY)
            }
            self.wfile.write(json.dumps(res).encode("utf-8"))
        else:
            self._set_cors_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_POST(self):
        if self.path in ["/api/chat", "/chat"]:
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"

            try:
                data = json.loads(post_data.decode("utf-8"))
            except Exception:
                data = {}

            message = data.get("message", "")
            history = data.get("history", [])

            if not message:
                self._set_cors_headers(400)
                self.wfile.write(json.dumps({"error": "'message' is required"}).encode("utf-8"))
                return

            reply = query_nvidia_nim(message, history)
            self._set_cors_headers(200)
            self.wfile.write(json.dumps({"reply": reply}).encode("utf-8"))
        else:
            self._set_cors_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))


def run_chatbot_server(port=5001):
    server = HTTPServer(("0.0.0.0", port), ChatbotHTTPHandler)
    print(f"🤖 NER-Sentinel NVIDIA Help Chatbot Service is LIVE on http://localhost:{port} ...")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Chatbot Server.")
        server.server_close()


if __name__ == "__main__":
    port = 5001
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except Exception:
            pass
    run_chatbot_server(port)
