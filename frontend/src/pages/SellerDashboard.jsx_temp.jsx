<td className="px-8 py-5">
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-all duration-300">
        <button
            onClick={() => navigate('/sell/edit-product', { state: { product } })}
            className="p-2.5 rounded-xl bg-white/5 border border-glass text-accent-primary hover:bg-accent-primary hover:text-white transition-all shadow-sm"
        >
            <Edit3 className="w-4 h-4" />
        </button>
        <button
            onClick={() => handleDelete(product.productId)}
            className="p-2.5 rounded-xl bg-white/5 border border-glass text-accent-danger hover:bg-accent-danger hover:text-white transition-all shadow-sm"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    </div>
</td>
                                        </tr >
                                    ))}
                                </tbody >
                            </table >
{
    filteredProducts.length === 0 && (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="p-5 rounded-full bg-white/5 border border-glass animate-float">
                <ShoppingBag className="w-12 h-12 text-secondary/30" />
            </div>
            <div>
                <h3 className="text-lg font-bold">No products found</h3>
                <p className="text-secondary">Try adjusting your search or add a new product.</p>
            </div>
        </div>
    )
}
                        </div >
                    </div >
                </div >
            </div >
        </div >
    );
};

export default SellerDashboard;
