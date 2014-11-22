(function()
{
    'use strict';

    APP.COMPONENTS.UI = APP.CORE.Event_Emitter.extend(
    {
        options :
        {
            blur : false
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
            this.sounds  = new APP.COMPONENTS.Sounds();

            this.$.canvas       = document.querySelector( 'canvas#three-canvas' );
            this.$.main         = document.querySelector( '.ui' );
            this.$.title        = this.$.main.querySelector( 'h1' );
            this.$.instructions = this.$.main.querySelector( '.instructions' );
            this.$.play         = this.$.main.querySelector( '.play' );
            this.$.replay       = this.$.main.querySelector( '.replay' );
            this.$.loose        = this.$.main.querySelector( '.loose' );

            this.$.live       = {};
            this.$.live.time  = this.$.main.querySelector( '.time-live' );
            this.$.live.elves = this.$.main.querySelector( '.elves-live' );

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
                that.trigger( 'play' );

                return false;
            };

            this.$.replay.onclick = function()
            {
                that.trigger( 'replay' );

                return false;
            };

            this.$.tweaks.sound.onclick = function()
            {
                that.$.tweaks.sound.classList.toggle( 'active' );

                // Deactivate
                if( that.$.tweaks.sound.classList.contains( 'active' ))
                    that.sounds.unmute();

                // Activate
                else
                    that.sounds.mute();

                return false;
            };

            this.$.tweaks.quality.onclick = function()
            {
                that.$.tweaks.quality.classList.toggle( 'active' );

                // Activate
                if( that.$.tweaks.quality.classList.contains( 'active' ))
                    that.trigger( 'quality', [ 'high' ] );

                // Deactivate
                else
                    that.trigger( 'quality', [ 'low' ] );

                return false;
            };

            this.$.credits.trigger.onclick = function()
            {
                that.show( that.$.credits.main );

                return false;
            };

            this.$.credits.close.onclick = function()
            {
                that.hide( that.$.credits.main );

                return false;
            };


            if (that.sounds.muted)
            {
                that.$.tweaks.sound.classList.remove( 'active' );
            }
        },

        /**
         * SHOW
         */
        show: function( element, time )
        {
            if( element.style.opacity === '1' && element.style.display === 'block' )
                return false;

            time = time || 0.3;
            time *= 1000;

            element.classList.remove( 'animated' );
            element.style.display = 'block';
            element.style.opacity = 0;

            window.requestAnimationFrame( function()
            {
                element.classList.add( 'animated' );
                element.style.opacity = 1;
            } );
        },

        /**
         * HIDE
         */
        hide: function( element, time )
        {
            if( element.style.opacity === '0' || element.style.display === 'none' )
                return false;

            if(typeof time === 'undefined')
                time = 0.3;
            time *= 1000;

            element.classList.remove( 'animated' );
            element.style.display = 'block';
            element.style.opacity = 1;

            window.requestAnimationFrame( function()
            {
                // Animated
                if( time )
                {
                    element.classList.add( 'animated' );
                    element.style.opacity = 0;

                    window.setTimeout( function()
                    {
                        element.style.display = 'none';
                    }, time );
                }

                // No animation
                else
                {
                    element.style.opacity = 0;
                    element.style.display = 'none';

                    window.requestAnimationFrame( function()
                    {
                        element.classList.add( 'animated' );
                    } );
                }
            } );
        },

        /**
         * SET COMMENT
         */
        set_comment: function( time, elves )
        {
            var that    = this,
                message = '';

            time *= 0.001;

            // Fast
            if( time < 0.9 )
            {
                if( elves < 0.5 )
                    message = 'Don\'t forget the elves';
                else if( elves < 0.8 )
                    message = 'Good !';
                else
                    message = 'Christmas has found a new hero';
            }

            // Pretty fast
            else if( time < 1.2 )
            {
                if( elves < 0.5 )
                    message = 'And the elves ?';
                else
                    message = 'Pretty fast !';
            }

            // Not so fast
            else if( time < 1.6 )
            {
                if( elves < 0.5 )
                    message = 'And the elves ?';
                else
                    message = 'Not bad';
            }

            // Too slow
            else if( time < 2 )
            {
                if( elves < 0.8 )
                    message = 'Too slow';
                else
                    message = 'So cautious';
            }

            // Felt asleep
            else if( time < 3 )
            {
                if( elves < 0.8 )
                    message = 'Sorry I felt asleep';
                else
                    message = 'Slow elves savior';
            }

            // Felt asleep
            else
            {
                message = 'You\'re gone to be late for christmas';
            }

            // Many dead elves
            if( elves === 0 )
                message = 'Did you forget something ?';

            // All elves are dead
            else if( elves <= 0.2 )
                message = 'Elves killer';

            // Cheating
            if( time < 0.1 )
            {
                message = 'You silly...';
            }

            // Cheating
            else if( time < 0.5 )
            {
                message = 'Cheater !';
            }

            this.$.scores.comment.innerHTML = '"' + message + '"';
            this.$.scores.comment.classList.remove( 'animated' );
            this.$.scores.comment.classList.add( 'big' );

            window.requestAnimationFrame( function()
            {
                that.$.scores.comment.classList.add( 'animated' );
                that.$.scores.comment.classList.remove( 'big' );
            } );
        },

        /**
         * SET STATE
         */
        set_state: function( state )
        {
            switch( state )
            {
                case 'intro':

                    this.hide( this.$.replay, 0 );
                    this.hide( this.$.credits.main, 0 );
                    this.hide( this.$.scores.main, 0 );
                    this.hide( this.$.loose, 0 );

                    this.show( this.$.instructions );
                    this.show( this.$.play );
                    this.show( this.$.title );

                    this.sounds.volume.target = 0.8;

                    if( this.options.blur )
                        this.$.canvas.style.webkitFilter = 'blur(20px)';

                    break;

                case 'playing':

                    this.hide( this.$.scores.main );
                    this.hide( this.$.instructions );
                    this.hide( this.$.play );
                    this.hide( this.$.title );
                    this.hide( this.$.loose );
                    this.hide( this.$.credits.main );

                    this.show( this.$.replay );
                    this.show( this.$.live.time );
                    this.show( this.$.live.elves );

                    this.sounds.volume.target = 1;

                    if( this.options.blur )
                        this.$.canvas.style.webkitFilter = 'blur(0px)';

                    break;

                case 'loose':

                    this.hide( this.$.replay );
                    this.hide( this.$.credits.main );
                    this.hide( this.$.live.time );
                    this.hide( this.$.live.elves );

                    this.show( this.$.loose );
                    this.show( this.$.play );

                    this.$.play.innerHTML        = 'Try again';
                    this.$.play.style.width      = '240px';
                    this.$.play.style.marginLeft = '-120px';

                    this.sounds.volume.target = 0.3;

                    if( this.options.blur )
                        this.$.canvas.style.webkitFilter = 'blur(20px)';

                    break;

                case 'win':

                    this.hide( this.$.replay );
                    this.hide( this.$.live.time );
                    this.hide( this.$.live.elves );

                    this.show( this.$.scores.main );
                    this.show( this.$.play );

                    this.$.play.innerHTML        = 'Try again';
                    this.$.play.style.width      = '240px';
                    this.$.play.style.marginLeft = '-120px';

                    this.sounds.volume.target = 0.3;

                    if( this.options.blur )
                        this.$.canvas.style.webkitFilter = 'blur(20px)';

                    break;
            }
        }
    });
})();




