import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from utils import token_required
from resume_storage import ResumeStorage
import resume_handler as rh

resume_bp = Blueprint('resume', __name__)

UPLOAD_FOLDER = './'
ALLOWED_EXTENSIONS = {'pdf'}

resume_storage = ResumeStorage('resumes.json')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@resume_bp.route('/resume/<string:id>', methods=['GET'])
def get_resume(id):
    resume = resume_storage.get_resume(id)
    if not resume:
        return jsonify({'message': 'Resume not found'}), 404
    return jsonify({'resumeId': id, 'responseDict': resume})

@resume_bp.route('/resume/<int:id>', methods=['DELETE'])
@token_required
def delete_resume(current_user, id):
    if resume_storage.delete_resume(id):
        return jsonify({'message': 'Resume deleted successfully'})
    return jsonify({'message': 'Resume not found'}), 404

@resume_bp.route('/resume/<int:id>', methods=['PATCH'])
@token_required
def update_resume(current_user, id):
    data = request.json
    if resume_storage.update_resume(id, data):
        return jsonify({'message': 'Resume updated successfully'})
    return jsonify({'message': 'Resume not found'}), 404

@resume_bp.route('/upload-resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        data = request.form.to_dict()
        new_id = request.form.get('resumeId', None)
        if not new_id:
            new_id = resume_storage.generate_new_id()
        
        # Process the resume file (e.g., extract data)
        res = rh.do(file_path)
        resume_storage.add_resume(new_id, res)
        
        return jsonify({'resumeId': new_id, 'filePath': file_path, 'responseDict': data, 'data': res})
    
    return jsonify({'message': 'Invalid file type. Only PDF files are allowed.'}), 400

@resume_bp.route('/get-resumes', methods=['GET'])
@token_required
def get_resumes(current_user):
    return jsonify(resume_storage.get_all_resumes())
