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
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold">
                <span className="text-[#00BCD4]">PLAI</span>
              </span>
              <span className="text-xl transform scale-x-[-1]">🪽</span>
              <span className="text-2xl font-bold text-gray-800">MAKER</span>
              <span className="text-xl">🪽</span>
            </div>
          </div>
          <nav className="text-sm text-gray-600">
            Turn ideas into reality with AI
          </nav>
        </div>
      </div>
    </header>
  );
};