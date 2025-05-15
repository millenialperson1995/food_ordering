import { useAppContext } from '../context/AppContext';
import { ProductCard } from './ProductCard';

export function ProductList() {
    const { products, currentCategory, isLoading, error } = useAppContext();

    const filteredProducts = currentCategory === "Todos"
        ? products
        : products.filter(p => p.category === currentCategory);

    if (isLoading) {
        return <p className="text-center text-gray-500 py-8">Buscando delícias no cardápio...</p>;
    }
    if (error) {
        return <p className="text-center text-red-500 py-8">{error}</p>;
    }
    if (products.length === 0 && !isLoading) {
        return <p className="text-center text-gray-500 py-8">Nenhum produto cadastrado ainda.</p>;
    }
    if (filteredProducts.length === 0 && currentCategory !== "Todos") {
        return <p className="text-center text-gray-500 py-8">Nenhum produto encontrado na categoria "{currentCategory}".</p>;
    }

    return (
        <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}