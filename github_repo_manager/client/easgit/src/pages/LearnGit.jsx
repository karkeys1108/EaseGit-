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
  Terminal,
  Globe,
  Users,
  Code,
  ShieldCheck,
  Settings,
  Star
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
        content: 'Git is a distributed version control system that tracks changes in source code during software development. It was created by Linus Torvalds in 2005 and has become the standard for version control in modern software development.',
        command: 'git --version',
        explanation: 'This command verifies Git is installed and shows the version number.'
      },
      {
        id: 'basics-2',
        title: 'Configuration',
        content: 'Before you start using Git, you need to configure your identity which will be attached to your commits.',
        command: 'git config --global user.name "Your Name"\ngit config --global user.email "your.email@example.com"',
        explanation: 'These commands set your username and email address for all Git repositories on your system.'
      },
      {
        id: 'basics-3',
        title: 'Initializing a Repository',
        content: 'To start tracking a project with Git, you need to initialize a repository in your project directory.',
        command: 'git init',
        explanation: 'This command creates a new Git repository in the current directory by creating a hidden .git folder to store all Git metadata.'
      },
      {
        id: 'basics-4',
        title: 'Making Your First Commit',
        content: 'Learn how to stage and commit changes to your repository. Commits are snapshots of your project at a specific point in time.',
        command: 'git add .\ngit commit -m "Initial commit"',
        explanation: 'The first command stages all changes in the current directory. The second creates a commit with the message "Initial commit".'
      }
    ]
  },
  {
    id: 2,
    title: 'Working with GitHub',
    description: 'Learn how to use GitHub to host and share your Git repositories',
    icon: Globe,
    modules: [
      {
        id: 'github-1',
        title: 'What is GitHub?',
        content: 'GitHub is a web-based platform that uses Git for version control. It provides additional features like issue tracking, wikis, and pull requests that enhance collaboration.',
        command: 'git remote -v',
        explanation: 'This command lists all remote repositories connected to your local repository.'
      },
      {
        id: 'github-2',
        title: 'Creating a GitHub Account',
        content: 'To use GitHub, you need to create an account on github.com. Once registered, you can create repositories, contribute to others\' projects, and more.',
        command: 'ssh-keygen -t ed25519 -C "your.email@example.com"',
        explanation: 'Generates an SSH key to securely communicate with GitHub without entering your password each time.'
      },
      {
        id: 'github-3',
        title: 'Creating a Repository',
        content: 'GitHub allows you to create repositories through their web interface. You can create public repositories that anyone can see, or private repositories with limited access.',
        command: 'git remote add origin https://github.com/username/repo-name.git',
        explanation: 'This command connects your local repository to a GitHub repository using HTTPS.'
      },
      {
        id: 'github-4',
        title: 'Pushing to GitHub',
        content: 'After creating commits locally, you can push them to GitHub to back up your work and make it accessible to others.',
        command: 'git push -u origin main',
        explanation: 'Pushes your commits to the main branch on GitHub and sets up tracking for that branch.'
      }
    ]
  },
  {
    id: 3,
    title: 'Branching and Merging',
    description: 'Master the art of working with branches and merging code',
    icon: GitMerge,
    modules: [
      {
        id: 'branch-1',
        title: 'Creating Branches',
        content: 'Branches allow you to develop features isolated from each other. They are lightweight and easy to create in Git.',
        command: 'git branch feature/new-feature\ngit checkout feature/new-feature\n\n# Or in one step:\ngit checkout -b feature/new-feature',
        explanation: 'These commands create a new branch and switch to it. The one-step version does both operations at once.'
      },
      {
        id: 'branch-2',
        title: 'Switching Branches',
        content: 'You can work on multiple branches and switch between them as needed without affecting other branches.',
        command: 'git checkout main\n\n# In newer Git versions:\ngit switch main',
        explanation: 'These commands switch to the main branch. The "switch" command is a newer alternative to "checkout" for changing branches.'
      },
      {
        id: 'branch-3',
        title: 'Merging Changes',
        content: 'When you\'ve completed work in a branch, you can merge it into another branch to incorporate the changes.',
        command: 'git checkout main\ngit merge feature/new-feature',
        explanation: 'These commands switch to the main branch and merge the feature branch into it.'
      },
      {
        id: 'branch-4',
        title: 'Resolving Conflicts',
        content: 'Sometimes Git can\'t automatically merge changes, resulting in conflicts that you need to resolve manually.',
        command: '# After seeing a conflict message:\ngit status\n\n# After resolving conflicts in the files:\ngit add <resolved-file>\ngit commit -m "Resolved merge conflict"',
        explanation: 'These commands show conflicted files, and then commit the resolved changes after you\'ve edited the files.'
      }
    ]
  },
  {
    id: 4,
    title: 'Pull Requests',
    description: 'Learn how to contribute to projects using GitHub pull requests',
    icon: GitPullRequest,
    modules: [
      {
        id: 'pr-1',
        title: 'What are Pull Requests?',
        content: 'Pull requests (PRs) are a GitHub feature that allows developers to propose changes to a repository. They\'re the main way contributors collaborate on GitHub.',
        command: 'git push origin feature/new-feature',
        explanation: 'This pushes your feature branch to GitHub, which you\'ll need before creating a pull request in the web interface.'
      },
      {
        id: 'pr-2',
        title: 'Creating a Pull Request',
        content: 'After pushing a branch to GitHub, you can create a pull request through the web interface to propose merging it into another branch, typically main.',
        command: '# No command needed - done through GitHub\'s web interface\n# After creating the PR, you might update it with:\ngit push origin feature/new-feature',
        explanation: 'Pull requests are created on GitHub\'s website. Additional commits pushed to the same branch will automatically update the PR.'
      },
      {
        id: 'pr-3',
        title: 'Reviewing Pull Requests',
        content: 'Code review is an important part of the pull request process. Reviewers can comment on code, request changes, or approve the pull request.',
        command: '# To check out someone else\'s PR locally:\ngit fetch origin pull/ID/head:BRANCHNAME\ngit checkout BRANCHNAME',
        explanation: 'These commands let you fetch and check out someone else\'s PR to test it locally. Replace ID with the PR number and BRANCHNAME with a name for your local branch.'
      },
      {
        id: 'pr-4',
        title: 'Merging Pull Requests',
        content: 'Once a pull request has been approved, it can be merged into the target branch. GitHub offers different merge strategies like merge commits, squashing, or rebasing.',
        command: '# Most PRs are merged through GitHub\'s interface\n# To merge locally after approval:\ngit checkout main\ngit merge --no-ff feature/new-feature\ngit push origin main',
        explanation: 'These commands create a merge commit locally and push it to GitHub. The --no-ff flag ensures a merge commit is created even if fast-forward is possible.'
      }
    ]
  },
  {
    id: 5,
    title: 'Collaboration',
    description: 'Learn advanced collaboration techniques on GitHub',
    icon: Users,
    modules: [
      {
        id: 'collab-1',
        title: 'Forking Repositories',
        content: 'Forking creates a copy of someone else\'s repository in your GitHub account, allowing you to freely experiment without affecting the original project.',
        command: '# Done through GitHub interface\n# To clone your fork:\ngit clone https://github.com/your-username/forked-repo.git',
        explanation: 'After forking through GitHub\'s interface, this command downloads your fork to your local machine.'
      },
      {
        id: 'collab-2',
        title: 'Working with Upstream',
        content: 'When working with a fork, you often want to keep it in sync with the original repository, referred to as "upstream".',
        command: 'git remote add upstream https://github.com/original-owner/original-repo.git\ngit fetch upstream\ngit checkout main\ngit merge upstream/main',
        explanation: 'These commands add the original repo as "upstream", fetch its changes, and merge them into your local main branch.'
      },
      {
        id: 'collab-3',
        title: 'GitHub Issues',
        content: 'GitHub Issues is a tracking system integrated with your repository. Issues can represent bugs, feature requests, tasks, or other work items.',
        command: '# No command - done through GitHub web interface\n# But you can reference issues in commits:\ngit commit -m "Fix login bug, closes #42"',
        explanation: 'Including "closes #42" in a commit message will automatically close issue #42 when the commit is merged into the default branch.'
      },
      {
        id: 'collab-4',
        title: 'GitHub Projects',
        content: 'GitHub Projects provides kanban-style board functionality to manage work. Projects can be linked to repositories and automatically track issues and PRs.',
        command: '# No command - managed through GitHub web interface',
        explanation: 'GitHub Projects is configured and used entirely through GitHub\'s web interface.'
      }
    ]
  },
  {
    id: 6,
    title: 'Advanced GitHub',
    description: 'Master advanced GitHub features and workflows',
    icon: Star,
    modules: [
      {
        id: 'adv-1',
        title: 'GitHub Actions',
        content: 'GitHub Actions is an automation platform that allows you to create workflows that automatically build, test, and deploy your code right from GitHub.',
        command: '# Example workflow file (.github/workflows/ci.yml):\nname: CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v3\n    - run: npm test',
        explanation: 'This is a simple GitHub Actions workflow file that runs npm test whenever code is pushed or a pull request is created.'
      },
      {
        id: 'adv-2',
        title: 'GitHub Pages',
        content: 'GitHub Pages is a hosting service for static websites directly from your GitHub repository. It\'s perfect for documentation, portfolios, or project pages.',
        command: '# To configure a GitHub Pages site:\ngit checkout --orphan gh-pages\ngit rm -rf .\necho "# My Project Page" > index.md\ngit add index.md\ngit commit -m "Initial GitHub Pages commit"\ngit push origin gh-pages',
        explanation: 'These commands create a separate branch called gh-pages, remove all content, add a simple markdown file, and push it to GitHub to activate GitHub Pages.'
      },
      {
        id: 'adv-3',
        title: 'GitHub Packages',
        content: 'GitHub Packages is a package hosting service that allows you to host your packages privately or publicly and use packages as dependencies in your projects.',
        command: '# Example for publishing an npm package:\nnpm config set registry=https://npm.pkg.github.com/OWNER\nnpm login --registry=https://npm.pkg.github.com/\nnpm publish',
        explanation: 'These commands configure npm to use GitHub Packages registry, log in, and publish a package.'
      },
      {
        id: 'adv-4',
        title: 'GitHub Codespaces',
        content: 'GitHub Codespaces provides cloud-hosted development environments right from your repository, allowing you to code, test, and debug in your browser or using VS Code.',
        command: '# Codespaces is accessed through GitHub\'s interface\n# Example devcontainer.json configuration:\n{\n  "image": "mcr.microsoft.com/devcontainers/universal:2",\n  "features": {\n    "ghcr.io/devcontainers/features/node:1": {}\n  }\n}',
        explanation: 'This is a basic configuration file for a GitHub Codespace that uses a universal image and adds Node.js support.'
      }
    ]
  },
  {
    id: 7,
    title: 'GitHub Security',
    description: 'Learn how to keep your GitHub projects secure',
    icon: ShieldCheck,
    modules: [
      {
        id: 'sec-1',
        title: 'Dependabot Alerts',
        content: 'Dependabot alerts notify you when vulnerabilities are detected in your repository\'s dependencies, helping you keep your project secure.',
        command: '# Enable through GitHub interface\n# Example dependabot.yml file:\nversion: 2\nupdates:\n  - package-ecosystem: "npm"\n    directory: "/"\n    schedule:\n      interval: "weekly"',
        explanation: 'This configuration file sets up Dependabot to check npm dependencies weekly and create pull requests for updates.'
      },
      {
        id: 'sec-2',
        title: 'Secret Scanning',
        content: 'GitHub automatically scans repositories for known types of secrets, such as API keys and tokens, to prevent fraudulent use of credentials that were accidentally committed.',
        command: '# No command - enabled automatically for some repositories\n# To configure patterns:\n# Create .github/secret_scanning.yml',
        explanation: 'Secret scanning is enabled by default for public repositories or with GitHub Advanced Security. Custom patterns can be configured in a YAML file.'
      },
      {
        id: 'sec-3',
        title: 'Code Scanning',
        content: 'GitHub\'s code scanning uses CodeQL to analyze your code for vulnerabilities and coding errors. It integrates with GitHub Actions to provide security alerts.',
        command: '# Example workflow file (.github/workflows/codeql.yml):\nname: "CodeQL"\non: [push, pull_request]\njobs:\n  analyze:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v3\n    - uses: github/codeql-action/init@v2\n    - uses: github/codeql-action/analyze@v2',
        explanation: 'This GitHub Actions workflow sets up CodeQL analysis to scan your code for security vulnerabilities whenever you push or create a pull request.'
      },
      {
        id: 'sec-4',
        title: 'Security Policies',
        content: 'A security policy tells people how to report security vulnerabilities in your project. This helps establish a responsible disclosure process.',
        command: '# Create a SECURITY.md file:\n# Example content:\n## Security Policy\n\n### Reporting a Vulnerability\nPlease email security@example.com to report vulnerabilities.',
        explanation: 'Creating a SECURITY.md file in your repository provides guidelines for reporting security vulnerabilities in your project.'
      }
    ]
  }
];

