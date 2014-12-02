(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.ROOMS.Start = APP.COMPONENTS.WORLD.ROOMS.Room.extend(
    {
        options :
        {
            x      : 0,
            y      : 0,
            width  : 2.5,
            height : 2.5,
            scale  : 1,
            color  : 0xFFAC44
        },

        /**
         * START
         */
        start: function()
        {
            this._super();

            // End bounds
            var size   = this.options.width * this.physics.options.scale,
                x      = this.options.x * this.physics.options.scale + this.physics.options.offset.x,
                y      = this.options.y * this.physics.options.scale + this.physics.options.offset.y,
                bounds = [
                    { x : x - size / 2, y : y - size / 2 },
                    { x : x + size / 2, y : y - size / 2 },
                    { x : x + size / 2, y : y + size / 2 },
                    { x : x - size / 2, y : y + size / 2 }
                ];

            this.physics.start_bounds = Matter.Bounds.create( bounds );
        }
    });
})();




