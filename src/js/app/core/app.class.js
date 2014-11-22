(function()
{
    'use strict';

    APP.CORE.App = APP.CORE.Abstract.extend(
    {
        options:
        {

        },

        /**
         * INIT
         */
        init: function( options )
        {
            this._super( options );

            this.page     = null;
            this.browser  = new APP.TOOLS.Browser();
            this.mouse    = new APP.TOOLS.Mouse();
            this.keyboard = new APP.TOOLS.Keyboard();
            this.css      = new APP.TOOLS.Css();
            this.ticker   = new APP.TOOLS.Ticker();
            this.debug    = new APP.COMPONENTS.Debug();
            this.world    = new APP.COMPONENTS.WORLD.World();
            this.sounds   = new APP.COMPONENTS.Sounds();
            this.ui       = new APP.COMPONENTS.UI();
            this.stats        = {
                elves :
                {
                    total   : this.world.options.elves.count,
                    alive   : this.world.options.elves.count,
                    dead    : 0,
                    arrived : 0,
                    left    : this.world.options.elves.count
                },
                time :
                {
                    start          : + ( new Date() ),
                    spent          : 0,
                    spent_formated : '0s'
                },
                game :
                {
                    over  : false,
                    state : 'playing'
                }
            };
        },

        /**
         * START
         */
        start: function()
        {
            var that = this;

            this.browser.start();
            this.world.start();
            this.debug.start();
            this.sounds.start();
            this.ui.start();
            this.ui.set_state( 'intro' );

            this.ticker.on( 'tick', function()
            {
                that.frame();
            });

            this.ui.on( 'play', function()
            {
                that.restart();
            } );

            this.ui.on( 'replay', function()
            {
                that.restart();
            } );

            this.ui.on( 'quality', function( value )
            {
                that.world.set_quality( value );
            } );

            // Init Debug
            this.init_debug();
        },

        /**
         * INIT DEBUG
         */
        init_debug: function()
        {
            var that  = this,
                debug = {};

            debug.instance = new APP.COMPONENTS.Debug();
            debug.restart  = this.debug.instance.gui.game.add( app, 'restart' ).name( 'restart' );
        },

        /**
         * FRAME
         */
        frame: function()
        {
            // Stats
            var alive   = 0,
                arrived = 0,
                elf     = null;

            for( var i = 0, len = this.world.elves.length; i < len; i++ )
            {
                elf = this.world.elves[ i ];

                if( elf.alive )
                    alive += 1;

                if( elf.arrived )
                    arrived += 1;
            }

            this.stats.elves.alive   = alive;
            this.stats.elves.dead    = this.stats.elves.total - alive;
            this.stats.elves.arrived = arrived;
            this.stats.elves.left    = this.stats.elves.total - this.stats.elves.dead - this.stats.elves.arrived;

            this.stats.time.spent = + ( new Date() ) - this.stats.time.start;
            this.stats.time.spent_formated = this.get_formated_time(this.stats.time.spent);

            // UI
            this.ui.$.live.time.innerHTML  = this.stats.time.spent_formated;
            this.ui.$.live.elves.innerHTML = this.stats.elves.alive + '/' + this.world.options.elves.count;

            // Arrived (santa arrived AND all elves arrived OR dead)
            if( this.world.santa.arrived && this.stats.elves.left <= 0 && !this.stats.game.over )
                this.win();

            // Loose
            if( !this.world.santa.alive && !this.stats.game.over )
                this.loose();
        },

        /**
         * GET FORMATED TIME
         */
        get_formated_time: function( time )
        {
            var seconds = Math.floor( time / 1000 ),
                minutes = Math.floor( seconds / 60 );

            seconds -= 60 * minutes;

            seconds = ('' + seconds).length < 2 ? '0' + seconds : seconds;
            minutes = ('' + minutes).length < 2 ? '0' + minutes : minutes;

            return minutes + ':' + seconds;
        },

        /**
         * RESTART
         */
        restart: function()
        {
            // Stats
            this.stats.game.state = 'playing';
            this.stats.game.over  = false;
            this.stats.time.start          = + ( new Date() );
            this.stats.time.spent          = 0;
            this.stats.time.spent_formated = '0s';

            // Ui
            this.ui.set_state( 'playing' );

            this.world.restart();
        },

        /**
         * LOOSE
         */
        loose: function()
        {
            var that = this;

            // Stats
            this.stats.game.over  = true;
            this.stats.game.state = 'win';

            // UI
            window.setTimeout( function()
            {
                that.ui.set_state( 'loose' );
            }, 2000);
        },

        /**
         * WIN
         */
        win: function()
        {
            var that = this;

            // Stats
            this.stats.game.over  = true;
            this.stats.game.state = 'win';

            // UI
            this.ui.$.scores.time.innerHTML  = this.stats.time.spent_formated;
            this.ui.$.scores.elves.innerHTML = this.stats.elves.arrived + '/' + this.world.options.elves.count;

            this.ui.set_state( 'win' );
            this.ui.set_comment( this.stats.time.spent / ( this.world.level.options.rooms.count - 2 ), this.stats.elves.arrived / this.world.options.elves.count );
        }
    });
})();
