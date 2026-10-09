import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/layout/Footer';

const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pt-16">
      {children}
    </main>
    <Footer />
  </div>
);

export default PublicLayout;
