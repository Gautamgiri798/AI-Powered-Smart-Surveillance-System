"""
SQLite3 database layer for SentinelVision.
Provides helper functions for users, cameras, and events tables.
"""
import sqlite3
import json
import threading
from config import Config

_local = threading.local()


def get_conn():
    """Get a thread-local SQLite3 connection."""
    if not hasattr(_local, "conn") or _local.conn is None:
        _local.conn = sqlite3.connect(Config.SQLITE_DB, check_same_thread=False)
        _local.conn.row_factory = sqlite3.Row
        _local.conn.execute("PRAGMA journal_mode=WAL")
        _local.conn.execute("PRAGMA foreign_keys=ON")
    return _local.conn


def init_db():
    """Create tables, indexes, and seed default data."""
    conn = get_conn()
    cur = conn.cursor()

    # ── Users table ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT    UNIQUE NOT NULL,
            password_hash TEXT  NOT NULL,
            role        TEXT    NOT NULL DEFAULT 'viewer',
            full_name   TEXT    DEFAULT ''
        )
    """)

    # ── Cameras table ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS cameras (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            camera_id   TEXT    UNIQUE NOT NULL,
            name        TEXT    NOT NULL,
            location    TEXT    DEFAULT '',
            rtsp_url    TEXT    DEFAULT '',
            status      TEXT    DEFAULT 'inactive',
            type        TEXT    DEFAULT 'rtsp'
        )
    """)

    # ── Events table ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            camera_id       TEXT    NOT NULL,
            event_type      TEXT    NOT NULL,
            severity        TEXT    NOT NULL DEFAULT 'info',
            severity_level  INTEGER DEFAULT 0,
            description     TEXT    DEFAULT '',
            metadata        TEXT    DEFAULT '{}',
            frame_url       TEXT,
            timestamp       TEXT    NOT NULL,
            acknowledged    INTEGER DEFAULT 0
        )
    """)

    cur.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_events_camera    ON events(camera_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_events_severity  ON events(severity)")

    conn.commit()

    # ── Seed default admin user ──
    from utils.auth_utils import hash_password
    existing = cur.execute("SELECT id FROM users WHERE username = ?", ("admin",)).fetchone()
    if not existing:
        cur.execute(
            "INSERT INTO users (username, password_hash, role, full_name) VALUES (?, ?, ?, ?)",
            ("admin", hash_password("admin123"), "admin", "System Administrator")
        )
        conn.commit()
        print("[DB] 👤 Default admin user created (admin / admin123)")

    # ── Seed primary cameras ──
    # Re-mapped indices for the user's laptop: 0 is Integrated, 1 is Iriun
    cur.execute("DELETE FROM cameras")
    sample_cameras = [
        ("cam_1", "System Camera", "Laptop Integrated", "0", "active", "usb"),
        ("cam_2", "Iriun Webcam",  "Secondary Source",  "1", "active", "usb"),
    ]
    cur.executemany(
        "INSERT INTO cameras (camera_id, name, location, rtsp_url, status, type) VALUES (?, ?, ?, ?, ?, ?)",
        sample_cameras
    )
    conn.commit()
    print("[DB] 📷 Dual-Camera system initialized (System + USB)")

    print(f"[DB] ✅ SQLite3 database initialized — {Config.SQLITE_DB}")


# ═══════════════════════════════════════════
#  USER helpers
# ═══════════════════════════════════════════

def get_user_by_username(username):
    """Return user dict or None."""
    row = get_conn().execute(
        "SELECT * FROM users WHERE username = ?", (username,)
    ).fetchone()
    return dict(row) if row else None


def create_user(username, password_hash, role="viewer", full_name=""):
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO users (username, password_hash, role, full_name) VALUES (?, ?, ?, ?)",
        (username, password_hash, role, full_name)
    )
    conn.commit()
    return cur.lastrowid


def user_exists(username):
    row = get_conn().execute(
        "SELECT 1 FROM users WHERE username = ?", (username,)
    ).fetchone()
    return row is not None


def update_user_password(username, new_password_hash):
    """Update user password. Returns True on success."""
    conn = get_conn()
    cur = conn.execute(
        "UPDATE users SET password_hash = ? WHERE username = ?",
        (new_password_hash, username)
    )
    conn.commit()
    return cur.rowcount > 0


# ═══════════════════════════════════════════
#  CAMERA helpers
# ═══════════════════════════════════════════

def get_all_cameras():
    rows = get_conn().execute("SELECT * FROM cameras").fetchall()
    return [dict(r) for r in rows]


def get_camera(camera_id):
    row = get_conn().execute(
        "SELECT * FROM cameras WHERE camera_id = ?", (camera_id,)
    ).fetchone()
    return dict(row) if row else None


def camera_exists(camera_id):
    row = get_conn().execute(
        "SELECT 1 FROM cameras WHERE camera_id = ?", (camera_id,)
    ).fetchone()
    return row is not None


def create_camera(camera_id, name, location, rtsp_url="", status="active", cam_type="rtsp"):
    conn = get_conn()
    conn.execute(
        "INSERT INTO cameras (camera_id, name, location, rtsp_url, status, type) VALUES (?, ?, ?, ?, ?, ?)",
        (camera_id, name, location, rtsp_url, status, cam_type)
    )
    conn.commit()


def update_camera(camera_id, **fields):
    """Update camera fields. Returns True if a row was updated."""
    allowed = {"name", "location", "rtsp_url", "status", "type"}
    updates = {k: v for k, v in fields.items() if k in allowed}
    if not updates:
        return False
    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values()) + [camera_id]
    conn = get_conn()
    cur = conn.execute(f"UPDATE cameras SET {set_clause} WHERE camera_id = ?", values)
    conn.commit()
    return cur.rowcount > 0


def delete_camera(camera_id):
    conn = get_conn()
    cur = conn.execute("DELETE FROM cameras WHERE camera_id = ?", (camera_id,))
    conn.commit()
    return cur.rowcount > 0


# ═══════════════════════════════════════════
#  EVENT helpers
# ═══════════════════════════════════════════

def create_event(camera_id, event_type, severity, severity_level,
                 description, metadata_dict=None, frame_url=None, timestamp=""):
    """Insert an event and return its row id."""
    conn = get_conn()
    cur = conn.execute(
        """INSERT INTO events
           (camera_id, event_type, severity, severity_level, description, metadata, frame_url, timestamp, acknowledged)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)""",
        (
            camera_id,
            event_type,
            severity,
            severity_level,
            description,
            json.dumps(metadata_dict or {}),
            frame_url,
            timestamp,
        )
    )
    conn.commit()
    return cur.lastrowid


def get_events(limit=50, camera_id=None, severity=None):
    """Return recent events as list of dicts."""
    query = "SELECT * FROM events WHERE 1=1"
    params = []
    if camera_id:
        query += " AND camera_id = ?"
        params.append(camera_id)
    if severity:
        query += " AND severity = ?"
        params.append(severity)
    query += " ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)

    rows = get_conn().execute(query, params).fetchall()
    events = []
    for r in rows:
        d = dict(r)
        d["_id"] = str(d.pop("id"))          # Frontend expects _id
        d["acknowledged"] = bool(d["acknowledged"])
        try:
            d["metadata"] = json.loads(d["metadata"])
        except (json.JSONDecodeError, TypeError):
            d["metadata"] = {}
        events.append(d)
    return events


def get_event_stats():
    """Aggregate event counts by severity."""
    conn = get_conn()
    rows = conn.execute(
        "SELECT severity, COUNT(*) as cnt FROM events GROUP BY severity"
    ).fetchall()

    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    for r in rows:
        sev = r["severity"]
        if sev in severity_counts:
            severity_counts[sev] = r["cnt"]

    total = sum(severity_counts.values())
    unack = conn.execute(
        "SELECT COUNT(*) FROM events WHERE acknowledged = 0"
    ).fetchone()[0]

    return {
        "total_events": total,
        "by_severity": severity_counts,
        "unacknowledged": unack,
    }


def acknowledge_event(event_id):
    """Mark an event as acknowledged. Returns True on success."""
    conn = get_conn()
    cur = conn.execute(
        "UPDATE events SET acknowledged = 1 WHERE id = ?", (int(event_id),)
    )
    conn.commit()
    return cur.rowcount > 0


def clear_all_events():
    """Delete all events. Returns count deleted."""
    conn = get_conn()
    cur = conn.execute("DELETE FROM events")
    conn.commit()
    return cur.rowcount


def delete_event(event_id):
    """Delete a specific event by ID. Returns True if a row was deleted."""
    conn = get_conn()
    cur = conn.execute("DELETE FROM events WHERE id = ?", (int(event_id),))
    conn.commit()
    return cur.rowcount > 0
