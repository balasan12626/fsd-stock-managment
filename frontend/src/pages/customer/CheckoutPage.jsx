import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import CustomerNavbar from '../../components/CustomerNavbar';
import {
    CreditCard,
    Smartphone,
    Banknote,
    CheckCircle2,
    Download,
    ShieldCheck,
    ArrowRight,
    Home,
    ShoppingBag,
    Mail,
    Phone,
    MapPin,
    FileText,
    Zap,
    ChevronRight,
    Package,
    Activity,
    Lock
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [finalOrder, setFinalOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [address, setAddress] = useState({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        zip: ''
    });

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await customerAPI.cart.get();
                if (res.data.length === 0 && !orderSuccess) navigate('/shop/cart');
                setCart(res.data);
            } catch (err) {
                console.error(err);
                navigate('/shop/login');
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [navigate, orderSuccess]);

    const handlePlaceOrder = async () => {
        if (!address.fullName || !address.phone || !address.street) {
            alert('Please fill in shipping details');
            return;
        }

        setProcessing(true);
        try {
            const orderPayload = {
                items: cart,
                paymentMethod,
                shippingAddress: address
            };
            const res = await customerAPI.orders.create(orderPayload);
            setFinalOrder(res.data.order);
            setOrderSuccess(true);
        } catch (err) {
            console.error(err);
            alert('Failed to place order. Try again.');
        } finally {
            setProcessing(false);
        }
    };

    const generateInvoice = (item, order) => {
        const doc = new jsPDF();
        const seller = item.sellerDetail || {};
        const customer = order.customerName || 'Valued Customer';
        const address = order.shippingAddress || {};
        const addressStr = `${address.street || ''}, ${address.city || ''} - ${address.zip || ''}`;

        doc.setFillColor(59, 130, 246);
        doc.roundedRect(15, 15, 50, 12, 3, 3, 'F');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('STOCKSYNC', 40, 23, { align: 'center' });

        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text('PREMIUM HARDWARE ECOSYSTEM', 20, 32);
        doc.text('support@stocksync.ai | +1 (800) SYNC-AI', 20, 36);

        doc.setFontSize(24);
        doc.setTextColor(30);
        doc.setFont('helvetica', 'bold');
        doc.text('TAX INVOICE', 200, 23, { align: 'right' });

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice #: INV-${order.orderId.split('-')[1]}-${item.productId.slice(0, 4)}`, 200, 30, { align: 'right' });
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 200, 35, { align: 'right' });
        doc.text(`Order ID: ${order.orderId}`, 200, 40, { align: 'right' });

        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.5);
        doc.line(15, 45, 195, 45);

        let yPos = 55;
        const sellerInitial = (seller.companyName || 'S').charAt(0).toUpperCase();

        doc.setFillColor(59, 130, 246);
        doc.circle(25, yPos + 10, 11, 'F');
        doc.setFillColor(80, 150, 255);
        doc.circle(25, yPos + 10, 9, 'F');

        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(sellerInitial, 25, yPos + 13, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(59, 130, 246);
        doc.setFont('helvetica', 'bold');
        doc.text('SOLD BY:', 40, yPos + 3);

        doc.setFontSize(11);
        doc.setTextColor(30);
        doc.text(seller.companyName || 'Verified Vendor', 40, yPos + 10);

        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.setFont('helvetica', 'normal');
        doc.text(`GSTIN: ${seller.gstNumber || '29AAAAA0000A1Z5'}`, 40, yPos + 16);
        doc.text(`Email: ${seller.email || 'seller@stocksync.ai'}`, 40, yPos + 21);
        doc.text(`Phone: ${seller.phone || '+1 (555) SELLER'}`, 40, yPos + 26);
        doc.text(`Address: ${seller.address || 'Distribution Center'}`, 40, yPos + 31, { maxWidth: 75 });

        doc.setFontSize(10);
        doc.setTextColor(59, 130, 246);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO:', 120, yPos + 3);

        doc.setFontSize(11);
        doc.setTextColor(30);
        doc.text(customer, 120, yPos + 10);

        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.setFont('helvetica', 'normal');
        doc.text(`Email: ${order.customerEmail}`, 120, yPos + 16);
        doc.text(`Phone: ${address.phone || 'N/A'}`, 120, yPos + 21);
        doc.text(`Address: ${addressStr}`, 120, yPos + 26, { maxWidth: 75 });

        const quantity = item.quantity || 1;
        const unitPrice = parseFloat(item.price);
        const subtotal = unitPrice * quantity;
        const gstRate = 0.18;
        const gstAmount = subtotal * gstRate;
        const total = subtotal + gstAmount;

        doc.autoTable({
            startY: yPos + 45,
            head: [['#', 'Asset Description', 'Qty', 'Node Price', 'Subtotal', 'Tax (18%)', 'Total']],
            body: [[
                '1',
                item.title || 'Hardware Asset',
                quantity,
                `₹${unitPrice.toLocaleString()}`,
                `₹${subtotal.toLocaleString()}`,
                `₹${gstAmount.toLocaleString()}`,
                `₹${total.toLocaleString()}`
            ]],
            theme: 'grid',
            headStyles: {
                fillColor: [59, 130, 246],
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: 50
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 70 },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 25, halign: 'right' },
                4: { cellWidth: 25, halign: 'right' },
                5: { cellWidth: 25, halign: 'right' },
                6: { cellWidth: 25, halign: 'right' }
            },
            margin: { left: 15, right: 15 }
        });

        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(120, finalY, 75, 35, 2, 2, 'F');

        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', 125, finalY + 8);
        doc.text(`₹${subtotal.toLocaleString()}`, 190, finalY + 8, { align: 'right' });
        doc.text('GST (18%):', 125, finalY + 15);
        doc.text(`₹${gstAmount.toLocaleString()}`, 190, finalY + 15, { align: 'right' });
        doc.setDrawColor(200);
        doc.line(125, finalY + 19, 190, finalY + 19);

        doc.setFontSize(12);
        doc.setTextColor(59, 130, 246);
        doc.setFont('helvetica', 'bold');
        doc.text('GRAND TOTAL:', 125, finalY + 28);
        doc.text(`₹${total.toLocaleString()}`, 190, finalY + 28, { align: 'right' });

        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(`Payment: ${order.paymentMethod}`, 15, finalY + 20);
        doc.text(`Status: Authorized`, 15, finalY + 25);

        doc.setDrawColor(230);
        doc.line(15, 270, 195, 270);
        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.text('1. Verified Asset under StockSync Protocol.', 15, 275);
        doc.text('2. Computer generated invoice - No signature required.', 15, 279);

        doc.setFontSize(8);
        doc.setTextColor(59, 130, 246);
        doc.setFont('helvetica', 'bold');
        doc.text('StockSync AI Deployment Confirmed.', 105, 290, { align: 'center' });

        doc.save(`Invoice_${order.orderId}_${item.productId.slice(0, 6)}.pdf`);
    };

    if (loading) return (
        <div className="min-h-screen bg-primary flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing Checkout Protocol...</p>
        </div>
    );

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center p-6 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 cosmic-grid opacity-30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent-primary/5 blur-[200px] rounded-full" />

                <div className="max-w-3xl w-full premium-card p-16 text-center relative z-10 border-accent-primary/30">
                    <div className="w-24 h-24 bg-accent-success/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-accent-success/20 shadow-2xl shadow-emerald-500/10">
                        <CheckCircle2 className="w-12 h-12 text-accent-success" />
                    </div>

                    <h1 className="text-5xl font-black text-primary italic tracking-tighter uppercase mb-2">Purchase <span className="text-accent-success">Authorized</span></h1>
                    <p className="text-secondary uppercase tracking-[0.3em] font-bold text-[10px] mb-12">Mission Critical Assets Allocated Successfully</p>

                    <div className="glass-card p-6 rounded-2xl border border-glass bg-white/[0.02] mb-12 flex items-center justify-between text-left">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Deployment ID</p>
                            <p className="text-lg font-black italic text-primary">{finalOrder?.orderId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Status</p>
                            <span className="text-sm font-black text-accent-success uppercase italic">Archived</span>
                        </div>
                    </div>

                    <div className="space-y-6 mb-16 px-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary flex items-center justify-center gap-4">
                            <div className="w-10 h-px bg-glass" />
                            Asset Invoices
                            <div className="w-10 h-px bg-glass" />
                        </h3>
                        <div className="grid grid-cols-1 gap-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {finalOrder?.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-glass group hover:border-accent-primary/40 hover:bg-white/[0.05] transition-all">
                                    <div className="flex items-center gap-5 text-left">
                                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center border border-glass group-hover:bg-accent-primary/20 transition-all">
                                            <FileText className="w-6 h-6 text-secondary group-hover:text-accent-primary transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black italic uppercase text-primary truncate max-w-[200px]">{item.title}</p>
                                            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60">Vendor Node: {item.sellerDetail?.companyName?.slice(0, 15)}...</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => generateInvoice(item, finalOrder)}
                                        className="btn-secondary p-3 shadow-none border-glass hover:bg-accent-primary hover:text-white group-hover:scale-105"
                                        title="Download Manifest"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/shop')}
                            className="flex-1 btn-primary py-5 text-sm group"
                        >
                            Return to Interface <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    return (
        <div className="min-h-screen bg-primary text-primary selection:bg-accent-primary/30 cosmic-grid pb-32">
            <CustomerNavbar />

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="animate-slide-up">
                        <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                            System <span className="text-accent-primary">Checkout</span>
                        </h1>
                        <p className="text-secondary mt-2 uppercase tracking-[0.2em] font-bold text-[10px]">Secure P2P Transaction Protocol Active</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Data Input Section */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-accent-primary/10 border border-accent-primary/20"><MapPin className="w-6 h-6 text-accent-primary" /></div>
                                Shipping Logistics
                            </h2>
                            <div className="premium-card p-10 space-y-8 bg-white/[0.02]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-secondary ml-1">Asset Receiver Name</label>
                                        <input
                                            type="text"
                                            placeholder="Operator Identification"
                                            className="input-field"
                                            value={address.fullName}
                                            onChange={e => setAddress({ ...address, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-secondary ml-1">Secure Contact Link</label>
                                        <input
                                            type="text"
                                            placeholder="+91 [NODE-ACCESS]"
                                            className="input-field"
                                            value={address.phone}
                                            onChange={e => setAddress({ ...address, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-secondary ml-1">Delivery Coordinate (Address)</label>
                                    <input
                                        type="text"
                                        placeholder="Sector, Street, Access Node"
                                        className="input-field"
                                        value={address.street}
                                        onChange={e => setAddress({ ...address, street: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-secondary ml-1">Hub City</label>
                                        <input
                                            type="text"
                                            placeholder="Metro Hub"
                                            className="input-field"
                                            value={address.city}
                                            onChange={e => setAddress({ ...address, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-secondary ml-1">Sector Code [ZIP]</label>
                                        <input
                                            type="text"
                                            placeholder="000 000"
                                            className="input-field"
                                            value={address.zip}
                                            onChange={e => setAddress({ ...address, zip: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-accent-primary/10 border border-accent-primary/20"><CreditCard className="w-6 h-6 text-accent-primary" /></div>
                                Payment Protocol
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { id: 'COD', label: 'Cash Dispatch', icon: Banknote, active: true },
                                    { id: 'UPI', label: 'UPI Sync', icon: Smartphone, active: false },
                                    { id: 'CARD', label: 'Neural Card', icon: CreditCard, active: false },
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => method.active && setPaymentMethod(method.id)}
                                        disabled={!method.active}
                                        className={`premium-card p-8 flex flex-col gap-6 items-start text-left group transition-all relative overflow-hidden ${paymentMethod === method.id ? 'border-accent-primary shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-accent-primary/5' : 'border-glass opacity-50 hover:opacity-100 hover:border-white/20'
                                            }`}
                                    >
                                        <method.icon className={`w-10 h-10 ${paymentMethod === method.id ? 'text-accent-primary' : 'text-secondary opacity-40'}`} />
                                        <div className="space-y-1">
                                            <p className={`font-black italic uppercase tracking-tighter text-lg ${paymentMethod === method.id ? 'text-primary' : 'text-secondary'}`}>{method.label}</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-secondary">{method.active ? 'Ready for Sync' : 'Offline'}</p>
                                        </div>
                                        {paymentMethod === method.id && (
                                            <div className="absolute top-6 right-6 p-1 rounded-lg bg-accent-primary/20 text-accent-primary border border-accent-primary/20">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-32 space-y-8">
                            <div className="premium-card p-10 border-accent-primary/20 bg-gradient-to-br from-white/[0.02] to-transparent">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10 flex items-center justify-between">
                                    Bundle <span className="text-secondary opacity-20">Manifest</span>
                                </h3>

                                <div className="space-y-8 mb-12 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {cart.map((item, i) => (
                                        <div key={i} className="flex gap-6 items-center group">
                                            <div className="w-20 h-20 bg-primary rounded-xl overflow-hidden border border-glass shrink-0 p-1 group-hover:border-accent-primary transition-all">
                                                {item.imageUrls?.[0] ? <img src={item.imageUrls[0]} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-full h-full p-4 text-secondary opacity-20" />}
                                            </div>
                                            <div className="flex-grow space-y-1">
                                                <h4 className="text-sm font-black italic uppercase text-primary line-clamp-1">{item.title}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Qty: {item.quantity}</span>
                                                    <span className="w-1 h-1 rounded-full bg-glass" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-primary">Verified Node</span>
                                                </div>
                                            </div>
                                            <p className="font-black italic text-lg tracking-tighter italic">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6 border-t border-glass pt-10">
                                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-secondary italic">
                                        <span>Allocated Net</span>
                                        <span className="text-primary text-xl">₹{total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-secondary italic">
                                        <span>Node Shipping</span>
                                        <span className="text-accent-success uppercase">FREE DISPATCH</span>
                                    </div>
                                    <div className="pt-8 border-t border-glass flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40">Deployment Total</p>
                                            <span className="text-xl font-black italic not-italic opacity-40">INR</span>
                                        </div>
                                        <span className="text-6xl font-black text-primary tracking-tighter italic shadow-text">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={processing}
                                    className="w-full btn-primary py-6 mt-12 flex items-center justify-center gap-4 text-xl group shadow-blue-500/20"
                                >
                                    {processing ? (
                                        <>
                                            <Activity className="w-6 h-6 animate-pulse" />
                                            Syncing Order...
                                        </>
                                    ) : (
                                        <>
                                            Execute Authorization <ShieldCheck className="w-6 h-6 fill-current" />
                                        </>
                                    )}
                                </button>

                                <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40">
                                    <Lock className="w-4 h-4 text-accent-success" />
                                    End-to-End P2P Sync Active
                                </div>
                            </div>

                            <div className="premium-card p-8 bg-accent-primary/5 border-glass flex gap-6 items-center">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-glass flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="w-7 h-7 text-accent-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black italic uppercase tracking-widest">Protocol Assurance</h4>
                                    <p className="text-[10px] font-bold text-secondary uppercase tracking-tight leading-tight">Assets are protected by Global Node Guard. Verified per-unit billing standard.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .shadow-text {
                    text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
                }
            ` }} />
        </div>
    );
};

export default CheckoutPage;
