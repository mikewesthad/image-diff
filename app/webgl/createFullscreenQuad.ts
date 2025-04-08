/**
 * Helper for image comparison shaders.Draws two images on a fullscreen quad.
 */
export function drawTwoImageProgram({
  gl,
  program,
  textureA,
  textureB,
  imageA,
  imageB,
}: {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  textureA: WebGLTexture;
  textureB: WebGLTexture;
  imageA: HTMLImageElement;
  imageB: HTMLImageElement;
}) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  const imageASizeLocation = gl.getUniformLocation(program, "u_imageASize");
  const imageBSizeLocation = gl.getUniformLocation(program, "u_imageBSize");
  gl.uniform2f(imageASizeLocation, imageA.width, imageA.height);
  gl.uniform2f(imageBSizeLocation, imageB.width, imageB.height);

  const image1Location = gl.getUniformLocation(program, "u_imageA");
  const image2Location = gl.getUniformLocation(program, "u_imageB");

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textureA);
  gl.uniform1i(image1Location, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textureB);
  gl.uniform1i(image2Location, 1);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  return {
    positionBuffer,
    texCoordBuffer,
  };
}
