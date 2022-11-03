import { Engine, Runner, Composite, Mouse, MouseConstraint, Body, Events, Constraint, Bodies, Query } from 'matter-js';
import Ragdoll from './ragdoll';
import Rectangle from './rectangle';
import Particle from './particle';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.94;

let tool = 'grab';
let balls: Body[] = [];
let launcher:Constraint;
let isLaunching = false;
let isAiming = false; // only draw constraint while aiming
let defaultMouseStifness = 0.02;

let particles: Particle[] = [];
let blocks: Rectangle[] = [];
let grapples: Constraint[] = [];
let grappleBody: any = null;

let engine = Engine.create({gravity: {x: 0, y: 1}});
let runner = Runner.create();

let ragdolls = [new Ragdoll(canvas.width / 2, canvas.height / 2)];
let ground = new Rectangle(canvas.width / 2, canvas.height + 1000, canvas.width + 1000, 2020, {isStatic: true});
let ceiling = new Rectangle(canvas.width / 2, -1000, canvas.width + 1000, 2020, {isStatic: true});
let leftWall = new Rectangle(-1000, canvas.height / 2, 2020, canvas.height + 1000, {isStatic: true});
let rightWall = new Rectangle(canvas.width + 1000, canvas.height / 2, 2020, canvas.height + 1000, {isStatic: true});

let mouse = Mouse.create(canvas);
let mouseConstraint = MouseConstraint.create(engine, {mouse: mouse, constraint: {stiffness: defaultMouseStifness}});

Composite.add(engine.world, [
    ground.rect,
    ceiling.rect,
    leftWall.rect,
    rightWall.rect,
    mouseConstraint
]);

ragdolls.forEach(r => {
    Composite.add(engine.world, r.ragdoll);
})

Runner.run(runner, engine);


export const spawnRagdoll = () => {
    let ragdoll = new Ragdoll(Math.random() * canvas.width, Math.random() * canvas.height);
    ragdolls.push(ragdoll);
    Composite.add(engine.world, ragdoll.ragdoll);
}

export const reset = () => {
    ragdolls.forEach(ragdoll => {
        Composite.remove(engine.world, ragdoll.ragdoll);
    });

    ragdolls = [];

    clearObjects();
}

export const clearObjects = () => {
    balls.forEach(ball => {
        Composite.remove(engine.world, ball);
    });

    blocks.forEach(block => {
        Composite.remove(engine.world, block.rect);
    });

    grapples.forEach(grapple => {
        Composite.remove(engine.world, grapple);
    });

    balls = [];
    blocks = [];
    grapples = [];
}

export const updateTool = () => {
    let selectElement = document.getElementById('tool-select') as HTMLSelectElement;
    tool = selectElement.value;

    if(tool === 'grab') {
        mouseConstraint.constraint.stiffness = defaultMouseStifness;
    }
    else if(tool === 'ball') {
        mouseConstraint.constraint.stiffness = 1;
    }
}

const spawnExplosionParticles = (x: number, y: number) => {
    for(let i = 0; i < 100; i++) {
        let color = Math.random() < 0.5 ? 'red' : 'orange';
        particles.push(new Particle(x, y, color));
    }
}

Events.on(mouseConstraint, 'mousedown', (_) => {
    if(tool === 'ball') {
        let ball = Bodies.circle(mouse.position.x, mouse.position.y, 15, {restitution: 1});
        balls.push(ball);

        launcher = Constraint.create({
            pointA: {x: mouse.position.x, y: mouse.position.y},
            bodyB: ball,
            stiffness: 0.005
        });

        Composite.add(engine.world, [ball, launcher]);

        isAiming = true;
    }
    else if(tool === 'explode') {
        spawnExplosionParticles(mouse.position.x, mouse.position.y);

        let bodies: Body[] = [];

        ragdolls.forEach(ragdoll => {
            bodies.push(ragdoll.body.rect);
        });

        balls.forEach(ball => {
            bodies.push(ball);
        });

        let blastRadius = 200;

        for(let i = 0; i < 360; i += 5) {
            let x = blastRadius * Math.cos(i * Math.PI / 180);
            let y = blastRadius * Math.sin(i * Math.PI / 180);
            let collisions = Query.ray(bodies, {x: mouse.position.x, y: mouse.position.y}, {x: x + mouse.position.x, y: y + mouse.position.y});

            collisions.forEach(c => {
                Body.applyForce(c.bodyB, {x: c.bodyB.position.x, y: c.bodyB.position.y}, {x: x / 2000, y: y / 2000});
            });
        }
    }
    else if(tool === 'block') {
        let block = new Rectangle(mouse.position.x, mouse.position.y, 100, 100, {density: 1, friction: 1, frictionAir: 0});
        blocks.push(block);
        Composite.add(engine.world, block.rect);
    }
    else if(tool === 'grapple') {
        if(mouseConstraint.body) {
            if(!grappleBody) {
                grappleBody = mouseConstraint.body;
            }
            else {
                let grapple = Constraint.create({bodyA: grappleBody, bodyB: mouseConstraint.body, length: 50, stiffness: 0.01});
                grapples.push(grapple);
                Composite.add(engine.world, grapple);

                // reset the grapple body
                grappleBody = null;
            }
        }
    }
});

