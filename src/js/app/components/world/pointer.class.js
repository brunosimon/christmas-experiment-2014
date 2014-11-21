(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.Pointer = APP.CORE.Abstract.extend(
    {
        options :
        {
            offset    : 0.40,
            amplitude : 0.03
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.visible = false;
            this.opacity = 0;
            this.ticker  = new APP.TOOLS.Ticker();
            this.scene   = this.options.scene;
        },

        /**
         * START
         */
        start: function()
        {
            var that = this;

            this.object = new THREE.Object3D();
            this.object.rotation.x = Math.PI;

            // Materials
            this.fill_material = new THREE.MeshBasicMaterial( { color : 0x00ccff } );
            this.fill_material.transparent = true;
            this.fill_material.opacity     = 0;

            this.wireframe_material = new THREE.LineBasicMaterial({
                color: 0xa4edff,
                linewidth : 2
            });
            this.wireframe_material.transparent = true;
            this.wireframe_material.opacity     = 0;

            // Variables
            var geometry           = null,
                wireframe_geometry = null,
                mesh               = null,
                line               = null,
                size               = 0.1;

            // Cube base full
            geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1, 1, 1, 1 );
            mesh     = new THREE.Mesh( geometry, this.fill_material );
            mesh.position.y = 0.05;
            this.object.add( mesh );

            // Cube wireframe
            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3( 0,    0, 0),
                new THREE.Vector3( size, 0, 0),
                new THREE.Vector3( size, 0, size),
                new THREE.Vector3( 0,    0, size),
                new THREE.Vector3( 0,    0, 0)
            );
            line = new THREE.Line( geometry, this.wireframe_material );
            line.position.x = - 0.05;
            line.position.z = - 0.05;
            this.object.add( line );

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3( 0,    size, 0),
                new THREE.Vector3( size, size, 0),
                new THREE.Vector3( size, size, size),
                new THREE.Vector3( 0,    size, size),
                new THREE.Vector3( 0,    size, 0)
            );
            line = new THREE.Line( geometry, this.wireframe_material );
            line.position.x = - 0.05;
            line.position.y = - 0.001;
            line.position.z = - 0.05;
            this.object.add( line );

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3( 0, 0,    0),
                new THREE.Vector3( 0, size, 0)
            );
            line = new THREE.Line( geometry, this.wireframe_material );
            line.position.x = - 0.05;
            line.position.z = - 0.05;
            this.object.add( line );

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3( size, 0,    0),
                new THREE.Vector3( size, size, 0)
            );
            line = new THREE.Line( geometry, this.wireframe_material );
            line.position.x = - 0.05;
            line.position.z = - 0.05;
            this.object.add( line );

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3( size, 0,    size),
                new THREE.Vector3( size, size, size)
            );
            line = new THREE.Line( geometry, this.wireframe_material );
            line.position.x = - 0.05;
            line.position.z = - 0.05;
            this.object.add( line );

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3( 0, 0,    size),
                new THREE.Vector3( 0, size, size)
            );
            line = new THREE.Line( geometry, this.wireframe_material );
            line.position.x = - 0.05;
            line.position.z = - 0.05;
            this.object.add( line );

            // Pyramid full
            geometry = new THREE.BoxGeometry( 0.2, 0.3, 0.2, 1, 1, 1 );
            mesh     = new THREE.Mesh( geometry, this.fill_material );
            mesh.position.y = 0.25;
            this.object.add( mesh );

            geometry.vertices[ 0 ].x -= 0.1;
            geometry.vertices[ 1 ].x -= 0.1;
            geometry.vertices[ 4 ].x += 0.1;
            geometry.vertices[ 5 ].x += 0.1;
            geometry.vertices[ 0 ].z -= 0.1;
            geometry.vertices[ 1 ].z += 0.1;
            geometry.vertices[ 4 ].z += 0.1;
            geometry.vertices[ 5 ].z -= 0.1;

            this.scene.add( this.object );

            // Pyramid wireframe
            size = 0.2;
            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3( 0,    0.1, 0),
                new THREE.Vector3( size, 0.1, 0),
                new THREE.Vector3( size, 0.1, size),
                new THREE.Vector3( 0,    0.1, size),
                new THREE.Vector3( 0,    0.1, 0)
            );
            line = new THREE.Line( geometry, this.wireframe_material );
            line.position.x = - 0.1;
            line.position.z = - 0.1;
            this.object.add( line );

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3( 0,   0.1, 0),
                new THREE.Vector3( 0.1, 0.4, 0.1)
            );
            line = new THREE.Line( geometry, this.wireframe_material );
            line.position.x = - 0.1;
            line.position.z = - 0.1;
            this.object.add( line );

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3( size, 0.1, 0),
                new THREE.Vector3( 0.1,  0.4, 0.1)
            );
            line = new THREE.Line( geometry, this.wireframe_material );
            line.position.x = - 0.1;
            line.position.z = - 0.1;
            this.object.add( line );

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3( size, 0.1, size),
                new THREE.Vector3( 0.1,  0.4, 0.1)
            );
            line = new THREE.Line( geometry, this.wireframe_material );
            line.position.x = - 0.1;
            line.position.z = - 0.1;
            this.object.add( line );

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3( 0,   0.1, size),
                new THREE.Vector3( 0.1, 0.4, 0.1)
            );
            line = new THREE.Line( geometry, this.wireframe_material );
            line.position.x = - 0.1;
            line.position.z = - 0.1;
            this.object.add( line );

            // Ticker event
            this.ticker.on( 'tick', function()
            {
                that.frame();
            } );
        },

        /**
         * SET POSITION
         */
        set_position: function( x, z )
        {
            this.object.position.x = x;
            this.object.position.z = z;
        },

        /**
         * SHOW
         */
        show: function()
        {
            this.visible = true;
        },

        /**
         * HIDE
         */
        hide: function()
        {
            this.visible = false;
        },

        /**
         * FRAME
         */
        frame: function()
        {
            // Opacity
            if( this.visible && this.opacity < 1 )
                this.opacity += 0.01 * this.ticker.delta;

            if( !this.visible && this.opacity > 0 )
                this.opacity -= 0.01 * this.ticker.delta;

            this.opacity = this.opacity > 1 ? 1 : this.opacity < 0 ? 0 : this.opacity;

            this.fill_material.opacity      = this.opacity * 0.2;
            this.wireframe_material.opacity = this.opacity;

            // Position
            this.object.position.y = this.options.offset + Math.abs( Math.sin( this.ticker.elapsed_time / 200 ) ) * this.options.amplitude;
        }
    });
})();