const CommandTerminal = ({ command, explanation }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`mt-4 rounded-lg overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-slate-100'} shadow-md transition-all duration-200`}>
      <div className={`px-4 py-2 bg-opacity-50 border-b ${isDark ? 'border-gray-700' : 'border-slate-200'} flex items-center`}>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
      </div>
      <div className="p-4">
        <pre className={`font-mono text-sm whitespace-pre-wrap ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>{command}</pre>
        <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{explanation}</p>
      </div>
    </div>
  );
};

const LearnGitHub = () => {
  const { isDark } = useTheme();
  const [currentLesson, setCurrentLesson] = useState(lessons[0]);
  const [currentModule, setCurrentModule] = useState(lessons[0].modules[0]);

  return (
    <div className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Learn GitHub
          </h2>
          <p className={`mt-2 text-base sm:text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Master Git and GitHub through comprehensive tutorials
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className={`space-y-2 p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white shadow-sm border border-gray-100'}`}>
              {lessons.map(lesson => (
                <div key={lesson.id}>
                  <div
                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentLesson.id === lesson.id
                        ? isDark
                          ? 'bg-gray-800 text-white'
                          : 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                          : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setCurrentModule(lesson.modules[0]);
                    }}
                  >
                    <lesson.icon className={`w-5 h-5 mr-2 ${
                      currentLesson.id === lesson.id && !isDark ? 'text-blue-600' : ''
                    }`} />
                    <span className="text-sm font-medium">{lesson.title}</span>
                  </div>
                  {currentLesson.id === lesson.id && (
                    <div className="ml-6 mt-1 space-y-1">
                      {lesson.modules.map(module => (
                        <div
                          key={module.id}
                          className={`flex items-center px-2 py-1 rounded text-sm cursor-pointer transition-all duration-200 ${
                            currentModule.id === module.id
                              ? isDark
                                ? 'text-blue-400'
                                : 'text-blue-700 font-medium'
                              : isDark
                                ? 'text-gray-400 hover:text-white'
                                : 'text-slate-600 hover:text-blue-600'
                          }`}
                          onClick={() => setCurrentModule(module)}
                        >
                          <ChevronRight className={`w-3 h-3 mr-1 ${
                            currentModule.id === module.id && !isDark ? 'text-blue-600' : ''
                          }`} />
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
          <div className="lg:col-span-8 xl:col-span-9">
            <div className={`p-4 sm:p-6 rounded-lg ${
              isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white shadow-sm border border-gray-100'
            }`}>
              <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {currentModule.title}
              </h3>
              <p className={`text-sm sm:text-base mb-6 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                {currentModule.content}
              </p>

              <div className={`mt-6 sm:mt-8 p-4 rounded-lg ${
                isDark ? 'bg-gray-900/50' : 'bg-slate-50 border border-slate-200'
              }`}>
                <h4 className={`text-sm font-medium mb-2 flex items-center ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  <Terminal className={`w-4 h-4 mr-2 ${!isDark ? 'text-blue-600' : ''}`} />
                  Command Reference
                </h4>
                <CommandTerminal
                  command={currentModule.command}
                  explanation={currentModule.explanation}
                />
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3">
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
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-all duration-200 ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
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
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-all duration-200 ${
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

export default LearnGitHub;