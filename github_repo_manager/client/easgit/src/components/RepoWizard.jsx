import React, { useState } from 'react';
import { GitBranch, FileText, Check, ChevronRight } from 'lucide-react';

const Step = ({ number, title, description, isActive, isCompleted }) => (
  <div className={`flex items-start ${isActive ? 'opacity-100' : 'opacity-60'}`}>
    <div className={`
      flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full
      ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-600' : 'bg-gray-300'}
    `}>
      {isCompleted ? (
        <Check className="h-5 w-5 text-white" />
      ) : (
        <span className="text-white font-medium">{number}</span>
      )}
    </div>
    <div className="ml-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-600">{description}</p>
    </div>
  </div>
);

const RepoWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    repoName: '',
    description: '',
    isPrivate: false,
    readme: '',
    license: 'mit'
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="p-8 bg-gray-50 min-h-screen ml-72">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <GitBranch className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 ml-3">Repository Wizard</h1>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg border border-blue-100">
          <div className="space-y-8 mb-8">
            <Step
              number={1}
              title="Basic Information"
              description="Name your repository and add a description"
              isActive={currentStep === 1}
              isCompleted={currentStep > 1}
            />
            <Step
              number={2}
              title="README Setup"
              description="Create a professional README file"
              isActive={currentStep === 2}
              isCompleted={currentStep > 2}
            />
            <Step
              number={3}
              title="License & Settings"
              description="Choose a license and configure repository settings"
              isActive={currentStep === 3}
              isCompleted={currentStep > 3}
            />
            <Step
              number={4}
              title="Review & Create"
              description="Review your settings and create the repository"
              isActive={currentStep === 4}
              isCompleted={currentStep > 4}
            />
          </div>

          <div className="mt-8 pt-8 border-t">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    name="repoName"
                    value={formData.repoName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="my-awesome-project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your project..."
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Make this repository private
                  </label>
                </div>
              </div>
            )}

            {/* Add other step content here */}

            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={nextStep}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                {currentStep === 4 ? 'Create Repository' : 'Next'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoWizard;
