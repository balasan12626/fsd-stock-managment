import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { productAPI } from '../services/api';

const BulkUploadModal = ({ isOpen, onClose, onRefresh }) => {
    const [fileData, setFileData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const rows = text.split('\n').slice(1); // Skip header
                const products = rows.filter(r => r.trim()).map(row => {
                    const [title, description, price, category, quantity] = row.split(',').map(s => s.trim());
                    return { title, description, price: parseFloat(price), category, quantity: parseInt(quantity) };
                });
                setFileData(products);
                setStatus({ type: 'success', message: `Parsed ${products.length} hardware units from manifest.` });
            } catch (err) {
                setStatus({ type: 'error', message: 'MANIFEST CORRUPTION: Could not parse CSV structure.' });
            }
        };
        reader.readAsText(file);
    };

    const handleUpload = async () => {
        if (!fileData) return;
        setLoading(true);
        try {
            await productAPI.bulkAdd(fileData);
            setStatus({ type: 'success', message: 'DEPLOYMENT COMPLETE: All units synchronized with global inventory.' });
            setTimeout(() => {
                onRefresh();
                onClose();
            }, 2000);
        } catch (err) {
            setStatus({ type: 'error', message: 'SYNC FAILURE: Deployment interrupted by protocol error.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-2xl rounded-[2rem] p-10 border-accent-primary/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/10 rounded-full blur-[100px] -z-10" />
                
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-accent-primary/20 border border-accent-primary/30">
                            <Upload className="w-6 h-6 text-accent-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight">Bulk Upload <span className="text-accent-primary">Manifest</span></h2>
                            <p className="text-secondary text-[10px] font-bold uppercase tracking-widest">Global Node Deployment</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-xl hover:bg-white/5 transition-all">
                        <X className="w-6 h-6 text-secondary" />
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="p-12 border-2 border-dashed border-glass rounded-3xl flex flex-col items-center gap-6 group hover:border-accent-primary/50 transition-all bg-white/[0.02]">
                        <input 
                            type="file" 
                            accept=".csv" 
                            onChange={handleFileChange} 
                            className="hidden" 
                            id="bulk-file-input" 
                        />
                        <label 
                            htmlFor="bulk-file-input" 
                            className="cursor-pointer flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-glass flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="w-8 h-8 text-secondary group-hover:text-accent-primary" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold uppercase tracking-widest text-xs">Inject CSV Manifest</p>
                                <p className="text-[10px] text-secondary mt-1">Format: Title, Desc, Price, Category, Qty</p>
                            </div>
                        </label>
                    </div>

                    {status.message && (
                        <div className={`p-6 rounded-[1.5rem] flex items-center gap-4 border animate-fade-in ${
                            status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                            {status.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            <span className="text-xs font-black uppercase tracking-widest">{status.message}</span>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button 
                            disabled={!fileData || loading}
                            onClick={handleUpload}
                            className="btn-primary flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            SYNC TO MATRIX
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;
