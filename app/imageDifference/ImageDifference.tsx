"use client";

import { useEffect, useRef, useState } from "react";
import { isError } from "../result";
import { createImageDifferenceProgram } from "./createImageDifferenceProgram";

export default function ImageDifference({
  imageA,
  imageB,
}: {
  imageA?: HTMLImageElement | null;
  imageB?: HTMLImageElement | null;
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

      const result = createImageDifferenceProgram({ gl, imageA, imageB });
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
          <img
            src={differenceImage ?? undefined}
            alt="Difference between images"
            className="max-w-full h-auto border border-gray-200 rounded"
          />
        ) : null}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
