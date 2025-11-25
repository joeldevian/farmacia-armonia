import React, { createContext, useState, useMemo, useContext, ReactNode, useCallback } from 'react';
import type { Producto } from '../types';

export type CartItem = {
  producto: Producto;
  cantidad: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addItem: (product: Producto) => void;
  updateItemQuantity: (productId: string, newQuantityStr: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
  impuestos: number;
  total: number;
  saleMessage: { type: 'success' | 'error'; message: string } | null;
  setSaleMessage: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; message: string } | null>>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [saleMessage, setSaleMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { subtotal, impuestos, total } = useMemo(() => {
    const IGV_DIVISOR = 1.18;
    
    const totalInCents = items.reduce(
      (sum, item) => sum + Math.round(item.producto.precio_venta * 100) * item.cantidad,
      0
    );
    
    const subtotalInCents = Math.round(totalInCents / IGV_DIVISOR);
    const impuestosInCents = totalInCents - subtotalInCents;
    
    return { 
      subtotal: subtotalInCents / 100, 
      impuestos: impuestosInCents / 100, 
      total: totalInCents / 100
    };
  }, [items]);

  const addItem = useCallback((productToAdd: Producto) => {
    setSaleMessage(null);
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.producto.id === productToAdd.id);
      if (existingItem) {
        const newQuantity = existingItem.cantidad + 1;
        if (newQuantity > productToAdd.stock_total) {
          setSaleMessage({ type: 'error', message: `No hay suficiente stock.` });
          return prevItems;
        }
        return prevItems.map((item) =>
          item.producto.id === productToAdd.id ? { ...item, cantidad: newQuantity } : item
        );
      }
      if (productToAdd.stock_total > 0) {
        return [...prevItems, { producto: productToAdd, cantidad: 1 }];
      } else {
        setSaleMessage({ type: 'error', message: `Producto sin stock.` });
        return prevItems;
      }
    });
  }, []);

  const updateItemQuantity = useCallback((productId: string, newQuantityStr: string) => {
    setSaleMessage(null);
    setItems((prevItems) => {
      const newCart = [...prevItems];
      const itemIndex = newCart.findIndex((item) => item.producto.id === productId);
      if (itemIndex === -1) return prevItems;

      const itemToUpdate = newCart[itemIndex];

      if (newQuantityStr === '') {
        newCart[itemIndex] = { ...itemToUpdate, cantidad: 0 };
        return newCart;
      }

      const newQuantity = parseInt(newQuantityStr, 10);
      if (isNaN(newQuantity) || newQuantity < 0) {
        return prevItems;
      }

      if (newQuantity === 0) {
        return newCart.filter(item => item.producto.id !== productId);
      }
      
      if (newQuantity > itemToUpdate.producto.stock_total) {
        setSaleMessage({ type: 'error', message: `Stock máximo: ${itemToUpdate.producto.stock_total}` });
        newCart[itemIndex] = { ...itemToUpdate, cantidad: itemToUpdate.producto.stock_total };
        return newCart;
      }
      
      newCart[itemIndex] = { ...itemToUpdate, cantidad: newQuantity };
      return newCart;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.producto.id !== productId));
  }, []);
  
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(() => ({
    cartItems: items,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    subtotal,
    impuestos,
    total,
    saleMessage,
    setSaleMessage,
  }), [items, subtotal, impuestos, total, saleMessage, addItem, updateItemQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

