import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ResumeData } from '../../types';
import SectionEditor from './SectionEditor';

interface ResumeFormProps {
  data: Partial<ResumeData>;
  onChange: (data: Partial<ResumeData>) => void;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange }) => {
  const handleSectionChange = (section: keyof ResumeData, value: any) => {
    onChange({ ...data, [section]: value });
  };

  const addListItem = (section: 'experience' | 'education' | 'projects') => {
    const newItem = {
      id: crypto.randomUUID(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      highlights: [],
      keywords: [],
    };

    handleSectionChange(section, [...(data[section] || []), newItem]);
  };

  const removeListItem = (section: 'experience' | 'education' | 'projects', id: string) => {
    handleSectionChange(
      section,
      (data[section] || []).filter(item => item.id !== id)
    );
  };

  return (
    <div className="space-y-8">
      <SectionEditor
        title="Personal Information"
        data={data.personalInfo}
        onChange={value => handleSectionChange('personalInfo', value)}
        fields={[
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Phone', type: 'tel', required: true },
          { name: 'location', label: 'Location', type: 'text', required: true },
          { name: 'title', label: 'Professional Title', type: 'text', required: true },
          { name: 'summary', label: 'Professional Summary', type: 'textarea' },
          { name: 'website', label: 'Website', type: 'url' },
          { name: 'linkedin', label: 'LinkedIn', type: 'url' },
          { name: 'github', label: 'GitHub', type: 'url' },
        ]}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Experience</h2>
          <button
            type="button"
            onClick={() => addListItem('experience')}
            className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </button>
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="relative">
            <button
              type="button"
              onClick={() => removeListItem('experience', exp.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <SectionEditor
              data={exp}
              onChange={value => {
                handleSectionChange(
                  'experience',
                  data.experience?.map(e => (e.id === exp.id ? value : e))
                );
              }}
              fields={[
                { name: 'title', label: 'Job Title', type: 'text', required: true },
                { name: 'company', label: 'Company', type: 'text', required: true },
                { name: 'location', label: 'Location', type: 'text', required: true },
                { name: 'startDate', label: 'Start Date', type: 'month', required: true },
                { name: 'endDate', label: 'End Date', type: 'month' },
                { name: 'highlights', label: 'Highlights', type: 'list' },
                { name: 'keywords', label: 'Keywords', type: 'tags' },
              ]}
            />
          </div>
        ))}
      </div>

      {/* Similar sections for Education and Projects */}
    </div>
  );
};

export default ResumeForm;
