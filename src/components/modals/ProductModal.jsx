import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

export function ProductModal() {
    const { selectedProduct, closeProductModal, addToCart } = useAppContext();
    const [quantity, setQuantity] = useState(1);
    const [currentOptions, setCurrentOptions] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        if (selectedProduct) {
            setQuantity(1);
            const initialOpts = (selectedProduct.options || []).map(opt => {
                let defaultValue = opt.default;
                if (opt.type === 'checkbox') defaultValue = [];
                return { name: opt.name, type: opt.type, value: defaultValue, priceChange: 0 };
            });
            setCurrentOptions(initialOpts);
        }
    }, [selectedProduct]);
    
    useEffect(() => {
        if (selectedProduct) {
            let price = selectedProduct.price;
            currentOptions.forEach(opt => {
                if (opt.type === 'checkbox' && Array.isArray(opt.value)) {
                    opt.value.forEach(v => price += extractPriceChange(v));
                } else if (opt.value) {
                    price += extractPriceChange(opt.value);
                }
            });
            setTotalPrice(price * quantity);
        }
    }, [selectedProduct, quantity, currentOptions]);

    const handleOptionChange = (optionName, optionType, value, isChecked) => {
        setCurrentOptions(prevOpts =>
            prevOpts.map(opt => {
                if (opt.name === optionName) {
                    if (optionType === 'checkbox') {
                        const currentValues = Array.isArray(opt.value) ? opt.value : [];
                        const newValues = isChecked
                            ? [...currentValues, value]
                            : currentValues.filter(v => v !== value);
                        return { ...opt, value: newValues, priceChange: newValues.reduce((sum, v) => sum + extractPriceChange(v),0) };
                    }
                    return { ...opt, value: value, priceChange: extractPriceChange(value) };
                }
                return opt;
            })
        );
    };
    
    const extractPriceChange = (optionValueString) => {
        if (typeof optionValueString !== 'string') return 0;
        const match = optionValueString.match(/\(\+R\$([\d,.]+)\)/);
        return match ? parseFloat(match[1].replace(',', '.')) : 0;
    };

    if (!selectedProduct) return null;

    const handleAddToCart = () => {
        const selectedOptionsDetails = currentOptions
            .map(opt => {
                if (opt.type === 'checkbox' && Array.isArray(opt.value)) {
                    return opt.value.map(v => ({ name: opt.name, value: v, priceChange: extractPriceChange(v) }));
                }
                return { name: opt.name, value: opt.value, priceChange: extractPriceChange(opt.value) };
            })
            .flat()
            .filter(opt => opt.value && ( (Array.isArray(opt.value) && opt.value.length > 0) || (!Array.isArray(opt.value) && opt.value !== '')) );

        addToCart(selectedProduct, quantity, selectedOptionsDetails);
        closeProductModal();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[500] modal">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto modal-content transform scale-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-[#E71D36]">{selectedProduct.name}</h3>
                    <button onClick={closeProductModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-48 object-cover rounded-md mb-4"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/cccccc/FFFFFF?text=Imagem Indisponível&font=Inter'; }}
                />
                <p className="text-gray-600 mb-4 text-sm">{selectedProduct.description}</p>

                {selectedProduct.options && selectedProduct.options.length > 0 && (
                    <div className="mb-4 max-h-40 overflow-y-auto pr-2">
                        <h4 className="text-md font-semibold text-gray-700 mb-2">Opções de Personalização:</h4>
                        {selectedProduct.options.map((option, optIndex) => (
                            <div key={optIndex} className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{option.name}</label>
                                {option.type === 'radio' && option.values.map((val, valIndex) => (
                                    <div key={valIndex} className="flex items-center mb-1">
                                        <input type="radio" id={`opt-${optIndex}-${valIndex}`} name={`opt-${optIndex}`} value={val}
                                               className="mr-2 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                                               checked={(currentOptions.find(o => o.name === option.name)?.value || option.default) === val}
                                               onChange={(e) => handleOptionChange(option.name, option.type, e.target.value)} />
                                        <label htmlFor={`opt-${optIndex}-${valIndex}`} className="text-sm text-gray-600">{val}</label>
                                    </div>
                                ))}
                                {option.type === 'select' && (
                                    <select 
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                        value={currentOptions.find(o => o.name === option.name)?.value || option.default}
                                        onChange={(e) => handleOptionChange(option.name, option.type, e.target.value)}
                                    >
                                        {option.values.map((val, valIndex) => <option key={valIndex} value={val}>{val}</option>)}
                                    </select>
                                )}
                                {option.type === 'checkbox' && option.values.map((val, valIndex) => (
                                     <div key={valIndex} className="flex items-center mb-1">
                                        <input type="checkbox" id={`opt-${optIndex}-${valIndex}`} value={val}
                                               className="mr-2 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                               checked={(currentOptions.find(o => o.name === option.name)?.value || []).includes(val)}
                                               onChange={(e) => handleOptionChange(option.name, option.type, e.target.value, e.target.checked)} />
                                        <label htmlFor={`opt-${optIndex}-${valIndex}`} className="text-sm text-gray-600">{val}</label>
                                    </div>
                                ))}
                                {option.type === 'textarea' && (
                                    <textarea
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                        rows="2"
                                        placeholder={option.placeholder || ''}
                                        value={currentOptions.find(o => o.name === option.name)?.value || ''}
                                        onChange={(e) => handleOptionChange(option.name, option.type, e.target.value)}
                                    ></textarea>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {!selectedProduct.options || selectedProduct.options.length === 0 && (
                    <p className="text-sm text-gray-500 mb-4">Nenhuma opção de personalização disponível.</p>
                )}

                <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-bold text-gray-800">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                    <div className="flex items-center">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="quantity-btn border rounded-l px-3 py-1 text-lg">-</button>
                        <span className="border-t border-b px-4 py-1 text-lg">{quantity}</span>
                        <button onClick={() => setQuantity(q => q + 1)} className="quantity-btn border rounded-r px-3 py-1 text-lg">+</button>
                    </div>
                </div>
                <button 
                    onClick={handleAddToCart}
                    className="w-full bg-[#2ECC71] text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition duration-300"
                >
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    );
}