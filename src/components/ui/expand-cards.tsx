import { useState } from "react";
import { useWorks } from "../../lib/useConvex";

const ExpandOnHover = () => {
  const [expandedImage, setExpandedImage] = useState(3);
  
  const worksData = useWorks();
  const images = worksData?.works?.map(w => w.url).filter(url => url).slice(0, 6) || [];

  const getImageWidth = (index: number) =>
    index === expandedImage ? "24rem" : "5rem";

  return (
    <>
      {/* Desktop: hover-expand grid */}
      <div className="w-full hidden lg:block bg-brand-white">
        <div className="relative grid h-full grid-cols-1 items-center justify-center p-2 transition-all duration-300 ease-in-out lg:flex w-full">
          <div className="w-full h-full overflow-hidden rounded-3xl">
            <div className="flex h-full w-full items-center justify-center overflow-hidden bg-brand-white">
              <div className="relative w-full max-w-6xl px-5">
                <div className="flex w-full items-center justify-center gap-1">
                  {images.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-in-out border border-brand-border"
                      style={{
                        width: getImageWidth(idx + 1),
                        height: "24rem",
                      }}
                      onMouseEnter={() => setExpandedImage(idx + 1)}
                    >
                      <img
                        className="w-full h-full object-cover"
                        src={src}
                        alt={`Project ${idx + 1}`}
                      />
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/0 transition-colors duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: horizontal scroll carousel */}
      <div className="w-full lg:hidden overflow-x-auto scroll-smooth snap-x snap-mandatory">
        <div className="flex gap-3 pb-4 px-1">
          {images.map((src, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[280px] h-[200px] rounded-2xl overflow-hidden snap-start border border-brand-border"
            >
              <img
                className="w-full h-full object-cover"
                src={src}
                alt={`Project ${idx + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ExpandOnHover;