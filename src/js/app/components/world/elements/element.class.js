(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.Element = APP.CORE.Abstract.extend(
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

            this.three_helper = new APP.TOOLS.THREE_Helper();
            this.ticker       = new APP.TOOLS.Ticker();
            this.scene        = this.options.scene;
            this.physics      = new APP.COMPONENTS.WORLD.Physics();
        },

        /**
         * START
         */
        start: function()
        {
            var that = this;

            this.object = new THREE.Object3D();
            this.object.position.set( 0, 0, 0 );
            this.object.scale.set( this.options.scale, this.options.scale, this.options.scale );

            this.speed   = {};
            this.speed.y = 0;

            this.scene.add( this.object );

            this.ticker.on( 'tick', function()
            {
                that.frame();
            });
        },

        /**
         * SET POSITION
         */
        set_position: function( x , y, z )
        {
            this.object.position.y = y;

            Matter.Body.translate(
                this.physic,
                {
                    x : - this.physic.position.x + x * this.physics.options.scale + this.physics.options.offset.x,
                    y : - this.physic.position.y + z * this.physics.options.scale + this.physics.options.offset.y
                }
            );
        },

        /**
         * SET ROTATION
         */
        set_rotation: function( y )
        {
            this.object.rotation.y = y;

            Matter.Body.rotate( this.physic, -this.physic.angle + y );
        },

        /**
         * FRAME
         */
        frame: function()
        {
            this.object.position.x = ( this.physic.position.x - this.physics.options.offset.x ) / this.physics.options.scale;
            this.object.position.z = ( this.physic.position.y - this.physics.options.offset.y ) / this.physics.options.scale;

            this.object.rotation.y = - this.physic.angle;
        }
    });
})();




