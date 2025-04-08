precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_imageA;
uniform sampler2D u_imageB;
uniform vec2 u_imageASize;
uniform vec2 u_imageBSize;

void main() {
  vec2 uvCoord = vec2(v_texCoord.x, v_texCoord.y);
  vec2 maxSize = max(u_imageASize, u_imageBSize);
  vec2 minSize = min(u_imageASize, u_imageBSize);
  vec2 pixelCoord = vec2(uvCoord.x * maxSize.x, uvCoord.y * maxSize.y);

  // If we're outside either image's bounds, show bright red.
  if(pixelCoord.x >= minSize.x || pixelCoord.y >= minSize.y) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    return;
  }

  // Convert pixel coordinates back to normalized UV coordinates for each 
  //texture
  vec2 uvA = pixelCoord / u_imageASize;
  vec2 uvB = pixelCoord / u_imageBSize;

  vec4 color1 = texture2D(u_imageA, uvA);
  vec4 color2 = texture2D(u_imageB, uvB);

  // TODO: make this configurable.
  // If both pixels are fully transparent, they are considered identical
  if(color1.a == 0.0 && color2.a == 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Calculate absolute difference for all channels.
  vec4 diff = abs(color1 - color2);

  // For RGB differences, use the difference values
  // For alpha differences, show them in the red channel
  gl_FragColor = vec4(max(diff.r, diff.a), diff.g, diff.b, 1.0);
}