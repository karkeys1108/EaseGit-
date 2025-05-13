import React from 'react';
import { HelpCircle, Tag, ExternalLink, GitPullRequest } from 'lucide-react';

const IssueCard = ({ title, repository, difficulty, tags }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 hover:border-blue-300 transition-colors">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-1">{repository}</p>
      </div>
      <span className={`
        px-3 py-1 rounded-full text-sm font-medium
        ${difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
      `}>
        {difficulty}
      </span>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <Tag className="h-4 w-4 text-gray-400" />
      <div className="flex gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="mt-4 pt-4 border-t flex justify-between items-center">
      <button className="text-blue-600 hover:text-blue-700 flex items-center">
        <GitPullRequest className="h-4 w-4 mr-2" />
        View Issue
      </button>
      <button className="text-gray-500 hover:text-gray-600">
        <ExternalLink className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const FirstIssues = () => {
  const issues = [
    {
      id: 1,
      title: 'Add Documentation to Python Project',
      repository: 'openai/gym',
      difficulty: 'Easy',
      tags: ['documentation', 'python']
    },
    {
      id: 2,
      title: 'Fix Typo in README',
      repository: 'tensorflow/tensorflow',
      difficulty: 'Very Easy',
      tags: ['documentation', 'quick-fix']
    },
    {
      id: 3,
      title: 'Add Unit Tests for Utils',
      repository: 'facebook/react',
      difficulty: 'Easy',
      tags: ['testing', 'javascript']
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen ml-72">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <HelpCircle className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 ml-3">First Issues</h1>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Contribute?</h2>
          <p className="text-blue-100 mb-6">
            We've curated a list of beginner-friendly issues from popular open source projects.
            These are perfect for your first contribution!
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              How to Contribute
            </button>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-400 transition-colors">
              View Tutorial
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.map(issue => (
            <IssueCard key={issue.id} {...issue} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button className="inline-flex items-center text-blue-600 hover:text-blue-700">
            Load More Issues
            <ExternalLink className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstIssues;
