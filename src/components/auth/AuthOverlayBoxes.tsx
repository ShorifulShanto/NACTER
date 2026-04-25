
"use client";

import React from "react";

/**
 * Renders the 4 reference images directly over the UI targets.
 * These are placed exactly where the numbers 1-4 were positioned.
 * "dont scale down" applied to the overlays.
 */
export function AuthOverlayBoxes() {
  const overlayStyle = "absolute pointer-events-none z-50 transition-all drop-shadow-2xl";
  
  // Using the Cloudinary URLs provided for the 4 reference PNGs
  const images = {
    box1: "https://res.cloudinary.com/dhzt5kvoz/image/upload/v1777043999/WhatsApp_Image_2026-04-24_at_9.17.53_PM_lvzjdp.jpg",
    box2: "https://res.cloudinary.com/dhzt5kvoz/image/upload/v1777044009/WhatsApp_Image_2026-04-24_at_9.17.53_PM_1_otdn45.jpg",
    box3: "https://res.cloudinary.com/dhzt5kvoz/image/upload/v1777044009/WhatsApp_Image_2026-04-24_at_9.17.52_PM_j9rwye.jpg",
    box4: "https://res.cloudinary.com/dhzt5kvoz/image/upload/v1777044008/WhatsApp_Image_2026-04-24_at_9.17.52_PM_1_l1rzj0.jpg"
  };

  return (
    <>
      {/* IMAGE 1: Top Left near NECTAR title */}
      <div 
        className={overlayStyle} 
        style={{ width: '80px', height: '80px', top: '10px', left: '10px' }}
      >
        <img src={images.box1} alt="Reference 1" className="w-full h-full object-contain" />
      </div>

      {/* IMAGE 2: Top Right near Welcome Heading */}
      <div 
        className={overlayStyle} 
        style={{ width: '120px', height: '120px', top: '70px', right: '10px' }}
      >
        <img src={images.box2} alt="Reference 2" className="w-full h-full object-contain" />
      </div>

      {/* IMAGE 3: Bottom Left near Action Button */}
      <div 
        className={overlayStyle} 
        style={{ width: '100px', height: '100px', top: '270px', left: '5px' }}
      >
        <img src={images.box3} alt="Reference 3" className="w-full h-full object-contain" />
      </div>

      {/* IMAGE 4: Bottom Right near Toggle Switch */}
      <div 
        className={overlayStyle} 
        style={{ width: '90px', height: '90px', bottom: '10px', right: '10px' }}
      >
        <img src={images.box4} alt="Reference 4" className="w-full h-full object-contain" />
      </div>
    </>
  );
}
