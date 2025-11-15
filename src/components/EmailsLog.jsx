
'use client';

import { useEffect, useState } from 'react';
import { Mail, CheckCircle, Clock, RefreshCw, AlertCircle, Filter, Search } from 'lucide-react';
import useStore from '@/store/useStore';

export default function EmailsLog() {
  const { emails, emailsLoading, fetchEmails } = useStore();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pendiente',
        icon: Clock,
      },
      processing: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Procesando',
        icon: RefreshCw,
      },
      processed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Procesado',
        icon: CheckCircle,
      },
      error: {
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Error',
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
      >
        <Icon className={`w-3 h-3 mr-1 ${status === 'processing' ? 'animate-spin' : ''}`} />
        {config.text}
      </span>
    );
  };

  // Filtrar emails
  const filteredEmails = emails.filter((email) => {
    const matchesStatus = filterStatus === 'all' || email.status === filterStatus;
    const matchesSearch =
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: emails.length,
    pending: emails.filter((e) => e.status === 'pending').length,
    processing: emails.filter((e) => e.status === 'processing').length,
    processed: emails.filter((e) => e.status === 'processed').length,
    error: emails.filter((e) => e.status === 'error').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Correos Procesados</h2>
          <p className="text-sm text-gray-600 mt-1">
            Historial de correos recibidos y respuestas generadas
          </p>
        </div>
        <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-sm sm:text-base">
          {filteredEmails.length} correos
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por remitente, asunto o contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pending', label: 'Pendientes' },
            { id: 'processing', label: 'Procesando' },
            { id: 'processed', label: 'Procesados' },
            { id: 'error', label: 'Errores' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterStatus(filter.id)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-xs sm:text-sm ${
                filterStatus === filter.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                {statusCounts[filter.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {emailsLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-3 text-gray-600">Cargando correos...</span>
        </div>
      )}

      {/* Empty State */}
      {!emailsLoading && filteredEmails.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm || filterStatus !== 'all'
              ? 'No se encontraron correos con los filtros aplicados'
              : 'No hay correos procesados aún'}
          </p>
        </div>
      )}

      {/* Emails List */}
      <div className="space-y-4">
        {filteredEmails.map((email) => (
          <div
            key={email.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="p-4 sm:p-6">
              {/* Email Header */}
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4 space-y-3 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                    <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 truncate">
                      {email.from}
                    </span>
                    {getStatusBadge(email.status)}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 break-words">
                    {email.subject}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Recibido: {email.receivedAt}
                  </p>
                </div>
              </div>

              {/* Email Body */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-700 font-medium mb-2 flex items-center">
                  <span className="mr-2">📨</span>
                  Mensaje del Usuario:
                </p>
                <p className="text-xs sm:text-sm text-gray-800 break-words whitespace-pre-wrap">
                  {email.body}
                </p>
              </div>

              {/* Response */}
              {email.response && email.status === 'processed' && (
                <div className="bg-green-50 rounded-lg p-3 sm:p-4 border-l-4 border-green-500">
                  <p className="text-xs sm:text-sm text-gray-700 font-medium mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Respuesta Enviada:
                  </p>
                  <p className="text-xs sm:text-sm text-gray-800 break-words whitespace-pre-wrap">
                    {email.response}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Procesado: {email.processedAt}
                  </p>
                </div>
              )}

              {/* Processing State */}
              {email.status === 'processing' && (
                <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 rounded-lg p-3 sm:p-4">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-xs sm:text-sm font-medium">
                    Procesando solicitud con LLM...
                  </span>
                </div>
              )}

              {/* Error State */}
              {email.status === 'error' && (
                <div className="bg-red-50 rounded-lg p-3 sm:p-4 border-l-4 border-red-500">
                  <p className="text-xs sm:text-sm text-red-700 font-medium flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Error al procesar el correo
                  </p>
                  {email.error && (
                    <p className="text-xs sm:text-sm text-red-600 mt-2">{email.error}</p>
                  )}
                </div>
              )}

              {/* Pending State */}
              {email.status === 'pending' && (
                <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 border-l-4 border-yellow-500">
                  <p className="text-xs sm:text-sm text-yellow-700 font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    En cola de procesamiento
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Footer */}
      {filteredEmails.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {statusCounts.processed}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Procesados</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {statusCounts.processing}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Procesando</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {statusCounts.pending}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Pendientes</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {statusCounts.error}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Errores</p>
          </div>
        </div>
      )}
    </div>
  );
}