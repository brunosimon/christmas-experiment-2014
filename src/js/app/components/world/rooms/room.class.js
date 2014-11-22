(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.ROOMS.Room = APP.CORE.Abstract.extend(
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
         * INIT
         */
        init: function(options)
        {
            this._super(options);

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
            this.scene.add( this.object );

            this.three_helper.create_box( this.options.x, -0.1, this.options.y, this.options.width, 0.2, this.options.height, this.options.color, this.object );

            // Bounds
            var size   = this.options.width * this.physics.options.scale,
                x      = this.options.x * this.physics.options.scale + this.physics.options.offset.x,
                y      = this.options.y * this.physics.options.scale + this.physics.options.offset.y,
                bounds = [
                    { x : x - size / 2, y : y - size / 2 },
                    { x : x + size / 2, y : y - size / 2 },
                    { x : x + size / 2, y : y + size / 2 },
                    { x : x - size / 2, y : y + size / 2 }
                ];
            this.physics.bounds.push( Matter.Bounds.create( bounds ) );

            // Ticker
            this.ticker.on( 'tick', function()
            {
                that.frame();
            } );
        },

        /**
         * FRAME
         */
        frame: function()
        {

        },

        /**
         * DESTORY
         */
        destroy: function()
        {
            this.scene.remove( this.object );
        }
    });
})();




