(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.Level = APP.CORE.Event_Emitter.extend(
    {
        options :
        {
            rooms :
            {
                count : 16,
                size  : 2.5,
                types : [
                    'room',
                    'marshmallow',
                    'mill',
                    'mills',
                    'explosives'
                ],
                colors :
                {
                    default : 0xF0771A,
                    start   : 0xFFAC44,
                    end     : 0xc7eb51,
                }
            },
            debug :
            {
                available : false,
                rooms :
                {
                    size   : 20,
                    style  : '#ff0000',
                    offset :
                    {
                        x : 200,
                        y : 200
                    }
                }
            }
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super(options);

            this.ticker       = new APP.TOOLS.Ticker();
            this.three_helper = new APP.TOOLS.THREE_Helper();
            this.scene        = this.options.scene;
        },

        /**
         * START
         */
        start: function()
        {
            var that = this;

            this.init_new_level();

            this.object = new THREE.Object3D();
            this.scene.add( this.object );

            // Init Debug
            this.init_debug();

            // Ticker
            this.ticker.on( 'tick' , function()
            {
                that.frame();
            } );
        },

        /**
         * INIT DEBUG
         */
        init_debug: function()
        {
            var that = this;

            this.debug = {};
            this.debug.instance = new APP.COMPONENTS.Debug();

            this.debug.lvl_debug           = this.debug.instance.gui.level.add( this.options.debug, 'available' ).name( 'debug' );
            this.debug.rooms_count         = this.debug.instance.gui.level.add( this.options.rooms, 'count', 1, 20 ).step( 1 ).name( 'rooms count' );
            this.debug.init_level          = this.debug.instance.gui.level.add( this, 'init_new_level' ).name( 'new level' );
            this.debug.rooms_color_default = this.debug.instance.gui.level.addColor( this.options.rooms.colors, 'default' ).name( 'room color default' );
            this.debug.rooms_color_end     = this.debug.instance.gui.level.addColor( this.options.rooms.colors, 'end' ).name( 'room color end' );
            this.debug.rooms_color_start   = this.debug.instance.gui.level.addColor( this.options.rooms.colors, 'start' ).name( 'room color start' );

            function update_rooms_colors()
            {
                var room = null,
                    mesh = null;

                // Each room
                for( var i = 0, len = that.rooms.length; i < len; i++ )
                {
                    room = that.rooms[ i ];
                    mesh = room.object.children[ 0 ];

                    if( room instanceof APP.COMPONENTS.WORLD.ROOMS.Start)
                        mesh.material.color = new THREE.Color( that.options.rooms.colors.start );
                    else if( room instanceof APP.COMPONENTS.WORLD.ROOMS.End)
                        mesh.material.color = new THREE.Color( that.options.rooms.colors.end );
                    else
                        mesh.material.color = new THREE.Color( that.options.rooms.colors.default );
                }
            }

            // Events
            this.debug.lvl_debug.onChange( function( value )
            {
                if( value )
                    that.canvas.classList.remove( 'hidden' );
                else
                    that.canvas.classList.add( 'hidden' );
            } );

            this.debug.rooms_color_default.onChange( function( value )
            {
                update_rooms_colors();
            } );

            this.debug.rooms_color_end.onChange( function( value )
            {
                update_rooms_colors();
            } );

            this.debug.rooms_color_start.onChange( function( value )
            {
                update_rooms_colors();
            } );
        },

        /**
         * INIT NEW LEVEL
         */
        init_new_level: function()
        {
            this.init_canvas();
            this.init_rooms();
            this.init_snow();
        },

        /**
         * INIT SNOW
         */
        init_snow: function()
        {
            if( this.snow )
                this.snow.destroy();

            var bounds = {
                min :
                {
                    x : this.sizes.min.x - this.options.rooms.size,
                    y : 0.1,
                    z : this.sizes.min.z - this.options.rooms.size
                },
                max :
                {
                    x : this.sizes.max.x - this.sizes.min.x + this.options.rooms.size * 2,
                    y : 4,
                    z : this.sizes.max.z - this.sizes.min.z + this.options.rooms.size * 2
                }
            };

            this.snow = new APP.COMPONENTS.WORLD.Snow( {
                scene : this.scene,
                count : Math.round( Math.sqrt( Math.pow( bounds.max.x, 2 ) + Math.pow( bounds.max.z, 2 ) ) * 500 ),
                volume_corner : bounds.min,
                volume_size   : bounds.max
            } );
            this.snow.start();
        },

        /**
         * INIT CANVAS
         */
        init_canvas: function()
        {
            // First time
            if( !this.canvas )
            {
                this.canvas  = document.createElement( 'canvas' );
                this.context = this.canvas.getContext( '2d' );

                this.canvas.width  = 400;
                this.canvas.height = 400;
                this.canvas.classList.add( 'level-canvas' );

                this.context.fillStyle = this.options.debug.rooms.style;

                if( !this.options.debug.available )
                    this.canvas.classList.add('hidden');

                document.body.appendChild( this.canvas );
            }

            // Destroy
            else
            {
                this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
            }
        },

        /**
         * INIT ROOMS
         */
        init_rooms: function()
        {
            var i     = 0,
                sides = [ 'top', 'right', 'bottom', 'left' ];

            // Destroy
            if( this.rooms )
            {
                for( i = 0; i < this.rooms.length; i++ )
                {
                    this.rooms[ i ].destroy();
                }
            }

            // Create
            this.rooms_coordinates = [];
            this.rooms             = [];

            // Sizes
            this.sizes = {
                min : { x : 0, z : 0 },
                max : { x : 0, z : 0 }
            };

            // Create coordinates
            i = 0;
            while( i < this.options.rooms.count )
            {
                // First
                if( i === 0 )
                {
                    this.add_room_coordinates( 0, 0 );
                }

                else
                {
                    var last  = this.rooms_coordinates[ this.rooms_coordinates.length - 1 ],
                        found = false,
                        j     = 3;

                    // Shuffle sides
                    sides = shuffle(sides);

                    // Try each side
                    while( !found && j >= 0 )
                    {
                        switch(sides[ j ])
                        {
                            case 'top':

                                if( this.is_room_available( last.x, last.y - 1, last ) )
                                {
                                    found = true;
                                    this.add_room_coordinates( last.x, last.y - 1 );
                                }

                                break;

                            case 'right':

                                if( this.is_room_available( last.x + 1, last.y, last ) )
                                {
                                    found = true;
                                    this.add_room_coordinates( last.x + 1, last.y );
                                }

                                break;

                            case 'bottom':

                                if( this.is_room_available( last.x, last.y + 1, last ) )
                                {
                                    found = true;
                                    this.add_room_coordinates( last.x, last.y + 1 );
                                }

                                break;

                            case 'left':

                                if( this.is_room_available( last.x - 1, last.y, last ) )
                                {
                                    found = true;
                                    this.add_room_coordinates( last.x - 1, last.y );
                                }

                                break;

                        }

                        j--;
                    }
                }

                i++;
            }

            // Create rooms
            for( i = 0; i < this.rooms_coordinates.length; i++ )
            {
                var coordinates = this.rooms_coordinates[ i ],
                    type        = 'room';

                // Start
                if( i === 0 )
                    type = 'start';

                // End
                else if( i === this.rooms_coordinates.length - 1 )
                    type = 'end';

                // Random
                else
                {
                    var random = Math.floor( Math.random() * this.options.rooms.types.length);
                    type = this.options.rooms.types[ random ];
                }

                this.add_room( coordinates, type );

                // Sizes
                if( coordinates.x < this.sizes.min.x )
                    this.sizes.min.x = coordinates.x;
                else if( coordinates.x > this.sizes.max.x )
                    this.sizes.max.x = coordinates.x;
                if( coordinates.y < this.sizes.min.z )
                    this.sizes.min.z = coordinates.y;
                else if( coordinates.y > this.sizes.max.z )
                    this.sizes.max.z = coordinates.y;
            }

            this.sizes.min.x = this.sizes.min.x * this.options.rooms.size - this.options.rooms.size / 2;
            this.sizes.max.x = this.sizes.max.x * this.options.rooms.size + this.options.rooms.size / 2;
            this.sizes.min.z = this.sizes.min.z * this.options.rooms.size - this.options.rooms.size / 2;
            this.sizes.max.z = this.sizes.max.z * this.options.rooms.size + this.options.rooms.size / 2;

            this.trigger('new-level');
        },

        /**
         * ADD ROOM
         */
        add_room: function( coordinates, type )
        {
            var color = this.options.rooms.colors[ type ] || this.options.rooms.colors.default,
                room  = new APP.COMPONENTS.WORLD.ROOMS[ type.capitalize() ]( {
                    scene  : this.scene,
                    x      : coordinates.x * this.options.rooms.size,
                    y      : coordinates.y * this.options.rooms.size,
                    width  : this.options.rooms.size,
                    height : this.options.rooms.size,
                    color  : color
                } );
            room.start();

            this.rooms.push(room);
        },

        /**
         * IS ROOM AVAILABLE
         */
        is_room_available: function( x, y, ignore )
        {
            var available = true,
                i         = 0,
                room      = null;

            // Test if already taken
            for( i = 0; i < this.rooms_coordinates.length; i++ )
            {
                room = this.rooms_coordinates[ i ];

                if( room.x === x && room.y === y )
                {
                    available = false;
                }
            }

            // Test if far enough (not from the ignore one)
            for( i = 0; i < this.rooms_coordinates.length - 1; i++ )
            {
                room = this.rooms_coordinates[ i ];

                if( room.x !== ignore.x || room.y !== ignore.y )
                {
                    if(
                        Math.abs( room.x - x ) <= 1 && room.y === y ||
                        Math.abs( room.y - y ) <= 1 && room.x === x
                    )
                        available = false;
                }
            }

            return available;
        },

        /**
         * ADD ROOM COORDINATES
         */
        add_room_coordinates: function( x, y )
        {
            this.rooms_coordinates.push({
                x : x,
                y : y
            });

            var size   = this.options.debug.rooms.size,
                offset = this.options.debug.rooms.offset;
            this.context.fillRect( x * size + offset.x, y * size + offset.y, size, size);
        },

        /**
         * FRAME
         */
        frame: function()
        {

        }
    });
})();




