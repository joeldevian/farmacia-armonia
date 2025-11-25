import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './VentasPage.css';
import type { Producto } from '../types'; // Importar la interfaz Producto

// Definir el tipo para un ítem en el carrito
interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface VentasPageProps {
  token: string;
}

const VentasPage: React.FC<VentasPageProps> = ({ token }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessingSale, setIsProcessingSale] = useState<boolean>(false);
  const [saleMessage, setSaleMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const navigate = useNavigate();

  const IGV_RATE = 0.18; // Tasa de IGV (Impuesto General a las Ventas)

  // Cálculos de totales del carrito
  const { subtotal, impuestos, total } = useMemo(() => {
    const calcSubtotal = cartItems.reduce((sum, item) => sum + (item.producto.precio_venta * item.cantidad), 0);
    const calcImpuestos = calcSubtotal * IGV_RATE;
    const calcTotal = calcSubtotal + calcImpuestos;
    return {
      subtotal: calcSubtotal,
      impuestos: calcImpuestos,
      total: calcTotal,
    };
  }, [cartItems]);

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/productos/search?term=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data: Producto[] = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError('Error al buscar productos. Inténtalo de nuevo.');
      console.error('Error searching products:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const addToCart = (productToAdd: Producto) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.producto.id === productToAdd.id);
      if (existingItem) {
        // Si el producto ya está en el carrito, incrementa la cantidad
        // Asegúrate de no exceder el stock disponible
        if (existingItem.cantidad < productToAdd.stock_total) {
          return prevItems.map((item) =>
            item.producto.id === productToAdd.id ? { ...item, cantidad: item.cantidad + 1 } : item
          );
        } else {
          setSaleMessage({ type: 'error', message: `No hay suficiente stock de ${productToAdd.nombre}.` });
          return prevItems;
        }
      } else {
        // Si el producto no está, añádelo con cantidad 1
        if (productToAdd.stock_total > 0) {
          return [...prevItems, { producto: productToAdd, cantidad: 1 }];
        } else {
          setSaleMessage({ type: 'error', message: `El producto ${productToAdd.nombre} no tiene stock disponible.` });
          return prevItems;
        }
      }
    });
    setSaleMessage(null); // Limpiar mensaje de venta al añadir al carrito
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    setSaleMessage(null); // Limpiar mensaje de venta al actualizar cantidad
    setCartItems((prevItems) => {
      const itemToUpdate = prevItems.find((item) => item.producto.id === productId);
      if (!itemToUpdate) return prevItems;

      if (newQuantity <= 0) {
        return prevItems.filter((item) => item.producto.id !== productId);
      }
      
      // No permitir exceder el stock disponible
      if (newQuantity > itemToUpdate.producto.stock_total) {
        setSaleMessage({ type: 'error', message: `No hay suficiente stock de ${itemToUpdate.producto.nombre}.` });
        return prevItems;
      }

      return prevItems.map((item) =>
        item.producto.id === productId ? { ...item, cantidad: newQuantity } : item
      );
    });
  };

  const removeCartItem = (productId: string) => {
    setSaleMessage(null); // Limpiar mensaje de venta al eliminar del carrito
    setCartItems((prevItems) => prevItems.filter((item) => item.producto.id !== productId));
  };

  const handleFinalizeSale = async () => {
    if (cartItems.length === 0) {
      setSaleMessage({ type: 'error', message: 'El carrito está vacío. Añade productos para finalizar la venta.' });
      return;
    }

    setIsProcessingSale(true);
    setSaleMessage(null);
    setError(null);

    try {
      // Aquí puedes añadir la lógica para seleccionar un cliente, tipo de comprobante, etc.
      // Por ahora, asumiremos valores por defecto o nulos
      const saleData = {
        clienteId: null, // Asumir cliente nulo por ahora
        tipo_comprobante: 'BOLETA', // O FACTURA, según la lógica de negocio
        metodo_pago: 'EFECTIVO', // O TARJETA, etc.
        detalles: cartItems.map(item => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio_venta,
          // loteId: item.lote.id, // Si manejamos lotes específicos, habría que añadirlo al CartItem
        })),
        subtotal: subtotal,
        impuestos: impuestos,
        total: total,
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar la venta.');
      }

      const result = await response.json();
      setSaleMessage({ type: 'success', message: `Venta #${result.numero_correlativo} realizada con éxito!` });
      setCartItems([]); // Vaciar el carrito
      setSearchResults([]); // Limpiar resultados de búsqueda
      setSearchTerm(''); // Limpiar término de búsqueda
    } catch (err: any) {
      setError(err.message || 'Error desconocido al finalizar la venta.');
      setSaleMessage({ type: 'error', message: err.message || 'Error al finalizar la venta.' });
      console.error('Error finalizing sale:', err);
    } finally {
      setIsProcessingSale(false);
    }
  };


  return (
    <div className="ventas-page">
      <div className="ventas-header">
        <h1>Punto de Venta</h1>
        <button className="btn btn-primary btn-header-action" onClick={() => navigate('/historial-ventas')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
            </svg>
            Historial de Ventas
        </button>
      </div>
      <div className="ventas-container">
        <div className="ventas-left-panel">
          <h2>Carrito de Compras</h2>
          <div className="cart-items">
            {cartItems.length === 0 ? (
              <p>El carrito está vacío.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.producto.id} className="cart-item">
                  <p>{item.producto.nombre}</p>
                  <div className="cart-item-controls">
                    <button onClick={() => updateCartItemQuantity(item.producto.id, item.cantidad - 1)}>-</button>
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => updateCartItemQuantity(item.producto.id, parseInt(e.target.value))}
                      min="1"
                      max={item.producto.stock_total} // Limitar la cantidad al stock disponible
                    />
                    <button onClick={() => updateCartItemQuantity(item.producto.id, item.cantidad + 1)}>+</button>
                    <button className="btn-remove" onClick={() => removeCartItem(item.producto.id)}>X</button>
                  </div>
                  <p>${(item.producto.precio_venta * item.cantidad).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
          <div className="cart-summary">
            <p>Subtotal: <span>${subtotal.toFixed(2)}</span></p>
            <p>Impuestos (IGV {IGV_RATE * 100}%): <span>${impuestos.toFixed(2)}</span></p>
            <h3>Total: <span>${total.toFixed(2)}</span></h3>
            {saleMessage && (
              <p className={`sale-message ${saleMessage.type === 'success' ? 'success' : 'error'}`}>
                {saleMessage.message}
              </p>
            )}
            <button
              className="btn btn-primary"
              onClick={handleFinalizeSale}
              disabled={cartItems.length === 0 || isProcessingSale}
            >
              {isProcessingSale ? 'Procesando Venta...' : 'Finalizar Venta'}
            </button>
          </div>
        </div>
        <div className="ventas-right-panel">
          <h2>Buscar Productos</h2>
          <div className="product-search">
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="btn btn-secondary" onClick={handleSearch} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          <div className="product-list">
            {error && <p className="error-message">{error}</p>}
            {!loading && searchResults.length === 0 && searchTerm.trim() !== '' && !error && (
              <p>No se encontraron productos.</p>
            )}
            {searchResults.map((producto) => (
              <div key={producto.id} className="product-item">
                <p><strong>{producto.nombre}</strong> - ${producto.precio_venta.toFixed(2)} ({producto.stock_total} en stock)</p>
                <button
                  className="btn btn-add-to-cart"
                  onClick={() => addToCart(producto)}
                  disabled={producto.stock_total <= 0} // Deshabilitar si no hay stock
                >
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentasPage;