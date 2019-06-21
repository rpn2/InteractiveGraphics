/**
 * @file A simple WebGL example drawing a circle
 * @author Ramya Narayanaswamy <rpn2@illinois.edu>  
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/** @global The Modelview matrix */
var mvMatrix = mat4.create();






/** @global The angle of rotation around the z axis for tilting motion in affine transformation*/
var uniformangle = 0;
var negangle = 0;

/*@global Contol the postion of badge in affine transformation*/
var deltax = 0;
var deltay = 0;

/*Controller for non-affine transformation*/
var yscale = 0;
    
//----------------------------------------------------------------------------------
/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    
}

/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}


/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}


/**
 * Populate vertex buffer with data
  
 */
function loadVertices() {
  
  
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    
  
  
  var triangleVertices = [
      
           //Blue region, modeled as vertices of triangle
           -4,  4.5, 0.0,
           -4,  3,   0.0,
           -3.25,  3,   0.0,

           -4,  4.5, 0.0,
           -3.25,  3,   0.0,
           -1.5,  3, 0.0,

           -4,  4.5, 0.0,
           -1.5,  3, 0.0,
           4,  4.5, 0.0,

           4,  4.5, 0.0,
           4,  3,   0.0,
           3.25,  3,   0.0,

           4,  4.5, 0.0,
           3.25,  3,   0.0,
           1.5,  3, 0.0,

           4,  4.5, 0.0,          
           1.5,  3, 0.0,
           -1.5,  3, 0.0,
      
           -3.25,  3,   0.0,
           -1.5,  3,  0.0,
           -1.5,  1.75,  0.0,
      
           -3.25,  3, 0.0,           
           -1.5,  1.75, 0.0,
           -1.5,  -0.25, 0.0,
      
           -3.25,  3,  0.0, 
           -1.5,  -0.25, 0.0,
           -3.25,  -1.25,  0.0, 
           
           -1.5,  -0.25, 0.0, 
           -3.25,  -1.25,  0.0,
           -1.5,  -1.25,  0.0,      
                      
           -1.5,  1.75, 0.0, 
           -1.5,  -0.25, 0.0,
           -0.875, 1.75, 0.0,
      
           -1.5,  -0.25, 0.0,
           -0.875, -0.25, 0.0,
           -0.875, 1.75, 0.0,
      
           3.25,  3,   0.0,
           1.5,  3,  0.0,
           1.5,  1.75,  0.0,
      
           3.25,  3, 0.0,           
           1.5,  1.75, 0.0,
           1.5,  -0.25, 0.0,
      
           3.25,  3,  0.0, 
           1.5,  -0.25, 0.0,
           3.25,  -1.25,  0.0, 
           
           1.5,  -0.25, 0.0, 
           3.25,  -1.25,  0.0,
           1.5,  -1.25,  0.0,      
                      
           1.5,  1.75, 0.0,
           1.5,  -0.25, 0.0,
           0.875, 1.75, 0.0,
      
           1.5,  -0.25, 0.0,
           0.875, -0.25, 0.0,
           0.875, 1.75, 0.0,
      
         /*Red region, non-uniform transformation applied based on angle of tilting;
         Changed the y-cordionate of vertices based on angle, to introduce a wiggling motion (sine wave with amplitude modulation used)
         yscale is used to turn off wiggling when the image is in center location */
      
          -3.25,  -1.75  - yscale *Math.sin(degToRad(negangle)),  0.0, 
          -3.25,  -2.375 - yscale *Math.sin(degToRad(negangle)), 0.0,
          -2.625,  -2.75 - yscale *Math.sin(degToRad(negangle)),  0.0, 
      
          -3.25,  -1.75  -  yscale *Math.sin(degToRad(negangle)),  0.0,
          -2.625,  -1.75 - yscale * Math.sin( degToRad(negangle)),  0.0, 
          -2.625,  -2.75 - yscale * Math.sin( degToRad(negangle)),  0.0,
      
          -2.125,  -1.75 +  yscale *0.8 * Math.sin( degToRad(negangle)), 0.0, 
          -2.125,  -3.125 + yscale *0.8 *  Math.sin( degToRad(negangle)),  0.0,
          -1.5,    -3.5 +  yscale * 0.8 * Math.sin( degToRad(negangle)),  0.0, 
      
          -2.125,  -1.75 + yscale * 0.8* Math.sin( degToRad(negangle)), 0.0, 
          -1.5,  -3.5  +  yscale *0.8* Math.sin( degToRad(negangle)),  0.0,
          -1.5,  -1.75 +  yscale * 0.8* Math.sin( degToRad(negangle)),  0.0, 
      
          -0.875,  -1.75 +  yscale *0.6* Math.sin( degToRad(negangle)), 0.0, 
          -0.875,  -3.875 +  yscale *0.6* Math.sin( degToRad(negangle)),  0.0,
          -0.25,  -4.125 +  yscale *0.6* Math.sin( degToRad(negangle)),  0.0, 
      
          -0.875,  -1.75 +  yscale *0.6* Math.sin(degToRad(negangle)), 0.0, 
          -0.25,  -4.125 +  yscale *0.6* Math.sin(degToRad(negangle)),  0.0,
          -0.25,  -1.75 +  yscale *0.6* Math.sin(degToRad(negangle)),  0.0, 
      
          3.25,  -1.75 +  yscale *0.6* Math.sin(degToRad(negangle)),  0.0, 
          3.25,  -2.375 +  yscale *0.6* Math.sin(degToRad(negangle)), 0.0,
          2.625,  -2.75 +  yscale * 0.6* Math.sin(degToRad(negangle)),  0.0, 
      
          3.25,  -1.75 +  yscale *0.6* Math.sin(degToRad(negangle)),  0.0,
          2.625,  -1.75 + yscale * 0.6* Math.sin(degToRad(negangle)),  0.0, 
          2.625,  -2.75 +  yscale *0.6* Math.sin(degToRad(negangle)),  0.0,
      
          2.125,  -1.75 -  yscale *0.8* Math.sin(degToRad(negangle)), 0.0, 
          2.125,  -3.125 - yscale * 0.8* Math.sin(degToRad(negangle)),  0.0,
          1.5,  -3.5 -  yscale *0.8* Math.sin(degToRad(negangle)),  0.0, 
      
          2.125,  -1.75 -  yscale *0.8* Math.sin(degToRad(negangle)), 0.0, 
          1.5,  -3.5 -  yscale *0.8* Math.sin(degToRad(negangle)),  0.0,
          1.5,  -1.75 -  yscale *0.8* Math.sin(degToRad(negangle)),  0.0, 
      
          0.875,  -1.75 -  yscale *Math.sin(degToRad(negangle)), 0.0, 
          0.875,  -3.875 -   yscale *Math.sin(degToRad(negangle)),  0.0,
          0.25,  -4.125 -   yscale *Math.sin(degToRad(negangle)),  0.0, 
      
          0.875,  -1.75 -  yscale * Math.sin(degToRad(negangle)), 0.0, 
          0.25,  -4.125 -  yscale * Math.sin(degToRad(negangle)),  0.0,
          0.25,  -1.75 -   yscale *Math.sin(degToRad(negangle)),  0.0 
      
         
  ];
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 90;
}

