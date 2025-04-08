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

  const handleImageLoad = useCallback(
    async (imageFileList: FileList) => {
      if (imageFileList.length === 0) {
        return;
      }

      const firstFile = imageFileList[0];
      const secondFile = imageFileList[1];

      const [image1Result, image2Result] = await Promise.all([
        firstFile ? loadImage(firstFile) : null,
        secondFile ? loadImage(secondFile) : null,
      ]);

      const newImage1 = image1Result && !isError(image1Result) ? image1Result.value : null;
      const newImage2 = image2Result && !isError(image2Result) ? image2Result.value : null;

      const allImages = [image1, image2, newImage1, newImage2].filter((image) => image !== null);
      const updatedImages = allImages.slice(allImages.length - 2);

      if (updatedImages[0]) {
        setImage1(updatedImages[0]);
      }

      if (updatedImages[1]) {
        setImage2(updatedImages[1]);
      }
    },
    [image1, image2]
  );

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
            Reset Images
          </button>
        </div>
        <div className="space-y-8">
          <ImageDropZone onDrop={handleImageLoad}>
            {image1 && !image2 ? (
              <p className="text-sm text-gray-400 mt-2">Drop a second image to compare</p>
            ) : null}
          </ImageDropZone>

          <div className="grid grid-cols-2 gap-8">
            <ImagePreview image={image1} label="First Image" onRemove={handleRemoveImage1} />
            <ImagePreview image={image2} label="Second Image" onRemove={handleRemoveImage2} />
          </div>

          <ImageDifference imageA={image1} imageB={image2} />
        </div>
      </div>
    </main>
  );
}
