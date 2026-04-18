import Link from "next/link";

export default function ProductCard({ product }: { product: any }) {
  const price = product.salePrice || product.basePrice || 0;
  const originalPrice = product.basePrice || 0;
  const hasSale = !!product.salePrice && product.salePrice < originalPrice;

  return (
    <Link href={`/products/${product.slug}`} className="bg-white p-2 md:p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-2 md:gap-3 h-full">
      <div className="aspect-[4/5] overflow-hidden rounded-lg md:rounded-xl bg-gray-50 relative shrink-0">
        <img 
          src={product.thumbnail || 'https://placehold.co/400x500/f8fafc/94a3b8?text=Product'} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {hasSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
            Sale
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-start">
        <h3 className="text-[13px] md:text-sm font-semibold text-gray-900 mb-1 md:mb-1.5 line-clamp-2 leading-snug">{product.name}</h3>
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-sm md:text-base font-bold text-[#a757ff]">{price.toLocaleString()}đ</span>
          {hasSale && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through">{(originalPrice).toLocaleString()}đ</span>
          )}
        </div>
      </div>
      <button className="w-full py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] md:text-xs font-black hover:bg-[#a757ff] hover:text-white hover:border-[#a757ff] transition-colors uppercase tracking-widest mt-1">
        Xem chi tiết
      </button>
    </Link>
  );
}
