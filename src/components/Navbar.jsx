import { FaShoppingCart } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import { NOME_LANCHONETE } from '../config';

export function Navbar() {
    const { openCartModal, cartItemCount } = useAppContext();
    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                    <img src="https://placehold.co/100x40/E71D36/FFFFFF?text=Logo&font=Inter" alt="Logo da Lanchonete" className="h-10 mr-3" />
                    <span className="text-xl font-bold text-[#E71D36] hidden sm:block">{NOME_LANCHONETE}</span>
                </div>
                <button onClick={openCartModal} className="relative text-[#E71D36]">
                    <FaShoppingCart size={24} />
                    {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {cartItemCount}
                        </span>
                    )}
                </button>
            </div>
        </nav>
    );
}