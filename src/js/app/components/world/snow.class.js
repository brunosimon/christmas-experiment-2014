(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.Snow = APP.CORE.Abstract.extend(
    {
        options :
        {
            count         : 5000,
            multiplier    : 1,
            volume_corner : { x : - 2, y : 0.1, z : - 2 },
            volume_size   : { x : 4, y : 4, z : 4 },
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.ticker  = new APP.TOOLS.Ticker();
            this.browser = new APP.TOOLS.Browser();
            this.scene   = this.options.scene;
            this.wind    = new THREE.Vector3( 0, 0, 0 );
            this.gravity = -0.0005;
            // this.gravity    = 0;
        },

        /**
         * START
         */
        start: function()
        {
            var that = this;

            this.uniforms   = {};
            this.attributes = {};
            this.material   = null;

            this.uniforms.texture         = { type : 't', value : THREE.ImageUtils.loadTexture('src/img/spark-9.png') };
            this.uniforms.pixelRatio      = { type : 'f', value : 1};
            this.uniforms.volumeCorner    = { type : 'v3', value : new THREE.Vector3( this.options.volume_corner.x, this.options.volume_corner.y, this.options.volume_corner.z ) };
            this.uniforms.volumeSize      = { type : 'v3', value : new THREE.Vector3( this.options.volume_size.x, this.options.volume_size.y, this.options.volume_size.z ) };
            this.uniforms.offset          = { type : 'v3', value : new THREE.Vector3( 0, 0, 0 ) };
            this.uniforms.perlinIntensity = { type : 'f', value : 1.5 };
            this.uniforms.perlinFrequency = { type : 'f', value : 0.5 };
            this.uniforms.time            = { type : 'f', value : 0 };
            this.uniforms.timeScale       = { type : 'f', value : 0.00025 };
            this.uniforms.fadeDistance    = { type : 'f', value : 1 };
            this.uniforms.particleScale   = { type : 'f', value : 6 };
            this.uniforms.particlesColor  = { type : 'c', value : new THREE.Color( 0xffffff ) };

            this.attributes.alpha = {type:'f',value:[]};

            this.material = new THREE.ShaderMaterial(
            {
                attributes     : this.attributes,
                uniforms       : this.uniforms,
                vertexShader   : document.getElementById( 'snow-vertex-shader' ).textContent,
                fragmentShader : document.getElementById( 'snow-fragment-shader' ).textContent,
                transparent    : true,
                blending       : THREE.AdditiveBlending,
                depthTest      : true,
                depthWrite     : false,
            });

            this.create_particles();

            // Init Debug
            this.init_debug();

            // Ticker
            this.ticker.on( 'tick' , function()
            {
                that.frame();
            } );
        },

        /**
         * INIT DEBUG
         */
        init_debug: function()
        {
            this.debug = {};

            this.debug.instance = new APP.COMPONENTS.Debug();

            this.debug.gravity          = this.debug.instance.gui.snow.add( this, 'gravity', -0.01, 0.01 ).step( 0.0001 ).name( 'gravity' );
            this.debug.wind_x           = this.debug.instance.gui.snow.add( this.wind, 'x', -0.01, 0.01 ).step( 0.0001 ).name( 'wind x' );
            this.debug.wind_y           = this.debug.instance.gui.snow.add( this.wind, 'y', -0.01, 0.01 ).step( 0.0001 ).name( 'wind y' );
            this.debug.wind_z           = this.debug.instance.gui.snow.add( this.wind, 'z', -0.01, 0.01 ).step( 0.0001 ).name( 'wind z' );
            this.debug.perlin_intensity = this.debug.instance.gui.snow.add( this.uniforms.perlinIntensity, 'value', -10, 10 ).step( 0.1 ).name( 'perlin int.' );
            this.debug.perlin_frequency = this.debug.instance.gui.snow.add( this.uniforms.perlinFrequency, 'value', -1, 1 ).step( 0.01 ).name( 'perlin freq.' );
            this.debug.time_scale       = this.debug.instance.gui.snow.add( this.uniforms.timeScale, 'value', 0, 0.001 ).step( 0.00001 ).name( 'time scale' );
            this.debug.fade_distance    = this.debug.instance.gui.snow.add( this.uniforms.fadeDistance, 'value', 0, 3 ).step( 0.1 ).name( 'fade distance' );
            this.debug.particle_scale   = this.debug.instance.gui.snow.add( this.uniforms.particleScale, 'value', 1, 20 ).step( 0.1 ).name( 'particle scale' );
        },

        /**
         * CREATE PARTICLES
         */
        create_particles: function()
        {
            // Reset
            if(this.point_cloud)
            {
                // this.point_cloud.geometry.dispose();
                this.scene.remove( this.point_cloud );
                this.attributes.alpha.value = [];
            }

            this.geometry    = new THREE.Geometry();
            this.point_cloud = new THREE.PointCloud(this.geometry,this.material);
            this.point_cloud.frustumCulled = false;

            // Loop
            var count = this.options.count;
            while(count--)
            {
                this.geometry.vertices.push( new THREE.Vector3(
                    Math.random() * this.options.volume_size.x - this.options.volume_size.x / 2,
                    Math.random() * this.options.volume_size.y - this.options.volume_size.y / 2,
                    Math.random() * this.options.volume_size.z - this.options.volume_size.z / 2
                ) );
                this.attributes.alpha.value.push( 1 );
            }

            this.scene.add( this.point_cloud );
        },

        /**
         * FRAME
         */
        frame: function()
        {
            // Snow
            this.uniforms.time.value = this.ticker.elapsed_time;

            this.uniforms.offset.value.x += this.wind.x * this.ticker.delta;
            this.uniforms.offset.value.y += this.wind.y * this.ticker.delta;
            this.uniforms.offset.value.z += this.wind.z * this.ticker.delta;

            this.uniforms.offset.value.y += this.gravity * this.ticker.delta;
        },

        /**
         * DESTROY
         */
        destroy: function()
        {
            // Scene
            this.scene.remove( this.point_cloud );

            // Debug
            this.debug.gravity.remove();
            this.debug.wind_x.remove();
            this.debug.wind_y.remove();
            this.debug.wind_z.remove();
            this.debug.perlin_intensity.remove();
            this.debug.perlin_frequency.remove();
            this.debug.time_scale.remove();
            this.debug.fade_distance.remove();
            this.debug.particle_scale.remove();
        }
    });
})();




