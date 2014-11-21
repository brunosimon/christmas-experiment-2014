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

            this.scene = this.options.scene;
        },

        /**
         * START
         */
        start: function()
        {
            this.create(0.5,0.5,0.5,0xffffff,0.2,this.scene);
            this.create(-0.5,0.5,0.5,0xffffff,0.6,this.scene);
            this.create(0.5,-0.5,0.5,0xffffff,0.2,this.scene);
            this.create(-0.5,-0.5,0.5,0xffffff,0.2,this.scene);
            this.create(0.5,0.5,-0.5,0xffffff,0.1,this.scene);
            this.create(-0.5,0.5,-0.5,0xffffff,0.1,this.scene);
            this.create(0.5,-0.5,-0.5,0xffffff,0.1,this.scene);
            this.create(-0.5,-0.5,-0.5,0xffffff,0.1,this.scene);
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
        }
    });
})();




