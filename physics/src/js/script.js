/* OPTIONS */
var options = {

};

/* GUI */
var gui         = new dat.GUI(),
    controllers = {};

/* STATS */
var rS = new rStats({
    CSSPath : 'src/css/',
    values  :
    {
        raf :
        {
            caption : 'RAF (ms)',
            over    : 25,
            average : true
        },
        fps :
        {
            caption : 'Framerate (FPS)',
            below   : 50,
            average : true
        }
    }
});

// Matter.Common.getDistance = function(bodyA,bodyB)
// {
//     return Math.abs(Math.sqrt(Math.pow(bodyB.position.x-bodyA.position.x,2) + Math.pow(bodyB.position.y-bodyA.position.y,2)));
// };

// Matter.Common.getAngle = function(bodyA,bodyB)
// {
//     return Math.atan2(bodyB.position.x-bodyA.position.x,bodyB.position.y-bodyA.position.y);
// };

/* ENGINE */
var engine = Matter.Engine.create(document.body, {
    world :
    {
        gravity :
        {
            x : 0,
            y : 0
        }
    },
    render :
    {
        options :
        {
            // showAxes           : true,
            // showVelocity       : true,
            // showAngleIndicator : true,
            wireframes         : true
        }
    }
});

// /* MOUSE CONSTRAINT */
// var mouse_constraint = Matter.MouseConstraint.create(engine);
// Matter.World.add(engine.world, mouse_constraint);

// var body_options =
// {
//     frictionAir : 0.1,
//     friction    : 0.0001,
//     restitution : 0.8
// };

/* ELVES */
var elves_composite = Matter.Composite.create();

for(var i = 0; i < 30; i++)
{
    var x = 200 + Math.random() * 200,
        y = 200 + Math.random() * 200;

    Matter.Composite.addBody(elves_composite,Matter.Bodies.rectangle(x,y,20,20,{
        frictionAir : 0.01,
        friction    : 0.0001,
        restitution : 0.8
    }));
}
Matter.World.addComposite(engine.world,elves_composite);

/* SANTA */
var santa_composite = Matter.Composite.create();
Matter.Composite.addBody(santa_composite,Matter.Bodies.rectangle(500,100,20,40,{
    frictionAir : 0.1,
    friction    : 0.0001,
    restitution : 0.8,
    density     : 0.01
}));
Matter.World.addComposite(engine.world,santa_composite);
var santa = santa_composite.bodies[0];

// /* MOVING BLOCKS */
// var block_origin     = {x:700,y:300},
//     blocks_composite = Matter.Composite.create();

// Matter.Composite.addBody(blocks_composite,Matter.Bodies.rectangle(block_origin.x,block_origin.y,60,200,{
//     isStatic    : true,
//     // frictionAir : 0,
//     // friction    : 1,
//     // restitution : 3,
//     // density     : 0.0001
// }));
// Matter.World.addComposite(engine.world,blocks_composite);
// var block = blocks_composite.bodies[0];


// Mills
var mills_composite = Matter.Composite.create();

Matter.Composite.addBody(mills_composite,Matter.Bodies.rectangle(500,400,20,200,{
    frictionAir : 0.1,
    friction    : 0.0001,
    restitution : 0.8,
    density     : 0.1
}));
Matter.World.addComposite(engine.world,mills_composite);
var mill = mills_composite.bodies[0];

Matter.Composite.addConstraint(mills_composite,Matter.Constraint.create({
    pointA : { x: 500, y: 400 },
    bodyB  : mill
}));

// Region
// var bounds = Matter.Bounds.create([{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:0,y:100}]);
var bounds = Matter.Bounds.create([{x:0,y:0},{x:400,y:300},{x:800,y:0}]);
console.log(bounds);

/* WALLS */
var offset = 5;
Matter.World.add(engine.world, [
    Matter.Bodies.rectangle(400,- offset,800 + 2 * offset,50,{isStatic:true}),
    Matter.Bodies.rectangle(400,600 + offset,800 + 2 * offset,50,{isStatic:true}),
    Matter.Bodies.rectangle(800 + offset,300,50,600 + 2 * offset,{isStatic:true}),
    Matter.Bodies.rectangle(-offset,300,50, 600 + 2 * offset,{isStatic:true})
]);

/* MOUSE */
var mouse  = {};
mouse.x    = 0;
mouse.y    = 0;
mouse.down = false;

document.onmousedown = function(e)
{
    mouse.down = true;
};

document.onmouseup = function(e)
{
    mouse.down = false;
};

document.onmousemove = function(e)
{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
};

// /* FRAMES */
// var time         = +(new Date()),
//     time_new     = time,
//     apply_forces = true;

// window.setTimeout(function()
// {
//     apply_forces = true;
// },500);

// run the engine
Matter.Engine.run(engine);

var inertie = 0;

// Explosion
function explosion(x,y,min_distance)
{
    var bodies = elves_composite.bodies;

    for(var i = 0; i < bodies.length; i++)
    {
        var elf      = bodies[i],
            distance = Matter.Vector.magnitude({x:elf.position.x - x,y:elf.position.y - y});

        if(distance < min_distance)
        {
            force = Matter.Vector.mult({x:elf.position.x - x,y:elf.position.y - y},0.0001);
            Matter.Body.applyForce(elf,{x:0,y:0},force);
        }

    }
}

Matter.Events.on(engine,'tick',function(e)
{
    // Stats
    rS('raf').tick();
    rS('fps').frame();
    rS().update();

    // // Time
    // time_new     = +(new Date());
    // time_elapsed = time_new - time;
    // time         = time_new;
    //

    // inertie = Math.sin(e.timestamp / 100) * 10;
    // console.log(inertie);
    // Matter.Body.translate(block,{x:inertie,y:0});

    if(Math.random() < 0.01)
    {
        // explosion(400,300,120);
    }

    // Region
    var bodies = Matter.Query.region(elves_composite.bodies,bounds);

    // Mills
    mill.torque = 20;

    // Force
    var force = null;

    // Force on elves
    for(var i = 0, len = elves_composite.bodies.length; i < len; i++)
    {
        var elf      = elves_composite.bodies[i],
            distance = Matter.Vector.magnitude({x:elf.position.x-santa.position.x,y:elf.position.y-santa.position.y});

        if(distance > 120)
        {
            force = Matter.Vector.normalise({x:santa.position.x-elf.position.x,y:santa.position.y-elf.position.y});
            force = Matter.Vector.mult(force,0.0005);

            Matter.Body.applyForce(elf,{x:0,y:0},force);
        }
    }

    // Force on santa
    if(mouse.down)
    {
        var mouse_vector = Matter.Vector.normalise({x:mouse.x - santa.position.x,y:mouse.y - santa.position.y});
        force = Matter.Vector.mult(mouse_vector,0.02);

        Matter.Body.applyForce(santa,{x:0,y:0},force);

        var vector = {x:Math.cos(santa.angle),y:Math.sin(santa.angle)},
            angle  = Matter.Vector.angle(vector,mouse_vector);
        santa.torque = angle / 10;
    }

    // Update Matter
    // Matter.MouseConstraint.update(mouse_constraint,engine.world.bodies);
    // Matter.Engine.update(engine,time_elapsed);
    // Matter.Engine.render(engine);
});


