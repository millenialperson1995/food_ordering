import React, { useState, useCallback, useEffect } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import { NOME_LANCHONETE, NUMERO_WHATSAPP } from '../../config';

export function CheckoutModal() {
    const { isCheckoutModalOpen, closeCheckoutModal, cart, cartTotal, clearCart, showToast } = useAppContext();
    const initialFormData = {
        clientName: '', street: '', number: '', complement: '', neighborhood: '', paymentMethod: '', troco: ''
    };
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Resetar o formulário quando o modal for aberto/fechado ou o carrinho mudar
    useEffect(() => {
        if (isCheckoutModalOpen) {
            setFormData(initialFormData); // Reseta o formulário ao abrir
        }
    }, [isCheckoutModalOpen]);


    const handleOverlayClick = useCallback((e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            closeCheckoutModal();
        }
    }, [closeCheckoutModal, isSubmitting]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !isSubmitting) {
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
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Previne o comportamento padrão do formulário

        // Validação para garantir que o carrinho não está vazio
        if (!Array.isArray(cart) || cart.length === 0) {
            showToast("Seu carrinho está vazio! Adicione itens antes de finalizar.");
            setIsSubmitting(false); // Reseta o estado de submissão
            return;
        }

        setIsSubmitting(true);

        // Validação dos campos do formulário
        const requiredFields = ['clientName', 'street', 'number', 'neighborhood', 'paymentMethod'];
        for (const field of requiredFields) {
            if (!formData[field] || !formData[field].trim()) {
                showToast(`Por favor, preencha o campo: ${field === 'clientName' ? 'Nome Completo' : field === 'paymentMethod' ? 'Método de Pagamento' : field}.`);
                setIsSubmitting(false);
                return;
            }
        }

        let address = `${formData.street.trim()}, ${formData.number.trim()}`;
        if (formData.complement && formData.complement.trim()) {
            address += `, ${formData.complement.trim()}`;
        }
        address += `, ${formData.neighborhood.trim()}`;

        let itemsListText = "";
        if (Array.isArray(cart)) {
            cart.forEach(item => {
                const itemName = item.name || "Produto sem nome";
                const itemQuantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
                const itemPrice = typeof item.price === 'number' ? item.price : 0;
                
                itemsListText += `- ${itemQuantity}x ${itemName}`;
                if (item.optionsText) {
                     itemsListText += ` (${item.optionsText.replace(/; /g, ', ')})`;
                }
                itemsListText += ` - R$ ${(itemPrice * itemQuantity).toFixed(2).replace('.', ',')}\n`;
            });
        }


        let paymentInfo = formData.paymentMethod;
        if (formData.paymentMethod === "Dinheiro") {
            const trocoInput = formData.troco.trim();
            if (trocoInput) { // Se o campo de troco foi preenchido
                const trocoValue = parseFloat(trocoInput.replace(',', '.')); // Aceita vírgula como decimal
                if (!isNaN(trocoValue) && trocoValue > 0) {
                    if (trocoValue < cartTotal) {
                        showToast("O valor do troco deve ser maior ou igual ao total do pedido.");
                        setIsSubmitting(false);
                        return;
                    }
                    paymentInfo += ` (Troco para R$ ${trocoValue.toFixed(2).replace('.',',')})`;
                } else {
                    showToast("Valor de troco inválido. Insira um número válido.");
                    setIsSubmitting(false);
                    return;
                }
            }
        }
        
        const finalCartTotal = typeof cartTotal === 'number' ? cartTotal : 0;

        const message = `🛍️ *NOVO PEDIDO - ${NOME_LANCHONETE}*

        🧑 *Cliente:* ${formData.clientName.trim()}
        🏠 *Endereço:* ${address}
        💲 *Pagamento:* ${paymentInfo}

        📋 *Itens do Pedido:*
        ${itemsListText}
        
        💰 *Total: R$ ${finalCartTotal.toFixed(2).replace('.', ',')}*

        🚀 *Pedido gerado via App ${NOME_LANCHONETE}.*`;

        const whatsappUrl = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
        
        console.log("Mensagem para WhatsApp:", message); // Para debug
        console.log("URL WhatsApp:", whatsappUrl); // Para debug

        try {
            const newWindow = window.open(whatsappUrl, '_blank');
            // Verifica se a janela foi bloqueada (essa verificação não é 100% garantida)
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                 setTimeout(() => { // Dá um tempo para o usuário ver a mensagem, caso o popup tenha sido bloqueado
                    showToast("A janela do WhatsApp pode ter sido bloqueada pelo seu navegador. Por favor, verifique.");
                    // Não limpa o carrinho nem fecha o modal se o WhatsApp não abrir
                    // setIsSubmitting(false); // Permite tentar novamente após verificar o bloqueador
                }, 500);
                // Não prosseguir com clearCart e closeModal aqui,
                // para o usuário não perder os dados se o WhatsApp não abrir.
                // Opcionalmente, pode-se resetar isSubmitting aqui após um delay para permitir nova tentativa.
            }
        } catch (error) {
            console.error("Erro ao tentar abrir o WhatsApp:", error);
            showToast("Ocorreu um erro ao tentar abrir o WhatsApp. Tente novamente.");
            setIsSubmitting(false);
            return;
        }

        // Adia a limpeza e o fechamento para dar tempo ao redirecionamento
        // e para o caso de o usuário precisar copiar a mensagem se o redirect automático falhar.
        setTimeout(() => {
            showToast("Seu pedido está sendo preparado para envio via WhatsApp!");
            // A decisão de limpar o carrinho e fechar o modal aqui assume que o WhatsApp abriu
            // ou que o usuário teve a chance de interagir.
            // Para maior robustez, poderia haver um feedback do usuário ("WhatsApp abriu corretamente?")
            // mas isso complexifica a UI.
            clearCart();
            closeCheckoutModal();
            // setFormData(initialFormData) é feito pelo useEffect ao reabrir
            setIsSubmitting(false);
        }, 3000); // Tempo para o usuário ver a mensagem e o WhatsApp carregar
    };

    if (!isCheckoutModalOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[700] modal"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto modal-content transform scale-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-[#E71D36]">Finalizar Pedido</h3>
                    <button
                        onClick={() => !isSubmitting && closeCheckoutModal()}
                        disabled={isSubmitting}
                        className={`p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
                        aria-label="Fechar modal de checkout"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {/* Nome Completo */}
                    <div className="mb-4">
                        <label htmlFor="client-name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo*</label>
                        <input type="text" id="client-name" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required disabled={isSubmitting} />
                    </div>

                    {/* Endereço */}
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

                    {/* Método de Pagamento */}
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

                    {/* Campo de Troco (condicional) */}
                    {formData.paymentMethod === 'Dinheiro' && (
                        <div className="mb-4">
                            <label htmlFor="troco" className="block text-sm font-medium text-gray-700 mb-1">Precisa de troco para quanto? (opcional)</label>
                            <input 
                                type="text" // Mudar para text para melhor formatação e parse com vírgula
                                inputMode="decimal" // Sugere teclado numérico em mobile
                                id="troco" 
                                name="troco" 
                                value={formData.troco} 
                                onChange={handleChange} 
                                placeholder="Ex: 50 ou 50,00" 
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" 
                                disabled={isSubmitting} />
                        </div>
                    )}

                    {/* Botão de Enviar */}
                    <button
                        type="submit"
                        disabled={isSubmitting || (Array.isArray(cart) && cart.length === 0)} // Desabilita se estiver submetendo ou carrinho vazio
                        className="w-full bg-[#2ECC71] text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition duration-300 whatsapp-btn disabled:opacity-70 disabled:cursor-not-allowed"
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