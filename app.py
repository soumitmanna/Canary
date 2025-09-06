

from flask import Flask, request, jsonify, session
from flask_session import Session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import time
import requests  # Needed for Mailinator API calls

# --------------------------
# Config
# --------------------------
MAILINATOR_API_KEY = "YOUR_MAILINATOR_API_KEY"  # Replace with your actual key
DEMO_USER_ID = 1  # Hardcoded demo user for the magic button

app = Flask(__name__)
app.secret_key = "supersecretkey"

app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
Session(app)

# --------------------------
# Database initialization
# --------------------------
def init_db():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    """)

    # Aliases table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS aliases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            alias_email TEXT UNIQUE NOT NULL,
            source_site TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Alerts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Checked emails table to avoid duplicate alerts
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS checked_emails (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alias_id INTEGER NOT NULL,
            message_id TEXT NOT NULL UNIQUE,
            FOREIGN KEY (alias_id) REFERENCES aliases (id)
        )
    """)

    conn.commit()
    conn.close()

init_db()

# --------------------------
# User Authentication Routes
# --------------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    password_hash = generate_password_hash(password)

    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (email, password_hash) VALUES (?, ?)", (email, password_hash))
        conn.commit()
        conn.close()
    except sqlite3.IntegrityError:
        return jsonify({"error": "User already exists"}), 400

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, password_hash FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user[1], password):
        session["user_id"] = user[0]
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"error": "Invalid email or password"}), 401

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})

@app.route("/profile", methods=["GET"])
def profile():
    if "user_id" in session:
        return jsonify({"user_id": session["user_id"]})
    return jsonify({"error": "Not logged in"}), 401

# --------------------------
# Aliases & Alerts
# --------------------------
@app.route("/aliases", methods=["POST"])
def create_alias():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json()
    source_site = data.get("source_site")
    if not source_site:
        return jsonify({"error": "source_site is required"}), 400

    # Generate Mailinator alias
    alias_email = f"alias_{session['user_id']}_{int(time.time())}@mailinator.com"

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO aliases (user_id, alias_email, source_site) VALUES (?, ?, ?)",
                   (session["user_id"], alias_email, source_site))
    cursor.execute("INSERT INTO alerts (user_id, message, risk_level) VALUES (?, ?, ?)",
                   (session["user_id"], f"New alias created: {alias_email}", "low"))
    conn.commit()
    conn.close()

    return jsonify({"message": "Alias created", "alias_email": alias_email})

@app.route("/alerts", methods=["GET"])
def get_alerts():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, message, risk_level, timestamp FROM alerts WHERE user_id = ?", (session["user_id"],))
    alerts = cursor.fetchall()
    conn.close()

    alerts_list = [{"id": a[0], "message": a[1], "risk_level": a[2], "timestamp": a[3]} for a in alerts]
    return jsonify(alerts_list)

# --------------------------
# Manual Canary Checker
# --------------------------
@app.route("/check_aliases", methods=["POST"])
def check_aliases():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session["user_id"]

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, alias_email, source_site FROM aliases WHERE user_id = ?", (user_id,))
    aliases = cursor.fetchall()

    new_alerts = []

    for alias in aliases:
        alias_id, alias_email, source_site = alias
        local_part = alias_email.split("@")[0]

        try:
            headers = {"Authorization": f"Bearer {MAILINATOR_API_KEY}"}
            url = f"https://api.mailinator.com/v2/domains/public/inboxes/{local_part}"
            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                data = response.json()
                messages = data.get("messages", [])

                for msg in messages:
                    msg_id = msg.get("id")
                    cursor.execute("SELECT 1 FROM checked_emails WHERE message_id = ?", (msg_id,))
                    if cursor.fetchone():
                        continue  # Already alerted

                    alert_msg = f"ALERT: Your alias for '{source_site}' just received an email. This service may have been breached."
                    cursor.execute("INSERT INTO alerts (user_id, message, risk_level) VALUES (?, ?, ?)",
                                   (user_id, alert_msg, "high"))
                    cursor.execute("INSERT INTO checked_emails (alias_id, message_id) VALUES (?, ?)",
                                   (alias_id, msg_id))
                    new_alerts.append(alert_msg)

        except Exception as e:
            print(f"Error checking alias {alias_email}: {e}")

    conn.commit()
    conn.close()

    return jsonify({"status": "check_complete", "new_alerts": new_alerts})

# --------------------------
# Demo Magic Button
# --------------------------
@app.route("/trigger_demo_alert", methods=["POST"])
def trigger_demo_alert():
    demo_alert_msg = "DEMO ALERT: This is a high-priority test alert!"
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO alerts (user_id, message, risk_level) VALUES (?, ?, ?)",
                   (DEMO_USER_ID, demo_alert_msg, "high"))
    conn.commit()
    conn.close()
    return jsonify({"status": "demo_alert_triggered"})

# --------------------------
if __name__ == "__main__":
    app.run(debug=True)