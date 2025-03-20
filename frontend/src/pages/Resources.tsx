import React from 'react';
import { BookOpen, Play, FileText, Download, ExternalLink } from 'lucide-react';

const resources = [
  {
    category: 'Resume Writing Guides',
    items: [
      {
        title: 'Crafting an ATS-Friendly Resume',
        type: 'Article',
        duration: '10 min read',
        icon: FileText,
      },
      {
        title: 'Resume Writing Best Practices',
        type: 'Video',
        duration: '15 min',
        icon: Play,
      },
      {
        title: 'Industry-Specific Templates',
        type: 'Templates',
        duration: '5 templates',
        icon: Download,
      },
    ],
  },
  {
    category: 'Interview Preparation',
    items: [
      {
        title: 'Common Interview Questions',
        type: 'Guide',
        duration: '20 min read',
        icon: BookOpen,
      },
      {
        title: 'Technical Interview Prep',
        type: 'Course',
        duration: '2 hours',
        icon: Play,
      },
      {
        title: 'Behavioral Interview Tips',
        type: 'Article',
        duration: '12 min read',
        icon: FileText,
      },
    ],
  },
];

const Resources = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Browse All Resources
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((category) => (
          <div key={category.category} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h2>
              <div className="space-y-4">
                {category.items.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <item.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">{item.type}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{item.duration}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All {category.category} →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Need personalized guidance?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Book a session with our career experts for personalized resume review and career advice.
            </p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Book Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resources;