/**
 * Populate color buffer with data
  
 */
function loadColors() {
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    
  // Set the colors for blue and red region   
  var colors = [
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,

        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,

        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,

        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,

        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,

        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,

        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,

        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,

        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,

        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
      
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
      
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
      
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
      
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
      
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,            
      
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,            
      
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,      
          
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
        0.07, 0.16, 0.29, 1.0,
      
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,      
          
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,      
          
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,      
          
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,      
          
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,      
          
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,      
          
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0
      
      
    ];
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 90;  
}
/**
 * Populate buffers with data
   @param {number} number of vertices to use around the circle boundary
 */
function setupBuffers() {
    
  //Generate the vertex positions    
  loadVertices();

  //Generate the vertex colors
  loadColors();
}


/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

  /*orthogonal transformation to work in (-10,-10) and (10,10) corordinate system */
  mat4.ortho(mvMatrix,-10, 10, -10, 10, -1, 1);
  
    
  
  /*Affine transformations for animation*/
  /*Move the center of the mesh from 0,0 to 4 different spots to create movement in dance,
  The spots are visited in round robin fashion*/
  mat4.translate(mvMatrix,mvMatrix,[deltax, deltay, 0])
  /*Another affine transformation to introduce swing motion by a small rotation at every spot*/    
  mat4.rotate(mvMatrix, mvMatrix, degToRad(negangle), [0,0,1]);
    
   
  

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
    
  
}

/**
 * Animation to be called from tick. Updates globals and performs animation for each tick.
 */
function animate() { 
    
    /*controls rotation angle, tilt badge 10 degrees left and 10 degrees right*/
    /* Adding a small value to angle controls speed of animation */
    uniformangle= (uniformangle+0.125);
    if (uniformangle == 21) {
        uniformangle = uniformangle % 20;
        /* Controls the position of badge in the screen for every 20 degrees of rotation*/
        if (deltax == 0 && deltay == 0) {
            deltax = 4.25;
            deltay = 4.25;
            yscale = 1;
        }
        else if(deltax == 4.25 && deltay == 4.25) {
            deltax = -4.25;
            deltay =  4.25;
            yscale = 1;
        }
        else if(deltax == -4.25 && deltay == 4.25) {
            deltax = -4.25;
            deltay =  -4.25;
            yscale = 1;
        }
        else if(deltax == -4.25 && deltay == -4.25) {
            deltax = 4.25;
            deltay =  -4.25;
            yscale = 1;
        }
        else {
            deltax = 0;
            deltay = 0;
            yscale = 0; 
        }
        
    }
    /*Helps in swaying motion for right and left side of badge: 20 degree total rotation is roughly split as 10 on right and 10 on left, negangle is also used to modulate the red region to give a wiggling motion */
    if (uniformangle > 10) {
        negangle = -uniformangle;
    }
    else {
        negangle = uniformangle;
    }
    
    /*the red region is recalculated every animation frame*/
    loadVertices();
}

/**
 * Startup function called from html code to start program.
 */
 function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  tick();
}

/**
 * Tick called for every animation frame.
 */
function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}

