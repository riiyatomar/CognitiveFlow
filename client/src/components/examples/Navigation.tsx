import { useState } from 'react';
import Navigation from '../Navigation';

export default function NavigationExample() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="relative h-screen bg-background">
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />
      
      {/* Example content */}
      <div className="lg:ml-80 p-6">
        <div className="max-w-2xl mx-auto text-center pt-20 lg:pt-6">
          <h2 className="text-2xl font-bold mb-4">Navigation Example</h2>
          <p className="text-muted-foreground">
            Current page: <span className="font-semibold">{currentPage}</span>
          </p>
          <p className="text-muted-foreground">
            Theme: <span className="font-semibold">{isDarkMode ? 'Dark' : 'Light'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}