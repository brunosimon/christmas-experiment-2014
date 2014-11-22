(function()
{
    'use strict';

    APP.COMPONENTS.Sounds = APP.CORE.Event_Emitter.extend(
    {
        options :
        {

        },

        /**
         * SINGLETON
         */
        staticInstantiate:function()
        {
            if( APP.COMPONENTS.Sounds.prototype.instance === null )
                return null;
            else
                return APP.COMPONENTS.Sounds.prototype.instance;
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.browser = new APP.TOOLS.Browser();
            this.ticker  = new APP.TOOLS.Ticker();

            this.muted          = false;
            this.volume         = {};
            this.volume.target  = 0.8;
            this.volume.current = 0.8;

            APP.COMPONENTS.Sounds.prototype.instance = this;
        },

        /**
         * START
         */
        start: function()
        {
            var that = this;

            this.music = new Howl({
                urls     : [ 'src/sounds/8-bit-christmas-carol-of-the-bells-by-rush-coil.mp3', 'src/sounds/8-bit-christmas-carol-of-the-bells-by-rush-coil.ogg' ],
                autoplay : true
            });

            if( this.muted )
                that.mute();

            // Ticker
            this.ticker.on( 'tick' , function()
            {
                that.frame();
            } );
        },

        /**
         * MUTE
         */
        mute: function()
        {
            Howler.mute();
            this.music.pause();
        },

        /**
         * UNMUTE
         */
        unmute: function()
        {
            Howler.unmute();
            this.music.play();
        },

        /**
         * FRAME
         */
        frame: function()
        {
            this.volume.current += ( this.volume.target - this.volume.current ) * 0.1;
            Howler.volume( this.volume.current );
        }
    });
})();




