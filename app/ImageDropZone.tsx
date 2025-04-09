"use client";

import { useCallback, useRef } from "react";

interface ImageDropZoneProps {
  onDrop: (files: FileList) => void;
  children?: React.ReactNode;
}

export default function ImageDropZone({ onDrop, children }: ImageDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        onDrop(e.target.files);
      }
    },
    [onDrop]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files) {
        onDrop(e.dataTransfer.files);
      }
    },
    [onDrop]
  );

  return (
    <div
      className="h-full border-2 border-gray-200 p-2 rounded-sm text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center"
      onClick={handleClick}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      {children}
    </div>
  );
}
