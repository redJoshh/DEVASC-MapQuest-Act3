"""
MapQuest Directions API wrapper (Flask).

Keeps the lab's logic (statuscode 0 / 402 / 611 checks, maneuvers list) but
returns JSON for the React frontend instead of printing to the console.
The API key stays on the server and is never sent to the browser, which is
also why we no longer print the request URL like the lab did (it contained the key).
"""
import os
from flask import Flask
from dotenv import load_dotenv

# Read backend/.env into the environment before anything looks up the key.
# This lets each developer keep their own key locally, while .gitignore keeps
# it out of the repo. Only .env.example (with an empty value) is committed.
load_dotenv()
app = Flask(__name__)

# The same Directions endpoint the lab used. It lives here, in one place, so
# the browser never needs to know it: React talks only to our Flask API.
MAIN_API = 'https://www.mapquestapi.com/directions/v2/route'

# Read once at startup. It may be None if .env is missing. We don't crash here,
# so the server still starts and can later return a clear error message
# instead of a stack trace.
KEY = os.getenv('MAPQUEST_KEY')


if __name__ == '__main__':
    # Port 5000 is what the Vite dev proxy forwards /api requests to.
    # debug=True gives auto-reload and readable tracebacks during development.
    # It must never be enabled in production.
    app.run(debug=True, port=5000)
