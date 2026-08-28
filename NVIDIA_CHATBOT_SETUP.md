# 🤖 NVIDIA NIM Help & Navigation Chatbot Setup Guide

This guide describes how to run the standalone **NVIDIA NIM-powered In-App Help & Navigation Chatbot** for the **NER-Sentinel** platform.

---

## 🏗️ Architecture Overview

```
User Browser (Web Dashboard on Port 3000)
    │
    ├──▶ Standalone NVIDIA Chatbot (Port 5001 - nvidia_help_chatbot.py)
    │        │
    │        └──▶ NVIDIA NIM API (Llama-3.1-8B-Instruct via cloud)
    │
    └──▶ Multi-Satellite & LLM Disaster Engine (Port 8000 / 8001 - llm_app.py)
```

- **Separation of Concerns:** `nvidia_help_chatbot.py` (Port 5001) is strictly for **user navigation, page directions, and feature guidance**. It does not interfere with your local trained disaster prediction models (`llm_app.py` / `northeast_flood_predictor.py`).

---

## 🚀 Quick Start (1 Command)

### 1️⃣ Start the Chatbot Service:
In your VS Code terminal:
```powershell
cd "c:\Users\KIIT\Desktop\resQVerse\NER-Sentinel"
python nvidia_help_chatbot.py 5001
```

### 2️⃣ (Optional) Add Your NVIDIA NIM API Key:
1. Get a free API key at [build.nvidia.com](https://build.nvidia.com/).
2. Set it in your terminal or in a `.env` file:
```powershell
$env:NVIDIA_API_KEY="nvapi-your-key-here"
python nvidia_help_chatbot.py 5001
```
*(Note: If no API key is provided, the chatbot uses built-in smart navigational intelligence and will still guide the user with 100% accuracy).*

---

## 💬 Features Available in the Chatbot Widget

1. **Floating Action Button (`🤖`):** Located at the bottom-right corner across all dashboard pages.
2. **Quick Prompt Chips:**
   - *"Where do I report a hazard?"* ➔ Points user to `/report-hazard`.
   - *"How to view the 3D map?"* ➔ Explains the 3D WebGL terrain on `/`.
   - *"How to coordinate rescue teams?"* ➔ Points user to `/response-coordination`.
   - *"Where can I change language?"* ➔ Points user to `/settings`.
3. **Multi-turn Context:** Retains conversation context for natural follow-up questions.
