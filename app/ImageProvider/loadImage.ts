import { error, success, Result } from "@/app/result";

export const loadImage = (file: File): Promise<Result<HTMLImageElement>> => {
  return new Promise<Result<HTMLImageElement>>((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => resolve(success(img));
    img.onerror = () => reject(error("Failed to load image"));
  });
};
