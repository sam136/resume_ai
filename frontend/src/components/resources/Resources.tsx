import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  imageUrl?: string;
}

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Categories for filtering
  const categories = ['all', 'interview', 'resume', 'career', 'technical'];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // Make API call to fetch resources
        const response = await api.get<Resource[]>('/resources');
        setResources(response.data);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Filter resources by category
  const filteredResources = activeCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === activeCategory);

  if (loading) return <div className="text-center py-10">Loading resources...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Career Resources</h1>
      
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full ${
                activeCategory === category 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {filteredResources.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No resources found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <div key={resource.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md">
              {resource.imageUrl && (
                <div className="h-40 overflow-hidden">
                  <img 
                    src={resource.imageUrl} 
                    alt={resource.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full mb-2">
                  {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                </span>
                <h2 className="text-xl font-semibold mb-2">{resource.title}</h2>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <a 
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  View Resource
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
