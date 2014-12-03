(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.ELEMENTS.Santa = APP.COMPONENTS.WORLD.Element.extend(
    {
        options :
        {
            scale : 1,
            x     : 0,
            z     : 0
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.alive         = true;
            this.arrived       = false;
            this.start_running = false;
            this.start_running_previous = false;
        },

        /**
         * START
         */
        start: function()
        {
            this._super();

            // Body
            this.three_helper.create_box( 0, 0.11, 0, 0.14, 0.1, 0.08, 0xff0000, this.object );
            this.three_helper.create_box( 0, 0.05, 0, 0.15, 0.02, 0.09, 0xffffff, this.object );
            this.three_helper.create_box( 0, 0.11, 0.042, 0.02, 0.1, 0.002, 0xffffff, this.object );

            // Leg left
            this.three_helper.create_box( 0.035, 0.03, 0, 0.05, 0.02, 0.05, 0xff0000, this.object );
            this.three_helper.create_box( 0.035, 0.01, 0, 0.05, 0.02, 0.05, 0x000000, this.object );

            // Leg right
            this.three_helper.create_box( -0.035, 0.03, 0, 0.05, 0.02, 0.05, 0xff0000, this.object );
            this.three_helper.create_box( -0.035, 0.01, 0, 0.05, 0.02, 0.05, 0x000000, this.object );

            // Head
            this.three_helper.create_box( 0, 0.19, 0, 0.05, 0.05, 0.05, 0xffc1b3, this.object );

            // Beard
            this.three_helper.create_box( 0, 0.16, 0.035, 0.05, 0.04, 0.02, 0xffffff, this.object );

            // mustach
            this.three_helper.create_box( 0, 0.18, 0.028, 0.02, 0.01, 0.005, 0xffffff, this.object );

            // Hat
            this.three_helper.create_box( 0, 0.215, 0, 0.055, 0.005, 0.055, 0xffffff, this.object );
            this.three_helper.create_pyramid( 0, 0.235, 0, 0.038, 0.04, 0xff0000, this.object );
            this.three_helper.create_box( 0, 0.255, 0, 0.012, 0.012, 0.012, 0xffffff, this.object );

            // Physics
            this.physic = Matter.Bodies.rectangle(
                this.options.x * this.physics.options.scale + this.physics.options.offset.x,
                this.options.z * this.physics.options.scale + this.physics.options.offset.y,
                20 * this.options.scale,
                28 * this.options.scale,
                {
                    frictionAir : 0.08,
                    friction    : 0.0001,
                    restitution : 0.8,
                    density     : 0.01
                }
            );
            this.physic.instance = this;
            Matter.Composite.addBody( this.physics.santa_composite, this.physic );
            this.physics.santa = this.physic;
        },

        /**
         * FRAME
         */
        frame: function()
        {
            this._super();

            if( !this.alive )
            {
                this.speed.y += 0.0002;
                this.object.position.y -= this.speed.y * this.ticker.delta;
            }

            if( this.start_running && this.start_running !== this.start_running_previous )
            {
                this.trigger( 'startrunning' );
            }

            this.start_running_previous = this.start_running;
        }
    });
})();




