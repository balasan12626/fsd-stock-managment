import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sellerAPI, adminAPI, customerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    FileText,
    Download,
    Package,
    User,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Building2,
    Shield,
    Smartphone
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const OrderManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, getRole } = useAuth();
    const role = getRole();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [role]);

    const fetchOrders = async () => {
        try {
            let res;
            if (role === 'admin') {
                res = await adminAPI.getAllOrders();
            } else if (role === 'seller') {
                res = await sellerAPI.getOrders(user.sellerId);
            } else {
                res = await customerAPI.orders.get();
            }
            setOrders(res.data || []);
        } catch (err) {
            console.error('Fetch Orders Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateInvoice = (item, order) => {
        const doc = new jsPDF();
        const seller = item.sellerDetail || {};
        const customer = order.customerName || 'Valued Customer';
        const address = order.shippingAddress || {};
        const addressStr = `${address.street || ''}, ${address.city || ''} - ${address.zip || ''}`;

        // ========== HEADER & COMPANY BRANDING ==========
        // Company Logo Area (Top Left)
        const brandColor = role === 'seller' ? [6, 182, 212] : [139, 92, 246];
        doc.setFillColor(...brandColor);
        doc.roundedRect(15, 15, 50, 12, 3, 3, 'F');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('TECHVIBE', 40, 23, { align: 'center' });

        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text('NEXT-GEN HARDWARE SOLUTIONS', 20, 32);
        doc.text('support@techvibe.com | +1 (800) TECH-123', 20, 36);

        // Invoice Title (Top Right)
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

        // Separator Line
        doc.setDrawColor(...brandColor);
        doc.setLineWidth(0.5);
        doc.line(15, 45, 195, 45);

        // ========== SELLER INFORMATION (LEFT COLUMN) ==========
        let yPos = 55;

        // Seller Logo - Visual Design
        const sellerInitial = (seller.companyName || 'S').charAt(0).toUpperCase();

        // Outer circle with gradient effect (border)
        doc.setFillColor(...brandColor);
        doc.circle(25, yPos + 10, 11, 'F');

        // Inner circle (background)
        const lighterColor = brandColor.map((c, i) => i === 0 ? c + 4 : c + 18);
        doc.setFillColor(...lighterColor);
        doc.circle(25, yPos + 10, 9, 'F');

        // Company initial in the center
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(sellerInitial, 25, yPos + 13, { align: 'center' });

        // Seller Details
        doc.setFontSize(10);
        doc.setTextColor(...brandColor);
        doc.setFont('helvetica', 'bold');
        doc.text('SOLD BY:', 40, yPos + 3);

        doc.setFontSize(11);
        doc.setTextColor(30);
        doc.text(seller.companyName || 'Verified Seller', 40, yPos + 10);

        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.setFont('helvetica', 'normal');
        doc.text(`GSTIN: ${seller.gstNumber || '29AAAAA0000A1Z5'}`, 40, yPos + 16);
        doc.text(`Email: ${seller.email || 'seller@techvibe.com'}`, 40, yPos + 21);
        doc.text(`Phone: ${seller.phone || '+1 (555) SELLER'}`, 40, yPos + 26);
        doc.text(`Address: ${seller.address || 'Distribution Center'}`, 40, yPos + 31, { maxWidth: 75 });

        // ========== CUSTOMER INFORMATION (RIGHT COLUMN) ==========
        doc.setFontSize(10);
        doc.setTextColor(...brandColor);
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

        // ========== PRODUCT DETAILS TABLE ==========
        const quantity = item.quantity || 1;
        const unitPrice = parseFloat(item.price);
        const subtotal = unitPrice * quantity;
        const gstRate = 0.18;
        const gstAmount = subtotal * gstRate;
        const total = subtotal + gstAmount;

        doc.autoTable({
            startY: yPos + 45,
            head: [['#', 'Product Description', 'Qty', 'Unit Price', 'Subtotal', 'GST (18%)', 'Total']],
            body: [[
                '1',
                item.title || 'Product',
                quantity,
                `$${unitPrice.toFixed(2)}`,
                `$${subtotal.toFixed(2)}`,
                `$${gstAmount.toFixed(2)}`,
                `$${total.toFixed(2)}`
            ]],
            theme: 'grid',
            headStyles: {
                fillColor: brandColor,
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

        // ========== PAYMENT SUMMARY ==========
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(120, finalY, 75, 35, 2, 2, 'F');

        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.setFont('helvetica', 'normal');

        doc.text('Subtotal:', 125, finalY + 8);
        doc.text(`$${subtotal.toFixed(2)}`, 190, finalY + 8, { align: 'right' });

        doc.text('GST (18%):', 125, finalY + 15);
        doc.text(`$${gstAmount.toFixed(2)}`, 190, finalY + 15, { align: 'right' });

        doc.setDrawColor(200);
        doc.line(125, finalY + 19, 190, finalY + 19);

        doc.setFontSize(12);
        doc.setTextColor(...brandColor);
        doc.setFont('helvetica', 'bold');
        doc.text('GRAND TOTAL:', 125, finalY + 28);
        doc.text(`$${total.toFixed(2)}`, 190, finalY + 28, { align: 'right' });

        // ========== PAYMENT INFO ==========
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');
        doc.text(`Payment Method: ${order.paymentMethod || 'Cash on Delivery'}`, 15, finalY + 20);
        doc.text(`Payment Status: ${order.paymentStatus || 'Pending'}`, 15, finalY + 25);

        // ========== FOOTER ==========
        doc.setDrawColor(230);
        doc.line(15, 270, 195, 270);

        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.text('Terms & Conditions:', 15, 275);
        doc.text('1. Products are covered under manufacturer warranty.', 15, 279);
        doc.text('2. This is a computer-generated invoice and does not require a signature.', 15, 283);

        doc.setFontSize(8);
        doc.setTextColor(...brandColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Thank you for choosing TechVibe!', 105, 290, { align: 'center' });

        // Save PDF
        doc.save(`TechVibe_Invoice_${order.orderId}_${item.productId.slice(0, 6)}.pdf`);
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await customerAPI.orders.updateStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error('Status Update Error:', err);
            alert('PROTOCOL FAILURE: Could not synchronize status update with main node.');
        }
    };

    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    const filteredOrders = orders.filter(o =>
        o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(role === 'admin' ? '/admin/dashboard' : '/sell/dashboard')}
                            className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                                {role === 'admin' ? 'Global Command' : 'Trading Hub'} <span className={role === 'seller' ? 'text-cyan-400' : 'text-purple-500'}>Orders</span>
                            </h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Managing {orders.length} ACTIVE REQUISITIONS</p>
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Order ID / Email..."
                            className="bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 pl-12 w-80 focus:outline-none focus:border-white/10 transition-all text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <Clock className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className={`w-12 h-12 border-4 ${role === 'seller' ? 'border-cyan-500' : 'border-purple-500'} border-t-transparent rounded-full animate-spin`}></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Syncing Distributed Ledgers...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="glass-card rounded-[3rem] p-32 text-center border-2 border-dashed border-white/5">
                        <FileText className="w-24 h-24 text-slate-800 mx-auto mb-8" />
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-500">No Orders Logged</h2>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map(order => (
                            <div key={order.orderId} className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-all group">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Order Meta */}
                                    <div className="lg:w-1/4 border-r border-white/5 pr-8 space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Order ID</p>
                                            <h3 className="text-lg font-mono font-bold text-white tracking-widest">{order.orderId}</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                                                <Calendar className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Timestamp</p>
                                                <p className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className={`p-1 rounded-2xl border transition-all ${
                                            order.status === 'Delivered' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                                            order.status === 'Cancelled' ? 'bg-red-500/10 border-red-500/20' : 
                                            'bg-white/5 border-white/5'
                                        }`}>
                                            {(role === 'seller' || role === 'admin') ? (
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                                                    className="w-full bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-white cursor-pointer px-4 py-2"
                                                >
                                                    {statusOptions.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                                                </select>
                                            ) : (
                                                <div className="flex items-center gap-4 py-2 px-4">
                                                    <div className={`w-2 h-2 rounded-full animate-pulse ${order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    {/* Customer & Items */}
                                    <div className="flex-grow space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/5">
                                                    <User className="w-6 h-6 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black italic tracking-tighter uppercase">{order.customerName}</p>
                                                    <p className="text-xs text-slate-500 font-bold">{order.customerEmail}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Total Valuation</p>
                                                <p className={`text-4xl font-black tracking-tighter ${role === 'seller' ? 'text-cyan-400' : 'text-purple-500'}`}>${parseFloat(order.totalAmount).toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-6 p-5 bg-white/5 rounded-3xl border border-white/5 relative group/item">
                                                    <div className="w-16 h-16 bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                                        <img src={item.imageUrls?.[0]} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="text-xs font-black uppercase tracking-widest text-slate-600 mb-1">
                                                            {role === 'admin' ? `Seller: ${item.sellerDetail?.companyName}` : 'Hardware Unit'}
                                                        </p>
                                                        <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <p className="text-xs font-black text-emerald-500">${item.price} x {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => generateInvoice(item, order)}
                                                        className="p-4 bg-white/5 text-slate-400 rounded-2xl hover:bg-white/10 hover:text-white transition-all shadow-xl"
                                                        title="Download Individual Invoice"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary Action */}
                                    <div className="lg:w-48 flex lg:flex-col justify-between gap-4">
                                        <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 text-center flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">Protocol</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <Smartphone className="w-4 h-4 text-slate-500" />
                                                <span className="text-xs font-bold text-white uppercase">{order.paymentMethod}</span>
                                            </div>
                                        </div>
                                        <button className="flex-1 py-4 bg-white text-slate-950 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                                            View Logs <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderManagement;
