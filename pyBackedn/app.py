from flask import Flask
from flask_cors import CORS
from auth import auth_bp
from resume import resume_bp
from job import job_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
CORS(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/')
app.register_blueprint(resume_bp, url_prefix='/')
app.register_blueprint(job_bp, url_prefix='/')

if __name__ == '__main__':
    app.run(debug=True,port=8000)
