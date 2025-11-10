// src/components/Dashboard.jsx
'use client';

import { useEffect } from 'react';
import { Mail, CheckCircle, Clock, RefreshCw, Activity, Database } from 'lucide-react';
import useStore from '@/store/useStore';

export default function Dashboard() {
  const { stats, systemStatus, fetchStats, fetchSystemStatus } = useStore();

  useEffect(() => {
    // Cargar datos iniciales
    fetchStats();
    fetchSystemStatus();

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchStats();
      fetchSystemStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStats, fetchSystemStatus]);

  const statsCards = [
    {
      title: 'Total Correos',
      value: stats.totalEmails || 0,
      icon: Mail,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500',
    },
    {
      title: 'Procesados Hoy',
      value: stats.processedToday || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
      borderColor: 'border-green-500',
    },
    {
      title: 'Pendientes',
      value: stats.pendingEmails || 0,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
      borderColor: 'border-yellow-500',
    },
    {
      title: 'Tiempo Promedio',
      value: stats.averageResponseTime || '0s',
      icon: RefreshCw,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-500',
    },
  ];

  const systemComponents = [
    {
      name: 'Monitoreo de Correos',
      status: systemStatus.emailMonitoring,
      icon: Mail,
    },
    {
      name: 'Procesamiento LLM',
      status: systemStatus.llmProcessing,
      icon: Activity,
    },
    {
      name: 'Base de Datos',
      status: systemStatus.databaseConnection,
      icon: Database,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200 text-green-600';
      case 'inactive':
        return 'bg-gray-50 border-gray-200 text-gray-600';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-600';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return '● Activo';
      case 'inactive':
        return '○ Inactivo';
      case 'error':
        return '● Error';
      default:
        return '○ Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Control</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 ${stat.borderColor} hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-8 h-8 sm:w-12 sm:h-12 ${stat.iconColor} opacity-50`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Estado del Sistema</h3>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              Última verificación: {systemStatus.lastCheck || 'Nunca'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {systemComponents.map((component, index) => {
            const Icon = component.icon;
            return (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${getStatusColor(
                  component.status
                )}`}
              >
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {component.name}
                  </p>
                  <p className="text-xs sm:text-sm font-medium">
                    {getStatusText(component.status)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {stats.successRate && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-900">
                Tasa de Éxito
              </span>
              <span className="text-2xl font-bold text-indigo-600">
                {stats.successRate}%
              </span>
            </div>
            <div className="mt-2 bg-indigo-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.successRate}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* How it Works */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 sm:p-8 text-white">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">¿Cómo Funciona?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-white bg-opacity-20 rounded-full p-3 sm:p-4 mb-3">
              <Mail className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h4 className="font-bold mb-2 text-sm sm:text-base">1. Usuario Envía Correo</h4>
            <p className="text-xs sm:text-sm opacity-90">
              El usuario escribe su solicitud en lenguaje natural a biblioteca@example.com
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-white bg-opacity-20 rounded-full p-3 sm:p-4 mb-3">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h4 className="font-bold mb-2 text-sm sm:text-base">2. Sistema Procesa</h4>
            <p className="text-xs sm:text-sm opacity-90">
              LLM analiza el correo, genera SQL y ejecuta en la base de datos
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-white bg-opacity-20 rounded-full p-3 sm:p-4 mb-3">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h4 className="font-bold mb-2 text-sm sm:text-base">3. Respuesta Automática</h4>
            <p className="text-xs sm:text-sm opacity-90">
              El usuario recibe una respuesta clara y amigable por correo
            </p>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-indigo-500">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
            <Mail className="w-5 h-5 mr-2 text-indigo-600" />
            Correo del Sistema
          </h4>
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Los usuarios deben enviar sus solicitudes a:
          </p>
          <p className="text-sm sm:text-base font-mono bg-gray-100 px-3 py-2 rounded-lg break-all">
            {process.env.NEXT_PUBLIC_EMAIL_MONITORING || 'biblioteca@example.com'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-purple-500">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Transacciones Soportadas
          </h4>
          <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
            <li>• Reservar un libro</li>
            <li>• Renovar una reserva</li>
            <li>• Eliminar una reserva</li>
            <li>• Registrar un libro</li>
            <li>• Listar libros disponibles</li>
            <li>• Solicitar recomendaciones</li>
          </ul>
        </div>
      </div>
    </div>
  );
}