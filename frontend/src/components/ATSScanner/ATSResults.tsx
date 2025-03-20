import React from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { ATSResultsProps } from './types';
import clsx from 'clsx';

const ATSResults: React.FC<ATSResultsProps> = ({ score, className }) => {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={clsx('space-y-6', className)}>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">ATS Analysis Results</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Overall Score</div>
            <div className={clsx('text-3xl font-bold', getScoreColor(score.overall))}>
              {score.overall}%
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Job Match</div>
            <div className={clsx('text-3xl font-bold', getScoreColor(score.jobMatch.score))}>
              {score.jobMatch.score}%
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Format Score</div>
            <div className={clsx('text-3xl font-bold', getScoreColor(score.sections.format.score))}>
              {score.sections.format.score}%
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Keywords Analysis</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <div className="font-medium">Matched Keywords</div>
                  <div className="text-sm text-gray-600">
                    {score.sections.keywords.matches.join(', ')}
                  </div>
                </div>
              </div>
              {score.sections.keywords.missing.length > 0 && (
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-1" />
                  <div>
                    <div className="font-medium">Missing Keywords</div>
                    <div className="text-sm text-gray-600">
                      {score.sections.keywords.missing.join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h3>
            <div className="space-y-3">
              {score.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertCircle className={clsx('h-5 w-5 mt-1', {
                    'text-red-500': rec.priority === 'high',
                    'text-yellow-500': rec.priority === 'medium',
                    'text-blue-500': rec.priority === 'low',
                  })} />
                  <div>
                    <div className="font-medium">{rec.message}</div>
                    <div className="text-sm text-gray-600">{rec.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ATSResults;
