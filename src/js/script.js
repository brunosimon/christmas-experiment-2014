/* OPTIONS */
var options = {
    brightness    : 0.1,
    contrast      : 0.1,
    shaders       : true,
    blur_strength : 1,
    blur_amount   : 0.001,
    color         : {r:0.8,g:1,b:1.4}
};

/* GUI */
var gui         = new dat.GUI(),
    controllers = {},
    graphics    = gui.addFolder('Graphics');

graphics.open();
controllers.brightness    = graphics.add(options,'brightness',-1,1).step(0.01).name('brightness');
controllers.contrast      = graphics.add(options,'contrast',-1,1).step(0.01).name('contrast');
controllers.shaders       = graphics.add(options,'shaders').name('shaders');
controllers.blur_strength = graphics.add(options,'blur_strength',0,2).step(0.01).name('blur strength');
controllers.blur_amount   = graphics.add(options,'blur_amount',0,0.01).step(0.0001).name('blur amount');
controllers.color_r       = graphics.add(options.color,'r',0,2).step(0.1).name('color R');
controllers.color_g       = graphics.add(options.color,'g',0,2).step(0.1).name('color G');
controllers.color_b       = graphics.add(options.color,'b',0,2).step(0.1).name('color B');

// Events
controllers.brightness.onChange(function(value)
{
    brightness_contrast_pass.uniforms.brightness.value = value;
});
controllers.contrast.onChange(function(value)
{
    brightness_contrast_pass.uniforms.contrast.value = value;
});
controllers.blur_strength.onChange(function(value)
{
    bloom_pass.copyUniforms.opacity.value = value;
});
controllers.blur_amount.onChange(function(value)
{
    THREE.BloomPass.blurX.x = value;
    THREE.BloomPass.blurY.y = value;
});
controllers.color_r.onChange(function(value)
{
    color_corection_pass.uniforms.mulRGB.value.x = value;
});
controllers.color_g.onChange(function(value)
{
    color_corection_pass.uniforms.mulRGB.value.y = value;
});
controllers.color_b.onChange(function(value)
{
    color_corection_pass.uniforms.mulRGB.value.z = value;
});

/* STATS */
var rS = new rStats({
    CSSPath : 'src/css/',
    values  :
    {
        raf :
        {
            caption : 'RAF (ms)',
            over    : 25,
            average : true
        },
        fps :
        {
            caption : 'Framerate (FPS)',
            below   : 50,
            average : true
        }
    }
});


/* INIT THREE */
var scene    = new THREE.Scene(),
    camera   = new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,0.1,100000),
    center   = new THREE.Vector3(),
    canvas   = document.getElementById('three-canvas'),
    renderer = new THREE.WebGLRenderer({canvas:canvas,alpha:true});

renderer.setClearColor(0x000000,0);
renderer.setSize(window.innerWidth,window.innerHeight);
camera.position.y = 0.2;
camera.position.z = 3;

// Render target
var render_target_parameters = {minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBFormat,stencilBuffer:false},
    render_target            = new THREE.WebGLRenderTarget(window.innerWidth,window.innerHeight,render_target_parameters);

// Shaders
var bloom_pass               = new THREE.BloomPass(options.blur_strength,25,4,512),
    brightness_contrast_pass = new THREE.ShaderPass(THREE.BrightnessContrastShader),
    fxaa_pass                = new THREE.ShaderPass(THREE.FXAAShader),
    color_corection_pass     = new THREE.ShaderPass(THREE.ColorCorrectionShader),
    copy_pass                = new THREE.ShaderPass(THREE.CopyShader),
    render_pass              = new THREE.RenderPass(scene,camera),
    blend_pass               = new THREE.ShaderPass(THREE.AdditiveBlendShader,'tDiffuse1');

brightness_contrast_pass.uniforms.brightness.value = 0;
brightness_contrast_pass.uniforms.contrast.value   = 0;

fxaa_pass.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);

color_corection_pass.uniforms.powRGB.value = new THREE.Vector3(1,1,1);
color_corection_pass.uniforms.mulRGB.value = new THREE.Vector3(options.color.r,options.color.g,options.color.b);

// copy_pass.renderToScreen = true;

// Bloom composer
var composer_bloom = new THREE.EffectComposer(renderer,render_target);
composer_bloom.addPass(render_pass);
composer_bloom.addPass(bloom_pass);
composer_bloom.addPass(copy_pass);

// Normal composer
var composer_final = new THREE.EffectComposer(renderer,render_target);
composer_final.addPass(render_pass);
composer_final.addPass(brightness_contrast_pass);
composer_final.addPass(fxaa_pass);
composer_final.addPass(color_corection_pass);
composer_final.addPass(copy_pass);

blend_pass.uniforms.tDiffuse2.value = composer_bloom.renderTarget2;
blend_pass.renderToScreen = true;
composer_final.addPass(blend_pass);


