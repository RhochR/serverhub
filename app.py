from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)
DATA_FILE = "/data/servers.json"

DEFAULT_DATA = {
    "servers": [
        {
            "id": "1",
            "name": "Home Server",
            "url": "http://192.168.1.10:8080",
            "icon": "dns",
            "category": "homelab",
            "description": "Unraid Server",
            "color": "#6750A4"
        },
        {
            "id": "2",
            "name": "NAS",
            "url": "http://192.168.1.20",
            "icon": "storage",
            "category": "homelab",
            "description": "QNAP TS-464",
            "color": "#0061A4"
        }
    ],
    "categories": [
        {"id": "homelab", "name": "Homelab", "icon": "home"},
        {"id": "vps", "name": "VPS", "icon": "cloud"},
        {"id": "monitoring", "name": "Monitoring", "icon": "monitor_heart"},
        {"id": "services", "name": "Services", "icon": "apps"}
    ]
}

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return DEFAULT_DATA.copy()

def save_data(data):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/servers", methods=["GET"])
def get_servers():
    return jsonify(load_data())

@app.route("/api/servers", methods=["POST"])
def add_server():
    data = load_data()
    server = request.json
    import uuid
    server["id"] = str(uuid.uuid4())
    data["servers"].append(server)
    save_data(data)
    return jsonify(server), 201

@app.route("/api/servers/<server_id>", methods=["PUT"])
def update_server(server_id):
    data = load_data()
    for i, s in enumerate(data["servers"]):
        if s["id"] == server_id:
            updated = request.json
            updated["id"] = server_id
            data["servers"][i] = updated
            save_data(data)
            return jsonify(updated)
    return jsonify({"error": "Not found"}), 404

@app.route("/api/servers/<server_id>", methods=["DELETE"])
def delete_server(server_id):
    data = load_data()
    data["servers"] = [s for s in data["servers"] if s["id"] != server_id]
    save_data(data)
    return jsonify({"ok": True})

@app.route("/api/categories", methods=["POST"])
def add_category():
    data = load_data()
    cat = request.json
    import uuid
    cat["id"] = str(uuid.uuid4())
    data["categories"].append(cat)
    save_data(data)
    return jsonify(cat), 201

@app.route("/api/categories/<cat_id>", methods=["DELETE"])
def delete_category(cat_id):
    data = load_data()
    data["categories"] = [c for c in data["categories"] if c["id"] != cat_id]
    data["servers"] = [s for s in data["servers"] if s.get("category") != cat_id]
    save_data(data)
    return jsonify({"ok": True})

if __name__ == "__main__":
    if not os.path.exists(DATA_FILE):
        save_data(DEFAULT_DATA)
    app.run(host="0.0.0.0", port=5000, debug=False)
