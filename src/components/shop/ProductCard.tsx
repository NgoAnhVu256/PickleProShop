import Link from "next/link";

export default function ProductCard({ product }: { product: any }) {
  const price = product.salePrice || product.basePrice || 0;
  const originalPrice = product.basePrice || 0;
  const hasSale = !!product.salePrice && product.salePrice < originalPrice;

  // Check total stock across all variants
  const totalStock = product.variants
    ? product.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
    : null; // null = no variants (don't show out of stock)
  const isOutOfStock = totalStock !== null && totalStock === 0;

  return (
    <Link href={`/products/${product.slug}`} className="bg-white p-2 md:p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-2 md:gap-3 h-full">
      <div className="aspect-[4/5] overflow-hidden rounded-lg md:rounded-xl bg-gray-50 relative shrink-0">
        <img 
          src={product.thumbnail || 'https://placehold.co/400x500/f8fafc/94a3b8?text=Product'} 
          alt={product.name} 
          width={400}
          height={500}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
          loading="lazy"
          decoding="async"
        />
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-gray-900/80 text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest backdrop-blur-sm">
              Hết hàng
            </span>
          </div>
        ) : hasSale ? (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
            Sale
          </div>
        ) : null}
      </div>
      <div className="flex-1 flex flex-col justify-start">
        <h3 className="text-[13px] md:text-sm font-semibold text-gray-900 mb-1 md:mb-1.5 line-clamp-2 leading-snug">{product.name}</h3>
        <div className="flex items-center gap-2 mt-auto pt-1">
          {isOutOfStock ? (
            <span className="text-sm md:text-base font-bold text-gray-400">Liên hệ</span>
          ) : (
            <>
              <span className="text-sm md:text-base font-bold text-[#7DAACB]">{price.toLocaleString()}đ</span>
              {hasSale && (
                <span className="text-[10px] md:text-xs text-gray-400 line-through">{(originalPrice).toLocaleString()}đ</span>
              )}
            </>
          )}
        </div>
      </div>
      <button className={`w-full py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest mt-1 transition-colors ${
        isOutOfStock 
          ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-gray-50 border border-gray-200 hover:bg-[#7DAACB] hover:text-white hover:border-[#7DAACB]'
      }`}>
        {isOutOfStock ? 'Hết hàng' : 'Xem chi tiết'}
      </button>
    </Link>
  );
}
