import { error, isError, Result, success } from "../result";

/**
 * Creates a shader from a source string
 */
export function createShader({
  gl,
  type,
  source,
}: {
  gl: WebGLRenderingContext;
  type: number;
  source: string;
}): Result<WebGLShader> {
  const shader = gl.createShader(type);
  if (!shader) {
    return error("Failed to create shader");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const result = error<WebGLShader>(
      gl.getShaderInfoLog(shader) ?? "Unknown shader compilation error"
    );
    gl.deleteShader(shader);
    return result;
  }

  return success(shader);
}

/**
 * Creates a program from a vertex shader and a fragment shader.
 */
export function createGlslProgram({
  gl,
  vertexShaderSource,
  fragmentShaderSource,
}: {
  gl: WebGLRenderingContext;
  vertexShaderSource: string;
  fragmentShaderSource: string;
}): Result<WebGLProgram> {
  const vertexShaderResult = createShader({
    gl,
    type: gl.VERTEX_SHADER,
    source: vertexShaderSource,
  });
  const fragmentShaderResult = createShader({
    gl,
    type: gl.FRAGMENT_SHADER,
    source: fragmentShaderSource,
  });

  if (isError(vertexShaderResult) || isError(fragmentShaderResult)) {
    console.error(vertexShaderResult, fragmentShaderResult);
    return error("Failed to create shaders");
  }

  const program = gl.createProgram();
  if (!program) {
    return error("Failed to create program");
  }

  gl.attachShader(program, vertexShaderResult.value);
  gl.attachShader(program, fragmentShaderResult.value);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    return error(`Could not compile WebGL program. \n\n${info}`);
  }

  return success(program);
}
