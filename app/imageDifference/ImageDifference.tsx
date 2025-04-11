"use client";

import { useEffect, useRef, useState } from "react";
import { isError } from "../result";
import { createImageDifferenceProgram } from "./createImageDifferenceProgram";
import { ImageStateData } from "../ImageProvider/ImageProvider";
export default function ImageDifference({
  imageA,
  imageB,
}: {
  imageA?: ImageStateData | null;
  imageB?: ImageStateData | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [differenceImage, setDifferenceImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDifferenceImage(null);
    setError(null);

    const canvas = canvasRef.current;
    if (imageA && imageB && canvas) {
      canvas.width = Math.max(imageA.width, imageB.width);
      canvas.height = Math.max(imageA.height, imageB.height);

      const gl = canvas.getContext("webgl2");
      if (!gl) {
        setError("Failed to create WebGL context");
        return;
      }

      const result = createImageDifferenceProgram({
        gl,
        imageA: imageA.imageElement,
        imageB: imageB.imageElement,
      });
      if (isError(result)) {
        setError(result.error);
        return;
      }

      const { render, destroy } = result.value;

      render();

      // TODO: ideally an object URL.
      setDifferenceImage(canvas.toDataURL());

      return destroy;
    }
  }, [imageA, imageB]);

  return (
    <div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Difference</h2>
        <p className="text-sm text-gray-600 mb-2">
          Black pixels indicate identical areas, colored pixels show differences.
        </p>
        {!differenceImage && !error ? <p>Please upload two images to see the difference</p> : null}
        {error ? <p className="text-red-500">{error}</p> : null}
        {differenceImage ? (
          <div className="w-full border-2 border-gray-200 p-2 rounded-sm">
            <img
              src={differenceImage ?? undefined}
              alt="Difference between images"
              className="w-full max-w-[500px] h-auto border border-gray-200 rounded mx-auto"
            />
          </div>
        ) : null}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
