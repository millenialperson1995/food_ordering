import { FaPlus } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

export function ProductCard({ product }) {
    const { openProductModal, addToCart } = useAppContext();

    const handleQuickAdd = (e) => {
        e.stopPropagation();
        addToCart(product, 1, []);
    };

    return (
        <div 
            className="product-card bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
            onClick={() => openProductModal(product)}
        >
            <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-40 object-cover" 
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200/cccccc/FFFFFF?text=Imagem+Indisponível&font=Inter'; }}
            />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-1 truncate" title={product.name}>{product.name}</h3>
                <p className="text-gray-700 font-bold text-xl mb-3">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                <button 
                    onClick={handleQuickAdd}
                    className="mt-auto w-full bg-[#E71D36] text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300 flex items-center justify-center"
                >
                    <FaPlus className="mr-2" /> Adicionar
                </button>
            </div>
        </div>
    );
}