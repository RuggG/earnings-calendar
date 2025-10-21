#!/usr/bin/env python3
import os
import requests

RENDER_API_KEY = os.getenv("RENDER_API_KEY")
SERVICE_ID = "srv-d3rr7t0gjchc73d52rdg"

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Content-Type": "application/json"
}

response = requests.post(
    f"https://api.render.com/v1/services/{SERVICE_ID}/deploys",
    headers=headers,
    json={"clearCache": "do_not_clear"}
)

print(f"Status: {response.status_code}")
print(response.text)
