import { useAppContext } from '../context/AppContext';

export function CategoryMenu() {
    const { categories, currentCategory, setCurrentCategory } = useAppContext();
    return (
        <section className="bg-white py-3 shadow-sm sticky top-[68px] z-40 overflow-x-auto category-menu">
            <div className="container mx-auto px-4">
                <div className="inline-flex space-x-6 text-gray-600 whitespace-nowrap">
                    {categories.map(category => (
                        <span
                            key={category}
                            className={`category-item py-2 px-1 text-sm sm:text-base font-medium cursor-pointer ${category === currentCategory ? 'active text-[#E71D36] border-b-2 border-[#E71D36]' : 'hover:text-[#E71D36]'}`}
                            onClick={() => setCurrentCategory(category)}
                        >
                            {category}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}