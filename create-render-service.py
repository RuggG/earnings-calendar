#!/usr/bin/env python3
import os
import requests
import json

RENDER_API_KEY = os.getenv("RENDER_API_KEY")
if not RENDER_API_KEY:
    print("Error: RENDER_API_KEY not set")
    exit(1)

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Content-Type": "application/json"
}

# Create service payload
payload = {
    "type": "web_service",
    "name": "earnings-calendar",
    "ownerId": "tea-d3ggubvfte5s73c4rlm0",
    "repo": "https://github.com/RuggG/earnings-calendar",
    "branch": "main",
    "autoDeploy": "no",
    "serviceDetails": {
        "env": "node",
        "region": "oregon",
        "plan": "starter",
        "buildCommand": "npm install && npm run build",
        "startCommand": "npm run start",
        "healthCheckPath": "/api/health",
        "envSpecificDetails": {
            "buildCommand": "npm install && npm run build",
            "startCommand": "npm run start"
        }
    }
}

print("Creating Render service...")
print(json.dumps(payload, indent=2))

response = requests.post(
    "https://api.render.com/v1/services",
    headers=headers,
    json=payload
)

print(f"\nStatus: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code in [200, 201]:
    service = response.json()
    print(f"\n✅ Service created successfully!")
    print(f"Service ID: {service.get('id')}")
    print(f"Dashboard URL: {service.get('dashboardUrl')}")
else:
    print(f"\n❌ Failed to create service")
