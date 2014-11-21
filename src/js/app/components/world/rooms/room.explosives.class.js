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
            floor  :
            {
                color : 0xF0771A
            }
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            // Materials
            this.fill_material = this.three_helper.get( 'material-explosive-fill' );
            if( !this.fill_material )
            {
                this.fill_material = this.three_helper.set( 'material-explosive-fill', new THREE.MeshLambertMaterial( { color : 0xff0000, shading : THREE.FlatShading } ) );
                this.fill_material.transparent = true;
                this.fill_material.opacity     = 1;
            }

            this.wireframe_material = this.three_helper.get( 'material-explosive-wireframe' );
            if( !this.wireframe_material )
            {
                this.wireframe_material = this.three_helper.set( 'material-explosive-wireframe', new THREE.LineBasicMaterial( { color : 0xffffff, linewidth : 2 } ) );
                this.wireframe_material.transparent = true;
                this.wireframe_material.opacity     = 1;
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
                dummy = count * 10;

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
                    var item = this.create_box( x, z );
                    this.scene.add( item );
                    this.items.push( item );

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
            var object             = new THREE.Object3D(),
                geometry           = null,
                wireframe_geometry = null,
                mesh               = null,
                line               = null,
                size               = 0.1;

            object.position.x = x;
            object.position.y = 0.001;
            object.position.z = z;

            // Cube base full
            geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1, 1, 1, 1 );
            mesh     = new THREE.Mesh( geometry, this.fill_material );
            mesh.position.y = 0.05;
            object.add( mesh );

            // // Cube wireframe
            // geometry = new THREE.Geometry();
            // geometry.vertices.push(
            //     new THREE.Vector3( 0,    0, 0),
            //     new THREE.Vector3( size, 0, 0),
            //     new THREE.Vector3( size, 0, size),
            //     new THREE.Vector3( 0,    0, size),
            //     new THREE.Vector3( 0,    0, 0)
            // );
            // line = new THREE.Line( geometry, this.wireframe_material );
            // line.position.x = - 0.05;
            // line.position.z = - 0.05;
            // object.add( line );

            // geometry = new THREE.Geometry();
            // geometry.vertices.push(
            //     new THREE.Vector3( 0,    size, 0),
            //     new THREE.Vector3( size, size, 0),
            //     new THREE.Vector3( size, size, size),
            //     new THREE.Vector3( 0,    size, size),
            //     new THREE.Vector3( 0,    size, 0)
            // );
            // line = new THREE.Line( geometry, this.wireframe_material );
            // line.position.x = - 0.05;
            // line.position.y = - 0.001;
            // line.position.z = - 0.05;
            // object.add( line );

            // geometry = new THREE.Geometry();
            // geometry.vertices.push(
            //     new THREE.Vector3( 0, 0,    0),
            //     new THREE.Vector3( 0, size, 0)
            // );
            // line = new THREE.Line( geometry, this.wireframe_material );
            // line.position.x = - 0.05;
            // line.position.z = - 0.05;
            // object.add( line );

            // geometry = new THREE.Geometry();
            // geometry.vertices.push(
            //     new THREE.Vector3( size, 0,    0),
            //     new THREE.Vector3( size, size, 0)
            // );
            // line = new THREE.Line( geometry, this.wireframe_material );
            // line.position.x = - 0.05;
            // line.position.z = - 0.05;
            // object.add( line );

            // geometry = new THREE.Geometry();
            // geometry.vertices.push(
            //     new THREE.Vector3( size, 0,    size),
            //     new THREE.Vector3( size, size, size)
            // );
            // line = new THREE.Line( geometry, this.wireframe_material );
            // line.position.x = - 0.05;
            // line.position.z = - 0.05;
            // object.add( line );

            // geometry = new THREE.Geometry();
            // geometry.vertices.push(
            //     new THREE.Vector3( 0, 0,    size),
            //     new THREE.Vector3( 0, size, size)
            // );
            // line = new THREE.Line( geometry, this.wireframe_material );
            // line.position.x = - 0.05;
            // line.position.z = - 0.05;
            // object.add( line );

            return object;
        },

        /**
         * FRAME
         */
        frame: function()
        {

            var explosions = [],
                bodies     = [],
                len_1      = 0,
                len_2      = 0,
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
                var explosion = explosions[ i ];

                // Create forces
                this.physics.explosion(
                    explosion.position.x * this.physics.options.scale + this.physics.options.offset.x,
                    explosion.position.z * this.physics.options.scale + this.physics.options.offset.y,
                    0.7 * this.physics.options.scale,
                    0.00010
                );

                // Remove object
                this.scene.remove( explosion );
                this.items.splice( this.items.indexOf( explosion ), 1);
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




