"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { isError } from "../result";
import { createImageDifferenceProgram } from "./createImageDifferenceProgram";
import { ImageStateData } from "../ImageProvider/ImageProvider";
import { Tooltip, TooltipTrigger, OverlayArrow, Button } from "react-aria-components";
import { IoMdInformationCircleOutline } from "react-icons/io";
import throttle from "lodash.throttle";

type PixelInfo = {
  x: number;
  y: number;
  image1: { r: number; g: number; b: number; a: number } | null;
  image2: { r: number; g: number; b: number; a: number } | null;
  difference: { r: number; g: number; b: number; a: number } | null;
};

const getPixelData = (ctx: CanvasRenderingContext2D | null, x: number, y: number) => {
  if (!ctx) return null;
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  return {
    r: pixel[0],
    g: pixel[1],
    b: pixel[2],
    a: pixel[3],
  };
};

const setupCanvas = (canvas: HTMLCanvasElement, image: ImageStateData) => {
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(image.imageElement, 0, 0);
  }
  return ctx;
};

export default function ImageDifference({
  imageA,
  imageB,
}: {
  imageA?: ImageStateData | null;
  imageB?: ImageStateData | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [differenceImageUrl, setDifferenceImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ignoreTransparent, setIgnoreTransparent] = useState(false);
  const [pixelInfo, setPixelInfo] = useState<PixelInfo | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const imageACanvasRef = useRef<HTMLCanvasElement>(null);
  const imageBCanvasRef = useRef<HTMLCanvasElement>(null);
  const differenceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageACtx, setImageACtx] = useState<CanvasRenderingContext2D | null>(null);
  const [imageBCtx, setImageBCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [differenceCtx, setDifferenceCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!imageA || !imageB) return;

    if (imageACanvasRef.current) {
      const ctx = setupCanvas(imageACanvasRef.current, imageA);
      setImageACtx(ctx);
    }

    if (imageBCanvasRef.current) {
      const ctx = setupCanvas(imageBCanvasRef.current, imageB);
      setImageBCtx(ctx);
    }
  }, [imageA, imageB]);

  const debouncedHandleMouseMove = useCallback(
    (target: HTMLDivElement, clientX: number, clientY: number) => {
      if (!imageRef.current || !imageA || !imageB || !differenceCtx) return;

      const rect = target.getBoundingClientRect();
      const scaleX = imageRef.current.naturalWidth / rect.width;
      const scaleY = imageRef.current.naturalHeight / rect.height;

      const x = Math.floor((clientX - rect.left) * scaleX);
      const y = Math.floor((clientY - rect.top) * scaleY);

      setHoverPosition({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });

      setPixelInfo({
        x,
        y,
        image1: getPixelData(imageACtx, x, y),
        image2: getPixelData(imageBCtx, x, y),
        difference: getPixelData(differenceCtx, x, y),
      });
    },
    [imageRef, imageA, imageB, differenceCtx, imageACtx, imageBCtx]
  );

  const throttledMouseMove = useCallback(
    throttle(
      (e: React.MouseEvent<HTMLDivElement>) => {
        debouncedHandleMouseMove(e.currentTarget, e.clientX, e.clientY);
      },
      16,
      { trailing: false }
    ),
    [debouncedHandleMouseMove]
  );

  const handleImageMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.persist();
      throttledMouseMove(e);
    },
    [throttledMouseMove]
  );

  const handleImageMouseLeave = () => {
    setPixelInfo(null);
    setHoverPosition(null);
  };

  useEffect(() => {
    setDifferenceImageUrl(null);
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

      const differenceCanvas = differenceCanvasRef.current;
      if (differenceCanvas) {
        differenceCanvas.width = canvas.width;
        differenceCanvas.height = canvas.height;
        const ctx = differenceCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, 0);
          setDifferenceCtx(ctx);
        }
      }

      setDifferenceImageUrl(canvas.toDataURL());

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
        {!differenceImageUrl && !error ? (
          <p>Please upload two images to see the difference</p>
        ) : null}
        {error ? <p className="text-red-500">{error}</p> : null}
        {differenceImageUrl ? (
          <div className="border-2 border-gray-200 rounded-sm">
            <div className="flex">
              <div
                className="w-[500px] mx-auto relative m-4"
                onMouseMove={handleImageMouseMove}
                onMouseLeave={handleImageMouseLeave}
              >
                <img
                  ref={imageRef}
                  src={differenceImageUrl}
                  alt="Difference between images"
                  className="w-full h-auto border border-gray-200 rounded"
                />
                {hoverPosition && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: hoverPosition.x,
                      top: hoverPosition.y,
                      transform: "translate(-50%, -50%)",
                      width: 10,
                      height: 10,
                      border: "1px solid white",
                      boxShadow: "0 0 0 1px black",
                      borderRadius: "50%",
                    }}
                  />
                )}
              </div>
              <div className="w-[250px] border-l border-gray-200 p-4">
                <h3 className="font-semibold mb-2">Pixel Info</h3>
                {pixelInfo ? (
                  <div className="text-sm">
                    <p className="mb-2">
                      Position: ({pixelInfo.x}, {pixelInfo.y})
                    </p>

                    <div className="mb-4">
                      <h4 className="font-medium mb-1">Image 1</h4>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{
                            backgroundColor: pixelInfo.image1
                              ? `rgba(${pixelInfo.image1.r}, ${pixelInfo.image1.g}, ${
                                  pixelInfo.image1.b
                                }, ${pixelInfo.image1.a / 255})`
                              : "transparent",
                          }}
                        />
                        <div>
                          ({pixelInfo.image1?.r ?? "-"}, {pixelInfo.image1?.g ?? "-"},{" "}
                          {pixelInfo.image1?.b ?? "-"}, {pixelInfo.image1?.a ?? "-"})
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-1">Image 2</h4>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{
                            backgroundColor: pixelInfo.image2
                              ? `rgba(${pixelInfo.image2.r}, ${pixelInfo.image2.g}, ${
                                  pixelInfo.image2.b
                                }, ${pixelInfo.image2.a / 255})`
                              : "transparent",
                          }}
                        />
                        <div>
                          ({pixelInfo.image2?.r ?? "-"}, {pixelInfo.image2?.g ?? "-"},{" "}
                          {pixelInfo.image2?.b ?? "-"}, {pixelInfo.image2?.a ?? "-"})
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Difference</h4>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{
                            backgroundColor: pixelInfo.difference
                              ? `rgba(${pixelInfo.difference.r}, ${pixelInfo.difference.g}, ${
                                  pixelInfo.difference.b
                                }, ${pixelInfo.difference.a / 255})`
                              : "transparent",
                          }}
                        />
                        <div>
                          ({pixelInfo.difference?.r ?? "-"}, {pixelInfo.difference?.g ?? "-"},{" "}
                          {pixelInfo.difference?.b ?? "-"}, {pixelInfo.difference?.a ?? "-"})
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p className="italic">
                      Hover over the difference image to see pixel information.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
      <canvas ref={imageACanvasRef} style={{ display: "none" }} />
      <canvas ref={imageBCanvasRef} style={{ display: "none" }} />
      <canvas ref={differenceCanvasRef} style={{ display: "none" }} />
    </div>
  );
}
