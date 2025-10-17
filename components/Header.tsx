
import React from 'react';

interface HeaderProps {
    isLoggedIn: boolean;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout }) => {
  return (
    <header className="bg-primary shadow-lg">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
         <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h1 className="text-2xl font-bold text-neutral">
              GitHub Actions Runner Monitor
            </h1>
        </div>
        {isLoggedIn && (
            <button
                onClick={onLogout}
                className="bg-secondary hover:bg-red-700/50 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
                Logout
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;
