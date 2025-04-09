#version 300 es

precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_imageA;
uniform sampler2D u_imageB;

out vec4 fragColor;

void main() {
  vec2 uvCoord = vec2(v_texCoord.x, v_texCoord.y);

  ivec2 textureSizeA = textureSize(u_imageA, 0);
  ivec2 textureSizeB = textureSize(u_imageB, 0);
  ivec2 maxSize = max(textureSizeA, textureSizeB);
  ivec2 minSize = min(textureSizeA, textureSizeB);
  ivec2 pixelCoord = ivec2(floor(uvCoord * vec2(maxSize)));

  // If we're outside either image's bounds, show bright red.
  if(pixelCoord.x > minSize.x || pixelCoord.y > minSize.y) {
    fragColor = vec4(1.0f, 0.0f, 0.0f, 1.0f); // Bright red for out of bounds
    return;
  }

  vec4 color1 = texelFetch(u_imageA, pixelCoord, 0);
  vec4 color2 = texelFetch(u_imageB, pixelCoord, 0);

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