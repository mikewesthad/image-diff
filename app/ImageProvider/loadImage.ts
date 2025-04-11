import { error, success, Result } from "@/app/result";

type LoadImageResult = Result<{ img: HTMLImageElement; objectUrl: string }>;

export const loadImage = (file: File): Promise<LoadImageResult> => {
  return new Promise<LoadImageResult>((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => resolve(success({ img, objectUrl }));
    img.onerror = () => reject(error("Failed to load image"));
  });
};
