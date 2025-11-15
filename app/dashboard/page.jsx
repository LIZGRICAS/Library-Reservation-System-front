// src/app/dashboard/page.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import EmailsLog from '@/components/EmailsLog';
import BooksDatabase from '@/components/BooksDatabase';
import TestSystem from '@/components/TestSystem';
import useStore from '@/store/useStore';

export default function DashboardPage() {
  const router = useRouter();
  const { activeTab, checkAuth, isAuthenticated } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Opcional: Proteger la ruta (comentar si quieres acceso sin login)
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'emails' && <EmailsLog />}
        {activeTab === 'books' && <BooksDatabase />}
        {activeTab === 'test' && <TestSystem />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs sm:text-sm text-gray-600 text-center md:text-left">
              © 2025 BiblioMail System - Gestión Inteligente de Biblioteca
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-semibold">
                FastAPI
              </span>
              <span>+</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
                LangChain
              </span>
              <span>+</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold">
                OpenAI
              </span>
              <span>+</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
                Next.js
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}