import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (data) {
        setProducts(JSON.parse(data));
      }
    }

    loadProducts();
  }, [setProducts]);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      const alreadyOnCart = !!products.filter(
        element => element.id === product.id,
      );

      if (!alreadyOnCart) {
        setProducts(
          products.map(element => {
            if (element.id === product.id) {
              const updated = element;
              updated.quantity += 1;
              return updated;
            }
            return element;
          }),
        );
      } else {
        const data = [...products, { ...product, quantity: 1 }];
        setProducts(data);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products, setProducts],
  );

  const increment = useCallback(
    async id => {
      const data = products.map(element => {
        if (element.id === id) {
          const updated = element;
          updated.quantity += 1;
          return updated;
        }
        return element;
      });

      setProducts(data);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products, setProducts],
  );

  const decrement = useCallback(
    async id => {
      const data = products.map(element => {
        if (element.id === id) {
          const updated = element;
          updated.quantity -= 1;
          return updated;
        }
        return element;
      });

      setProducts(data);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products, setProducts],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
