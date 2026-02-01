// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './layout/Header';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-content">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default Layout;

