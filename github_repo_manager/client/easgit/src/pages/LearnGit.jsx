import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Book,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Check,
  ChevronRight,
  Play,
  Terminal
} from 'lucide-react';

const lessons = [
  {
    id: 1,
    title: 'Git Basics',
    description: 'Learn the fundamental concepts of Git version control',
    icon: GitBranch,
    modules: [
      {
        id: 'basics-1',
        title: 'What is Git?',
        content: 'Git is a distributed version control system that tracks changes in source code during software development.',
        exercise: {
          task: 'Initialize a new Git repository',
          command: 'git init',
          explanation: 'This command creates a new Git repository in the current directory.'
        }
      },
      {
        id: 'basics-2',
        title: 'Making Your First Commit',
        content: 'Learn how to stage and commit changes to your repository.',
        exercise: {
          task: 'Stage and commit your changes',
          command: 'git add . && git commit -m "Initial commit"',
          explanation: 'These commands stage all changes and create a commit with a message.'
        }
      }
    ]
  },
  {
    id: 2,
    title: 'Branching and Merging',
    description: 'Master the art of working with branches and merging code',
    icon: GitMerge,
    modules: [
      {
        id: 'branch-1',
        title: 'Creating Branches',
        content: 'Branches allow you to develop features isolated from each other.',
        exercise: {
          task: 'Create and switch to a new branch',
          command: 'git checkout -b feature/new-feature',
          explanation: 'This command creates a new branch and switches to it.'
        }
      },
      {
        id: 'branch-2',
        title: 'Merging Changes',
        content: 'Learn how to combine changes from different branches.',
        exercise: {
          task: 'Merge a branch into main',
          command: 'git checkout main && git merge feature/new-feature',
          explanation: 'These commands switch to main and merge the feature branch.'
        }
      }
    ]
  },
  {
    id: 3,
    title: 'Collaboration',
    description: 'Learn how to work with remote repositories and collaborate with others',
    icon: GitPullRequest,
    modules: [
      {
        id: 'collab-1',
        title: 'Working with Remotes',
        content: 'Learn how to connect to and work with remote repositories.',
        exercise: {
          task: 'Add a remote repository',
          command: 'git remote add origin https://github.com/username/repo.git',
          explanation: 'This command connects your local repository to a remote one.'
        }
      },
      {
        id: 'collab-2',
        title: 'Pull Requests',
        content: 'Understand how to create and review pull requests.',
        exercise: {
          task: 'Push changes and create a pull request',
          command: 'git push origin feature/new-feature',
          explanation: 'This command pushes your changes to the remote repository.'
        }
      }
    ]
  }
];

const CommandTerminal = ({ command, explanation }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`mt-4 rounded-lg overflow-hidden ${
      isDark ? 'bg-gray-900' : 'bg-gray-800'
    }`}>
      <div className="px-4 py-2 bg-opacity-50 border-b border-gray-700 flex items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
      </div>
      <div className="p-4">
        <code className="text-gray-100 font-mono text-sm">{command}</code>
        <p className="mt-2 text-xs text-gray-400">{explanation}</p>
      </div>
    </div>
  );
};

const ModuleCard = ({ module, isActive, onClick }) => {
  const { isDark } = useTheme();
  
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isActive
          ? isDark
            ? 'bg-gray-800 border-blue-500'
            : 'bg-white border-blue-500 shadow-sm'
          : isDark
            ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <h4 className={`text-sm font-medium ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {module.title}
        </h4>
        {isActive && (
          <Check className={`w-4 h-4 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
        )}
      </div>
    </div>
  );
};

const LearnGit = () => {
  const { isDark } = useTheme();
  const [currentLesson, setCurrentLesson] = useState(lessons[0]);
  const [currentModule, setCurrentModule] = useState(lessons[0].modules[0]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Learn Git
          </h2>
          <p className={`mt-2 text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Master Git through interactive lessons and exercises
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="space-y-4">
              {lessons.map(lesson => (
                <div key={lesson.id}>
                  <div
                    className={`flex items-center p-2 rounded-lg cursor-pointer ${
                      currentLesson.id === lesson.id
                        ? isDark
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-900'
                        : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setCurrentModule(lesson.modules[0]);
                    }}
                  >
                    <lesson.icon className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">{lesson.title}</span>
                  </div>
                  {currentLesson.id === lesson.id && (
                    <div className="mt-2 ml-7 space-y-1">
                      {lesson.modules.map(module => (
                        <div
                          key={module.id}
                          className={`flex items-center px-2 py-1 rounded text-sm cursor-pointer ${
                            currentModule.id === module.id
                              ? isDark
                                ? 'text-blue-400'
                                : 'text-blue-600'
                              : isDark
                                ? 'text-gray-400 hover:text-white'
                                : 'text-gray-600 hover:text-gray-900'
                          }`}
                          onClick={() => setCurrentModule(module)}
                        >
                          <ChevronRight className="w-4 h-4 mr-1" />
                          {module.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className={`p-6 rounded-lg border ${
              isDark
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {currentModule.title}
              </h3>
              <p className={`text-base mb-6 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {currentModule.content}
              </p>

              <div className={`mt-8 p-4 rounded-lg ${
                isDark ? 'bg-gray-900/50' : 'bg-gray-50'
              }`}>
                <h4 className={`text-sm font-medium mb-2 flex items-center ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Play className="w-4 h-4 mr-2" />
                  Practice Exercise
                </h4>
                <p className={`text-sm mb-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {currentModule.exercise.task}
                </p>
                <CommandTerminal
                  command={currentModule.exercise.command}
                  explanation={currentModule.exercise.explanation}
                />
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => {
                    const currentIndex = currentLesson.modules.findIndex(m => m.id === currentModule.id);
                    if (currentIndex > 0) {
                      setCurrentModule(currentLesson.modules[currentIndex - 1]);
                    } else {
                      const prevLessonIndex = lessons.findIndex(l => l.id === currentLesson.id) - 1;
                      if (prevLessonIndex >= 0) {
                        const prevLesson = lessons[prevLessonIndex];
                        setCurrentLesson(prevLesson);
                        setCurrentModule(prevLesson.modules[prevLesson.modules.length - 1]);
                      }
                    }
                  }}
                  disabled={currentLesson.id === 1 && currentModule.id === lessons[0].modules[0].id}
                  className={`px-4 py-2 rounded-lg ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const currentIndex = currentLesson.modules.findIndex(m => m.id === currentModule.id);
                    if (currentIndex < currentLesson.modules.length - 1) {
                      setCurrentModule(currentLesson.modules[currentIndex + 1]);
                    } else {
                      const nextLessonIndex = lessons.findIndex(l => l.id === currentLesson.id) + 1;
                      if (nextLessonIndex < lessons.length) {
                        const nextLesson = lessons[nextLessonIndex];
                        setCurrentLesson(nextLesson);
                        setCurrentModule(nextLesson.modules[0]);
                      }
                    }
                  }}
                  disabled={
                    currentLesson.id === lessons.length &&
                    currentModule.id === lessons[lessons.length - 1].modules[lessons[lessons.length - 1].modules.length - 1].id
                  }
                  className={`px-4 py-2 rounded-lg ${
                    isDark
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Next
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
