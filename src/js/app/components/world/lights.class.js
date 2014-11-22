(function()
{
    'use strict';

    APP.COMPONENTS.WORLD.Lights = APP.CORE.Abstract.extend(
    {
        options :
        {

        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.scene         = this.options.scene;
            this.multiplicator = 1;
        },

        /**
         * START
         */
        start: function()
        {
            this.items = [];
            this.items.push( this.create(0.5,0.5,0.5,0xffffff,0.2,this.scene) );
            this.items.push( this.create(-0.5,0.5,0.5,0xffffff,0.6,this.scene) );
            this.items.push( this.create(0.5,-0.5,0.5,0xffffff,0.2,this.scene) );
            this.items.push( this.create(-0.5,-0.5,0.5,0xffffff,0.2,this.scene) );
            this.items.push( this.create(0.5,0.5,-0.5,0xffffff,0.1,this.scene) );
            this.items.push( this.create(-0.5,0.5,-0.5,0xffffff,0.1,this.scene) );
            this.items.push( this.create(0.5,-0.5,-0.5,0xffffff,0.1,this.scene) );
            this.items.push( this.create(-0.5,-0.5,-0.5,0xffffff,0.1,this.scene) );

            // Init Debug
            this.init_debug();
        },

        /**
         * INIT DEBUG
         */
        init_debug: function()
        {
            var that = this;

            this.debug = {};
            this.debug.instance = new APP.COMPONENTS.Debug();

            this.debug.multiplicator = this.debug.instance.gui.lights.add( this, 'multiplicator', 0.1, 3 ).step( 0.01 ).name( 'Multiplicator' );

            this.debug.multiplicator.onChange( function( value )
            {
                that.set_multiplicator( value );
            } );
        },

        /**
         * CREATE
         */
        create: function( x, y, z, color, strength, destination )
        {
            var directional_light = new THREE.DirectionalLight( color, strength );
            directional_light.position.set( x, y, z );
            destination.add( directional_light );

            return directional_light;
        },

        /**
         * SET MULTIPLICATOR
         */
        set_multiplicator: function( value )
        {
            var light = null;

            // Lights
            for( var i = 0, len = this.items.length; i < len; i++ )
            {
                light = this.items[ i ];

                if( typeof light.intensity_origin === 'undefined' )
                    light.intensity_origin = light.intensity;

                light.intensity = light.intensity_origin * value;
            }

            this.multiplicator = value;
        },
    });
})();




