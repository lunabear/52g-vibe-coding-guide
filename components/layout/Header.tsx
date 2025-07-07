import React from 'react';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={`border-b bg-white ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <h1 className="text-xl font-semibold">PRD Generator</h1>
          </div>
          <nav className="text-sm text-gray-600">
            MISO와 함께 완벽한 PRD를 만들어보세요
          </nav>
        </div>
      </div>
    </header>
  );
};