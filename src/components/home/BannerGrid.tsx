import Image from "next/image";
import Link from "next/link";
import HeroSlider from "./HeroSlider";

interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string | null;
}

interface Props {
  heroBanners: Banner[];
  leftBanner?: Banner | null;
  rightBanners: Banner[];
}

export default function BannerGrid({ heroBanners, leftBanner, rightBanners }: Props) {
  const rightTop = rightBanners[0];
  const rightBottom = rightBanners[1];

  return (
    <section className="w-full px-8 py-6">
      {/* 
        Desktop Grid Layout: [LEFT 2.5/12] [HERO 6.5/12] [RIGHT 3/12]
        Gaps to match the design (around 16-20px)
      */}
      <div className="grid grid-cols-12 gap-5 h-[340px]">
        
        {/* ══ LEFT BANNER ══ */}
        <div className="col-span-3 h-full">
          <Link
            href={leftBanner?.link || "#"}
            className="relative block w-full h-full rounded-[24px] overflow-hidden group shadow-sm bg-[#fff8ef] hover:shadow-lg transition-all"
          >
            {leftBanner ? (
              <Image
                src={leftBanner.image}
                alt={leftBanner.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 20vw"
              />
            ) : (
              /* Fallback visual based on PikLab design */
              <div className="w-full h-full flex flex-col justify-start items-center text-center p-3 relative overflow-hidden bg-gradient-to-b from-[#fff2de] to-[#fff]">
                {/* Decorative boxes at top left in image */}
                <div className="absolute top-2 left-2 flex gap-1 z-0 opacity-50">
                   <div className="w-6 h-6 bg-red-400 rounded-sm"></div>
                   <div className="w-6 h-6 bg-yellow-400 rounded-sm"></div>
                </div>

                <div className="z-10 bg-black text-[#facc15] font-black text-[22px] px-2 py-1 uppercase shadow-lg w-[110%] absolute top-20 flex items-center justify-center tracking-wide">
                  PIKLAB SHOP
                </div>
                
                <div className="mt-32 px-1 z-10">
                  <p className="text-[12px] font-semibold text-gray-800 leading-snug">
                    Các sản phẩm bản quyền, phần mềm ứng dụng thiết kế có tại PikLab
                  </p>
                </div>
                
                <button className="z-10 mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-1.5 rounded-full text-[13px] font-bold shadow-md hover:opacity-90 transition-opacity">
                  xem chi tiết
                </button>
                
                <div className="flex-1" />
                <div className="flex gap-2 justify-center flex-wrap pb-2 z-10 w-[90%] mx-auto mt-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">Ps</div>
                  <div className="w-8 h-8 bg-fuchsia-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">Ae</div>
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">Ai</div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs shrink-0 shadow-sm">🟩</div>
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">Pr</div>
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* ══ HERO SLIDER OVAL-SHAPED ══ */}
        <div className="col-span-6 h-full">
          <div className="w-full h-full rounded-[24px] overflow-hidden shadow-sm">
            <HeroSlider banners={heroBanners} />
          </div>
        </div>

        {/* ══ RIGHT BANNERS (STACKED) ══ */}
        <div className="col-span-3 flex flex-col gap-5 h-full">
          {/* Right Top */}
          <RightCard 
            banner={rightTop} 
            fallbackGradient="from-[#ff6ec4] to-[#7873f5]" 
            fallbackTitle="Công cụ" 
            fallbackSubtitle="GETLINK FILES" 
            fallbackButton="xem chi tiết" 
          />
          {/* Right Bottom */}
          <RightCard 
            banner={rightBottom} 
            fallbackGradient="from-[#fde047] to-[#fbbf24]" 
            fallbackTitle="ĐĂNG KÝ" 
            fallbackSubtitle="MEMBER" 
            fallbackButton="xem chi tiết" 
            dark 
          />
        </div>

      </div>
    </section>
  );
}

function RightCard({
  banner,
  fallbackGradient,
  fallbackTitle,
  fallbackSubtitle,
  fallbackButton,
  dark,
}: {
  banner?: Banner;
  fallbackGradient: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackButton: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={banner?.link || "#"}
      className="relative flex-1 min-h-[140px] lg:min-h-0 rounded-[24px] overflow-hidden group shadow-sm hover:shadow-lg transition-all block"
    >
      {banner ? (
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 1024px) 100vw, 25vw"
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-r ${fallbackGradient} p-6 flex flex-col justify-center`}>
          <p className={`text-lg font-bold mb-0 leading-tight ${dark ? "text-pink-600" : "text-white"}`}>
            {fallbackTitle}
          </p>
          <h3 className={`text-[25px] font-black uppercase leading-none drop-shadow-sm mb-4 ${dark ? "text-pink-600" : "text-white"}`}>
            {fallbackSubtitle}
          </h3>
          <span className={`text-[11px] uppercase font-bold px-5 py-2 rounded-full w-fit ${dark ? "bg-pink-100 text-pink-600" : "bg-white/30 text-white backdrop-blur-md"}`}>
            {fallbackButton}
          </span>
          {dark && (
            <span className="absolute right-[-10px] bottom-[-10px] text-[100px] leading-none opacity-90 grayscale opacity-80">🐈‍⬛</span>
          )}
          {!dark && (
            <span className="absolute right-0 bottom-0 text-[80px] leading-none opacity-90 drop-shadow-lg">👩‍🎤</span>
          )}
        </div>
      )}
    </Link>
  );
}
