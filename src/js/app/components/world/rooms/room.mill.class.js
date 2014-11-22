(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.ROOMS.Mill = APP.COMPONENTS.WORLD.ROOMS.Room.extend(
    {
        options :
        {
            x      : 0,
            y      : 0,
            width  : 2.5,
            height : 2.5,
            scale  : 1,
            color  : 0xF0771A
        },

        /**
         * START
         */
        start: function()
        {
            this._super();

            this.block = new APP.COMPONENTS.WORLD.ELEMENTS.Block({
                scene  : this.scene,
                x      : this.options.x,
                z      : this.options.y,
                width  : 2.3,
                depth  : 0.2,
                height : 0.2,
                static : false
            } );
            this.block.start();

            this.torque = 3 + Math.random() * 3;

            Matter.Composite.addConstraint( this.physics.blocks_composite, Matter.Constraint.create( {
                pointA : { x : this.options.x * this.physics.options.scale + this.physics.options.offset.x, y : this.options.y * this.physics.options.scale + this.physics.options.offset.y },
                bodyB  : this.block.physic
            } ) );
        },

        /**
         * FRAME
         */
        frame: function()
        {
            this.block.physic.torque = this.torque;
        },

        /**
         * DESTORY
         */
        destroy: function()
        {
            this._super();

            Matter.Composite.remove( this.physics.blocks_composite, this.block.physic );

            this.scene.remove( this.block.object );
        }
    });
})();




