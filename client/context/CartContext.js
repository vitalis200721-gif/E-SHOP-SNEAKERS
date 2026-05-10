'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product, size) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id && item.size === size);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id && item.size === size ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, size, qty: 1 }];
    });
  };

  const removeFromCart = (id, size) => {
    setCartItems((prev) => prev.filter((item) => !(item._id === id && item.size === size)));
  };

  const updateQty = (id, size, qty) => {
    if (qty < 1) return removeFromCart(id, size);
    setCartItems((prev) =>
      prev.map((item) => (item._id === id && item.size === size ? { ...item, qty } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  // Saugus skaičiavimas su numatytąja reikšme 0
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0) || 0;

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, totalPrice, isLoaded }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
