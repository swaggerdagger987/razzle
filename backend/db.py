"""
Razzle database connection module.

Single source of truth for DB connections. Uses Turso HTTP pipeline API
when TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars are set; falls back
to local SQLite for local development.
"""

import json
import os
import sqlite3
import urllib.request
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "terminal.db"

# Turso config from environment
_TURSO_URL = os.environ.get("TURSO_DATABASE_URL", "")
_TURSO_TOKEN = os.environ.get("TURSO_AUTH_TOKEN", "")


class _TursoRow:
    """Mimics sqlite3.Row — supports both index and key access."""

    def __init__(self, columns, values):
        self._columns = columns
        self._values = values
        self._map = dict(zip(columns, values))

    def __getitem__(self, key):
        if isinstance(key, int):
            return self._values[key]
        return self._map[key]

    def __contains__(self, key):
        return key in self._map

    def keys(self):
        return self._columns

    def __iter__(self):
        return iter(self._values)

    def __len__(self):
        return len(self._values)


def _decode_value(v):
    """Convert a Turso pipeline API value to a Python type."""
    if v is None or v.get("type") == "null":
        return None
    t = v.get("type", "")
    val = v.get("value")
    if t == "integer":
        return int(val)
    if t == "float":
        return float(val)
    if t == "blob":
        import base64
        return base64.b64decode(val)
    return val  # text and anything else


class _TursoCursor:
    """Mimics sqlite3.Cursor — wraps a Turso pipeline result."""

    def __init__(self, columns, rows, last_insert_rowid=None, rows_affected=0):
        self._rows = [_TursoRow(columns, row) for row in rows]
        self.description = [
            (col, None, None, None, None, None, None) for col in columns
        ] if columns else None
        self.lastrowid = last_insert_rowid
        self.rowcount = rows_affected

    def fetchone(self):
        return self._rows[0] if self._rows else None

    def fetchall(self):
        return self._rows

    def fetchmany(self, size=None):
        if size is None:
            return self._rows
        return self._rows[:size]

    def __iter__(self):
        return iter(self._rows)


class _TursoConnection:
    """Talks to Turso via its HTTP pipeline API, mimicking sqlite3.Connection."""

    def __init__(self, base_url, token):
        self._url = f"{base_url}/v3/pipeline"
        self._token = token
        self.row_factory = None  # ignored, always _TursoRow

    def _request(self, statements):
        """Send statements to Turso pipeline API and return results."""
        body = {
            "requests": [
                {"type": "execute", "stmt": s} for s in statements
            ] + [{"type": "close"}]
        }
        data = json.dumps(body).encode()
        req = urllib.request.Request(
            self._url,
            data=data,
            headers={
                "Authorization": f"Bearer {self._token}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        resp = urllib.request.urlopen(req, timeout=60)
        return json.loads(resp.read())["results"]

    def _make_stmt(self, sql, params=None):
        """Build a statement object for the pipeline API."""
        stmt = {"sql": sql}
        if params:
            stmt["args"] = [
                {"type": "null", "value": None} if v is None
                else {"type": "integer", "value": str(v)} if isinstance(v, int)
                else {"type": "float", "value": v} if isinstance(v, float)
                else {"type": "blob", "base64": __import__("base64").b64encode(v).decode()} if isinstance(v, (bytes, bytearray))
                else {"type": "text", "value": str(v)}
                for v in params
            ]
        return stmt

    def _parse_result(self, result):
        """Parse a pipeline API result into columns and decoded rows."""
        if result.get("type") == "error":
            raise Exception(result["error"].get("message", str(result["error"])))
        r = result["response"]["result"]
        columns = tuple(c["name"] for c in r.get("cols", []))
        rows = [
            tuple(_decode_value(v) for v in row)
            for row in r.get("rows", [])
        ]
        return columns, rows, r.get("last_insert_rowid"), r.get("affected_row_count", 0)

    def execute(self, sql, params=None):
        stmt = self._make_stmt(sql, list(params) if params else None)
        results = self._request([stmt])
        columns, rows, last_id, affected = self._parse_result(results[0])
        return _TursoCursor(columns, rows, last_id, affected)

    def executemany(self, sql, seq_of_params):
        stmts = [self._make_stmt(sql, list(p)) for p in seq_of_params]
        if not stmts:
            return _TursoCursor((), [])
        results = self._request(stmts)
        # Return cursor for last result
        columns, rows, last_id, affected = self._parse_result(results[-2])  # -1 is close
        return _TursoCursor(columns, rows, last_id, affected)

    def commit(self):
        pass  # HTTP is auto-commit

    def close(self):
        pass  # Stateless HTTP

    def cursor(self):
        return self

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


def _use_turso():
    """Return True if Turso credentials are available."""
    return bool(_TURSO_URL) and bool(_TURSO_TOKEN)


def get_conn():
    """Get a database connection (Turso in production, local SQLite in dev)."""
    if _use_turso():
        http_url = _TURSO_URL.replace("libsql://", "https://")
        return _TursoConnection(http_url, _TURSO_TOKEN)
    conn = sqlite3.connect(str(DB_PATH), timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    """Context manager for database connections. Always closes on exit."""
    conn = get_conn()
    try:
        yield conn
    finally:
        conn.close()


def get_write_conn():
    """Get a writable connection (used by adapters for data ingestion).

    Same as get_conn() but explicit about write intent.
    """
    return get_conn()
