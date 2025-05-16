// src/components/ProductList.jsx
import { useAppContext } from '../context/AppContext';
import { ProductCard } from './ProductCard'; // Esta importação é necessária aqui

// Defina a ordem de prioridade para as categorias AQUI
const PREFERRED_CATEGORY_ORDER = ["Promoção", "Lanche"]; // Certifique-se que os nomes são exatos

export function ProductList() {
    const { products, categories, currentCategory, isLoading, error } = useAppContext();

    if (isLoading) {
        return <p className="text-center text-gray-500 py-8">Buscando delícias no cardápio...</p>;
    }
    if (error) {
        return <p className="text-center text-red-500 py-8">{error}</p>;
    }
    if (products.length === 0 && !isLoading) {
        return <p className="text-center text-gray-500 py-8">Nenhum produto cadastrado ainda.</p>;
    }

    // Se uma categoria específica (diferente de "Todos") estiver selecionada, mostra apenas ela
    if (currentCategory !== "Todos") {
        const filteredProducts = products.filter(p => p.category === currentCategory);
        if (filteredProducts.length === 0) {
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

    // Se "Todos" estiver selecionado, agrupa por categoria com a ordenação personalizada
    let categoriesToDisplay = categories.filter(cat => cat !== "Todos");

    // Ordena as categoriasToDisplay de acordo com PREFERRED_CATEGORY_ORDER
    categoriesToDisplay.sort((a, b) => {
        const indexA = PREFERRED_CATEGORY_ORDER.indexOf(a);
        const indexB = PREFERRED_CATEGORY_ORDER.indexOf(b);

        // Se ambos estão na lista de preferência, ordene pela sua ordem na lista
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        // Se apenas 'a' está na lista de preferência, 'a' vem primeiro
        if (indexA !== -1) {
            return -1;
        }
        // Se apenas 'b' está na lista de preferência, 'b' vem primeiro
        if (indexB !== -1) {
            return 1;
        }
        // Se nenhum está na lista de preferência, mantém a ordem alfabética original
        // (que já vem do context, após remover "Todos")
        return 0;
    });

    return (
        <div className="space-y-12"> {/* Adiciona espaço entre as seções de categoria */}
            {categoriesToDisplay.map(categoryName => {
                // Filtra produtos para a categoria atual
                const productsInCategory = products.filter(p => p.category === categoryName);
                
                // Não renderiza a seção se não houver produtos nessa categoria
                if (productsInCategory.length === 0) {
                    return null; 
                }

                return (
                    <section key={categoryName} aria-labelledby={`category-title-${categoryName.replace(/\s+/g, '-').toLowerCase()}`}>
                        <h3
                            id={`category-title-${categoryName.replace(/\s+/g, '-').toLowerCase()}`}
                            className="text-2xl font-semibold mb-6 text-gray-700"
                        >
                            {categoryName}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {productsInCategory.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}