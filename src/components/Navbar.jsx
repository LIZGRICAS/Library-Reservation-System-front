'use client';

import { useState, useEffect } from 'react';
import { Mail, Activity, Inbox, BookOpen, Send, Menu, X, RefreshCw, LogIn, LogOut } from 'lucide-react';
import useStore from '@/store/useStore';
import { useRouter } from 'next/navigation'; // ← CORRECTO en Next.js 13/14

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeTab, setActiveTab, refreshAll, isAuthenticated, logout, checkAuth } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter(); // ← Ya no da error

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      logout();
      alert('✅ Sesión cerrada exitosamente');
      router.push('/login'); // ← Redirección correcta
    }
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'emails', label: 'Correos Procesados', icon: Inbox },
    { id: 'books', label: 'Base de Datos', icon: BookOpen },
    { id: 'test', label: 'Probar Sistema', icon: Send },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-indigo-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-indigo-600 p-2 sm:p-3 rounded-xl">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">BiblioMail System</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Gestión de Biblioteca por Correo Electrónico
                </p>
              </div>
            </div>

            {/* Right-side actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>

              <div className="hidden md:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-100 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-600">Sistema Activo</span>
              </div>

              {/* Login / Logout button */}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar sesión</span>
                </button>
              ) : (
                <button
                  onClick={handleLoginRedirect}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar sesión</span>
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Desktop */}
      <nav className="hidden md:block bg-white shadow-sm border-b sticky top-[88px] sm:top-[104px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Navigation - Mobile */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-b shadow-lg">
          <div className="px-4 py-2 space-y-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>

            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
