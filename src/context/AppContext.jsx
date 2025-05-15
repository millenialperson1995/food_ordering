import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { NOME_LANCHONETE, POCKETBASE_URL, COLLECTION_NAME } from '../config';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(["Todos"]);
    const [currentCategory, setCurrentCategory] = useState("Todos");
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Carregar carrinho do localStorage ao iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('deliveryAppCart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Salvar carrinho no localStorage sempre que ele mudar
    useEffect(() => {
        localStorage.setItem('deliveryAppCart', JSON.stringify(cart));
    }, [cart]);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records?perPage=100`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            const data = await response.json();
            const fetchedProducts = data.items.map(item => ({
                id: item.id,
                name: item.title,
                price: parseFloat(item.price) || 0,
                image: item.img ? `${POCKETBASE_URL}/api/files/${item.collectionName}/${item.id}/${item.img}` : 'https://placehold.co/300x200/cccccc/FFFFFF?text=Sem+Imagem&font=Inter',
                category: item.category || "Sem Categoria",
                description: item.description || "Sem descrição disponível.",
                options: parseProductOptions(item.options)
            }));
            setProducts(fetchedProducts);

            const uniqueCategories = new Set(fetchedProducts.map(p => p.category));
            setCategories(["Todos", ...Array.from(uniqueCategories).sort()]);
            setCurrentCategory("Todos");

        } catch (err) {
            console.error("Falha ao buscar produtos do PocketBase:", err);
            setError(`Oops! Não conseguimos carregar o cardápio. Detalhe: ${err.message}`);
            setProducts([]);
            setCategories(["Todos"]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const parseProductOptions = (optionsField) => {
        if (typeof optionsField === 'string') {
            try {
                const parsed = JSON.parse(optionsField);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) { return []; }
        } else if (Array.isArray(optionsField)) {
            return optionsField;
        }
        return [];
    };

    const addToCart = (product, quantity, selectedOptionsDetails) => {
        const optionsString = selectedOptionsDetails.map(opt => `${opt.name}: ${opt.value}`).sort().join('; ');
        const cartItemId = `${product.id}-${optionsString}`;
        
        let itemEffectivePrice = product.price;
        selectedOptionsDetails.forEach(opt => itemEffectivePrice += opt.priceChange);

        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.cartItemId === cartItemId);
            if (existingItemIndex > -1) {
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity += quantity;
                return updatedCart;
            } else {
                return [...prevCart, {
                    cartItemId,
                    id: product.id,
                    name: product.name,
                    price: itemEffectivePrice,
                    quantity,
                    image: product.image,
                    optionsText: optionsString
                }];
            }
        });
        showToast(`${product.name} adicionado ao carrinho!`);
    };

    const updateCartItemQuantity = (cartItemId, change) => {
        setCart(prevCart => prevCart.map(item =>
            item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
        ).filter(item => item.quantity > 0));
    };

    const removeCartItem = (cartItemId) => {
        setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
    };

    const clearCart = () => {
        setCart([]);
    }

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Funções para controlar modais
    const openProductModal = (product) => setSelectedProduct(product);
    const closeProductModal = () => setSelectedProduct(null);
    const openCartModal = () => setIsCartModalOpen(true);
    const closeCartModal = () => setIsCartModalOpen(false);
    const openCheckoutModal = () => {
        setIsCartModalOpen(false);
        setIsCheckoutModalOpen(true);
    };
    const closeCheckoutModal = () => setIsCheckoutModalOpen(false);

    const showToast = (message) => {
        const toastId = `toast-${Date.now()}`;
        const toastEl = document.createElement('div');
        toastEl.id = toastId;
        toastEl.className = 'fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg text-sm z-[1000] opacity-0 transition-opacity duration-300';
        toastEl.textContent = message;
        document.body.appendChild(toastEl);
        setTimeout(() => { toastEl.style.opacity = '1'; }, 10);
        setTimeout(() => {
            toastEl.style.opacity = '0';
            setTimeout(() => { toastEl.remove(); }, 300);
        }, 3000);
    };

    return (
        <AppContext.Provider value={{
            products, categories, currentCategory, setCurrentCategory,
            cart, addToCart, updateCartItemQuantity, removeCartItem, clearCart, cartTotal, cartItemCount,
            selectedProduct, openProductModal, closeProductModal,
            isCartModalOpen, openCartModal, closeCartModal,
            isCheckoutModalOpen, openCheckoutModal, closeCheckoutModal,
            isLoading, error,
            fetchProducts,
            showToast
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => useContext(AppContext);