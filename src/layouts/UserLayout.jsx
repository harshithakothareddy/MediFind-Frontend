import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/layout/Footer';

const UserLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#f0fdf4]">
    <Navbar />
    <main className="flex-1 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

export default UserLayout;
