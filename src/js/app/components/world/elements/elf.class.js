(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.ELEMENTS.Elf = APP.COMPONENTS.WORLD.Element.extend(
    {
        options :
        {
            scale : 1.5,
            x     : 0,
            z     : 0
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.alive   = true;
            this.arrived = false;
        },

        /**
         * START
         */
        start: function()
        {
            this._super();

            // Body
            this.three_helper.create_box(0,0.02,0,0.06,0.01,0.06,0xffffff,this.object);
            this.three_helper.create_box(0,0.035,0,0.06,0.02,0.06,0x82ad00,this.object);

            // Legs
            this.three_helper.create_box( 0.018,0.015,0,0.02,0.01,0.02,0x82ad00,this.object);
            this.three_helper.create_box(-0.018,0.015,0,0.02,0.01,0.02,0x82ad00,this.object);
            this.three_helper.create_box( 0.018,0.005,0,0.02,0.01,0.02,0x000000,this.object);
            this.three_helper.create_box(-0.018,0.005,0,0.02,0.01,0.02,0x000000,this.object);

            // Head
            this.three_helper.create_box(0,0.055,0,0.06,0.02,0.06,0xffc1b3,this.object);
            this.three_helper.create_box(0,0.055,0.035,0.01,0.01,0.01,0xffc1b3,this.object);

            // Hat
            this.three_helper.create_box(0,0.067,0,0.062,0.005,0.062,0xffffff,this.object);
            this.three_helper.create_pyramid(0,0.089,0,0.038,0.04,0x82ad00,this.object);
            this.three_helper.create_box(0,0.109,0,0.012,0.012,0.012,0xffffff,this.object);

            // Physics
            this.physic = Matter.Bodies.rectangle(
                this.options.x * this.physics.options.scale + this.physics.options.offset.x,
                this.options.z * this.physics.options.scale + this.physics.options.offset.y,
                12 * this.options.scale,
                12 * this.options.scale,
                {
                    frictionAir : 0.03,
                    friction    : 0.001,
                    restitution : 0.8
                }
            );
            this.physic.instance = this;
            Matter.Composite.addBody( this.physics.elves_composite, this.physic );
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
        }
    });
})();




