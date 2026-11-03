# Setup guide

You need **Python 3** (with `pip`) and **Node.js 20.19+ or 22.12+** (Vite 8's
minimum), plus a MapQuest API key from <https://developer.mapquest.com/>.

The app runs as two processes, so use **two terminals**.

## Terminal 1: backend (Flask, port 5000)

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

| Shell                | Command                        |
| -------------------- | ------------------------------ |
| Git Bash (Windows)   | `source venv/Scripts/activate` |
| PowerShell (Windows) | `venv\Scripts\Activate.ps1`    |
| macOS / Linux        | `source venv/bin/activate`     |

Then:

```bash
pip install -r requirements.txt
cp .env.example .env          # PowerShell: Copy-Item .env.example .env
```

Open `backend/.env` and put your key after `MAPQUEST_KEY=`. Never commit this
file; `.gitignore` already excludes it.

```bash
python app.py
```

Expected output includes `Running on http://127.0.0.1:5000`. Leave it running.

## Terminal 2: frontend (Vite, port 5173)

```bash
cd frontend
npm ci
npm run dev
```

`npm ci` installs exactly the versions in `package-lock.json` without changing it.
Open <http://localhost:5173>. Vite forwards `/api/...` to Flask on
`127.0.0.1:5000` (see [decisions/002-vite-proxy.md](decisions/002-vite-proxy.md)).

## Quick check

- <http://localhost:5173> shows the ROUTE page.
- `curl -i "http://127.0.0.1:5000/api/route?from=Washington,%20DC&to=Baltimore,%20MD"` returns `200`.
- `npm run lint` in `frontend/` reports no errors.

## Testing the API-key errors

`load_dotenv()` never overrides a variable that is already set in the
environment. So you can test the key errors **without editing, opening or
showing `.env`**: stop Flask (Ctrl+C) and start it with a temporary value.

**Rejected key** → `500 "MapQuest rejected the API key…"`

```bash
# Git Bash / macOS / Linux
MAPQUEST_KEY=not-a-real-key python app.py
```
```powershell
# PowerShell (clear it afterwards with: Remove-Item Env:MAPQUEST_KEY)
$env:MAPQUEST_KEY = "not-a-real-key"; python app.py
```

**Missing key** → `500 "Server is missing the MapQuest API key…"`

```bash
# Git Bash / macOS / Linux: an empty value counts as missing
MAPQUEST_KEY= python app.py
```

PowerShell can't hold an empty variable (setting it to `""` deletes it, and
`.env` would then load), so run the missing-key test from Git Bash.

**No internet** → `502 "Could not reach MapQuest…"`: disconnect from the network,
or point Python at a closed proxy for one run:

```bash
HTTPS_PROXY=http://127.0.0.1:9 python app.py
```

Restart with plain `python app.py` afterwards. Your `.env` key was never changed.

## Troubleshooting

| Symptom | Cause / fix |
| ------- | ----------- |
| Every `/api/route` call returns Flask's 404 page | An old Flask process is still running on port 5000 with older code. Stop it and restart `python app.py`. |
| "Cannot reach the server. Make sure the backend is running." | Flask isn't running in terminal 1, or it crashed. Check that terminal. |
| `Address already in use` on port 5000 | Another program uses port 5000. Stop it; the Vite proxy expects Flask on 5000. |
| "Server is missing the MapQuest API key" | `backend/.env` is missing or `MAPQUEST_KEY=` is empty. Restart Flask after fixing it; the key is read once at startup. |
| `ModuleNotFoundError: flask` | The virtual environment isn't active, or `pip install -r requirements.txt` wasn't run in it. |
| 404 for `/favicon.svg` in DevTools | Expected: `index.html` links a favicon that the project doesn't include (see README backlog). |
