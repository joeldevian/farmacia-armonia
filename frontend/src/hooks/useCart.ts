// frontend/src/hooks/useCart.ts
import { useState, useMemo } from 'react';
import type { Producto } from '../types';

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [saleMessage, setSaleMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const IGV_RATE = 0.18;

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + parseFloat(String(item.producto.precio_venta)) * item.cantidad,
      0
    );
  }, [items]);

  const impuestos = useMemo(() => subtotal * IGV_RATE, [subtotal]);
  const total = useMemo(() => subtotal + impuestos, [subtotal, impuestos]);

  const addItem = (productToAdd: Producto) => {
    setSaleMessage(null);
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.producto.id === productToAdd.id);

      if (existingItem) {
        const newQuantity = existingItem.cantidad + 1;
        if (newQuantity > productToAdd.stock_total) {
          setSaleMessage({ type: 'error', message: `No hay suficiente stock de ${productToAdd.nombre}.` });
          return prevItems;
        }
        return prevItems.map((item) =>
          item.producto.id === productToAdd.id ? { ...item, cantidad: newQuantity } : item
        );
      }

      if (productToAdd.stock_total > 0) {
        return [...prevItems, { producto: productToAdd, cantidad: 1 }];
      } else {
        setSaleMessage({ type: 'error', message: `El producto ${productToAdd.nombre} no tiene stock disponible.` });
        return prevItems;
      }
    });
  };

  const updateItemQuantity = (productId: string, newQuantityStr: string) => {
    setSaleMessage(null);
    const newQuantity = parseInt(newQuantityStr, 10);

    if (isNaN(newQuantity) && newQuantityStr !== '') {
      return;
    }

    setItems((prevItems) => {
      const newCart = [...prevItems];
      const itemIndex = newCart.findIndex(item => item.producto.id === productId);

      if (itemIndex === -1) return prevItems;

      const itemToUpdate = newCart[itemIndex];

      if (newQuantityStr === '' || newQuantity <= 0) {
        newCart.splice(itemIndex, 1);
        return newCart;
      }
      
      if (newQuantity > itemToUpdate.producto.stock_total) {
        setSaleMessage({ type: 'error', message: `No hay suficiente stock de ${itemToUpdate.producto.nombre}.` });
        return prevItems;
      }

      newCart[itemIndex] = { ...itemToUpdate, cantidad: newQuantity };
      return newCart;
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.producto.id !== productId));
  };
  
  const clearCart = () => {
    setItems([]);
  };

  return {
    cartItems: items,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    subtotal,
    impuestos,
    total,
    saleMessage,
    setSaleMessage
  };
};
