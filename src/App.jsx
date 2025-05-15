import { useAppContext } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CategoryMenu } from './components/CategoryMenu';
import { ProductList } from './components/ProductList';
import { ProductModal } from './components/modals/ProductModal';
import { CartModal } from './components/modals/CartModal';
import { CheckoutModal } from './components/modals/CheckoutModal';

export default function App() {
    const { currentCategory, isLoading: isLoadingProducts, error: productsError } = useAppContext();

    return (
        <div className="pb-20">
            <Navbar />
            <CategoryMenu />
            <main className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">
                    {isLoadingProducts ? "Carregando cardápio..." : (productsError ? "Erro" : (currentCategory === "Todos" ? "Todos os Produtos" : currentCategory))}
                </h2>
                <ProductList />
            </main>
            <ProductModal />
            <CartModal />
            <CheckoutModal />
        </div>
    );
}