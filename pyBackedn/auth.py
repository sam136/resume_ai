from flask import Blueprint, request, jsonify
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from models import users
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = users.get(username)
    # if user and check_password_hash(user['password'], password):
    if user and user['password'] ==  password:
        token = jwt.encode({'username': username, 'exp': datetime.utcnow() + timedelta(hours=1)}, 'your_secret_key', algorithm='HS256')
        return jsonify({'token': token})
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    if username in users:
        return jsonify({'message': 'User already exists'}), 400
    users[username] = {
        'first_name': data.get('first_name'),
        'last_name': data.get('last_name'),
        # 'password': generate_password_hash(data.get('password'))
        'password': data.get('password')
    }
    return jsonify({'message': 'User registered successfully'})
