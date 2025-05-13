import React from 'react';
import { Home, Code, Book, HelpCircle, Settings, GitBranch } from 'lucide-react';

const NavItem = ({ icon: Icon, label, page, activePage, setActivePage }) => (
  <li>
    <button 
      onClick={() => setActivePage(page)}
      className={`w-full flex items-center py-3 px-4 text-left hover:bg-blue-800/50 rounded-lg transition-all duration-200 ${
        activePage === page ? 'bg-blue-700 shadow-lg' : ''
      }`}
    >
      <Icon className="mr-3 h-5 w-5" /> 
      <span className="font-medium">{label}</span>
    </button>
  </li>
);

const Sidebar = ({ activePage, setActivePage }) => {
  return (
    <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6 shadow-xl">
      <div className="mb-10">
        <h1 className="text-2xl font-bold flex items-center">
          <GitBranch className="mr-3 h-7 w-7" /> 
          <span className="bg-gradient-to-r from-blue-200 to-blue-100 bg-clip-text text-transparent">
            EasGit
          </span>
        </h1>
        <p className="text-blue-200 mt-2 text-sm">Simple Git Management</p>
      </div>
      <nav>
        <ul className="space-y-2">
          <NavItem icon={Home} label="Dashboard" page="dashboard" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={Code} label="Repo Wizard" page="repo-wizard" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={Book} label="Learn Git" page="learn" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={HelpCircle} label="First Issues" page="issues" activePage={activePage} setActivePage={setActivePage} />
          <NavItem icon={Settings} label="Settings" page="settings" activePage={activePage} setActivePage={setActivePage} />
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
