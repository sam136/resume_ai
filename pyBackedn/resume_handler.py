import requests
import json
import re
from pdfminer.high_level import extract_text
import fitz 

API_KEY = "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"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

def extract_hyperlinks(pdf_path):
    doc = fitz.open(pdf_path)
    links = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        for link in page.get_links():
            if 'uri' in link:  # Check if it's a web link
                rect = link['from']
                text = page.get_textbox(rect)  # Extract text from link area
                links.append((text.strip(), link['uri']))

    return links


def extract_json(response_text):
    """
    Extracts JSON from a string using regex.
    """
    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
    if json_match:
        json_text = json_match.group(0)
        try:
            return json.loads(json_text)
        except json.JSONDecodeError:
            return {"error": "The extracted JSON is not valid."}
    else:
        return {"error": "No valid JSON found in the response."}

def get_resume_analysis(resume_text, resume_links):
    """
    Sends resume text to the API and returns the analysis result.
    """
    prompt = f"""
You are an expert resume analyzer. You must produce valid JSON output and ensure all URLs are valid and relevant to the recommended courses. Additionally, you must tailor job roles to the candidate’s experience level. For example, if the resume indicates an entry-level or student background, include junior- or intern-level job roles (e.g., 'Data Science Intern', 'Junior Data Scientist', 'Machine Learning Intern') rather than exclusively senior positions.

Evaluation Criteria for Resume Score:
- Formatting and structure (clear sections, bullet points)
- ATS Optimization (use of industry-relevant keywords)
- Content Quality (clarity, conciseness, grammar)
- Relevance (matching skills and experience)
- Readability and presentation

Return the JSON structure as follows:
{{
    "basic_info": {{
        "name": string,
        "email": string,
        "mobile": string,
        "address": string
    }},
    "skills": {{
        "current_skills": list of at least 5 key skills,
        "recommended_skills": list of at least 5 skills for improvement
    }},
    "course_recommendations": list of at least 5 courses with details as:
    {{
        "platform": string,
        "course_name": string,
        "link": valid URL (ensure this is an active, relevant course URL)
    }},
    "appreciation": list of at least 5 personalized positive comments,
    "resume_tips": list of at least 5 suggestions for improvement,
    "resume_score": string (score in "XX/100" format),
    "ai_resume_summary": string (a concise summary for ATS optimization),
    "matching_job_roles": list of 2-3 job roles specifically relevant to the candidate’s experience level,
    "ats_keywords": list of at least 5 industry-relevant keywords,
    "project_suggestions": {{
        "improvement_tips": list of 2-3 tips to enhance existing projects,
        "new_project_recommendations": list of 2-3 suggested projects
    }}
}}

Ensure the JSON is valid before outputting.

Here is the resume text:
\"\"\"{resume_text}\"\"\"
"""

    prompt = prompt.replace('{0}', resume_text).replace('{1}', json.dumps(resume_links))

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
        "messages": [{"role": "user", "content": prompt}]
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code == 200:
        try:
            j = response.json()
            # print(j)
            raw_response = j["choices"][0]["message"]["content"]
            data = extract_json(raw_response)
            if "error" in data:
                return {"error": "No valid JSON found in API response."}
            return data
        except Exception as e:
            return {"error": f"Error during JSON extraction: {e}"}
    else:
        return {"error": f"API Error {response.status_code}: {response.text}"}


def do(uploaded_file):
    resume_text = extract_text(uploaded_file)
    resume_links = extract_hyperlinks(uploaded_file)
    return get_resume_analysis(resume_text, resume_links)