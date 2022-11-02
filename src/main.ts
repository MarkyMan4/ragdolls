import { Engine, Runner, Composite, Mouse, MouseConstraint, Body, Events, Constraint, Bodies } from 'matter-js';
import Ragdoll from './ragdoll';
import Rectangle from './rectangle';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.94;

let tool = 'grab';
let balls: Body[] = [];
let launcher:Constraint;
let isLaunching = false;
let isAiming = false; // only draw constraint while aiming

let engine = Engine.create({gravity: {x: 0, y: 1}});
let runner = Runner.create();

let ragdolls = [new Ragdoll(canvas.width / 2, canvas.height / 2)];
let ground = new Rectangle(canvas.width / 2, canvas.height + 1000, canvas.width + 1000, 2020, {isStatic: true});
let ceiling = new Rectangle(canvas.width / 2, -1000, canvas.width + 1000, 2020, {isStatic: true});
let leftWall = new Rectangle(-1000, canvas.height / 2, 2020, canvas.height + 1000, {isStatic: true});
let rightWall = new Rectangle(canvas.width + 1000, canvas.height / 2, 2020, canvas.height + 1000, {isStatic: true});

let mouse = Mouse.create(canvas);
let mouseConstraint = MouseConstraint.create(engine, {mouse: mouse, constraint: {stiffness: 0.007}});

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
    })

    balls.forEach(ball => {
        Composite.remove(engine.world, ball);
    })

    ragdolls = [];
    balls = [];
}

export const updateTool = () => {
    let selectElement = document.getElementById('tool-select') as HTMLSelectElement;
    tool = selectElement.value;

    if(tool === 'grab') {
        mouseConstraint.constraint.stiffness = 0.007;
    }
    else if(tool === 'ball') {
        mouseConstraint.constraint.stiffness = 1;
    }
}

export const updateMouseStrength = () => {
    let mouseStrengthInp = document.getElementById('mouse-strength-input') as HTMLInputElement;
    mouseConstraint.constraint.stiffness = parseFloat(mouseStrengthInp.value);
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

Events.on(engine, 'afterUpdate', (_) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRagdolls();
    drawBalls();
    drawRect(ground, '#868686');
    drawRect(ceiling, '#868686');
    drawRect(leftWall, '#868686');
    drawRect(rightWall, '#868686');

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
