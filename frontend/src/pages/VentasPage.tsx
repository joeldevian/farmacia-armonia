import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Producto, Cliente } from '../types';
import './VentasPage.css'; // Usaremos el mismo archivo, pero lo sobreescribiremos

// --- Iconos SVG ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
  </svg>
);

// --- Componentes Reutilizables del TPV ---

const ProductCard = ({ producto, onAddToCart }) => (
  <div className="pos-product-card" onClick={() => onAddToCart(producto)}>
    <div className="pos-product-info">
      <p className="pos-product-name">{producto.nombre}</p>
      <p className="pos-product-stock">{producto.stock_total} en stock</p>
    </div>
    <div className="pos-product-actions">
      <p className="pos-product-price">${parseFloat(String(producto.precio_venta)).toFixed(2)}</p>
      <button className="btn-add-product">+</button>
    </div>
  </div>
);

const SaleItemRow = ({ item, onUpdate, onRemove }) => (
  <tr className="sale-item-row">
    <td>
      <p className="sale-item-name">{item.producto.nombre}</p>
      <p className="sale-item-price">${parseFloat(String(item.producto.precio_venta)).toFixed(2)}</p>
    </td>
    <td>
      <div className="quantity-control">
        <button onClick={() => onUpdate(item.producto.id, String(item.cantidad - 1))}>-</button>
        <input type="text" value={item.cantidad} onChange={e => onUpdate(item.producto.id, e.target.value)} />
        <button onClick={() => onUpdate(item.producto.id, String(item.cantidad + 1))}>+</button>
      </div>
    </td>
    <td className="sale-item-total">${(item.cantidad * parseFloat(String(item.producto.precio_venta))).toFixed(2)}</td>
    <td>
      <button className="btn-remove-item" onClick={() => onRemove(item.producto.id)}><TrashIcon /></button>
    </td>
  </tr>
);


// --- Componente Principal de la Página de Ventas (TPV) ---

const VentasPage: React.FC<{ token: string }> = ({ token }) => {
  const navigate = useNavigate();
  const { cartItems, addItem, updateItemQuantity, removeItem, clearCart, subtotal, impuestos, total, saleMessage, setSaleMessage } = useCart();
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteSearch, setClienteSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [tipoComprobante, setTipoComprobante] = useState('Boleta');
  const [metodoPago, setMetodoPago] = useState('Efectivo');

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cargar productos al montar
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/productos?limit=50`, { // Limitar la carga inicial
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Error al cargar productos');
        const data = await response.json();
        setProductos(data.data || []);
      } catch (error) {
        console.error(error);
        setSaleMessage({ type: 'error', message: 'No se pudieron cargar los productos.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token, setSaleMessage]);
  
  // Lógica de búsqueda de clientes
  useEffect(() => {
    if (clienteSearch.trim().length > 2) {
      const fetchClientes = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/clientes/search?term=${clienteSearch}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await response.json();
          setClientes(data || []);
        } catch (error) {
          console.error("Error buscando clientes:", error);
          setClientes([]);
        }
      };
      fetchClientes();
    } else {
      setClientes([]);
    }
  }, [clienteSearch, token]);

  const filteredProducts = useMemo(() => 
    productos.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  , [productos, searchTerm]);

  const handleFinalizeSale = useCallback(async () => {
    if (cartItems.length === 0) {
      setSaleMessage({ type: 'error', message: 'No hay productos en la venta.' });
      return;
    }
    setIsProcessing(true);
    try {
      const ventaData = {
        clienteId: selectedCliente?.id || null,
        tipo_comprobante: tipoComprobante,
        metodo_pago: metodoPago,
        detalles: cartItems.map(item => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
        })),
      };
      
      await fetch(`${import.meta.env.VITE_API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(ventaData),
      });

      setSaleMessage({ type: 'success', message: '¡Venta realizada con éxito!' });
      clearCart();
      setSelectedCliente(null);
      setClienteSearch('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al procesar la venta.';
      setSaleMessage({ type: 'error', message: errorMsg });
    } finally {
      setIsProcessing(false);
    }
  }, [cartItems, selectedCliente, tipoComprobante, metodoPago, token, clearCart, setSaleMessage]);
  
  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setClienteSearch(`${cliente.nombre} ${cliente.apellido}`);
    setClientes([]);
  };

  return (
    <div className="pos-page-container">
      {/* Columna Izquierda: Catálogo */}
      <div className="pos-catalog">
        <div className="pos-header">
          <h1>Catálogo de Productos</h1>
          <input 
            type="text" 
            placeholder="Buscar producto..." 
            className="pos-search-bar"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="pos-catalog-content">
          {loading ? <p>Cargando...</p> : filteredProducts.map(p => <ProductCard key={p.id} producto={p} onAddToCart={addItem} />)}
        </div>
      </div>

      {/* Columna Derecha: Detalles de Venta */}
      <div className="pos-sale-details">
        <div className="pos-header">
          <h1>Detalle de Venta</h1>
          <button className="btn-historial" onClick={() => navigate('/historial-ventas')}>Historial</button>
        </div>
        
        <div className="pos-sale-content">
          {/* Sección del Cliente */}
          <div className="client-section">
            <input 
              type="text" 
              placeholder="Buscar cliente por nombre o DNI"
              value={clienteSearch}
              onChange={e => { setClienteSearch(e.target.value); if (selectedCliente) setSelectedCliente(null); }}
            />
            {clientes.length > 0 && (
              <ul className="client-search-results">
                {clientes.map(c => <li key={c.id} onClick={() => handleSelectCliente(c)}>{c.nombre} {c.apellido}</li>)}
              </ul>
            )}
          </div>
          
          {/* Opciones de Venta */}
          <div className="sale-options">
            <div>
              <label htmlFor="tipo_comprobante">Comprobante</label>
              <select id="tipo_comprobante" value={tipoComprobante} onChange={e => setTipoComprobante(e.target.value)}>
                <option value="Boleta">Boleta</option>
                <option value="Factura">Factura</option>
              </select>
            </div>
            <div>
              <label htmlFor="metodo_pago">Método de Pago</label>
              <select id="metodo_pago" value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Yape/Plin">Yape/Plin</option>
              </select>
            </div>
          </div>

          {/* Items de la Venta */}
          <div className="sale-items-container">
            {cartItems.length > 0 ? (
              <table className="sale-items-table">
                <tbody>
                  {cartItems.map(item => <SaleItemRow key={item.producto.id} item={item} onUpdate={updateItemQuantity} onRemove={removeItem} />)}
                </tbody>
              </table>
            ) : (
              <p className="empty-cart-msg">Agregue productos desde el catálogo</p>
            )}
          </div>
        </div>

        {/* Footer con Totales y Acciones */}
        <div className="pos-sale-footer">
          <div className="sale-summary">
            <p>Subtotal: <span>${subtotal.toFixed(2)}</span></p>
            <p>Impuestos (18%): <span>${impuestos.toFixed(2)}</span></p>
            <p className="summary-total">Total: <span>${total.toFixed(2)}</span></p>
          </div>
          {saleMessage && <p className={`sale-message ${saleMessage.type}`}>{saleMessage.message}</p>}
          <div className="sale-actions">
            <button className="btn-cancel" onClick={clearCart}>Cancelar</button>
            <button className="btn-finalize" onClick={handleFinalizeSale} disabled={isProcessing || cartItems.length === 0}>
              {isProcessing ? 'Procesando...' : 'Finalizar Venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentasPage;
