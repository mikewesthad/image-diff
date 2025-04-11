"use client";

import { useEffect, useRef, useState } from "react";
import { isError } from "../result";
import { createImageDifferenceProgram } from "./createImageDifferenceProgram";
import { ImageStateData } from "../ImageProvider/ImageProvider";
import { Tooltip, TooltipTrigger, OverlayArrow, Button } from "react-aria-components";
import { IoMdInformationCircleOutline } from "react-icons/io";

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
  const [ignoreTransparent, setIgnoreTransparent] = useState(false);

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
        ignoreTransparent,
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
  }, [imageA, imageB, ignoreTransparent]);

  return (
    <div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Difference</h2>
        <p className="text-sm text-gray-600 mb-2">
          Black pixels indicate identical areas, colored pixels show differences.
        </p>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="ignoreTransparent"
            checked={ignoreTransparent}
            onChange={(e) => setIgnoreTransparent(e.target.checked)}
            className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="ignoreTransparent" className="text-sm text-gray-700 flex items-center">
            Ignore transparent pixels
            <TooltipTrigger delay={100}>
              <Button className="ml-1 text-gray-400 flex items-center">
                <IoMdInformationCircleOutline className="w-4 h-4" />
              </Button>
              <Tooltip className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
                <OverlayArrow>
                  <svg width={8} height={8} viewBox="0 0 8 8">
                    <path d="M0 0 L4 4 L8 0" />
                  </svg>
                </OverlayArrow>
                If checked, this will consider any fully transparent pixels to be identical even if
                they have different individual red, green and blue values
              </Tooltip>
            </TooltipTrigger>
          </label>
        </div>
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
