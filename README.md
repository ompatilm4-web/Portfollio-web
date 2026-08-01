# Om Patil — Portfolio

A "query console" themed portfolio: the hero is styled like a SQL editor,
sections read like files in an editor tab bar (`about.py`, `projects.sql`,
`requirements.txt`, `activity.log`, `contact.sh`), and the contact form
really does POST to a Flask endpoint.

## Stack
- **Frontend:** HTML5, CSS (no framework), vanilla JS
- **Backend:** Flask (serves the page + a `/api/contact` JSON endpoint)

## Run locally

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open **http://127.0.0.1:8080**.

## Project structure

```
portfolio/
├── app.py                  # Flask app + /api/contact endpoint
├── requirements.txt
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    ├── js/main.js
    └── data/
        └── contact_submissions.json   # created at runtime
```

## Editing content

All the copy — project descriptions, stats, skills, contact links — lives
directly in `templates/index.html`. Update the `<article class="card">`
blocks in the `#projects` section to add or edit projects, and the
`.req-list` items in `#skills` to adjust the skills bars (the `--w` inline
style is the fill percentage).

## Contact form

`POST /api/contact` validates `name`, `email`, and `message`, then appends
the submission to `static/data/contact_submissions.json`.

**Before deploying, decide where submissions should go:**

- **Render / Railway** (persistent disk): the JSON-file approach works as-is.
- **Vercel / other serverless hosts:** the filesystem is read-only/ephemeral
  at runtime, so submissions won't persist between requests. Swap the
  `_save_submission` function in `app.py` for either:
  - a database insert (e.g. Supabase/Postgres — you already use Supabase
    in other projects), or
  - an email send (SMTP, Resend, or a service like Formspree).

## Deployment notes

- `app.py` reads the port from the `PORT` environment variable, which is
  what Render/Railway/Vercel typically inject.
- Turn `debug=True` off (or drive it from an environment variable) before
  deploying publicly.
