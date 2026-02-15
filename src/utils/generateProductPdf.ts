import type { ProductPdfData } from "../components/ProductPdfDocument";


async function convertImageToPngBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${response.status}`);
      return null;
    }
    
    const blob = await response.blob();
    
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    
    const imageLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
    });
    
    img.src = URL.createObjectURL(blob);
    
    const loadedImg = await imageLoadPromise;
    
    const canvas = document.createElement("canvas");
    canvas.width = loadedImg.naturalWidth;
    canvas.height = loadedImg.naturalHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("Failed to get canvas context");
      return null;
    }
    
    ctx.drawImage(loadedImg, 0, 0);
    
    URL.revokeObjectURL(img.src);
    
    const pngBase64 = canvas.toDataURL("image/png");
    
    return pngBase64;
  } catch (error) {
    console.warn("Failed to convert image to PNG base64:", error);
    return null;
  }
}

async function fetchImageAsBase64(imageUrl: string): Promise<string | null> {
  if (imageUrl.toLowerCase().includes(".webp")) {
    return convertImageToPngBase64(imageUrl);
  }
  
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${response.status}`);
      return null;
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Failed to convert image to base64:", error);
    return null;
  }
}

async function preparePdfData(data: ProductPdfData): Promise<ProductPdfData> {
  const preparedData = { ...data };
  
  if (data.imageUrl) {
    const base64Image = await fetchImageAsBase64(data.imageUrl);
    preparedData.imageUrl = base64Image;
  }
  
  if (data.logoUrl) {
    const base64Logo = await fetchImageAsBase64(data.logoUrl);
    if (base64Logo) {
      preparedData.logoUrl = base64Logo;
    }
  }
  
  return preparedData;
}

async function generatePdfBlob(data: ProductPdfData): Promise<Blob> {
  const [{ pdf }, { ProductPdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../components/ProductPdfDocument"),
  ]);

  const preparedData = await preparePdfData(data);
  const document = ProductPdfDocument({ data: preparedData });
  const blob = await pdf(document).toBlob();
  return blob;
}

export async function downloadProductPdf(data: ProductPdfData): Promise<void> {
  const blob = await generatePdfBlob(data);
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.modelNumber}.pdf`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export async function printProductPdf(data: ProductPdfData): Promise<void> {
  const blob = await generatePdfBlob(data);
  const url = URL.createObjectURL(blob);
  
  const printWindow = window.open(url, "_blank");
  
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
}