Events.on(mouseConstraint, 'mouseup', (_) => {
    if(tool === 'ball') {
        isLaunching = true;
    }
});

const drawCircle = (circle:Body, color:string='DodgerBlue') => {
    ctx.beginPath();
    ctx.arc(circle.position.x, circle.position.y, circle.circleRadius as number, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

const drawLine = (rect:Rectangle, color:string='DodgerBlue') => {
    let rectBody = rect.rect;

    ctx.beginPath();
    ctx.save();
    ctx.translate(rectBody.position.x, rectBody.position.y);
    ctx.rotate(rectBody.angle);
    ctx.moveTo(0, -rect.height / 2);
    ctx.lineTo(0, rect.height / 2);
    ctx.lineCap = 'round';
    ctx.lineWidth = rect.width;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
}

const drawRect = (rect:Rectangle, color:string='DodgerBlue', fill:boolean=true) => {
    let rectBody = rect.rect;

    ctx.beginPath();
    ctx.save();
    ctx.translate(rectBody.position.x, rectBody.position.y);
    ctx.rotate(rectBody.angle);
    ctx.rect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);

    if(fill) {
        ctx.fillStyle = color;
        ctx.fill();
    }
    else {
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    ctx.restore();
}

const drawMouseConstraint = () => {
    ctx.beginPath();
    ctx.moveTo(mouse.position.x, mouse.position.y);
    ctx.lineTo(mouseConstraint.body.position.x, mouseConstraint.body.position.y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.stroke();
}

const drawGrapples = () => {
    grapples.forEach(grapple => {
        ctx.beginPath();
        ctx.moveTo(grapple.bodyA.position.x, grapple.bodyA.position.y);
        ctx.lineTo(grapple.bodyB.position.x, grapple.bodyB.position.y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'white';
        ctx.stroke();
    });
}

const drawLauncher = () => {
    ctx.beginPath();
    ctx.moveTo(launcher.pointA.x, launcher.pointA.y);
    ctx.lineTo(launcher.bodyB.position.x, launcher.bodyB.position.y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(launcher.bodyB.position.x, launcher.bodyB.position.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
}

const drawRagdolls = () => {
    ragdolls.forEach(ragdoll => {
        drawCircle(ragdoll.head);
        drawLine(ragdoll.body);
        drawLine(ragdoll.leftLeg);
        drawLine(ragdoll.rightLeg);
        drawLine(ragdoll.leftArm);
        drawLine(ragdoll.rightArm);

        Body.applyForce(
            ragdoll.head, 
            {
                x: ragdoll.head.position.x, 
                y: ragdoll.head.position.y
            }, 
            {
                x: 0, 
                y: -0.002
            }
        );
    });
}

const drawBalls = () => {
    balls.forEach(ball => {
        drawCircle(ball, '#FF7850');
    });
}

const drawAndUpdateParticles = () => {
    particles.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.update();

        // if the particle size is less than 0.2, remove it
        if(p.radius < 0.2) {
            particles.splice(idx, 1);
        }
    })
}

const drawBlocks = () => {
    blocks.forEach(block => {
        drawRect(block, 'white');
    });
}

// turn this on to debug explosion
// const drawRays = () => {
//     let radius = 200;

//     for(let i = 0; i < 360; i += 5) {
//         let x = (radius * Math.cos(i * Math.PI / 180)) + (mouse.position.x);
//         let y = (radius * Math.sin(i * Math.PI / 180)) + (mouse.position.y);

//         ctx.beginPath();
//         ctx.moveTo(mouse.position.x, mouse.position.y);
//         ctx.lineTo(x, y);
//         ctx.strokeStyle = 'white';
//         ctx.lineWidth = 1;
//         ctx.stroke();
//     }
// }

Events.on(engine, 'afterUpdate', (_) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // drawRays();
    drawRagdolls();
    drawBalls();
    drawBlocks();
    drawGrapples();
    drawRect(ground, '#868686');
    drawRect(ceiling, '#868686');
    drawRect(leftWall, '#868686');
    drawRect(rightWall, '#868686');
    drawAndUpdateParticles();

    if(tool === 'grab') {
        if(mouseConstraint.body) {
            drawMouseConstraint();
        }
    }
    else if(tool === 'ball') {
        if(isAiming) {
            drawLauncher();
        }

        if(isLaunching && Math.abs(launcher.bodyB.position.x - launcher.pointA.x) < 20 && Math.abs(launcher.bodyB.position.y - launcher.pointA.y) < 20) {
            Composite.remove(engine.world, launcher);
            isLaunching = false;
            isAiming = false;
        }
    }
});
