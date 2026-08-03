import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "static" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
SUBMISSIONS_FILE = DATA_DIR / "contact_submissions.json"

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _load_submissions():
    if not SUBMISSIONS_FILE.exists():
        return []
    try:
        return json.loads(SUBMISSIONS_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def _save_submission(entry: dict) -> None:
    submissions = _load_submissions()
    submissions.append(entry)
    SUBMISSIONS_FILE.write_text(
        json.dumps(submissions, indent=2), encoding="utf-8"
    )


@app.route("/")
def home():
    return render_template("index.html", current_year=datetime.now(timezone.utc).year)


@app.route("/api/contact", methods=["POST"])
def contact():
    payload = request.get_json(silent=True) or {}

    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip()
    message = (payload.get("message") or "").strip()

    errors = {}
    if len(name) < 2:
        errors["name"] = "Enter your full name."
    if not EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."
    if len(message) < 10:
        errors["message"] = "Message should be at least 10 characters."

    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    entry = {
        "name": name,
        "email": email,
        "message": message,
        "received_at": datetime.now(timezone.utc).isoformat(),
    }

    
    try:
        _save_submission(entry)
    except OSError:
        pass

    return jsonify({"ok": True, "message": "Thanks — I'll get back to you soon."})


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)
