import { Bodies, Body, Constraint, Composite } from "matter-js";

export default class Web {
    private _points: Body[][];
    private _canvas: HTMLCanvasElement;
    private _web: Composite;

    constructor(x: number, y: number, canvas: HTMLCanvasElement) {
        this._points = [];
        this._canvas = canvas;

        let across = 10;
        let down = 10;
        let spaceBetween = 50;

        // create the bodies
        let bodies: Body[] = [];

        for(let i = 0; i < down; i++) {
            let row: Body[] = [];

            for(let j = 0; j < across; j++) {
                let point = Bodies.circle((i * spaceBetween) + x, (j * spaceBetween) + y, 5, {density: 0.01});

                row.push(point);
                bodies.push(point);
            }

            this._points.push(row);
        }

        // add constraints to all adjacent bodies
        let webConstraints: Constraint[] = [];
        
        for(let i = 0; i < this._points.length; i++) {
            for(let j = 0; j < this._points[i].length; j++) {
                if(i < this._points.length - 1) {
                    webConstraints.push(Constraint.create({
                        bodyA: this._points[i][j], 
                        bodyB: this._points[i + 1][j],
                        length: 20,
                        stiffness: 0.05
                    }));
                }
                if(j < this._points[i].length - 1) {
                    webConstraints.push(Constraint.create({
                        bodyA: this._points[i][j], 
                        bodyB: this._points[i][j + 1],
                        length: 20,
                        stiffness: 0.05
                    }));
                }
            }
        }

        // pin web to the point clicked
        let topLeft = this._points[0][0];
        let topRight = this._points[0][this._points[0].length - 1];
        let bottomLeft = this._points[this._points.length - 1][0];
        let bottomRight = this._points[this._points.length - 1][this._points[this._points.length - 1].length - 1];
        
        // top left
        webConstraints.push(Constraint.create({
            bodyA: topLeft,
            pointB: {x: topLeft.position.x, y: topLeft.position.y},
            stiffness: 1,
            length: 0
        }));

        // top right
        webConstraints.push(Constraint.create({
            bodyA: topRight,
            pointB: {x: topRight.position.x, y: topRight.position.y},
            stiffness: 1,
            length: 0
        }));

        // bottom left
        webConstraints.push(Constraint.create({
            bodyA: bottomLeft,
            pointB: {x: bottomLeft.position.x, y: bottomLeft.position.y},
            stiffness: 1,
            length: 0
        }));

        // bottom right
        webConstraints.push(Constraint.create({
            bodyA: bottomRight,
            pointB: {x: bottomRight.position.x, y: bottomRight.position.y},
            stiffness: 1,
            length: 0
        }));

        this._web = Composite.create({
            bodies: bodies,
            constraints: webConstraints
        });
    }

    public draw() {
        let ctx = this._canvas.getContext('2d');

        this._web.constraints.forEach(c => {
            ctx.beginPath();

            if(c.bodyB) {
                ctx.moveTo(c.bodyA.position.x, c.bodyA.position.y);
                ctx.lineTo(c.bodyB.position.x, c.bodyB.position.y);
            }
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'white';
            ctx.stroke();
        })

        this._web.bodies.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.position.x, b.position.y, b.circleRadius, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
        })
    }

    public get web() {
        return this._web;
    }
}
