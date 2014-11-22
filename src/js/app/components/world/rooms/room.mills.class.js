(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.ROOMS.Mills = APP.COMPONENTS.WORLD.ROOMS.Room.extend(
    {
        options :
        {
            count  : 3,
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

            this.blocks  = [];
            this.torques = [];

            var count = this.options.count,
                dummy = count * 10;

            while( count > 0 && dummy > 0 )
            {
                // Random position
                var x = this.options.x + Math.random() * this.options.width * 0.8  - this.options.width * 0.8 / 2,
                    z = this.options.y + Math.random() * this.options.height * 0.8 - this.options.height * 0.8 / 2;

                // Test if far enough from other mills
                var far_enough = true;

                for( var i = 0; i < this.blocks.length; i++ )
                {
                    var other_block = this.blocks[ i ],
                        distance    = Math.sqrt( Math.pow( Math.abs( other_block.options.x - x ), 2 ) + Math.pow( Math.abs( other_block.options.z - z ), 2 ) );

                    if( distance < 0.6 )
                        far_enough = false;
                }

                if( far_enough )
                {
                    // Create mill
                    var block = new APP.COMPONENTS.WORLD.ELEMENTS.Block({
                        scene  : this.scene,
                        x      : x,
                        z      : z,
                        width  : 0.6,
                        depth  : 0.1,
                        height : 0.2,
                        static : false
                    } );
                    this.blocks.push( block );
                    block.start();

                    // Create constraint
                    Matter.Composite.addConstraint( this.physics.blocks_composite, Matter.Constraint.create( {
                        pointA : { x : x * this.physics.options.scale + this.physics.options.offset.x, y : z * this.physics.options.scale + this.physics.options.offset.y },
                        bodyB  : block.physic
                    } ) );

                    // Create random torque
                    this.torques.push( ( 0.1 + Math.random() * 0.3 ) * ( Math.random() < 0.5 ? 1 : - 1) );

                    count--;
                }

                dummy--;
            }
        },

        /**
         * FRAME
         */
        frame: function()
        {
            for( var i = 0; i < this.options.count; i++ )
                this.blocks[ i ].physic.torque = this.torques[ i ];
        },

        /**
         * DESTORY
         */
        destroy: function()
        {
            this._super();

            for( var i = 0, len = this.blocks.length; i < len; i++ )
            {
                var block = this.blocks[ i ];
                Matter.Composite.remove( this.physics.blocks_composite, block.physic );
                this.scene.remove( block.object );
            }
        }
    });
})();




