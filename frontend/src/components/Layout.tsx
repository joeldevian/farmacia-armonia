import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ user, onLogout }) => {
  return (
    <div className="app-layout">
      <Sidebar onLogout={onLogout} />
      <div className="main-content-wrapper">
        <Header user={user} />
        <main className="main-content">
          <Outlet /> {/* This is where the routed pages will be rendered */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
