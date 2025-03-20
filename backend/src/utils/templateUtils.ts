import type { ResumeData } from '../types/resume';
import { readFile } from 'fs/promises';
import { join } from 'path';

const TEMPLATE_DIR = join(__dirname, '..', 'templates');

export async function generateResumeHTML(
  resume: ResumeData,
  templateName: string = 'professional'
): Promise<string> {
  try {
    // Load template
    const templatePath = join(TEMPLATE_DIR, `${templateName}.html`);
    const template = await readFile(templatePath, 'utf-8');

    // Basic template variable replacement
    let html = template
      .replace('{{name}}', `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`)
      .replace('{{title}}', resume.personalInfo.title)
      .replace('{{email}}', resume.personalInfo.email)
      .replace('{{phone}}', resume.personalInfo.phone)
      .replace('{{location}}', resume.personalInfo.location)
      .replace('{{summary}}', resume.personalInfo.summary || '');

    // Generate experience section
    const experienceHTML = resume.experience.map(exp => `
      <div class="experience-item">
        <h3>${exp.title}</h3>
        <h4>${exp.company} - ${exp.location}</h4>
        <p class="date">${exp.startDate} - ${exp.endDate}</p>
        <ul>
          ${exp.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
        </ul>
      </div>
    `).join('');
    html = html.replace('{{experience}}', experienceHTML);

    // Generate education section
    const educationHTML = resume.education.map(edu => `
      <div class="education-item">
        <h3>${edu.degree}</h3>
        <h4>${edu.institution}</h4>
        <p class="date">${edu.startDate} - ${edu.endDate}</p>
        ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}
      </div>
    `).join('');
    html = html.replace('{{education}}', educationHTML);

    // Generate skills section
    const skillsHTML = resume.skills.map(skill => `
      <div class="skill-item">
        <h4>${skill.name}</h4>
        <p>${skill.keywords.join(', ')}</p>
      </div>
    `).join('');
    html = html.replace('{{skills}}', skillsHTML);

    // Generate projects section if exists
    const projectsHTML = resume.projects?.map(project => `
      <div class="project-item">
        <h3>${project.name}</h3>
        <p>${project.description}</p>
        <ul>
          ${project.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
        </ul>
      </div>
    `).join('') || '';
    html = html.replace('{{projects}}', projectsHTML);

    return html;
  } catch (error) {
    console.error('Failed to generate HTML:', error);
    throw new Error('Failed to generate resume HTML');
  }
}
