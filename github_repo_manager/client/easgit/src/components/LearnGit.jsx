import React, { useState } from 'react';
import { Book, HelpCircle, Search, ChevronRight } from 'lucide-react';

const GIT_TERMS = {
  'commit': {
    title: 'Git Commit',
    description: 'A commit is a snapshot of your project at a specific point in time, recording changes to your repository.',
    example: 'git commit -m "Add new feature"'
  },
  'branch': {
    title: 'Git Branch',
    description: 'A branch is a parallel version of a repository, allowing you to work on different parts of a project without affecting the main branch.',
    example: 'git branch feature/new-feature'
  },
  'clone': {
    title: 'Git Clone',
    description: 'Cloning creates a local copy of a remote repository on your computer, allowing you to work on the project locally.',
    example: 'git clone https://github.com/username/repository.git'
  },
  'merge': {
    title: 'Git Merge',
    description: 'Merging combines changes from different branches, integrating the work from one branch into another.',
    example: 'git merge feature/new-feature'
  },
  'pull request': {
    title: 'Pull Request',
    description: 'A pull request is a way to suggest changes from one branch to another, allowing code review and discussion before merging.',
    example: 'Created through GitHub interface'
  }
};

const TermCard = ({ term, title, description, example }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 hover:border-blue-300 transition-colors">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="bg-gray-50 rounded-lg p-4">
      <code className="text-sm text-blue-600 font-mono">{example}</code>
    </div>
  </div>
);

const LearnGit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(null);

  const filteredTerms = Object.entries(GIT_TERMS).filter(([term]) =>
    term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen ml-72">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Book className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 ml-3">Learn Git</h1>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Git terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTerms.map(([term, details]) => (
            <TermCard
              key={term}
              term={term}
              title={details.title}
              description={details.description}
              example={details.example}
            />
          ))}
        </div>

        <div className="mt-12">
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
            <div className="flex items-start">
              <div className="p-3 bg-blue-100 rounded-lg">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Need More Help?</h3>
                <p className="mt-2 text-gray-600">
                  Check out our interactive tutorials or join our community for more support.
                </p>
                <button className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
                  View Tutorials
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnGit;
