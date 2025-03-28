from flask import Blueprint, request, jsonify
from utils import token_required
from models import jobs

job_bp = Blueprint('job', __name__)

@job_bp.route('/save-job/<int:jobId>', methods=['POST'])
@token_required
def save_job(current_user, jobId):
    data = request.json
    jobs[jobId] = data
    return jsonify({'message': 'Job saved successfully'})

@job_bp.route('/save-job/<int:jobId>', methods=['DELETE'])
@token_required
def delete_job(current_user, jobId):
    if jobId in jobs:
        del jobs[jobId]
        return jsonify({'message': 'Job deleted successfully'})
    return jsonify({'message': 'Job not found'}), 404
