(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.ELEMENTS.Block = APP.COMPONENTS.WORLD.Element.extend(
    {
        options :
        {
            scale  : 1,
            x      : 0,
            z      : 0,
            width  : 1,
            height : 0.4,
            depth  : 1,
            static : true
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );
        },

        /**
         * START
         */
        start: function()
        {
            this._super();

            this.three_helper.create_box( 0, this.options.height / 2, 0, this.options.width, this.options.height, this.options.depth, 0xffffff, this.object );

            // Physics
            this.physic = Matter.Bodies.rectangle(
                this.options.x * this.physics.options.scale + this.physics.options.offset.x,
                this.options.z * this.physics.options.scale + this.physics.options.offset.y,
                this.options.width * 200,
                this.options.depth * 200,
                {
                    frictionAir : 0.05,
                    friction    : 0.001,
                    restitution : 0.4,
                    isStatic    : this.options.static
                }
            );
            Matter.Composite.addBody( this.physics.blocks_composite, this.physic );
        }
    });
})();




