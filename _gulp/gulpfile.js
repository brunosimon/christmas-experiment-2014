var gulp        = require('gulp'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    watch       = require('gulp-watch'),
    minify      = require('gulp-minify-css');

var paths =
    {
        js : '../src/js/'
    };

var files = {
    js : [
        paths.js + 'libs/dat.gui.min.js',
        paths.js + 'libs/rStats.js',
        paths.js + 'libs/jquery-2.1.1.min.js',
        paths.js + 'libs/class.js',
        paths.js + 'libs/matter-0.8.0.min.js',
        paths.js + 'libs/howler.min.js',
        paths.js + 'libs/three-js/three.min.js',
        paths.js + 'libs/three-js/shaders/AdditiveBlendingShader.js',
        paths.js + 'libs/three-js/shaders/ConvolutionShader.js',
        paths.js + 'libs/three-js/shaders/CopyShader.js',
        paths.js + 'libs/three-js/shaders/VerticalBlurShader.js',
        paths.js + 'libs/three-js/shaders/HorizontalBlurShader.js',
        paths.js + 'libs/three-js/shaders/VerticalTiltShiftShader.js',
        paths.js + 'libs/three-js/shaders/HorizontalTiltShiftShader.js',
        paths.js + 'libs/three-js/shaders/BrightnessContrastShader.js',
        paths.js + 'libs/three-js/shaders/FXAAShader.js',
        paths.js + 'libs/three-js/shaders/ColorCorrectionShader.js',
        paths.js + 'libs/three-js/postprocessing/EffectComposer.js',
        paths.js + 'libs/three-js/postprocessing/BloomPass.js',
        paths.js + 'libs/three-js/postprocessing/RenderPass.js',
        paths.js + 'libs/three-js/postprocessing/ShaderPass.js',
        paths.js + 'libs/three-js/postprocessing/MaskPass.js',
        paths.js + 'app/app.js',
        paths.js + 'app/core/abstract.class.js',
        paths.js + 'app/core/event_emitter.class.js',
        paths.js + 'app/core/app.class.js',
        paths.js + 'app/components/debug.class.js',
        paths.js + 'app/components/ui.class.js',
        paths.js + 'app/components/sounds.class.js',
        paths.js + 'app/components/world/world.class.js',
        paths.js + 'app/components/world/renderer.class.js',
        paths.js + 'app/components/world/lights.class.js',
        paths.js + 'app/components/world/sky.class.js',
        paths.js + 'app/components/world/snow.class.js',
        paths.js + 'app/components/world/level.class.js',
        paths.js + 'app/components/world/physics.class.js',
        paths.js + 'app/components/world/pointer.class.js',
        paths.js + 'app/components/world/elements/element.class.js',
        paths.js + 'app/components/world/elements/block.class.js',
        paths.js + 'app/components/world/elements/santa.class.js',
        paths.js + 'app/components/world/elements/elf.class.js',
        paths.js + 'app/components/world/rooms/room.class.js',
        paths.js + 'app/components/world/rooms/room.start.class.js',
        paths.js + 'app/components/world/rooms/room.end.class.js',
        paths.js + 'app/components/world/rooms/room.mill.class.js',
        paths.js + 'app/components/world/rooms/room.mills.class.js',
        paths.js + 'app/components/world/rooms/room.explosives.class.js',
        paths.js + 'app/components/world/rooms/room.marshmallow.class.js',
        paths.js + 'app/components/world/rooms/room.empty.class.js',
        paths.js + 'app/tools/browser.class.js',
        paths.js + 'app/tools/css.class.js',
        paths.js + 'app/tools/images.class.js',
        paths.js + 'app/tools/three_helper.class.js',
        paths.js + 'app/tools/keyboard.class.js',
        paths.js + 'app/tools/mouse.class.js',
        paths.js + 'app/tools/ticker.class.js',
    ]
};

gulp.task('js',function()
{
    gulp.src(files.js)
        .pipe(concat("santa-workout.min.js"))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.js));
});

gulp.task("watch", function ()
{
    gulp.watch(files.js, ['js']);
});

gulp.task('default',['js']);
