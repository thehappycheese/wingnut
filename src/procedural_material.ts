import * as THREE from 'three';

// Create a MeshPhongMaterial
export const material = new THREE.MeshPhongMaterial({
    color: 0x888888
});

// Use onBeforeCompile to modify the material's shaders
material.onBeforeCompile = (shader) => {
  // Vertex shader: No changes needed for color, but you could modify if necessary for other effects

  // Inject custom fragment shader code for base color calculation
  // Find the right place in the shader code to inject your pattern
  // This example injects the code before the diffuse color is used for the first time
  const customColorCode = `
    // Simple procedural pattern, e.g., stripes
    float stripes = sin(vUv.x * 10.0) * 0.5 + 0.5;
    vec3 customColor = vec3(stripes);
    diffuseColor.rgb *= customColor;
  `;

  // Inject the custom code into the fragment shader
  // This example assumes you know a good injection point; adjust as needed
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <dithering_fragment>',
    `${customColorCode}\n#include <dithering_fragment>`
  );

  // Optionally, pass any uniforms or varyings your custom code needs
  shader.uniforms.myCustomUniform = { value: 1.0 }; // Example uniform
  // Note: For custom uniforms, you'll also need to add them to the shader code
};