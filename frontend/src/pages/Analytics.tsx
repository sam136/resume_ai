import React from 'react';
import { BarChart2, TrendingUp, Users, Calendar, Download, Filter } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <div className="flex space-x-4">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Applications</p>
              <p className="text-2xl font-semibold text-gray-900">24</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-green-600">+12.5%</span>
              <span className="ml-2 text-sm text-gray-500">from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Interview Rate</p>
              <p className="text-2xl font-semibold text-gray-900">45%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-blue-600">+5%</span>
              <span className="ml-2 text-sm text-gray-500">from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
              <p className="text-2xl font-semibold text-gray-900">3.2 days</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-yellow-600">-1.5 days</span>
              <span className="ml-2 text-sm text-gray-500">from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. ATS Score</p>
              <p className="text-2xl font-semibold text-gray-900">88%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <span className="text-sm text-purple-600">+3%</span>
              <span className="ml-2 text-sm text-gray-500">from last month</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h2>
          <div className="space-y-4">
            {['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'].map((status, index) => (
              <div key={status} className="flex items-center">
                <div className="w-32 text-sm text-gray-500">{status}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600"
                      style={{ width: `${Math.max(5, 70 - index * 15)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right text-sm text-gray-500">
                  {Math.max(1, 12 - index * 3)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Skills Matched</h2>
          <div className="space-y-4">
            {[
              { skill: 'React.js', match: 95 },
              { skill: 'TypeScript', match: 90 },
              { skill: 'Node.js', match: 85 },
              { skill: 'AWS', match: 80 },
              { skill: 'Python', match: 75 },
            ].map((item) => (
              <div key={item.skill} className="flex items-center">
                <div className="w-32 text-sm text-gray-500">{item.skill}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{ width: `${item.match}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right text-sm text-gray-500">
                  {item.match}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;