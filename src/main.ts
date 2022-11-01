import { Engine, Runner, Composite, Mouse, MouseConstraint, Body } from 'matter-js';
import Ragdoll from './ragdoll';
import Rectangle from './rectangle';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.94;

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

    ragdolls = [];
}

const drawCircle = (circle:Body) => {
    ctx.beginPath();
    ctx.arc(circle.position.x, circle.position.y, circle.circleRadius as number, 0, 2 * Math.PI);
    ctx.fillStyle = 'DodgerBlue';
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

const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    drawRect(ground, '#868686');
    drawRect(ceiling, '#868686');
    drawRect(leftWall, '#868686');
    drawRect(rightWall, '#868686');

    if(mouseConstraint.body) {
        drawMouseConstraint();
    }

    requestAnimationFrame(animate);
}

animate();
