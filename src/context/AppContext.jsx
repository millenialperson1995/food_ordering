import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { POCKETBASE_URL, COLLECTION_NAME } from '../config';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(["Todos"]);
    const [currentCategory, setCurrentCategory] = useState("Todos");
    const [cart, setCart] = useState([]); // Inicializado como array
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Carregar carrinho do localStorage ao iniciar
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('deliveryAppCart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                // Verifica se o valor parseado é de fato um array
                if (Array.isArray(parsedCart)) {
                    setCart(parsedCart);
                } else {
                    // Se não for um array (ex: null, objeto, etc.), inicia com carrinho vazio
                    console.warn("Conteúdo do 'deliveryAppCart' no localStorage não era um array. Redefinindo para [].");
                    setCart([]);
                    localStorage.setItem('deliveryAppCart', JSON.stringify([])); // Garante que o localStorage seja corrigido
                }
            }
        } catch (e) {
            // Se houver erro no JSON.parse (JSON inválido), também inicia com carrinho vazio
            console.error("Erro ao parsear 'deliveryAppCart' do localStorage:", e);
            setCart([]);
            localStorage.setItem('deliveryAppCart', JSON.stringify([])); // Garante que o localStorage seja corrigido
        }
    }, []);

    // Salvar carrinho no localStorage sempre que ele mudar
    useEffect(() => {
        // Só salva se 'cart' for um array, para evitar corromper o localStorage
        if (Array.isArray(cart)) {
            localStorage.setItem('deliveryAppCart', JSON.stringify(cart));
        }
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
            const allFetchedProducts = data.items.map(item => ({
                id: item.id,
                name: item.title,
                price: parseFloat(item.price) || 0,
                image: item.img ? `${POCKETBASE_URL}/api/files/${item.collectionName}/${item.id}/${item.img}` : 'https://placehold.co/300x200/cccccc/FFFFFF?text=Sem+Imagem&font=Inter',
                category: item.category || "Sem Categoria",
                description: item.description || "Sem descrição disponível.",
                options: parseProductOptions(item.options),
                isAvailable: item.isAvailable === undefined ? true : item.isAvailable
            }));

            const availableProducts = allFetchedProducts.filter(product => product.isAvailable);

            setProducts(availableProducts);

            const uniqueCategories = new Set(availableProducts.map(p => p.category));
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
    }, []); // A dependência parseProductOptions será adicionada abaixo se necessário, mas geralmente não é.

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const parseProductOptions = useCallback((optionsField) => {
        if (typeof optionsField === 'string') {
            try {
                const parsed = JSON.parse(optionsField);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) { return []; }
        } else if (Array.isArray(optionsField)) {
            return optionsField;
        }
        return [];
    }, []);

    const showToast = useCallback((message) => {
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
    }, []);

    const addToCart = useCallback((product, quantity, selectedOptionsDetails) => {
        const optionsString = selectedOptionsDetails.map(opt => `${opt.name}: ${opt.value}`).sort().join('; ');
        const cartItemId = `${product.id}-${optionsString}`;
        
        let itemEffectivePrice = product.price;
        selectedOptionsDetails.forEach(opt => itemEffectivePrice += opt.priceChange);

        setCart(prevCart => {
            // Garante que prevCart seja um array antes de tentar o findIndex
            const currentCart = Array.isArray(prevCart) ? prevCart : [];
            const existingItemIndex = currentCart.findIndex(item => item.cartItemId === cartItemId);
            if (existingItemIndex > -1) {
                const updatedCart = [...currentCart];
                updatedCart[existingItemIndex].quantity += quantity;
                return updatedCart;
            } else {
                return [...currentCart, {
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
    }, [showToast]);

    const updateCartItemQuantity = useCallback((cartItemId, change) => {
        setCart(prevCart => {
            const currentCart = Array.isArray(prevCart) ? prevCart : [];
            return currentCart.map(item =>
                item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
            ).filter(item => item.quantity > 0)
        });
    }, []);

    const removeCartItem = useCallback((cartItemId) => {
        setCart(prevCart => {
            const currentCart = Array.isArray(prevCart) ? prevCart : [];
            return currentCart.filter(item => item.cartItemId !== cartItemId)
        });
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    // Linha 140 original, agora mais segura:
    const cartTotal = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    const cartItemCount = Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;

    const openProductModal = useCallback((product) => setSelectedProduct(product), []);
    const closeProductModal = useCallback(() => setSelectedProduct(null), []);
    const openCartModal = useCallback(() => setIsCartModalOpen(true), []);
    const closeCartModal = useCallback(() => setIsCartModalOpen(false), []);
    
    const openCheckoutModal = useCallback(() => {
        setIsCartModalOpen(false);
        setIsCheckoutModalOpen(true);
    }, []);
    const closeCheckoutModal = useCallback(() => setIsCheckoutModalOpen(false), []);
    

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