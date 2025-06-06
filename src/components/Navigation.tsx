import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PieChart, Shield, Upload } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/risk-assessment', label: 'Risk Assessment', icon: Shield },
    { path: '/portfolio-import', label: 'Import Portfolio', icon: Upload },
  ];

  return (
    <nav className="bg-[#242424] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <PieChart className="h-8 w-8 text-indigo-400" />
            <span className="text-xl font-bold text-white">NexGrow</span>
          </Link>
          
          <div className="flex space-x-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === path
                    ? 'bg-indigo-900 text-indigo-300'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;