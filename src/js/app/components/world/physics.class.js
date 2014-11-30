(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.Physics = APP.CORE.Abstract.extend(
    {
        options :
        {
            debug : false,
            scale : 200,
            offset :
            {
                x : 8000,
                y : 8000
            },
            forces :
            {
                santa : 0.018,
                elves : 0.0005
            }
        },

        /**
         * SINGLETON
         */
        staticInstantiate:function()
        {
            if( APP.COMPONENTS.WORLD.Physics.prototype.instance === null )
                return null;
            else
                return APP.COMPONENTS.WORLD.Physics.prototype.instance;
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.interactions = false;
            this.ticker       = new APP.TOOLS.Ticker();
            this.target       = { x : 0 , y : 0 };
            this.wind         = { x : 0 , y : 0 };

            APP.COMPONENTS.WORLD.Physics.prototype.instance = this;
        },

        /**
         * START
         */
        start: function()
        {
            var that = this;

            // Engine
            this.engine = Matter.Engine.create(document.body, {
                world  : { gravity : { x : 0, y : 0 }, bounds : { min : { x : - 16000, y : - 16000 }, max : { x : 16000, y : 16000 } } },
                render : { options : { wireframes : true }, hasBounds : true, bounds : { min : { x : - 16000, y : - 16000 }, max : { x : 16000, y : 16000 } } }
            });
            this.engine.render.canvas.className = 'physics-canvas';
            if(!this.options.debug)
                this.engine.render.canvas.classList.add( 'hidden' );

            // Elves
            this.elves_composite = Matter.Composite.create();
            Matter.World.addComposite( this.engine.world, this.elves_composite );

            // Santa
            this.santa_composite = Matter.Composite.create();
            Matter.World.addComposite( this.engine.world, this.santa_composite );

            // Blocks
            this.blocks_composite = Matter.Composite.create();
            Matter.World.addComposite( this.engine.world, this.blocks_composite );

            // Bounds
            this.bounds       = [];
            this.end_bounds   = null;
            this.start_bounds = null;

            // Init Debug (need a frame)
            window.requestAnimationFrame(function()
            {
                that.init_debug();
            });

            // Tick event
            Matter.Events.on( this.engine, 'tick', function(e)
            {
                that.frame();
                that.ticker.tick();
            });

            // Run
            Matter.Engine.run( this.engine );
        },

        /**
         * INIT DEBUG
         */
        init_debug: function()
        {
            var that = this;

            this.debug = {};
            this.debug.instance = new APP.COMPONENTS.Debug();

            this.debug.physics_debug  = this.debug.instance.gui.physics.add( this.options, 'debug' ).name( 'debug' );
            this.debug.santa_force    = this.debug.instance.gui.physics.add( this.options.forces, 'santa', 0, 0.05 ).step( 0.0001 ).name( 'santa force' );
            this.debug.elves_force    = this.debug.instance.gui.physics.add( this.options.forces, 'elves', 0, 0.005 ).step( 0.00001 ).name( 'elves force' );
            this.debug.santa_friction = this.debug.instance.gui.physics.add( this.santa_composite.bodies[ 0 ], 'frictionAir', 0, 0.5 ).step( 0.001 ).name( 'santa friction' );
            this.debug.elves_friction = this.debug.instance.gui.physics.add( this.elves_composite.bodies[ 0 ], 'frictionAir', 0, 0.5 ).step( 0.001 ).name( 'elves friction' );

            this.debug.physics_debug.onChange( function( value )
            {
                if( value )
                    that.engine.render.canvas.classList.remove('hidden');
                else
                    that.engine.render.canvas.classList.add('hidden');
            } );

            this.debug.elves_friction.onChange( function( value )
            {
                for( var i = 0; i < that.elves_composite.bodies.length; i++ )
                {
                    var elf = that.elves_composite.bodies[ i ];
                    elf.frictionAir = value;
                }
            } );
        },

        /**
         * EXPLOSION
         */
        explosion: function( x, y, min_distance, multiplicator )
        {
            var bodies = [],
                i      = 0;

            bodies.push( this.santa_composite.bodies[ 0 ] );
            for( i = 0; i < this.elves_composite.bodies.length; i++ )
                bodies.push( this.elves_composite.bodies[ i ] );

            // Each body
            for( i = 0; i < bodies.length; i++ )
            {
                var body     = bodies[ i ],
                    distance = Matter.Vector.magnitude( { x : body.position.x - x, y : body.position.y - y } );

                // Close enough
                if( distance < min_distance )
                {
                    var force = Matter.Vector.mult( { x : body.position.x - x, y : body.position.y - y }, multiplicator );

                    // Stronger for santa
                    if( i === 0 )
                    {
                        force.x *= 30;
                        force.y *= 30;
                    }

                    Matter.Body.applyForce( body, { x : body.position.x, y : body.position.y }, force );
                }
            }
        },

        /**
         * FRAME
         */
        frame: function()
        {
            var i   = 0,
                len = 0;

            // Fall regions
            var bodies     = [],
                bodies_tmp = [],
                body       = null;

            for( i = 0, len = this.bounds.length; i < len ; i++ )
            {
                // Elves
                bodies_tmp = Matter.Query.region( this.elves_composite.bodies, this.bounds[ i ] );
                for( var j = 0; j < bodies_tmp.length ; j++ )
                {
                    body = bodies_tmp[ j ];
                    if( bodies.indexOf( body ) === -1 )
                        bodies.push( body );
                }

                // Santa
                bodies_tmp = Matter.Query.region( this.santa_composite.bodies, this.bounds[ i ] );
                if( bodies_tmp.length && bodies.indexOf( bodies_tmp[ 0 ] ) === -1 )
                    bodies.push( bodies_tmp[ 0 ] );
            }

            // Alives
            var elf = null;
            for( i = 0, len = this.elves_composite.bodies.length; i < len; i++ )
            {
                elf = this.elves_composite.bodies[ i ];

                if( bodies.indexOf( elf ) === -1 /*&& !elf.instance.arrived*/ )
                    elf.instance.alive = false;
            }

            if( this.santa && bodies.indexOf( this.santa ) === -1 )
                this.santa.instance.alive = false;

            // End region
            bodies = Matter.Query.region( this.elves_composite.bodies, this.end_bounds );

            bodies_tmp = Matter.Query.region( this.santa_composite.bodies, this.end_bounds );
            if( bodies_tmp.length && bodies.indexOf( bodies_tmp[ 0 ] ) === -1 )
                bodies.push( bodies_tmp[ 0 ] );

            // Arrived
            for( i = 0, len = bodies.length; i < len; i++ )
            {
                if( !bodies[ i ].instance.arrived && bodies[ i ].instance.alive )
                    bodies[ i ].instance.arrived = true;
            }

            // Start region
            bodies = Matter.Query.region( this.santa_composite.bodies, this.start_bounds );

            // Started
            if( this.santa && bodies.length === 0 )
                this.santa.instance.start_running = true;

            // Force
            var force = null;

            // Force on elves
            for( i = 0, len = this.elves_composite.bodies.length; i < len; i++ )
            {
                elf = this.elves_composite.bodies[ i ];
                var distance = Matter.Vector.magnitude( { x : elf.position.x - this.santa.position.x, y : elf.position.y - this.santa.position.y } );

                if( elf.instance.alive && distance > 120 )
                {
                    force = Matter.Vector.normalise( { x : this.santa.position.x - elf.position.x, y : this.santa.position.y - elf.position.y } );
                    force = Matter.Vector.mult( force, this.options.forces.elves );

                    Matter.Body.applyForce( elf, { x : elf.position.x, y : elf.position.y }, force );
                }
            }

            // Force on santa
            if( this.interactions )
            {
                if( this.santa.instance.alive )
                {
                    var mouse_vector = Matter.Vector.normalise( {
                        x : this.target.x - this.santa.position.x + this.options.offset.x,
                        y : this.target.y - this.santa.position.y + this.options.offset.y
                    } );
                    force = Matter.Vector.mult( mouse_vector, this.options.forces.santa );

                    Matter.Body.applyForce( this.santa, { x : 0, y : 0 }, force );

                    var vector = { x : Math.cos( this.santa.angle ), y : Math.sin( this.santa.angle ) },
                        angle  = Matter.Vector.angle( vector, mouse_vector );

                    this.santa.torque = angle / 10;
                }
            }

            // Wind force
            bodies = [];
            bodies.push( this.santa_composite.bodies[ 0 ] );
            for( i = 0; i < this.elves_composite.bodies.length; i++ )
                bodies.push( this.elves_composite.bodies[ i ] );

            // Each body
            for( i = 0; i < bodies.length; i++ )
            {
                body  = bodies[ i ];
                force = Matter.Vector.mult( { x : this.wind.x, y : this.wind.y }, 1 );

                // Stronger for santa
                if( i === 0 )
                {
                    force.x *= 10;
                    force.y *= 10;
                }

                if( body )
                    Matter.Body.applyForce( body, { x : body.position.x, y : body.position.y }, force );
            }
        }
    });
})();




