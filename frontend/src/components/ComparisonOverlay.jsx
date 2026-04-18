import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComparisonOverlay = ({ selectedProducts, onRemove, onClear }) => {
    const navigate = useNavigate();

    if (selectedProducts.length === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1001] w-[95%] max-w-5xl animate-slide-up">
            <div className="premium-card p-6 border-accent-primary/50 shadow-[0_20px_50px_rgba(59,130,246,0.3)] bg-slate-900/90 backdrop-blur-2xl">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                        {selectedProducts.map(product => (
                            <div key={product.productId} className="min-w-[150px] relative group">
                                <div className="aspect-square rounded-xl bg-black/40 border border-white/10 p-2 relative overflow-hidden">
                                     <img src={product.imageUrls?.[0]} alt={product.title} className="w-full h-full object-contain" />
                                     <button 
                                        onClick={() => onRemove(product.productId)}
                                        className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                     >
                                        <X className="w-3 h-3 text-white" />
                                     </button>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-tight text-white mt-2 truncate">{product.title}</p>
                            </div>
                        ))}
                        
                        {selectedProducts.length < 4 && (
                            <div className="min-w-[150px] aspect-square rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500">
                                <p className="text-[10px] uppercase font-black tracking-widest">+ Add Unit</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-accent-primary leading-none">Comparison Node</p>
                            <p className="text-xl font-black italic uppercase text-white mt-1">{selectedProducts.length}/4 Active</p>
                        </div>
                        <button 
                            onClick={onClear}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 transition-all font-bold text-xs uppercase"
                        >
                            Reset
                        </button>
                        <button 
                            disabled={selectedProducts.length < 2}
                            onClick={() => {/* Open Modal or Link to Compare Page */}}
                            className="btn-primary px-10 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sync Comparison
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonOverlay;
