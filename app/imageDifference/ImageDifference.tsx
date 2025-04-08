"use client";

import vertexShaderSource from "./vertex.glsl";
import fragmentShaderSource from "./fragment.glsl";
import { useEffect, useRef, useState } from "react";
import { createProgram } from "../webgl/createShader";
import { isError } from "../result";
import { createTexture } from "../webgl/createTexture";
import { drawTwoImageProgram } from "../webgl/createFullscreenQuad";

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

      const programResult = createProgram({ gl, vertexShaderSource, fragmentShaderSource });
      if (isError(programResult)) {
        setError(programResult.error);
        return;
      }

      const program = programResult.value;

      gl.useProgram(program);

      const textureA = createTexture({ gl, image: imageA });
      const textureB = createTexture({ gl, image: imageB });

      const { positionBuffer, texCoordBuffer } = drawTwoImageProgram({
        gl,
        program,
        textureA,
        textureB,
      });

      // TODO: ideally an object URL.
      setDifferenceImage(canvas.toDataURL());

      return () => {
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texCoordBuffer);
        gl.deleteTexture(textureA);
        gl.deleteTexture(textureB);
        gl.deleteProgram(program);
      };
    }
  }, [imageA, imageB]);

  return (
    <div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Difference Image</h2>
        <p className="text-sm text-gray-600 mb-2">
          Black pixels indicate identical areas, colored pixels show differences
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
