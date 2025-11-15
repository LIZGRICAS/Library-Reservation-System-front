'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { BookOpen, Search, Plus, Edit, Trash2, X, Save, Loader2 } from 'lucide-react';
import useStore from '@/store/useStore';

export default function BooksDatabase() {
  const { fetchBooks: fetchBooksFromStore, createBook, updateBook, deleteBook } = useStore();
  
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]); // Todos los libros sin filtrar
  const [booksLoading, setBooksLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [selectedBook, setSelectedBook] = useState(null);
  const [offset, setOffset] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    description: '',
    published_year: '',
    language: 'es',
    location: '',
    total_copies: 1,
  });

  const observer = useRef();
  const limit = 10;

  // Función para normalizar texto (remover tildes/acentos)
  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Fetch books con infinite scroll usando el store
  const fetchBooks = async (params) => {
    if (booksLoading) return;
    
    setBooksLoading(true);
    try {
      // No enviar query al backend, traer todos los libros
      const response = await fetchBooksFromStore({ 
        limit: params.limit, 
        offset: params.offset,
        query: null // Siempre null para traer todos
      });
      
      console.log('Response from API:', response); // Debug
      
      if (!response) {
        console.error('fetchBooksFromStore no está retornando una respuesta');
        setBooksLoading(false);
        return;
      }
      
      const apiData = response.data;
      
      if (params.offset === 0) {
        setAllBooks(apiData.results || []);
      } else {
        setAllBooks(prev => [...prev, ...(apiData.results || [])]);
      }
      
      setTotalBooks(apiData.total || 0);
      setHasMore((params.offset + params.limit) < (apiData.total || 0));
      
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setBooksLoading(false);
    }
  };

  // Cargar más libros
  const loadMore = useCallback(() => {
    if (!booksLoading && hasMore) {
      const newOffset = offset + limit;
      setOffset(newOffset);
      fetchBooks({ limit, offset: newOffset, query: searchTerm || null });
    }
  }, [offset, booksLoading, hasMore, searchTerm]);

  // Observer para el último elemento
  const lastBookElementRef = useCallback(node => {
    if (booksLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [booksLoading, hasMore, loadMore]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchBooks({ limit, offset: 0 });
  }, []);

  // Filtrar libros en el frontend cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setBooks(allBooks);
    } else {
      const normalizedSearch = normalizeText(searchTerm);
      const filtered = allBooks.filter(book => {
        const normalizedTitle = normalizeText(book.title);
        const normalizedAuthor = normalizeText(book.author);
        const normalizedIsbn = normalizeText(book.isbn);
        const normalizedGenre = normalizeText(book.genre || '');
        
        return (
          normalizedTitle.includes(normalizedSearch) ||
          normalizedAuthor.includes(normalizedSearch) ||
          normalizedIsbn.includes(normalizedSearch) ||
          normalizedGenre.includes(normalizedSearch)
        );
      });
      setBooks(filtered);
    }
  }, [searchTerm, allBooks]);

  const handleOpenModal = (mode, book = null) => {
    setModalMode(mode);
    setSelectedBook(book);
    if (mode === 'edit' && book) {
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre || '',
        description: book.description || '',
        published_year: book.published_year || '',
        language: book.language || 'es',
        location: book.location || '',
        total_copies: book.total_copies || 1,
      });
    } else {
      setFormData({ 
        title: '', 
        author: '', 
        isbn: '', 
        genre: '', 
        description: '', 
        published_year: '', 
        language: 'es', 
        location: '', 
        total_copies: 1 
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBook(null);
    setFormData({ 
      title: '', 
      author: '', 
      isbn: '', 
      genre: '', 
      description: '', 
      published_year: '', 
      language: 'es', 
      location: '', 
      total_copies: 1 
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      // Preparar los datos según lo que espera la API
      const dataToSend = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        genre: formData.genre || null,
        description: formData.description || null,
        published_year: formData.published_year ? parseInt(formData.published_year) : null,
        language: formData.language || 'es',
        location: formData.location || null,
        total_copies: parseInt(formData.total_copies) || 1,
      };

      console.log('Datos a enviar:', dataToSend); // Debug

      if (modalMode === 'create') {
        await createBook(dataToSend);
        alert('Libro creado exitosamente');
      } else {
        console.log('Actualizando libro ID:', selectedBook.id); // Debug
        await updateBook(selectedBook.id, dataToSend);
        alert('Libro actualizado exitosamente');
      }
      handleCloseModal();
      // Recargar lista
      setOffset(0);
      setAllBooks([]);
      setBooks([]);
      setHasMore(true);
      fetchBooks({ limit, offset: 0 });
    } catch (error) {
      console.error('Error completo:', error); // Debug mejorado
      console.error('Respuesta del servidor:', error.response); // Ver la respuesta del servidor
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id, title) => {
    setBookToDelete({ id, title });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    
    try {
      await deleteBook(bookToDelete.id);
      alert('Libro eliminado exitosamente');
      setShowDeleteModal(false);
      setBookToDelete(null);
      // Recargar lista
      setOffset(0);
      setAllBooks([]);
      setBooks([]);
      setHasMore(true);
      fetchBooks({ limit, offset: 0 });
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBookToDelete(null);
  };

  const availableCount = books.filter((b) => b.status === 'available').length;
  const reservedCount = books.filter((b) => b.status === 'reserved').length;

console.log('Token enviado:', localStorage.getItem('access_token'));


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Base de Datos de Libros</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona el catálogo completo de la biblioteca
            </p>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            className="bg-indigo-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-md text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Libro</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, autor o ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>
            <p className="text-sm text-gray-600">Total Libros</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{availableCount}</p>
            <p className="text-sm text-gray-600">Disponibles</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{reservedCount}</p>
            <p className="text-sm text-gray-600">Reservados</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{books.length}</p>
            <p className="text-sm text-gray-600">Cargados</p>
          </div>
        </div>

        {/* Books Grid */}
        {books.length === 0 && !booksLoading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No se encontraron libros' : 'No hay libros registrados'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {books.map((book, index) => {
              const isLastElement = books.length === index + 1;
              return (
                <div
                  key={book.id}
                  ref={isLastElement ? lastBookElementRef : null}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 border border-gray-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base break-words">
                        {book.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">{book.author}</p>
                      <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
                      {book.genre && (
                        <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                          {book.genre}
                        </span>
                      )}
                      {book.location && (
                        <p className="text-xs text-gray-500 mt-1">📍 {book.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        book.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : book.status === 'reserved'
                          ? 'bg-yellow-100 text-yellow-800'
                          : book.status === 'lost'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {book.status === 'available' && '✓ Disponible'}
                      {book.status === 'reserved' && '📚 Reservado'}
                      {book.status === 'lost' && '❌ Perdido'}
                      {book.status === 'maintenance' && '🔧 Mantenimiento'}
                    </span>
                    <span className="ml-2 text-xs text-gray-600">
                      {book.available_copies}/{book.total_copies} copias
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal('edit', book)}
                      className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(book.id, book.title)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading Indicator */}
        {booksLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-gray-600 text-sm">Cargando más libros...</p>
            </div>
          </div>
        )}

        {/* End Message */}
        {!hasMore && books.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600">
              ✨ Has visto todos los {totalBooks} libros disponibles
            </p>
          </div>
        )}

        {/* Modal Create/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Registrar Nuevo Libro' : 'Editar Libro'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ej: Cien años de soledad"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Autor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ej: Gabriel García Márquez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ej: 978-0307474728"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Género
                  </label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ej: Ficción, Ciencia Ficción"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Breve descripción del libro"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año
                    </label>
                    <input
                      type="number"
                      value={formData.published_year}
                      onChange={(e) => setFormData({ ...formData, published_year: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Idioma
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ej: A1, B2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Copias
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.total_copies}
                      onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{modalMode === 'create' ? 'Crear' : 'Actualizar'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Delete Confirmation */}
        {showDeleteModal && bookToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  ¿Eliminar libro?
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  ¿Estás seguro de eliminar <span className="font-semibold">"{bookToDelete.title}"</span>? 
                  Esta acción no se puede deshacer.
                </p>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}