(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.World = APP.CORE.Event_Emitter.extend(
    {
        options :
        {
            camera :
            {
                ease : 0.1
            },
            elves :
            {
                count    : 30,
                distance : 0.5
            }
        },

        /**
         * SINGLETON
         */
        staticInstantiate:function()
        {
            if( APP.COMPONENTS.WORLD.World.prototype.instance === null )
                return null;
            else
                return APP.COMPONENTS.WORLD.World.prototype.instance;
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.ticker       = new APP.TOOLS.Ticker();
            this.three_helper = new APP.TOOLS.THREE_Helper();
            this.browser      = new APP.TOOLS.Browser();
            this.mouse        = new APP.TOOLS.Mouse();
            this.physics      = new APP.COMPONENTS.WORLD.Physics();
            this.canvas       = document.getElementById( 'three-canvas' );
            this.wind         =
            {
                active : false,
                x : 0,
                z : 0,
                target :
                {
                    x : 0,
                    z : 0
                },
                interval : null
            };

            APP.COMPONENTS.WORLD.World.prototype.instance = this;
        },

        /**
         * INIT EVENTS
         */
        init_events: function()
        {
            var that = this;
        },

        /**
         * START
         */
        start: function()
        {
            var that = this;

            // Physics
            this.physics.start();

            // Scene
            this.scene  = new THREE.Scene();

            // Camera
            this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 100000 );
            this.center = new THREE.Vector3( 2, 0, 2 );
            this.camera.position.set( 4, 2, 4 );
            this.camera.speed = { x : 0, y : 0, z : 0 };

            // Sky
            this.sky = new APP.COMPONENTS.WORLD.Sky( { scene : this.scene } );
            this.sky.start();

            // lights
            this.lights = new APP.COMPONENTS.WORLD.Lights( { scene : this.scene } );
            this.lights.start();
            this.lights.set_multiplicator(1.8);

            // Level
            this.level = new APP.COMPONENTS.WORLD.Level( { scene : this.scene } );
            this.level.start();

            // Santa
            this.santa = new APP.COMPONENTS.WORLD.ELEMENTS.Santa( { scene : this.scene } );
            this.santa.start();

            // Elves
            this.elves = [];
            for( var i = 0; i < this.options.elves.count; i++ )
            {
                var elf = new APP.COMPONENTS.WORLD.ELEMENTS.Elf( {
                    scene : this.scene,
                    x     : Math.sin( i / this.options.elves.count * Math.PI * 2 ) * this.options.elves.distance,
                    z     : Math.cos( i / this.options.elves.count * Math.PI * 2 ) * this.options.elves.distance
                } );
                elf.start();
                this.elves.push( elf );
            }

            // Floor
            this.floor_material = new THREE.MeshBasicMaterial( 0xff0000 );
            this.floor_geometry = new THREE.PlaneBufferGeometry( 1000, 1000, 2, 2 );
            this.floor          = new THREE.Mesh( this.floor_geometry, this.floor_material );
            this.floor_vector   = new THREE.Vector3( 0, 0, 0 );
            this.raycaster      = new THREE.Raycaster( this.camera.position, this.floor_vector.sub( this.camera.position ).normalize() );

            this.floor.rotation.x       = - Math.PI / 2;
            this.floor_material.visible = false;

            this.scene.add( this.floor );

            // Pointer
            this.pointer = new APP.COMPONENTS.WORLD.Pointer( { scene : this.scene } );
            this.pointer.start();

            // Resize
            this.browser.on( 'resize' ,function()
            {
                // Canvas
                that.canvas.width  = that.browser.width;
                that.canvas.height = that.browser.height;

                // Camera
                that.camera.aspect = that.browser.width / that.browser.height;
                that.camera.updateProjectionMatrix();
            } );

            // Mouse wheel
            this.distance = 2.8;
            this.mouse.on( 'wheel', function()
            {
                that.distance += - that.mouse.wheel.delta / 200;

                if(that.distance < 0.6)
                    that.distance = 0.6;
                else if(that.distance > 4)
                    that.distance = 4;
            } );

            // Mouse down
            this.mouse.on( 'down', function( target )
            {
                // Click on canvas
                if( target.tagName.toLowerCase() === 'canvas' )
                    that.physics.interactions = true;
            } );

            // Mouse up
            this.mouse.on( 'up', function()
            {
                that.physics.interactions = false;
            } );

            // Renderer
            this.renderer = new APP.COMPONENTS.WORLD.Renderer( { canvas : this.canvas } );
            this.renderer.start( this.scene, this.camera );

            // Ticker
            this.ticker.on( 'tick' , function()
            {
                that.frame();
            } );

            // Wind
            this.wind.interval = window.setInterval( function()
            {
                if( !that.wind.active )
                    return;

                var rand = Math.random();

                // Chances that wind turns
                if( rand < 0.2 )
                {
                    that.wind.target.x = Math.random() * 2 - 1;
                    that.wind.target.z = Math.random() * 2 - 1;
                }
                else if( rand < 0.4 )
                {
                    that.wind.target.x = 0;
                    that.wind.target.z = 0;
                }
            }, 1000 );
        },

        /**
         * GET AVERAGE POSITION
         */
        get_average_position: function()
        {
            var average = {},
                count   = 1,
                santa_multiplicator = Math.round( this.options.elves.count );

            average.x = this.santa.object.position.x * santa_multiplicator;
            average.y = this.santa.object.position.y * santa_multiplicator;
            average.z = this.santa.object.position.z * santa_multiplicator;

            for( var i = 0; i < this.elves.length; i++ )
            {
                var elf = this.elves[ i ];

                if( elf.alive )
                {
                    average.x += elf.object.position.x;
                    average.y += elf.object.position.y;
                    average.z += elf.object.position.z;

                    count++;
                }
            }

            average.x /= count + santa_multiplicator;
            average.y /= count + santa_multiplicator;
            average.z /= count + santa_multiplicator;

            return average;
        },

        /**
         * FRAME
         */
        frame: function()
        {
            var average_position = this.get_average_position();

            // Wind
            this.wind.x += (this.wind.target.x - this.wind.x) * 0.01;
            this.wind.z += (this.wind.target.z - this.wind.z) * 0.01;

            // this.level.snow.wind.x = this.wind.x * 0.005;
            // this.level.snow.wind.z = this.wind.z * 0.005;

            this.physics.wind.x = this.wind.x * 0.0002;
            this.physics.wind.y = this.wind.z * 0.0002;

            // Ray caster
            this.floor_vector.set( this.mouse.ratio.x * 2 - 1, - (this.mouse.ratio.y * 2 - 1), this.camera.near );
            this.floor_vector.unproject( this.camera );
            this.raycaster  = new THREE.Raycaster( this.camera.position, this.floor_vector.sub( this.camera.position ).normalize() );
            this.intersects = this.raycaster.intersectObject( this.floor );

            // Toggle rotation bool for meshes that we clicked
            if( this.intersects.length > 0 )
            {
                var x = this.intersects[ 0 ].point.x,
                    z = this.intersects[ 0 ].point.z;

                // Update physic target (convert to mouse theoric position)
                this.physics.target.x = x * this.physics.options.scale;
                this.physics.target.y = z * this.physics.options.scale;

                // Update pointer
                this.pointer.set_position( x, z );
            }

            // Pointer
            if( this.mouse.down && this.physics.interactions )
                this.pointer.show();
            else
                this.pointer.hide();

            // Camera
            var new_position = {
                x : average_position.x,
                y : 0,
                z : average_position.z
            };
            this.camera.position.x += (new_position.x + this.distance - this.camera.position.x) * this.options.camera.ease;
            this.camera.position.y += (new_position.y + this.distance - this.camera.position.y) * this.options.camera.ease;
            this.camera.position.z += (new_position.z + this.distance - this.camera.position.z) * this.options.camera.ease;
            this.center.x += (average_position.x - this.center.x) * this.options.camera.ease;
            this.center.y += (average_position.y - this.center.y) * this.options.camera.ease;
            this.center.z += (average_position.z - this.center.z) * this.options.camera.ease;
            this.camera.lookAt( this.center );
        },

        /**
         * SET QUALITY
         */
        set_quality: function( quality )
        {
            // Quality
            if( quality === 'high' )
            {
                // Lights
                this.lights.set_multiplicator( 1.8 );

                // Shaders
                this.renderer.options.shaders = true;
            }

            // Low
            else
            {
                // Lights
                this.lights.set_multiplicator( 1.8 );

                // Shaders
                this.renderer.options.shaders = false;
            }
        },

        /**
         * RESTART
         */
        restart: function()
        {
            // Santa
            this.santa.set_position( 0, 0, 0 );
            this.santa.object.rotation.y = 0;
            this.santa.speed.y           = 0;
            this.santa.arrived           = false;
            this.santa.alive             = true;
            this.santa.start_running     = false;

            // Elves
            for( var i = 0; i < this.elves.length; i++ )
            {
                var elf  = this.elves[ i ];
                elf.speed.y  = 0;
                elf.alive    = true;
                elf.arrived  = false;
                Matter.Body.resetForcesAll( elf.physic );
                elf.set_rotation( 0 );
                elf.set_position(
                    Math.sin( i / this.options.elves.count * Math.PI * 2 ) * this.options.elves.distance,
                    0,
                    Math.cos( i / this.options.elves.count * Math.PI * 2 ) * this.options.elves.distance
                );
            }

            // Physic bounds
            this.physics.bounds = [];

            // Level
            this.level.init_new_level();
        }
    });
})();




