"use client";

import ImageDropZone from "./ImageDropZone";
import { ImageStateData } from "./ImageProvider/ImageProvider";

interface ImagePreviewProps {
  imageData: ImageStateData | null;
  label: string;
  onRemove: () => void;
  onImageChange: (file: File) => void;
}

export default function ImagePreview({
  imageData,
  label,
  onRemove,
  onImageChange,
}: ImagePreviewProps) {
  const handleDrop = (files: File[]) => {
    if (files.length > 0 && onImageChange) {
      onImageChange(files[0]);
    }
  };

  return (
    <div className="h-full">
      <div className="pb-2 mt-2 text-gray-500 flex justify-between items-center">
        <p className="text-md font-medium">{label}</p>
        <button
          onClick={onRemove}
          disabled={!imageData}
          className="p-1.5 text-gray-400 enabled:hover:text-red-500 enabled:hover:bg-red-50 enabled:active:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full transition-colors duration-150 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
          aria-label="Remove image"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="h-[200px]">
        <ImageDropZone onDrop={handleDrop}>
          {imageData ? (
            <img
              src={imageData.imageObjectUrl}
              alt={label}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-gray-400 text-center p-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2">Click or drag & drop an image</p>
            </div>
          )}
        </ImageDropZone>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        {imageData && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="font-medium">Size</span>
              <span>
                {imageData.width} x {imageData.height} pixels
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Filename</span>
              <span>{imageData.fileName}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
