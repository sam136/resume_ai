import os
from flask import Blueprint, json, request, jsonify
from werkzeug.utils import secure_filename
from utils import token_required
from models import resumes
import resume_handler as rh

resume_bp = Blueprint('resume', __name__)

UPLOAD_FOLDER = './'
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

data ='{"basicInfo": {"name": "Samarth Chauhan", "email": "samarthchauhan7@gmail.com", "mobile": "+91 9426824765", "address": "Gujarat, India"}, "atsScore": "85/100", "aiResumeSummary": "A highly motivated and skilled Software Engineer with experience in Flutter development and a strong foundation in various programming languages and technologies. Proven ability to develop and optimize applications, integrate payment gateways, and work with databases. Demonstrated leadership and organizational skills through involvement in tech clubs and competitions. Eager to contribute to innovative projects and continuously expand skill set.", "relevantSkillsScore": [{"skill": "Flutter", "score": 90}, {"skill": "Python", "score": 85}, {"skill": "Golang", "score": 80}, {"skill": "API Integration", "score": 80}, {"skill": "Database Management (MongoDB, MySQL, SQLite)", "score": 75}, {"skill": "Git", "score": 85}, {"skill": "REST API", "score": 80}, {"skill": "Dart", "score": 80}, {"skill": "Docker", "score": 75}, {"skill": "FastAPI", "score": 70}], "jobLevelScore": [{"level": "Entry Level", "score": 90}, {"level": "Junior", "score": 85}], "careerGrowthTrajectory": [{"currentRole": "Software Engineer", "nextRole": "Junior Software Engineer / Backend Engineer", "futureRoles": ["Software Engineer", "Senior Software Engineer", "Technical Lead", "Engineering Manager"], "suggestions": ["Focus on gaining experience in backend development with Golang and Python.", "Contribute to open-source projects to showcase skills and build a public portfolio.", "Seek mentorship from experienced engineers.", "Network with professionals in your field.", "Develop a specialization (e.g., backend, mobile, DevOps)."]}], "matchingJobRoles": ["Junior Software Engineer", "Flutter Developer", "Backend Engineer", "Full Stack Developer (Entry Level)", "Software Developer Intern", "Mobile Application Developer"], "atsKeywords": ["Flutter", "Golang", "Python", "Dart", "C/C++", "Git", "Docker", "REST API", "RabbitMQ", "GraphQL", "FastAPI", "FlaskAPI", "Firebase", "NodeJS", "BeautifulSoup", "SQLite", "MySQL", "MongoDB", "API Integration", "UX/UI", "State Management", "Payment Gateway", "Mobile Development", "Software Engineer", "Backend Development", "Load Balancer", "Telegram Bot"], "skills": {"currentSkills": ["Flutter", "Golang", "Python", "Dart", "C/C++", "Git", "Docker", "REST API", "RabbitMQ", "GraphQL", "FastAPI", "FlaskAPI", "Firebase", "NodeJS", "BeautifulSoup", "SQLite", "MySQL", "MongoDB", "TFLite"], "recommendedSkills": ["Cloud Computing (AWS, Azure, or GCP)", "Testing frameworks (e.g., Jest, Pytest)", "CI/CD pipelines", "Advanced Database Skills", "Kubernetes", "Network Fundamentals"]}, "courseRecommendations": [{"platform": "Coursera", "course_name": "Google Cloud Platform Fundamentals: Core Infrastructure", "link": "https://www.coursera.org/learn/gcp-fundamentals"}, {"platform": "Udacity", "course_name": "Full Stack Web Development Nanodegree", "link": "https://www.udacity.com/course/full-stack-web-developer-nanodegree--nd004"}, {"platform": "KodeKloud", "course_name": "Docker Training Course", "link": "https://kodekloud.com/courses/docker-for-the-absolute-beginner/"}, {"platform": "MongoDB University", "course_name": "MongoDB Node.js Developer Path", "link": "https://learn.mongodb.com/track/mongodb-nodejs-developer"}, {"platform": "Udemy", "course_name": "Flutter & Dart - The Complete Guide [2024 Edition]", "link": "https://www.udemy.com/course/flutter-and-dart-the-complete-flutter-app-development-course/"}], "appreciation": ["Demonstrates strong initiative and experience with Flutter.", "Projects showcase a diverse skill set and practical application.", "Active involvement in university clubs provides leadership experience.", "Possesses a solid foundation in various programming languages and tools.", "The resume is well-organized and easy to read."], "resumeTips": ["Quantify your accomplishments using metrics, such as performance improvements or user engagement.", "Tailor the resume for each job application, highlighting the most relevant skills and experiences for that specific role.", "Provide more context with a more descriptive bullet points, clarifying your role and impact, avoiding overly vague language such as \'worked on various modules\'.", "Consider adding a professional summary or objective statement at the beginning to highlight your key skills and career goals.", "Review all the links and ensure their functionality (GitHub and LinkedIn)."], "projectSuggestions": {"improvementTips": ["Add more detailed explanations for project contributions, including the technologies used and challenges faced.", "Include metrics for project performance (e.g., improved efficiency, user acceptance) and size of impact.", "Showcase project deployments or live demos (if applicable) for easy viewing.", "Focus more on the specific role and achievements inside the team for the projects"], "newProjectRecommendations": ["Build a full-stack web application using a popular framework like React or Angular, coupled with a backend developed on nodeJS / golang", "Contribute to open-source projects on GitHub to demonstrate coding skills.", "Develop a mobile app with Flutter.", "Build a microservice architecture using Docker and Kubernetes", "Create a CI/CD pipeline with tools such as Jenkins "]}}'

@resume_bp.route('/resume/<string:id>', methods=['GET'])
def get_resume(id):
    d = json.loads(data)
    return jsonify(d)
    resume = resumes.get(id)
    if not resume:
        return jsonify({'message': 'Resume not found'}), 404
    return jsonify({'resumeId': id, 'responseDict': resume})

@resume_bp.route('/resume/<int:id>', methods=['DELETE'])
@token_required
def delete_resume(current_user, id):
    if id in resumes:
        del resumes[id]
        return jsonify({'message': 'Resume deleted successfully'})
    return jsonify({'message': 'Resume not found'}), 404

@resume_bp.route('/resume/<int:id>', methods=['PATCH'])
@token_required
def update_resume(current_user, id):
    data = request.json
    if id in resumes:
        resumes[id].update(data)
        return jsonify({'message': 'Resume updated successfully'})
    return jsonify({'message': 'Resume not found'}), 404

@resume_bp.route('/upload-resume', methods=['POST'])
def upload_resume():
    print(request.form)
    if 'resume' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Optionally, save metadata or additional data
        data = request.form.to_dict()
        new_id = max(resumes.keys(), default=0) + 1
        resumes[new_id] = {'file_path': file_path, **data}
        
        res = rh.do(file_path)

        return jsonify({'resumeId': request.form.get('resumeId','-1'), 'filePath': file_path, 'responseDict': data,'data': res})
    
    return jsonify({'message': 'Invalid file type. Only PDF files are allowed.'}), 400

@resume_bp.route('/get-resumes', methods=['GET'])
@token_required
def get_resumes(current_user):
    return jsonify([{'resumeId': id, 'responseDict': resume} for id, resume in resumes.items()])
