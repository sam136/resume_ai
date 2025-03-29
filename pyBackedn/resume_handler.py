import requests
import json
import re
from pdfminer.high_level import extract_text
import fitz 
import google.generativeai as genai

# Replace with your Gemini API key
API_KEY = "AIzaSyAhnIwkj3nVTWP3arBxz63GL1LI6_Srr4A"

# Configure the Gemini SDK
genai.configure(api_key=API_KEY)

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
    Sends resume text to the Gemini API and returns the analysis result.
    """
    try:
        # Load prompt template from file
        with open("prompt", "r") as f:
            prompt = f.read()
        
        # Replace placeholders with actual content
        prompt = prompt.replace('{0}', resume_text).replace('{1}', json.dumps(resume_links))
        
        # Initialize the Gemini model (using Gemini 1.5 Flash)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        # Extract the text from the response
        raw_response = response.text
        
        # Extract JSON from the response text
        data = extract_json(raw_response)
        
        if "error" in data:
            return {"error": "No valid JSON found in API response."}
        
        return data
    
    except Exception as e:
        return {"error": f"Error during API request or JSON extraction: {e}"}


def do(uploaded_file):
    resume_text = extract_text(uploaded_file)
    resume_links = extract_hyperlinks(uploaded_file)
    return get_resume_analysis(resume_text, resume_links)