/* SKYBOX */
var image_prefix   = 'src/img/skyboxes/mountains-blur/',
    directions     = ['xpos','xneg','ypos','yneg','zpos','zneg'],
    image_suffix   = '.png',
    sky_geometry   = new THREE.BoxGeometry(10000,10000,10000),
    material_array = [];

for(var i = 0; i < 6; i++)
{
    material_array.push(new THREE.MeshBasicMaterial({
        map  : THREE.ImageUtils.loadTexture(image_prefix + directions[i] + image_suffix),
        side : THREE.BackSide
    }));
}
var sky_material = new THREE.MeshFaceMaterial(material_array),
    sky_box      = new THREE.Mesh(sky_geometry,sky_material);

sky_material.emissive = new THREE.Color(0xffffff);

scene.add(sky_box);


/* LIGHTS */
function create_direction_light(x,y,z,color,strength,destination)
{
    var directional_light = new THREE.DirectionalLight(color,strength);
    directional_light.position.set(x,y,z);
    destination.add(directional_light);

    return directional_light;
}

create_direction_light(0.5,0.5,0.5,0xffffff,0.2,scene);
create_direction_light(-0.5,0.5,0.5,0xffffff,0.6,scene);
create_direction_light(0.5,-0.5,0.5,0xffffff,0.2,scene);
create_direction_light(-0.5,-0.5,0.5,0xffffff,0.2,scene);
create_direction_light(0.5,0.5,-0.5,0xffffff,0.1,scene);
create_direction_light(-0.5,0.5,-0.5,0xffffff,0.1,scene);
create_direction_light(0.5,-0.5,-0.5,0xffffff,0.1,scene);
create_direction_light(-0.5,-0.5,-0.5,0xffffff,0.1,scene);


/* CREATE BOX */
function create_box(x,y,z,width,height,depth,color,destination)
{
    var material = new THREE.MeshLambertMaterial({color:color,shading:THREE.FlatShading}),
        geometry = new THREE.BoxGeometry(width,height,depth),
        mesh     = new THREE.Mesh(geometry,material);

    mesh.position.set(x,y,z);

    destination.add(mesh);

    return mesh;
}

/* CREATE PYRAMID */
function create_pyramid(x,y,z,width,height,color,destination)
{
    var material = new THREE.MeshLambertMaterial({color:color,shading:THREE.FlatShading}),
        geometry = new THREE.CylinderGeometry(0,width,height,4,false),
        mesh     = new THREE.Mesh(geometry,material);

    mesh.position.set(x,y,z);
    mesh.rotation.y = Math.PI / 4;

    destination.add(mesh);

    return mesh;
}

/* WORLD */
create_box(0,0,0,2,0.2,3,0xdf6b33,scene);
create_box(0,0.3,0,0.2,0.4,0.2,0xffffff,scene);
create_box(-0.9,0.3,0,0.2,0.4,3,0xffffff,scene);
create_box(0.9,0.3,0,0.2,0.4,3,0xffffff,scene);

/* SANTA */
var santa = new THREE.Object3D();
santa.position.set(0,0.05,1);
scene.add(santa);

// Body
create_box(0,0.15,0,0.14,0.1,0.08,0xff0000,santa);
create_box(0,0.1,0,0.15,0.02,0.09,0xffffff,santa);
create_box(0,0.15,0.042,0.02,0.1,0.002,0xffffff,santa);
// Leg left
create_box(0.035,0.08,0,0.05,0.02,0.05,0xff0000,santa);
create_box(0.035,0.06,0,0.05,0.02,0.05,0x000000,santa);
// Leg right
create_box(-0.035,0.08,0,0.05,0.02,0.05,0xff0000,santa);
create_box(-0.035,0.06,0,0.05,0.02,0.05,0x000000,santa);
// Head
create_box(0,0.23,0,0.05,0.05,0.05,0xffc1b3,santa);
// Beard
create_box(0,0.20,0.035,0.05,0.04,0.02,0xffffff,santa);
// mustach
create_box(0,0.225,0.028,0.02,0.01,0.005,0xffffff,santa);
// Hat
create_box(0,0.255,0,0.055,0.005,0.055,0xffffff,santa);
create_pyramid(0,0.275,0,0.038,0.04,0xff0000,santa);
create_box(0,0.295,0,0.012,0.012,0.012,0xffffff,santa);

/* ELF */
var elf = new THREE.Object3D();
elf.position.set(0,0.05,1.2);
scene.add(elf);

// Body
create_box(0,0.07,0,0.06,0.01,0.06,0xffffff,elf);
create_box(0,0.085,0,0.06,0.02,0.06,0x82ad00,elf);
// Legs
create_box( 0.018,0.065,0,0.02,0.01,0.02,0x82ad00,elf);
create_box(-0.018,0.065,0,0.02,0.01,0.02,0x82ad00,elf);
create_box( 0.018,0.055,0,0.02,0.01,0.02,0x000000,elf);
create_box(-0.018,0.055,0,0.02,0.01,0.02,0x000000,elf);
// Head
create_box(0,0.105,0,0.06,0.02,0.06,0xffc1b3,elf);
create_box(0,0.105,0.035,0.01,0.01,0.01,0xffc1b3,elf);
// Hat
create_box(0,0.117,0,0.062,0.005,0.062,0xffffff,elf);
create_pyramid(0,0.139,0,0.038,0.04,0x82ad00,elf);
create_box(0,0.159,0,0.012,0.012,0.012,0xffffff,elf);

