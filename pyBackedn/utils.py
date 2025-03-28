from flask import request, jsonify
import jwt
from functools import wraps

def token_required(f):
    @wraps(f)  # Preserve the original function's metadata
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, 'your_secret_key', algorithms=['HS256'])
            print(f"F: {data}")
            current_user = data['username']
        except Exception as e:
            print(e)
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated
