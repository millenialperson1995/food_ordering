import { FaMinus, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';

export function CartModal() {
    const { isCartModalOpen, closeCartModal, cart, updateCartItemQuantity, removeCartItem, cartTotal, openCheckoutModal } = useAppContext();

    if (!isCartModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[600] modal">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto modal-content transform scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-[#E71D36]">Seu Carrinho</h3>
                    <button onClick={closeCartModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Seu carrinho está vazio.</p>
                ) : (
                    <div className="mb-6 max-h-60 overflow-y-auto pr-2">
                        {cart.map(item => (
                            <div key={item.cartItemId} className="flex items-center justify-between py-3 border-b last:border-b-0">
                                <div className="flex items-center">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-16 h-16 object-cover rounded-md mr-3"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x64/cccccc/FFFFFF?text=Img&font=Inter'; }}
                                    />
                                    <div>
                                        <h4 className="font-semibold truncate w-40 sm:w-auto" title={item.name}>{item.name}</h4>
                                        {item.optionsText && <p className="text-xs text-gray-500 truncate w-40 sm:w-auto" title={item.optionsText}>{item.optionsText}</p>}
                                        <p className="text-sm text-[#E71D36] font-medium">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <button onClick={() => updateCartItemQuantity(item.cartItemId, -1)} className="cart-quantity-btn quantity-btn border rounded-l px-2 py-1 text-sm"><FaMinus /></button>
                                    <span className="border-t border-b px-3 py-1 text-sm">{item.quantity}</span>
                                    <button onClick={() => updateCartItemQuantity(item.cartItemId, 1)} className="cart-quantity-btn quantity-btn border rounded-r px-2 py-1 text-sm"><FaPlus /></button>
                                    <button onClick={() => removeCartItem(item.cartItemId)} className="remove-cart-item-btn text-red-500 hover:text-red-700 ml-3 text-lg"><FaTrashAlt /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-700">Total:</span>
                        <span className="text-xl font-bold text-[#E71D36]">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <button 
                        onClick={openCheckoutModal}
                        disabled={cart.length === 0}
                        className="w-full bg-[#2ECC71] text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Finalizar Compra
                    </button>
                </div>
            </div>
        </div>
    );
}