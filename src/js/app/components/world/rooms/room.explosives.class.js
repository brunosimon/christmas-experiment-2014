(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.ROOMS.Explosives = APP.COMPONENTS.WORLD.ROOMS.Room.extend(
    {
        options :
        {
            count  : 5,
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
        init: function( options )
        {
            this._super( options );

            this.ticler = new APP.TOOLS.Ticker();

            // Materials
            this.box_material = this.three_helper.get( 'material-explosive-box' );
            if( !this.box_material )
            {
                this.box_material = this.three_helper.set( 'material-explosive-box', new THREE.MeshLambertMaterial( { color : 0xff0000, shading : THREE.FlatShading } ) );
                this.box_material.transparent = true;
                this.box_material.opacity     = 1;
            }

            this.sphere_material = this.three_helper.get( 'material-explosive-sphere' );
            if( !this.sphere_material )
            {
                this.sphere_material = this.three_helper.set( 'material-explosive-sphere', new THREE.MeshLambertMaterial( { color : 0xffffff, shading : THREE.FlatShading } ) );
                this.sphere_material.transparent = true;
                this.sphere_material.opacity     = 0.6;
            }
        },

        /**
         * START
         */
        start: function()
        {
            this._super();

            this.items  = [];

            var count = this.options.count,
                dummy = count * 20;

            while( count > 0 && dummy > 0 )
            {
                // Random position
                var x = this.options.x + Math.random() * this.options.width * 0.8  - this.options.width * 0.8 / 2,
                    z = this.options.y + Math.random() * this.options.height * 0.8 - this.options.height * 0.8 / 2;

                // Test if far enough from other mills
                var far_enough = true;

                for( var i = 0; i < this.items.length; i++ )
                {
                    var other_item = this.items[ i ],
                        distance   = Math.sqrt( Math.pow( Math.abs( other_item.position.x - x ), 2 ) + Math.pow( Math.abs( other_item.position.z - z ), 2 ) );

                    if( distance < 0.1 )
                        far_enough = false;
                }

                if( far_enough )
                {
                    // Create explosive
                    var box    = this.create_box( x, z ),
                        sphere = this.create_sphere( 0, 0 );

                    box.add( sphere );
                    box.shock_wave = sphere;

                    box.state = 'pending';

                    this.scene.add( box );
                    this.items.push( box );

                    count--;
                }

                dummy--;
            }
        },

        /**
         * CREATE BOX
         */
        create_box: function( x, z )
        {
            // Variables
            var object   = new THREE.Object3D(),
                geometry = null,
                mesh     = null,
                line     = null,
                size     = 0.1;

            object.position.x = x;
            object.position.y = 0;
            object.position.z = z;

            // Cube base full
            geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1, 1, 1, 1 );
            mesh     = new THREE.Mesh( geometry, this.box_material );
            mesh.position.y = 0.05;
            object.add( mesh );

            return object;
        },

        /**
         * CREATE SPHERE
         */
        create_sphere: function( x, z )
        {
            // Variables
            var object   = new THREE.Object3D(),
                geometry = null,
                mesh     = null,
                line     = null,
                size     = 0.1;

            object.position.x = x;
            object.position.y = 0;
            object.position.z = z;

            geometry = new THREE.SphereGeometry( 0.01, 16, 16 );
            mesh     = new THREE.Mesh( geometry, this.sphere_material );
            object.add( mesh );

            return object;
        },

        /**
         * FRAME
         */
        frame: function()
        {
            var that       = this,
                explosions = [],
                bodies     = [],
                len_1      = 0,
                len_2      = 0,
                explosion  = null,
                i          = 0,
                j          = 0;

            bodies.push( this.physics.santa_composite.bodies[ 0 ] );

            for( i = 0, len_1 = this.physics.elves_composite.bodies.length; i < len_1; i++ )
                bodies.push( this.physics.elves_composite.bodies[ i ] );

            // Each elf
            for( i = 0, len_1 = bodies.length; i < len_1; i++ )
            {
                var object = bodies[ i ].instance.object;

                // Each explosive
                for( j = 0, len_2 = this.items.length; j < len_2; j++ )
                {
                    var explosive = this.items[ j ],
                        distance  = Math.sqrt( Math.pow( Math.abs( explosive.position.x - object.position.x ), 2 ) + Math.pow( Math.abs( explosive.position.z - object.position.z ), 2 ) );

                    // Close enough
                    if( distance < 0.15 && explosions.indexOf(explosive) === -1 )
                        explosions.push( explosive );

                }
            }

            // KABOOM
            for( i = 0, len_1 = explosions.length; i < len_1; i++ )
            {
                explosion = explosions[ i ];


                if( explosion.state === 'pending' )
                {
                    explosion.state = 'exploding';

                    // Create forces
                    this.physics.explosion(
                        explosion.position.x * this.physics.options.scale + this.physics.options.offset.x,
                        explosion.position.z * this.physics.options.scale + this.physics.options.offset.y,
                        0.7 * this.physics.options.scale,
                        0.00010
                    );
                }
            }

            // ANIMATION
            for( i = 0, len_1 = this.items.length; i < len_1; i++ )
            {
                explosion = this.items[ i ];

                if( explosion.state === 'exploding' )
                {
                    if( !explosion.time_spend )
                        explosion.time_spend = 0;
                    explosion.time_spend += this.ticker.delta;

                    explosion.shock_wave.scale.x += 0.5 * this.ticker.delta;
                    explosion.shock_wave.scale.y += 0.5 * this.ticker.delta;
                    explosion.shock_wave.scale.z += 0.5 * this.ticker.delta;

                    // Remove object
                    if( explosion.time_spend > 200)
                    {
                        that.scene.remove( explosion );
                        that.items.splice( i, 1 );

                        i--;
                        len_1 = this.items.length;
                    }
                }
            }
        },

        /**
         * DESTORY
         */
        destroy: function()
        {
            this._super();

            for( var i = 0, len = this.items.length; i < len; i++ )
            {
                var item = this.items[ i ];
                this.scene.remove( item );
            }

            this.items = [];
        }
    });
})();




