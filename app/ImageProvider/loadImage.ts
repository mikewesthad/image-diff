import { makeSuccess, makeError, Outcome } from "ts-outcome";

type LoadImageResult = Outcome<{ img: HTMLImageElement; objectUrl: string }, Error>;

export const loadImage = (file: File): Promise<LoadImageResult> => {
  return new Promise<LoadImageResult>((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => resolve(makeSuccess({ img, objectUrl }));
    img.onerror = () => reject(makeError(new Error("Failed to load image")));
  });
};
