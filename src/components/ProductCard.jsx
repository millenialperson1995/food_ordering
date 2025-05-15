import React from 'react'; // Importar React para React.memo
import { FaPlus } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

// Envolver o componente com React.memo
const ProductCard = React.memo(function ProductCard({ product }) {
    const { openProductModal, addToCart, showToast } = useAppContext(); // Adicionado showToast para consistência, se necessário

    const handleQuickAdd = (e) => {
        e.stopPropagation(); // Evita que o modal do produto abra ao clicar no botão de adicionar rápido
        addToCart(product, 1, []);
        // showToast(`${product.name} adicionado!`); // O showToast já está no addToCart do context
    };

    return (
        <div
            className="product-card bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
            onClick={() => openProductModal(product)}
            role="button" // Adicionado role para acessibilidade
            tabIndex={0} // Adicionado tabIndex para acessibilidade
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openProductModal(product); }} // Adicionado evento de teclado para acessibilidade
        >
            <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover"
                loading="lazy" // Adicionado lazy loading para a imagem
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200/cccccc/FFFFFF?text=Imagem+Indisponível&font=Inter'; }}
            />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-1 truncate" title={product.name}>{product.name}</h3>
                <p className="text-gray-700 font-bold text-xl mb-3">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                <button
                    onClick={handleQuickAdd}
                    className="mt-auto w-full bg-[#E71D36] text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300 flex items-center justify-center"
                    aria-label={`Adicionar ${product.name} ao carrinho`} // Melhorar acessibilidade do botão
                >
                    <FaPlus className="mr-2" /> Adicionar
                </button>
            </div>
        </div>
    );
});

export { ProductCard }; // Exportar o componente memoizado