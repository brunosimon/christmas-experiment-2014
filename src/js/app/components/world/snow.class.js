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

            this.ticker     = new APP.TOOLS.Ticker();
            this.scene      = this.options.scene;
            this.wind       = new THREE.Vector3( 0, 0, 0 );
            this.gravity    = -0.0005;
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
            this.uniforms.particleScale   = { type : 'f', value : 5 };
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

            // Ticker
            this.ticker.on( 'tick' , function()
            {
                that.frame();
            } );
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

            // console.log(this.wind.y);
            // console.log(this.gravity);

            this.uniforms.offset.value.y += this.gravity * this.ticker.delta;
        },

        /**
         * DESTROY
         */
        destroy: function()
        {
            this.scene.remove( this.point_cloud );
        }
    });
})();




