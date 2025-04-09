/**
 * Helper for image comparison shaders.Draws two images on a fullscreen quad.
 */
export function drawTwoImageProgram({
  gl,
  program,
  textureA,
  textureB,
}: {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  textureA: WebGLTexture;
  textureB: WebGLTexture;
}) {
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
  const image1Location = gl.getUniformLocation(program, "u_imageA");
  const image2Location = gl.getUniformLocation(program, "u_imageB");

  // Vertex positions for a quad covering the render area.
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  // Matching texture coordinates for the positions.
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

  const vertexArrayObject = gl.createVertexArray();
  gl.bindVertexArray(vertexArrayObject);

  // Set up position attribute in the vao
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Set up texture coordinate attribute
  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

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
    vertexArrayObject,
  };
}
