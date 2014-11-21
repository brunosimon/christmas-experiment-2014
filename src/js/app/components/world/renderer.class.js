(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.Renderer = APP.CORE.Abstract.extend(
    {
        options :
        {
            shaders             : true,
            canvas              : null,
            brightness          : 0.1,
            contrast            : 0.1,
            blur_strength       : 1,
            blur_amount         : 0.001,
            tilt_shift_position : 0.55,
            tilt_shift_strength : 0.8,
            color               : { r : 0.8, g : 1, b : 1.4 }
        },

        /**
         * SINGLETON
         */
        staticInstantiate:function()
        {
            if( APP.COMPONENTS.WORLD.Renderer.prototype.instance === null )
                return null;
            else
                return APP.COMPONENTS.WORLD.Renderer.prototype.instance;
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.ticker  = new APP.TOOLS.Ticker();
            this.browser = new APP.TOOLS.Browser();

            this.init_events();

            APP.COMPONENTS.WORLD.Renderer.prototype.instance = this;
        },

        /**
         * INIT EVENTS
         */
        init_events: function()
        {
            var that = this;

            /* RESIZE */
            this.browser.on( 'resize', function()
            {
                // Pass
                that.fxaa_pass.uniforms.resolution.value.set( 1 / that.browser.width, 1 / that.browser.height );

                // Renderer / Composers
                that.instance.setSize( that.browser.width, that.browser.height );
                that.composer_final.setSize( that.browser.width, that.browser.height );
            } );
        },

        /**
         * START
         */
        start: function(scene,camera)
        {
            var that = this;

            this.scene      = scene;
            this.camera     = camera;
            this.instance   = new THREE.WebGLRenderer( { canvas : this.options.canvas, alpha : true } );
            this.start_time = + ( new Date() );

            this.instance.setClearColor( 0x000000, 0 );
            this.instance.setSize( window.innerWidth, window.innerHeight );

            // Render target
            var render_target_parameters = { minFilter : THREE.LinearFilter, magFilter : THREE.LinearFilter, format : THREE.RGBFormat, stencilBuffer : false },
                render_target            = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, render_target_parameters );

            // Shaders
            this.bloom_pass               = new THREE.BloomPass( this.options.blur_strength, 25, 4, 512 );
            this.brightness_contrast_pass = new THREE.ShaderPass( THREE.BrightnessContrastShader );
            this.fxaa_pass                = new THREE.ShaderPass( THREE.FXAAShader );
            this.color_corection_pass     = new THREE.ShaderPass( THREE.ColorCorrectionShader );
            this.copy_pass                = new THREE.ShaderPass( THREE.CopyShader );
            this.render_pass              = new THREE.RenderPass( this.scene, this.camera );
            this.blend_pass               = new THREE.ShaderPass( THREE.AdditiveBlendShader, 'tDiffuse1' );
            this.horizontal_tilt_pass     = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
            this.vertical_tilt_pass       = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );

            this.brightness_contrast_pass.uniforms.brightness.value = 0;
            this.brightness_contrast_pass.uniforms.contrast.value   = 0;

            this.fxaa_pass.uniforms.resolution.value.set( 1 / window.innerWidth, 1 / window.innerHeight );

            this.color_corection_pass.uniforms.powRGB.value = new THREE.Vector3( 1, 1, 1 );
            this.color_corection_pass.uniforms.mulRGB.value = new THREE.Vector3( this.options.color.r, this.options.color.g, this.options.color.b );

            this.horizontal_tilt_pass.uniforms.h.value = 4 / ( this.browser.width ) * this.options.tilt_shift_strength;
            this.vertical_tilt_pass.uniforms.v.value   = 4 / ( this.browser.height ) * this.options.tilt_shift_strength;

            this.horizontal_tilt_pass.uniforms.r.value = this.options.tilt_shift_position;
            this.vertical_tilt_pass.uniforms.r.value   = this.options.tilt_shift_position;

            // Bloom composer
            this.composer_bloom = new THREE.EffectComposer( this.instance, render_target );
            this.composer_bloom.addPass( this.render_pass );
            this.composer_bloom.addPass( this.bloom_pass );
            this.composer_bloom.addPass( this.copy_pass );

            // Normal composer
            this.composer_final = new THREE.EffectComposer( this.instance,render_target );
            this.composer_final.addPass( this.render_pass );
            this.composer_final.addPass( this.brightness_contrast_pass );
            this.composer_final.addPass( this.fxaa_pass );
            this.composer_final.addPass( this.color_corection_pass );
            this.composer_final.addPass( this.horizontal_tilt_pass );
            this.composer_final.addPass( this.vertical_tilt_pass );
            this.composer_final.addPass( this.copy_pass );

            this.blend_pass.uniforms.tDiffuse2.value = this.composer_bloom.renderTarget2;
            this.blend_pass.renderToScreen = true;
            this.composer_final.addPass( this.blend_pass );

            // Ticker
            this.ticker.on( 'tick' , function()
            {
                that.frame();
            } );
        },

        /**
         * FRAME
         */
        frame: function()
        {
            if( !this.options.shaders )
            {
                this.instance.render( this.scene, this.camera );
            }
            else
            {
                this.composer_bloom.render();
                this.composer_final.render();
            }
        }
    });
})();




