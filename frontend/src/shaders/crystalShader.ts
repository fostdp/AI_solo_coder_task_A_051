export const crystalVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vHeight;
  
  uniform float uTime;
  uniform float uGrowthProgress;
  uniform vec3 uLightPosition;
  
  void main() {
    vUv = uv;
    vNormal = normal;
    vPosition = position;
    vHeight = position.y;
    
    vec3 pos = position;
    
    float noise = sin(pos.x * 10.0 + uTime * 0.5) * cos(pos.z * 10.0 + uTime * 0.3) * 0.02;
    pos += normal * noise * uGrowthProgress;
    
    float growthMask = smoothstep(0.0, 0.3, vHeight + 0.5);
    pos *= mix(0.9, 1.0, growthMask * uGrowthProgress);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const crystalFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vHeight;
  
  uniform float uTime;
  uniform float uGrowthProgress;
  uniform vec3 uColor;
  uniform float uOpacity;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    vec2 uv = vUv * 20.0;
    
    float crystalNoise = noise(uv + uTime * 0.1);
    float crystalPattern = step(0.7, crystalNoise);
    
    float sparkle = pow(max(0.0, dot(normalize(vNormal), vec3(0.0, 1.0, 0.0))), 3.0);
    sparkle += pow(max(0.0, dot(normalize(vNormal), normalize(vec3(1.0, 1.0, 1.0)))), 5.0) * 0.5;
    
    float growthMask = smoothstep(0.0, 0.5, vHeight + 0.5) * uGrowthProgress;
    
    vec3 baseColor = uColor;
    vec3 sparkleColor = vec3(1.0, 1.0, 1.0);
    vec3 finalColor = mix(baseColor, sparkleColor, crystalPattern * 0.3 + sparkle * 0.4);
    
    float alpha = uOpacity * growthMask;
    alpha *= mix(0.6, 1.0, crystalPattern);
    
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 3.0);
    finalColor = mix(finalColor, vec3(1.0), fresnel * 0.3);
    alpha += fresnel * 0.2;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export const heatmapVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vIntensity;
  
  attribute float aIntensity;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vIntensity = aIntensity;
    
    vec3 pos = position;
    pos.y += aIntensity * 0.3;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const heatmapFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vIntensity;
  
  uniform float uTime;
  
  vec3 getHeatmapColor(float value) {
    vec3 color0 = vec3(0.0, 0.0, 0.5);
    vec3 color1 = vec3(0.0, 0.5, 1.0);
    vec3 color2 = vec3(0.0, 1.0, 0.5);
    vec3 color3 = vec3(1.0, 1.0, 0.0);
    vec3 color4 = vec3(1.0, 0.5, 0.0);
    vec3 color5 = vec3(1.0, 0.0, 0.0);
    
    if (value < 0.2) return mix(color0, color1, value / 0.2);
    else if (value < 0.4) return mix(color1, color2, (value - 0.2) / 0.2);
    else if (value < 0.6) return mix(color2, color3, (value - 0.4) / 0.2);
    else if (value < 0.8) return mix(color3, color4, (value - 0.6) / 0.2);
    else return mix(color4, color5, (value - 0.8) / 0.2);
  }
  
  void main() {
    float intensity = clamp(vIntensity, 0.0, 1.0);
    
    vec3 color = getHeatmapColor(intensity);
    
    float pulse = 0.8 + 0.2 * sin(uTime * 2.0 + vPosition.x * 10.0 + vPosition.z * 10.0);
    color *= pulse;
    
    float alpha = 0.5 + intensity * 0.5;
    
    float edge = smoothstep(0.0, 0.1, min(vUv.x, min(vUv.y, min(1.0 - vUv.x, 1.0 - vUv.y))));
    alpha *= edge;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const arrowVertexShader = `
  attribute float aDirectionX;
  attribute float aDirectionY;
  attribute float aDirectionZ;
  attribute float aScale;
  attribute float aPhase;
  
  varying float vPhase;
  varying vec3 vDirection;
  
  uniform float uTime;
  
  void main() {
    vPhase = aPhase;
    vDirection = normalize(vec3(aDirectionX, aDirectionY, aDirectionZ));
    
    vec3 pos = position;
    pos *= aScale;
    
    float animation = 0.5 + 0.5 * sin(uTime * 2.0 + aPhase * 6.28);
    pos *= 0.8 + animation * 0.4;
    
    vec3 dir = vDirection;
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, dir));
    vec3 newUp = cross(dir, right);
    
    mat3 rotation = mat3(right, newUp, dir);
    pos = rotation * pos;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const arrowFragmentShader = `
  varying float vPhase;
  varying vec3 vDirection;
  
  uniform float uTime;
  uniform vec3 uColor;
  
  void main() {
    float animation = 0.5 + 0.5 * sin(uTime * 2.0 + vPhase * 6.28);
    
    vec3 color = uColor;
    color *= 0.8 + animation * 0.4;
    
    float alpha = 0.7 + animation * 0.3;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
