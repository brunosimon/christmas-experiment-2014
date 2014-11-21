(function()
{
    'use strict';

    APP.COMPONENTS.UI = APP.CORE.Abstract.extend(
    {
        options :
        {

        },

        /**
         * SINGLETON
         */
        staticInstantiate:function()
        {
            if( APP.COMPONENTS.UI.prototype.instance === null )
                return null;
            else
                return APP.COMPONENTS.UI.prototype.instance;
        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.browser = new APP.TOOLS.Browser();
            this.ticker  = new APP.TOOLS.Ticker();

            this.$.main         = document.querySelector( '.ui' );
            this.$.title        = this.$.main.querySelector( 'h1' );
            this.$.instructions = this.$.main.querySelector( '.instructions' );
            this.$.play         = this.$.main.querySelector( '.play' );
            this.$.replay       = this.$.main.querySelector( '.replay' );

            this.$.scores         = {};
            this.$.scores.main    = this.$.main.querySelector( '.scores' );
            this.$.scores.time    = this.$.scores.main.querySelector( '.time .value' );
            this.$.scores.elves   = this.$.scores.main.querySelector( '.elves .value' );
            this.$.scores.comment = this.$.scores.main.querySelector( '.comment' );

            this.$.tweaks         = {};
            this.$.tweaks.main    = this.$.main.querySelector( '.tweaks' );
            this.$.tweaks.sound   = this.$.tweaks.main.querySelector( '.sound' );
            this.$.tweaks.quality = this.$.tweaks.main.querySelector( '.quality' );

            this.$.credits         = {};
            this.$.credits.main    = this.$.main.querySelector( '.credits' );
            this.$.credits.close   = this.$.credits.main.querySelector( '.close' );
            this.$.credits.trigger = this.$.main.querySelector( '.credits-trigger' );

            APP.COMPONENTS.UI.prototype.instance = this;
        },

        /**
         * START
         */
        start: function()
        {
            var that = this;

            this.$.play.onclick = function()
            {
                console.log('play');
                return false;
            };

            this.$.replay.onclick = function()
            {
                console.log('replay');
                return false;
            };

            this.$.tweaks.sound.onclick = function()
            {
                console.log('sound toggle');
                return false;
            };

            this.$.tweaks.quality.onclick = function()
            {
                console.log('quality toggle');
                return false;
            };

            this.$.credits.trigger.onclick = function()
            {
                console.log('credits toggle');
                return false;
            };

            this.$.credits.close.onclick = function()
            {
                console.log('credits close');
                return false;
            };
        }
    });
})();