/* SNOW */
// var snow_material = new THREE.PointCloudMaterial({color:0xffffff,size:0.01})

var snow_uniforms   = {},
    snow_attributes = {},
    snow_material   = null;

snow_uniforms.texture         = {type:'t',value:THREE.ImageUtils.loadTexture('src/img/spark-9.png')};
snow_uniforms.pixelRatio      = {type:'f',value:1};
snow_uniforms.volumeCorner    = {type:'v3',value:new THREE.Vector3(-2,-2,-2)};
snow_uniforms.volumeSize      = {type:'v3',value:new THREE.Vector3(4,4,4)};
snow_uniforms.wind            = {type:'v3',value:new THREE.Vector3(2,0,0)};
snow_uniforms.perlinIntensity = {type:'f',value:0.1};
snow_uniforms.perlinFrequency = {type:'f',value:0.1};
snow_uniforms.time            = {type:'f',value:0};
snow_uniforms.timeScale       = {type:'f',value:0.00025};
snow_uniforms.gravity         = {type:'f',value:-2};
snow_uniforms.fadeDistance    = {type:'f',value:1};
snow_uniforms.particleScale   = {type:'f',value:5};
snow_uniforms.particlesColor  = {type:'c',value:new THREE.Color(0xffffff)};

snow_attributes.alpha = {type:'f',value:[]};

snow_material = new THREE.ShaderMaterial(
{
    attributes     : snow_attributes,
    uniforms       : snow_uniforms,
    vertexShader   : document.getElementById('vertexshader').textContent,
    fragmentShader : document.getElementById('fragmentshader').textContent,
    transparent    : true,
    blending       : THREE.AdditiveBlending,
    depthTest      : true
});

var snow_geometry    = new THREE.Geometry(),
    snow_count       = 1000,
    snow_point_cloud = new THREE.PointCloud(snow_geometry,snow_material);

while(snow_count--)
{
    snow_geometry.vertices.push(new THREE.Vector3(Math.random() * 12 - 6,Math.random() * 12 - 6,Math.random() * 12 - 6));
    snow_attributes.alpha.value.push(1);
}

scene.add(snow_point_cloud);


/* RESIZE */
var win = {width:window.innerWidth,height:window.innerHeight};
window.onresize = function()
{
    // Window
    win.width  = window.innerWidth;
    win.height = window.innerHeight;

    // Canvas
    canvas.width  = win.width;
    canvas.height = win.height;

    // Camera
    camera.aspect = win.width / win.height;
    camera.updateProjectionMatrix();

    // Pass
    fxaa_pass.uniforms.resolution.value.set(1 / win.width,1 / win.height);

    // Renderer / Composers
    renderer.setSize(win.width,win.height);
    composer_final.setSize(win.width,win.height);
};


/* MOUSE MOVE */
var mouse = {x:0,y:0,ratio:{x:0,y:0}};
window.onmousemove = function(e)
{
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    mouse.ratio.x = mouse.x / win.width;
    mouse.ratio.y = mouse.y / win.height;
};


/* MOUSE WHEEL */
var distance = 3;
var mouse_wheel_handler = function(e)
{
    e.preventDefault();

    var delta = e.wheelDeltaY || e.wheelDelta || - e.detail;

    distance += - delta / 200;

    if(distance < 0.6)
        distance = 0.6;
    else if(distance > 4)
        distance = 4;

    return false;
};
document.addEventListener('mousewheel',mouse_wheel_handler,false);
document.addEventListener('DOMMouseScroll',mouse_wheel_handler,false);


/* FRAMES */
var start_time = +(new Date());
function loop()
{
    window.requestAnimationFrame(loop);

    // Stats
    rS('raf').tick();
    rS('fps').frame();
    rS().update();

    // Camera
    camera.position.x += (Math.sin(mouse.ratio.x * 4.6 - 2.3) * distance - camera.position.x) / 10;
    camera.position.z += (Math.cos(mouse.ratio.x * 4.6 - 2.3) * distance - camera.position.z) / 10;
    camera.position.y += (center.y / 2 - (mouse.ratio.y - 1) * distance - camera.position.y) / 10;
    camera.lookAt(center);

    // Snow
    snow_uniforms.time.value = ((+new Date()) - start_time);

    // Santa
    santa.rotation.y += 0.01;

    if(!options.shaders)
    {
        renderer.render(scene,camera);
    }
    else
    {
        composer_bloom.render();
        composer_final.render();
    }
}

loop();


