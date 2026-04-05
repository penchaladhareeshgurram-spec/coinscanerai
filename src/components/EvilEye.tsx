import React, { useEffect, useRef } from 'react';

interface EvilEyeProps {
  eyeColor?: string;
  intensity?: number;
  pupilSize?: number;
  irisWidth?: number;
  glowIntensity?: number;
  scale?: number;
  noiseScale?: number;
  pupilFollow?: number;
  flameSpeed?: number;
  backgroundColor?: string;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ] : [0, 0, 0];
};

export const EvilEye: React.FC<EvilEyeProps> = ({
  eyeColor = "#FF6F37",
  intensity = 1.3,
  pupilSize = 1.35,
  irisWidth = 0.25,
  glowIntensity = 0.35,
  scale = 0.8,
  noiseScale = 1,
  pupilFollow = 0.6,
  flameSpeed = 1.8,
  backgroundColor = "#010000"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform vec3 u_eyeColor;
      uniform float u_intensity;
      uniform float u_pupilSize;
      uniform float u_irisWidth;
      uniform float u_glowIntensity;
      uniform float u_scale;
      uniform float u_noiseScale;
      uniform float u_flameSpeed;
      uniform float u_pupilFollow;
      uniform vec3 u_backgroundColor;

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= u_resolution.x / u_resolution.y;
        
        vec2 mouse = u_mouse / u_resolution.xy;
        mouse = mouse * 2.0 - 1.0;
        mouse.x *= u_resolution.x / u_resolution.y;

        uv /= u_scale;

        float dCenter = length(uv);
        
        vec2 pupilOffset = mouse * 0.15 * u_pupilFollow;
        vec2 uvEye = uv - pupilOffset;
        float dEye = length(uvEye);

        float angle = atan(uvEye.y, uvEye.x);
        
        float n = snoise(vec2(angle * 4.0 * u_noiseScale, dEye * 8.0 - u_time * u_flameSpeed));
        float n2 = snoise(vec2(angle * 8.0 * u_noiseScale, dEye * 12.0 - u_time * u_flameSpeed * 1.5));
        float noiseVal = (n + n2 * 0.5) * 0.5 + 0.5;

        float irisRadius = 0.4 * u_irisWidth;
        float iris = smoothstep(irisRadius + 0.3, irisRadius - 0.1, dEye + noiseVal * 0.15);
        
        float pSize = 0.08 * u_pupilSize;
        float pupil = smoothstep(pSize + 0.04, pSize, dEye);

        float glow = exp(-dCenter * (2.5 / u_glowIntensity)) * u_intensity;

        vec3 color = u_backgroundColor;
        
        vec3 eyeCol = u_eyeColor * noiseVal * iris * u_intensity * 1.5;
        
        color += eyeCol;
        color += u_eyeColor * glow * 0.6;
        
        color = mix(color, vec3(0.0), pupil);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      mouse: gl.getUniformLocation(program, 'u_mouse'),
      time: gl.getUniformLocation(program, 'u_time'),
      eyeColor: gl.getUniformLocation(program, 'u_eyeColor'),
      intensity: gl.getUniformLocation(program, 'u_intensity'),
      pupilSize: gl.getUniformLocation(program, 'u_pupilSize'),
      irisWidth: gl.getUniformLocation(program, 'u_irisWidth'),
      glowIntensity: gl.getUniformLocation(program, 'u_glowIntensity'),
      scale: gl.getUniformLocation(program, 'u_scale'),
      noiseScale: gl.getUniformLocation(program, 'u_noiseScale'),
      flameSpeed: gl.getUniformLocation(program, 'u_flameSpeed'),
      pupilFollow: gl.getUniformLocation(program, 'u_pupilFollow'),
      backgroundColor: gl.getUniformLocation(program, 'u_backgroundColor'),
    };

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = canvas.height - (e.clientY - rect.top);
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let startTime = Date.now();

    const render = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);

      const currentTime = (Date.now() - startTime) / 1000;

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.mouse, mouseX, mouseY);
      gl.uniform1f(uniforms.time, currentTime);
      
      const rgbEye = hexToRgb(eyeColor);
      gl.uniform3f(uniforms.eyeColor, rgbEye[0], rgbEye[1], rgbEye[2]);
      
      gl.uniform1f(uniforms.intensity, intensity);
      gl.uniform1f(uniforms.pupilSize, pupilSize);
      gl.uniform1f(uniforms.irisWidth, irisWidth);
      gl.uniform1f(uniforms.glowIntensity, glowIntensity);
      gl.uniform1f(uniforms.scale, scale);
      gl.uniform1f(uniforms.noiseScale, noiseScale);
      gl.uniform1f(uniforms.flameSpeed, flameSpeed);
      gl.uniform1f(uniforms.pupilFollow, pupilFollow);
      
      const rgbBg = hexToRgb(backgroundColor);
      gl.uniform3f(uniforms.backgroundColor, rgbBg[0], rgbBg[1], rgbBg[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [eyeColor, intensity, pupilSize, irisWidth, glowIntensity, scale, noiseScale, pupilFollow, flameSpeed, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
};
