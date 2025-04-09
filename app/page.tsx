"use client";

import { useState, useCallback } from "react";
import ImageDifference from "./imageDifference/ImageDifference";
import ImageDropZone from "./ImageDropZone";
import ImagePreview from "./ImagePreview";
import { error, isError, Result, success } from "./result";

const loadImage = (file: File): Promise<Result<HTMLImageElement>> => {
  return new Promise<Result<HTMLImageElement>>((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    // TODO: revoke object URL on cleanup.
    img.onload = () => resolve(success(img));
    img.onerror = () => reject(error("Failed to load image"));
  });
};

export default function Home() {
  const [image1, setImage1] = useState<HTMLImageElement | null>(null);
  const [image2, setImage2] = useState<HTMLImageElement | null>(null);

  const handleImage1Change = useCallback(async (file: File) => {
    const result = await loadImage(file);
    if (!isError(result)) {
      setImage1(result.value);
    }
  }, []);

  const handleImage2Change = useCallback(async (file: File) => {
    const result = await loadImage(file);
    if (!isError(result)) {
      setImage2(result.value);
    }
  }, []);

  const handleReset = useCallback(() => {
    setImage1(null);
    setImage2(null);
  }, []);

  const handleRemoveImage1 = useCallback(() => {
    setImage1(null);
  }, []);

  const handleRemoveImage2 = useCallback(() => {
    setImage2(null);
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Image Comparison Tool</h1>
          <button
            onClick={handleReset}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="h-[300px]">
              <ImagePreview
                image={image1}
                label="First Image"
                onRemove={handleRemoveImage1}
                onImageChange={handleImage1Change}
              />
            </div>
            <div className="h-[300px]">
              <ImagePreview
                image={image2}
                label="Second Image"
                onRemove={handleRemoveImage2}
                onImageChange={handleImage2Change}
              />
            </div>
          </div>

          <ImageDifference imageA={image1} imageB={image2} />
        </div>
      </div>
    </main>
  );
}
