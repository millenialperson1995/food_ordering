export function SubmittingOverlay({ isActive }) {
    if (!isActive) return null;
    return (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-[800] modal">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24 mb-4"></div>
            <p className="text-lg font-semibold text-[#E71D36]">Preparando seu pedido...</p>
        </div>
    );
}