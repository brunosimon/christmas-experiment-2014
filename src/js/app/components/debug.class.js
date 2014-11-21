(function()
{
    'use strict';

    APP.COMPONENTS.Debug = APP.CORE.Abstract.extend(
    {
        options :
        {

        },

        /**
         * SINGLETON
         */
        staticInstantiate:function()
        {
            if( APP.COMPONENTS.Debug.prototype.instance === null )
                return null;
            else
                return APP.COMPONENTS.Debug.prototype.instance;
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.started  = false;
            this.hidden   = true;
            this.browser  = new APP.TOOLS.Browser();
            this.ticker   = new APP.TOOLS.Ticker();
            this.keyboard = new APP.TOOLS.Keyboard();
            this.init_events();

            APP.COMPONENTS.Debug.prototype.instance = this;
        },

        /**
         * INIT EVENTS
         */
        init_events: function()
        {
            var that = this;

            // Ticker
            this.ticker.on( 'tick', function()
            {
                that.frame();
            } );

            // Keyboard
            this.keyboard.on( 'down', function( character )
            {
                if( character === 'd' )
                    that.toggle();
            } );
        },

        /**
         * START
         */
        start: function()
        {
            this.start_gui();
            this.start_stats();
            this.started = true;

            // Start hidden
            if( this.hidden )
                this.hide();
        },

        /**
         * TOGGLE
         */
        toggle: function()
        {
            if( this.hidden )
                this.show();
            else
                this.hide();
        },

        /**
         * SHOW
         */
        show: function()
        {
            this.hidden = false;
            this.gui.instance.domElement.style.display   = 'block';
            this.stats.instance.domElement.style.display = 'block';
        },

        /**
         * HIDE
         */
        hide: function()
        {
            this.hidden = true;
            this.gui.instance.domElement.style.display   = 'none';
            this.stats.instance.domElement.style.display = 'none';
        },

        /**
         * START GUI
         */
        start_gui: function()
        {
            var that = this;

            this.gui             = {};
            this.gui.instance    = new dat.GUI();
            this.gui.controllers = {};
            this.gui.graphics    = this.gui.instance.addFolder( 'Graphics' );
            this.gui.snow        = this.gui.instance.addFolder( 'Snow' );
            this.gui.sky         = this.gui.instance.addFolder( 'Sky' );
            this.gui.physics     = this.gui.instance.addFolder( 'Physics' );
            this.gui.level       = this.gui.instance.addFolder( 'Level' );
            this.gui.game        = this.gui.instance.addFolder( 'Game' );

            // this.gui.graphics.open();
            // this.gui.snow.open();
            // this.gui.sky.open();
            // this.gui.physics.open();
            // this.gui.level.open();
            this.gui.game.open();

            this.gui.controllers.brightness          = this.gui.graphics.add( app.world.renderer.brightness_contrast_pass.uniforms.brightness, 'value', -1, 1 ).step( 0.01 ).name( 'brightness' );
            this.gui.controllers.contrast            = this.gui.graphics.add( app.world.renderer.brightness_contrast_pass.uniforms.contrast, 'value' ,-1 ,1 ).step( 0.01 ).name( 'contrast' );
            this.gui.controllers.shaders             = this.gui.graphics.add( app.world.renderer.options,'shaders').name( 'shaders' );
            this.gui.controllers.blur_strength       = this.gui.graphics.add( app.world.renderer.bloom_pass.copyUniforms.opacity, 'value', 0, 2 ).step( 0.01 ).name( 'blur strength' );
            this.gui.controllers.blur_amount         = this.gui.graphics.add( app.world.renderer.options, 'blur_amount', 0, 0.01 ).step( 0.0001 ).name( 'blur amount' );
            this.gui.controllers.tilt_shift_position = this.gui.graphics.add( app.world.renderer.options, 'tilt_shift_position', 0, 1 ).step( 0.01 ).name( 'tilt position' );
            this.gui.controllers.tilt_shift_strength = this.gui.graphics.add( app.world.renderer.options, 'tilt_shift_strength', 0, 10 ).step( 0.1 ).name( 'tilt strength' );
            this.gui.controllers.color_r             = this.gui.graphics.add( app.world.renderer.color_corection_pass.uniforms.mulRGB.value, 'x', 0, 2 ).step( 0.1 ).name( 'color R' );
            this.gui.controllers.color_g             = this.gui.graphics.add( app.world.renderer.color_corection_pass.uniforms.mulRGB.value, 'y', 0, 2 ).step( 0.1 ).name( 'color G' );
            this.gui.controllers.color_b             = this.gui.graphics.add( app.world.renderer.color_corection_pass.uniforms.mulRGB.value, 'z', 0, 2 ).step( 0.1 ).name( 'color B' );

            this.gui.controllers.multiplier       = this.gui.snow.add( app.world.level.snow.options, 'multiplier', 0, 10 ).step( 0.1 ).name( 'multiplier' );
            this.gui.controllers.gravity          = this.gui.snow.add( app.world.level.snow, 'gravity', -0.01, 0.01 ).step( 0.0001 ).name( 'gravity' );
            this.gui.controllers.wind_x           = this.gui.snow.add( app.world.level.snow.wind, 'x', -0.01, 0.01 ).step( 0.0001 ).name( 'wind x' );
            this.gui.controllers.wind_y           = this.gui.snow.add( app.world.level.snow.wind, 'y', -0.01, 0.01 ).step( 0.0001 ).name( 'wind y' );
            this.gui.controllers.wind_z           = this.gui.snow.add( app.world.level.snow.wind, 'z', -0.01, 0.01 ).step( 0.0001 ).name( 'wind z' );
            this.gui.controllers.perlin_intensity = this.gui.snow.add( app.world.level.snow.uniforms.perlinIntensity, 'value', -10, 10 ).step( 0.1 ).name( 'perlin int.' );
            this.gui.controllers.perlin_frequency = this.gui.snow.add( app.world.level.snow.uniforms.perlinFrequency, 'value', -1, 1 ).step( 0.01 ).name( 'perlin freq.' );
            this.gui.controllers.time_scale       = this.gui.snow.add( app.world.level.snow.uniforms.timeScale, 'value', 0, 0.001 ).step( 0.00001 ).name( 'time scale' );
            this.gui.controllers.fade_distance    = this.gui.snow.add( app.world.level.snow.uniforms.fadeDistance, 'value', 0, 3 ).step( 0.1 ).name( 'fade distance' );
            this.gui.controllers.particle_scale   = this.gui.snow.add( app.world.level.snow.uniforms.particleScale, 'value', 1, 20 ).step( 0.1 ).name( 'particle scale' );

            this.gui.controllers.top_color    = this.gui.sky.addColor( app.world.sky.options, 'top_color' ).name( 'top color' );
            this.gui.controllers.bottom_color = this.gui.sky.addColor( app.world.sky.options, 'bottom_color' ).name( 'bottom color' );
            this.gui.controllers.offset       = this.gui.sky.add( app.world.sky.uniforms.offset, 'value', -20000, 20000 ).step( 10 ).name( 'offset' );
            this.gui.controllers.multiplier   = this.gui.sky.add( app.world.sky.uniforms.multiplier, 'value', 0, 40000 ).step( 10 ).name( 'multiplier' );
            this.gui.controllers.min_clamp    = this.gui.sky.add( app.world.sky.uniforms.minClamp, 'value', -2, 2 ).step( 0.1 ).name( 'min clamp' );
            this.gui.controllers.max_clamp    = this.gui.sky.add( app.world.sky.uniforms.maxClamp, 'value', -2, 2 ).step( 0.1 ).name( 'max clamp' );

            this.gui.controllers.physics_debug  = this.gui.physics.add( app.world.physics.options, 'debug' ).name( 'debug' );
            this.gui.controllers.santa_force    = this.gui.physics.add( app.world.physics.options.forces, 'santa', 0, 0.05 ).step( 0.0001 ).name( 'santa force' );
            this.gui.controllers.elves_force    = this.gui.physics.add( app.world.physics.options.forces, 'elves', 0, 0.005 ).step( 0.00001 ).name( 'elves force' );
            this.gui.controllers.santa_friction = this.gui.physics.add( app.world.santa.physic, 'frictionAir', 0, 0.5 ).step( 0.001 ).name( 'santa friction' );
            this.gui.controllers.elves_friction = this.gui.physics.add( app.world.elves[ 0 ].physic, 'frictionAir', 0, 0.5 ).step( 0.001 ).name( 'elves friction' );

            this.gui.controllers.lvl_debug   = this.gui.level.add( app.world.level.options.debug, 'available' ).name( 'debug' );
            this.gui.controllers.rooms_count = this.gui.level.add( app.world.level.options.rooms, 'count', 1, 20 ).step( 1 ).name( 'rooms count' );
            this.gui.controllers.init_level  = this.gui.level.add( app.world.level, 'init_new_level' ).name( 'new level' );

            this.gui.controllers.restart = this.gui.game.add( app, 'restart' ).name( 'restart' );

            // Events
            this.instance.gui.controllers.blur_amount.onChange( function( value )
            {
                THREE.BloomPass.blurX.x = value;
                THREE.BloomPass.blurY.y = value;
            } );

            this.instance.gui.controllers.tilt_shift_position.onChange( function( value )
            {
                app.world.renderer.horizontal_tilt_pass.uniforms.r.value = value;
                app.world.renderer.vertical_tilt_pass.uniforms.r.value   = value;
            } );

            this.instance.gui.controllers.tilt_shift_strength.onChange( function( value )
            {
                app.world.renderer.horizontal_tilt_pass.uniforms.h.value = 4 / ( that.browser.width ) * value;
                app.world.renderer.vertical_tilt_pass.uniforms.v.value   = 4 / ( that.browser.height ) * value;
            } );

            this.instance.gui.controllers.top_color.onChange( function( value )
            {
                app.world.sky.uniforms.topColor.value = new THREE.Color( value );
            } );

            this.instance.gui.controllers.bottom_color.onChange( function( value )
            {
                app.world.sky.uniforms.bottomColor.value = new THREE.Color( value );
            } );

            this.instance.gui.controllers.physics_debug.onChange( function( value )
            {
                if( value )
                    app.world.physics.engine.render.canvas.classList.remove('hidden');
                else
                    app.world.physics.engine.render.canvas.classList.add('hidden');
            } );

            this.instance.gui.controllers.lvl_debug.onChange( function( value )
            {
                if( value )
                    app.world.level.canvas.classList.remove( 'hidden' );
                else
                    app.world.level.canvas.classList.add( 'hidden' );
            } );

            this.gui.controllers.elves_friction.onChange( function( value )
            {
                for( var i = 0; i < app.world.elves.length; i++ )
                {
                    var elf = app.world.elves[ i ];
                    elf.physic.frictionAir = value;
                }
            } );
        },

        /**
         * START STATS
         */
        start_stats: function()
        {
            this.stats          = {};
            this.stats.instance = new rStats({
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

            this.stats.instance.domElement = document.querySelector('.rs-base');
        },

        /**
         * FRAME
         */
        frame: function()
        {
            if(this.started)
            {
                // Stats
                this.stats.instance( 'raf' ).tick();
                this.stats.instance( 'fps' ).frame();
                this.stats.instance().update();
            }
        }
    });
})();




