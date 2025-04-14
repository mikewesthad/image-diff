import { createGlslProgram } from "../webgl/createShader";
import vertexShaderSource from "./vertex.glsl";
import fragmentShaderSource from "./fragment.glsl";
import { makeSuccess, makeError, isError, Outcome } from "ts-outcome";
import { createTexture } from "../webgl/createTexture";

interface ShaderProgram {
  render: () => void;
  destroy: () => void;
}

export function createImageDifferenceProgram({
  gl,
  imageA,
  imageB,
  ignoreTransparent,
}: {
  gl: WebGL2RenderingContext;
  imageA: HTMLImageElement;
  imageB: HTMLImageElement;
  /**
   * If true, this will consider any fully transparent pixels to be identical
   * even if they have different individual red, green and blue values
   */
  ignoreTransparent: boolean;
}): Outcome<ShaderProgram, Error> {
  const programResult = createGlslProgram({ gl, vertexShaderSource, fragmentShaderSource });
  if (isError(programResult)) {
    return makeError(programResult.error);
  }

  let isDestroyed = false;
  const program = programResult.value;

  const textureA = createTexture({ gl, image: imageA });
  const textureB = createTexture({ gl, image: imageB });

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
  const image1Location = gl.getUniformLocation(program, "u_imageA");
  const image2Location = gl.getUniformLocation(program, "u_imageB");
  const ignoreTransparentLocation = gl.getUniformLocation(program, "u_ignoreTransparent");

  // Vertex positions for a quad covering the render area. (-1, -1) is the is
  // the bottom left in clip space.
  // Set up a new buffer on the GPU.
  const positionBuffer = gl.createBuffer();
  // Set that new position buffer as the active ARRAY_BUFFER.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Upload vertex positions to active ARRAY_BUFFER to form a triangle strip.
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // Bottom left
      -1, -1,
      // Bottom right
      1, -1,
      // Top left
      -1, 1,
      // Top right
      1, 1,
    ]),
    gl.STATIC_DRAW
  );

  // Matching texture coordinates for the positions. (0, 0) is the top left in
  // our fragment shader.
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // Bottom left
      0, 1,
      // Bottom right
      1, 1,
      // Top left
      0, 0,
      // Top right
      1, 0,
    ]),
    gl.STATIC_DRAW
  );

  // Object store for vertex data (in this case, positions & texture coords).
  const vertexArrayObject = gl.createVertexArray();
  // Set the VAO as active.
  gl.bindVertexArray(vertexArrayObject);

  // Set up position attribute in the VAO.
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Set up texture coordinate attribute in the VAO.
  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  return makeSuccess({
    render: () => {
      if (isDestroyed) {
        return;
      }

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindVertexArray(vertexArrayObject);

      // Bind the textures to slots 0 and 1.
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureA);
      gl.uniform1i(image1Location, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textureB);
      gl.uniform1i(image2Location, 1);

      // Set the ignoreTransparent uniform
      gl.uniform1i(ignoreTransparentLocation, ignoreTransparent ? 1 : 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    destroy: () => {
      if (isDestroyed) {
        return;
      }

      isDestroyed = true;
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texCoordBuffer);
      gl.deleteVertexArray(vertexArrayObject);
      gl.deleteTexture(textureA);
      gl.deleteTexture(textureB);
      gl.deleteProgram(program);
    },
  });
}
