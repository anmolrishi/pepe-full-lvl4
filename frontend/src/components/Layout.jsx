import React from 'react';
import VerticalNavbar from './VerticalNavbar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <VerticalNavbar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;