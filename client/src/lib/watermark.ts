/**
 * Watermark utility for adding logo and text to images
 */

export async function addWatermarkToImage(
  imageUrl: string,
  logoUrl: string,
  title: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      
      // Add semi-transparent overlay
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(canvas.width - 300, canvas.height - 180, 280, 160);
      
      // Logo image
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      
      logoImg.onload = () => {
        const logoSize = Math.max(40, Math.floor(img.naturalWidth / 20));
        ctx.drawImage(logoImg, canvas.width - logoSize - 20, canvas.height - logoSize - 80, logoSize, logoSize);
        
        // Text watermark
        const fontSize = Math.max(24, Math.floor(img.naturalWidth / 30));
        ctx.font = `bold ${fontSize}px 'Playfair Display', serif`;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        const padding = fontSize * 0.6;
        ctx.fillText("© Wilds Aura", canvas.width - padding, canvas.height - padding);
        
        // Small text
        const smallFont = Math.max(14, Math.floor(fontSize * 0.55));
        ctx.font = `${smallFont}px 'Inter', sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.70)";
        ctx.fillText("wilds_aura", canvas.width - padding, canvas.height - padding - fontSize - 4);
        
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };
      
      logoImg.onerror = () => reject(new Error("Failed to load logo"));
      logoImg.src = logoUrl;
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}
