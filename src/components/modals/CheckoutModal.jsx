import React, { useState, useCallback, useEffect } from 'react'; // Adicionado useCallback, useEffect
import { FaWhatsapp, FaTimes } from 'react-icons/fa'; // Importado FaTimes
import { useAppContext } from '../../context/AppContext';
import { NOME_LANCHONETE, NUMERO_WHATSAPP } from '../../config';

export function CheckoutModal() {
    const { isCheckoutModalOpen, closeCheckoutModal, cart, cartTotal, clearCart, showToast } = useAppContext();
    const [formData, setFormData] = useState({
        clientName: '', street: '', number: '', complement: '', neighborhood: '', paymentMethod: '', troco: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Função para fechar o modal ao clicar no overlay
    const handleOverlayClick = useCallback((e) => {
        if (e.target === e.currentTarget && !isSubmitting) { // Não fechar se estiver submetendo
            closeCheckoutModal();
        }
    }, [closeCheckoutModal, isSubmitting]);

    // Efeito para adicionar/remover event listener para a tecla 'Escape'
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !isSubmitting) { // Não fechar se estiver submetendo
                closeCheckoutModal();
            }
        };

        if (isCheckoutModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCheckoutModalOpen, closeCheckoutModal, isSubmitting]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            showToast("Seu carrinho está vazio!");
            return;
        }
        setIsSubmitting(true);

        let address = `${formData.street}, ${formData.number}`;
        if (formData.complement) address += `, ${formData.complement}`;
        address += `, ${formData.neighborhood}`;

        let itemsListText = "";
        cart.forEach(item => {
            itemsListText += `- ${item.quantity}x ${item.name}`;
            if (item.optionsText) {
                 itemsListText += ` (${item.optionsText.replace(/; /g, ', ')})`;
            }
            itemsListText += ` - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
        });

        let paymentInfo = formData.paymentMethod;
        if (formData.paymentMethod === "Dinheiro" && formData.troco && parseFloat(formData.troco) > 0) {
            paymentInfo += ` (Troco para R$ ${parseFloat(formData.troco).toFixed(2).replace('.',',')})`;
        }

        const message = `📱 *NOVO PEDIDO - ${NOME_LANCHONETE}*

👤 *Cliente:* ${formData.clientName}
📍 *Endereço:* ${address}
💳 *Pagamento:* ${paymentInfo}

🍔 *Itens do Pedido:*
${itemsListText}
💰 *Total: R$ ${cartTotal.toFixed(2).replace('.', ',')}*

🛵 *Pedido gerado via App ${NOME_LANCHONETE}.*`;

        const whatsappUrl = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;

        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            showToast("Pedido enviado! Redirecionando para o WhatsApp...");
            clearCart();
            closeCheckoutModal();
            setFormData({ clientName: '', street: '', number: '', complement: '', neighborhood: '', paymentMethod: '', troco: '' });
            setIsSubmitting(false);
        }, 1500);
    };

    if (!isCheckoutModalOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[700] modal"
            onClick={handleOverlayClick} // Adicionado manipulador de clique no overlay
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto modal-content transform scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-[#E71D36]">Finalizar Pedido</h3>
                    {/* Botão 'X' Estilizado */}
                    <button
                        onClick={() => !isSubmitting && closeCheckoutModal()} // Não fechar se estiver submetendo
                        disabled={isSubmitting}
                        className={`p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
                        aria-label="Fechar modal de checkout"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {/* ... restante do formulário ... */}
                    <div className="mb-4">
                        <label htmlFor="client-name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo*</label>
                        <input type="text" id="client-name" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required disabled={isSubmitting} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Rua/Avenida*</label>
                            <input type="text" id="street" name="street" value={formData.street} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required disabled={isSubmitting} />
                        </div>
                        <div>
                            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">Número*</label>
                            <input type="text" id="number" name="number" value={formData.number} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required disabled={isSubmitting} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="complement" className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                            <input type="text" id="complement" name="complement" value={formData.complement} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" disabled={isSubmitting} />
                        </div>
                        <div>
                            <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">Bairro*</label>
                            <input type="text" id="neighborhood" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required disabled={isSubmitting} />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento*</label>
                        <select id="payment-method" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required disabled={isSubmitting}>
                            <option value="">Selecione...</option>
                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                            <option value="Cartão de Débito">Cartão de Débito</option>
                            <option value="Pix">Pix</option>
                            <option value="Dinheiro">Dinheiro</option>
                        </select>
                    </div>
                    {formData.paymentMethod === 'Dinheiro' && (
                        <div className="mb-4">
                            <label htmlFor="troco" className="block text-sm font-medium text-gray-700 mb-1">Precisa de troco para quanto?</label>
                            <input type="number" id="troco" name="troco" value={formData.troco} onChange={handleChange} placeholder="Ex: 50" className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" disabled={isSubmitting} />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#2ECC71] text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition duration-300 whatsapp-btn disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enviando...
                            </span>
                        ) : (
                             <span className="flex items-center justify-center"><FaWhatsapp className="mr-2" /> Enviar Pedido via WhatsApp</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}