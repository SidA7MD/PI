// src/components/Layout.jsx
import React from 'react';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-page">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

