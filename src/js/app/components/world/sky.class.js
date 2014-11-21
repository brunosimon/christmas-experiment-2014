(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.Sky = APP.CORE.Abstract.extend(
    {
        options :
        {
            scene        : null,
            bottom_color : 0x002b5c,
            top_color    : 0x0087ff,
            min_clamp    : -1,
            max_clamp    : 1,
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.scene = this.options.scene;
        },

        /**
         * START
         */
        start: function()
        {
            // Sphere
            this.uniforms = {
                topColor    : { type : 'c', value : new THREE.Color( this.options.top_color ) },
                bottomColor : { type : 'c', value : new THREE.Color( this.options.bottom_color ) },
                offset      : { type : 'f', value : -5000 },
                multiplier  : { type : 'f', value : 10000 },
                minClamp    : { type : 'f', value : this.options.min_clamp },
                maxClamp    : { type : 'f', value : this.options.max_clamp }
            };
            this.sky_geometry = new THREE.SphereGeometry( 10000, 32, 16 );
            this.sky_material = new THREE.ShaderMaterial( {
                vertexShader   : document.getElementById( 'gradient-vertex-shader' ).textContent,
                fragmentShader : document.getElementById( 'gradient-fragment-shader' ).textContent,
                uniforms       : this.uniforms,
                side           : THREE.BackSide
            } );
            this.sky = new THREE.Mesh( this.sky_geometry, this.sky_material );

            this.scene.add( this.sky );
        }
    });
})();




