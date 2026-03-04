from flask import Flask, render_template_string
from flask_socketio import SocketIO
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return "<h1>FADI GOLD CHAT</h1><p>الشات شغال!</p>"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    socketio.run(app, host='0.0.0.0', port=port)
