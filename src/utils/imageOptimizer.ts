/**
 * Utility for compressing, resizing, and optimizing product images for mobile and desktop.
 * Converts high-resolution phone camera photos (5-15MB) into lightweight, high-fidelity
 * catalog images (30-80KB) so that storage limits (localStorage & IndexedDB) are never exceeded.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  originalSizeKb: number;
  optimizedSizeKb: number;
  width: number;
  height: number;
}

/**
 * Compresses and resizes an image file to a maximum dimension and optimal quality.
 * @param file The image File from input or camera
 * @param maxWidth Max width in pixels (default 1080)
 * @param maxHeight Max height in pixels (default 1080)
 * @param initialQuality JPEG quality (0.0 to 1.0, default 0.82)
 */
export async function optimizeProductImage(
  file: File | Blob,
  maxWidth = 1080,
  maxHeight = 1080,
  initialQuality = 0.82
): Promise<OptimizedImageResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error('Falha ao ler arquivo de imagem.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate new proportional dimensions
          if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const bestRatio = Math.min(widthRatio, heightRatio);

            width = Math.round(width * bestRatio);
            height = Math.round(height * bestRatio);
          }

          // Create canvas for high-performance scaling
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível inicializar o processador de imagem.'));
            return;
          }

          // Enable high-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Fill with clean background (for transparency handling if png)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);

          // Initial compression
          let quality = initialQuality;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          let sizeInBytes = Math.round((dataUrl.length * 3) / 4);

          // If size is still larger than 150KB, reduce quality progressively
          if (sizeInBytes > 150 * 1024) {
            quality = 0.75;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            sizeInBytes = Math.round((dataUrl.length * 3) / 4);
          }
          if (sizeInBytes > 250 * 1024) {
            quality = 0.68;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            sizeInBytes = Math.round((dataUrl.length * 3) / 4);
          }

          const optimizedSizeKb = Math.round(sizeInBytes / 1024);

          resolve({
            dataUrl,
            originalSizeKb,
            optimizedSizeKb,
            width,
            height,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('Formato de imagem inválido ou não suportado.'));
      };

      img.src = src;
    };

    reader.onerror = () => {
      reject(new Error('Erro ao carregar o arquivo da imagem.'));
    };

    reader.readAsDataURL(file);
  });
}
