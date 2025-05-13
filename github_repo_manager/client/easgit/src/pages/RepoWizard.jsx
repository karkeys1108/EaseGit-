import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const RepoWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    hasReadme: true,
    gitignoreTemplate: 'Node',
    license: 'mit'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/repos/create', formData, {
        headers: {
          Authorization: `token ${token}`
        }
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating repository:', error);
      setError(error.response?.data?.error || 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Repository Wizard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <div 
                key={stepNumber}
                className={`w-1/3 text-center ${
                  stepNumber < step ? 'text-green-500' : 
                  stepNumber === step ? 'text-blue-500 font-bold' : 
                  'text-gray-400'
                } dark:text-gray-300`}
              >
                Step {stepNumber}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-500 h-2.5 rounded-full" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : nextStep}>
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Basic Information</h2>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Repository Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Description (optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="3"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Private Repository
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Repository Setup</h2>
              <div className="mb-4">
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="hasReadme"
                    checked={formData.hasReadme}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Initialize with README
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  .gitignore template
                </label>
                <select
                  name="gitignoreTemplate"
                  value={formData.gitignoreTemplate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Node">Node</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="Ruby">Ruby</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  License
                </label>
                <select
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="mit">MIT License</option>
                  <option value="apache-2.0">Apache License 2.0</option>
                  <option value="gpl-3.0">GNU GPLv3</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Review & Create</h2>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <h3 className="font-semibold dark:text-white">{formData.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{formData.description || 'No description'}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>• {formData.isPrivate ? 'Private' : 'Public'} repository</p>
                  <p>• {formData.hasReadme ? 'With' : 'Without'} README</p>
                  <p>• .gitignore: {formData.gitignoreTemplate === 'none' ? 'None' : formData.gitignoreTemplate}</p>
                  <p>• License: {formData.license === 'none' ? 'None' : formData.license}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ml-auto"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Repository'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepoWizard;
