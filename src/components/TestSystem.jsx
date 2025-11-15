// src/components/TestSystem.jsx
'use client';

import { useState } from 'react';
import { Send, Mail, Star, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import useStore from '@/store/useStore';

export default function TestSystem() {
  const { sendTestEmail, sendRecommendations } = useStore();
  const [activeSection, setActiveSection] = useState('email'); // 'email' or 'recommendations'
  const [isLoading, setIsLoading] = useState(false);

  // Email Test Form
  const [emailForm, setEmailForm] = useState({
    from: '',
    subject: '',
    body: '',
  });

  // Recommendations Form
  const [recommendForm, setRecommendForm] = useState({
    email: '',
    category: '',
  });

  const exampleRequests = [
    'Quiero reservar el libro "Cien años de soledad"',
    '¿Me puedes dar la lista de todos los libros disponibles?',
    'Necesito renovar mi reserva del libro "1984"',
    'Cancelar mi reserva de "El Principito"',
    'Registrar nuevo libro: "Don Quijote" de Miguel de Cervantes, ISBN: 978-8491050476',
    'Eliminar el libro con ISBN 978-0451524935',
  ];

  const categories = [
    'Novelas Policiacas',
    'Ciencia Ficción',
    'Autosuperación',
    'Literatura',
    'Suspenso',
    'Romance',
    'Fantasía',
    'Historia',
    'Biografías',
    'Poesía',
  ];

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.from || !emailForm.body) {
      alert('Por favor completa el correo y el mensaje');
      return;
    }

    setIsLoading(true);
    try {
      await sendTestEmail(emailForm);
      alert('✅ Correo enviado al sistema. Procesando...');
      setEmailForm({ from: '', subject: '', body: '' });
    } catch (error) {
      alert('❌ Error al enviar: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRecommendations = async (e) => {
    e.preventDefault();
    if (!recommendForm.email || !recommendForm.category) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendRecommendations(recommendForm.email, recommendForm.category);
      alert(
        `✅ ${response.message || 'Solicitud de recomendaciones enviada'}\nRecibirás un correo con ${response.recommendations_count || 5} recomendaciones pronto.`
      );
      setRecommendForm({ email: '', category: '' });
    } catch (error) {
      alert('❌ Error al enviar: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExample = (example) => {
    setEmailForm({
      ...emailForm,
      body: example,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Probar el Sistema</h2>
        <p className="text-sm text-gray-600 mt-1">
          Simula correos entrantes y solicitudes de recomendaciones
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex space-x-2 sm:space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('email')}
          className={`pb-3 px-4 font-semibold transition-colors text-sm sm:text-base ${
            activeSection === 'email'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📧 Correo de Prueba
        </button>
        <button
          onClick={() => setActiveSection('recommendations')}
          className={`pb-3 px-4 font-semibold transition-colors text-sm sm:text-base ${
            activeSection === 'recommendations'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ⭐ Recomendaciones
        </button>
      </div>

      {/* Email Test Section */}
      {activeSection === 'email' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Send className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Simular Correo Entrante
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Envía un correo de prueba al sistema
                </p>
              </div>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo del Usuario *
                </label>
                <input
                  type="email"
                  required
                  value={emailForm.from}
                  onChange={(e) => setEmailForm({ ...emailForm, from: e.target.value })}
                  placeholder="usuario@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto (opcional)
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Ej: Reservar libro"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje del Correo *
                </label>
                <textarea
                  required
                  value={emailForm.body}
                  onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                  placeholder="Escribe tu solicitud en lenguaje natural..."
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm sm:text-base"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Correo de Prueba</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Examples */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md p-4 sm:p-6 border border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                Ejemplos de Solicitudes
              </h4>
            </div>
            <div className="space-y-2">
              {exampleRequests.map((example, index) => (
                <button
                  key={index}
                  onClick={() => loadExample(example)}
                  className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-blue-200 text-xs sm:text-sm text-gray-700 hover:text-blue-900"
                >
                  <span className="font-medium mr-2">•</span>
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-indigo-500">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Transacciones Soportadas
                </h4>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <li>✓ Reservar un libro</li>
                  <li>✓ Renovar una reserva existente</li>
                  <li>✓ Eliminar una reserva</li>
                  <li>✓ Registrar un nuevo libro</li>
                  <li>✓ Eliminar un libro</li>
                  <li>✓ Obtener lista de libros disponibles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {activeSection === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Solicitar Recomendaciones
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Recibe recomendaciones personalizadas por correo
                </p>
              </div>
            </div>

            <form onSubmit={handleSendRecommendations} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={recommendForm.email}
                  onChange={(e) =>
                    setRecommendForm({ ...recommendForm, email: e.target.value })
                  }
                  placeholder="usuario@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría de Interés *
                </label>
                <select
                  required
                  value={recommendForm.category}
                  onChange={(e) =>
                    setRecommendForm({ ...recommendForm, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">Selecciona una categoría...</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Enviar Solicitud por Correo</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Nota:</strong> Las recomendaciones incluirán una tabla con el nombre
                  del autor, título del libro y una breve descripción. Recibirás el correo en
                  los próximos minutos.
                </p>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">
              Categorías Disponibles
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setRecommendForm({ ...recommendForm, category })}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-xs sm:text-sm font-medium ${
                    recommendForm.category === category
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}