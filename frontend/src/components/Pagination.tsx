import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Lógica para no mostrar todos los números de página si son muchos
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    // Siempre mostrar la primera página, puntos suspensivos, y las últimas páginas
    if (currentPage > 3) {
      pages.push(1, '...');
    }

    // El rango de páginas alrededor de la página actual
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...', totalPages);
    }

    // Eliminar duplicados en los extremos
    return [...new Set(pages)];
  };

  const pageNumbers = getPageNumbers();
  
  if (totalPages <= 1) {
    return null; // No mostrar paginación si solo hay una página
  }

  return (
    <nav className="pagination-container">
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        className="pagination-button nav-button"
      >
        Anterior
      </button>
      {pageNumbers.map((number, index) =>
        typeof number === 'number' ? (
          <button 
            key={number} 
            onClick={() => onPageChange(number)}
            className={`pagination-button ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ) : (
          <span key={`dots-${index}`} className="pagination-dots">...</span>
        )
      )}
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        className="pagination-button nav-button"
      >
        Siguiente
      </button>
    </nav>
  );
};

export default Pagination;
