#version 300 es

precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_imageA;
uniform sampler2D u_imageB;

out vec4 fragColor;

void main() {
  vec2 uvCoord = vec2(v_texCoord.x, v_texCoord.y);
  vec2 textureSizeA = vec2(textureSize(u_imageA, 0));
  vec2 textureSizeB = vec2(textureSize(u_imageB, 0));
  vec2 maxSize = max(textureSizeA, textureSizeB);
  vec2 pixelCoord = vec2(uvCoord.x * maxSize.x, uvCoord.y * maxSize.y);

  // If we're outside either image's bounds, show bright red.
  if(pixelCoord.x >= textureSizeA.x || pixelCoord.y >= textureSizeA.y ||
    pixelCoord.x >= textureSizeB.x || pixelCoord.y >= textureSizeB.y) {
    fragColor = vec4(1.0f, 0.0f, 0.0f, 1.0f); // Bright red for out of bounds
    return;
  }

  // Convert pixel coordinates back to normalized UV coordinates for each
  // texture using the correct size for each texture
  vec2 uvA = pixelCoord / textureSizeA;
  vec2 uvB = pixelCoord / textureSizeB;

  vec4 color1 = texture(u_imageA, uvA);
  vec4 color2 = texture(u_imageB, uvB);

  // TODO: make this configurable.
  // If both pixels are fully transparent, they are considered identical.
  if(color1.a == 0.0f && color2.a == 0.0f) {
    fragColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
    return;
  }

  // Calculate absolute difference for all channels.
  vec4 diff = abs(color1 - color2);

  // For RGB differences, use the difference values
  // For alpha differences, show them in the red channel
  fragColor = vec4(max(diff.r, diff.a), diff.g, diff.b, 1.0f);
}