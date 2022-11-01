import { Bodies, Body, Composite, Constraint } from "matter-js";
import Rectangle from "./rectangle";

class Ragdoll {
    private _head:Body;
    private _body:Rectangle;
    private _leftLeg:Rectangle;
    private _rightLeg:Rectangle;
    private _leftArm:Rectangle;
    private _rightArm:Rectangle;
    private _ragdoll:Composite;

    constructor(x:number, y:number) {
        this._head = Bodies.circle(x, y, 20, {density: 0.0005});
        this._body = new Rectangle(this._head.position.x, this._head.position.y + 5, 10, 60);
        this._leftLeg = new Rectangle(this._body.rect.position.x - 5, this._body.rect.position.y + (this._body.height / 2) + 5, 10, 50);
        this._rightLeg = new Rectangle(this._body.rect.position.x + 5, this._body.rect.position.y + (this._body.height / 2) + 5, 10, 50);
        this._leftArm = new Rectangle(this._body.rect.position.x - (this._body.width / 2) - 5, this._body.rect.position.y - (this._body.height / 5), 10, 50);
        this._rightArm = new Rectangle(this._body.rect.position.x + (this._body.width / 2) + 5, this._body.rect.position.y - (this._body.height / 5), 10, 50);

        let bodyConstraint = Constraint.create({
            bodyA: this._head,
            bodyB: this._body.rect,
            pointA: {x: 0, y: 10},
            pointB: {x: 0, y: -25},
            length: 15
        });

        let leftLegConstraint = Constraint.create({
            bodyA: this._body.rect,
            bodyB: this._leftLeg.rect,
            pointA: {x: -5, y: this._body.height / 2},
            pointB: {x: 0, y: -this._leftLeg.height / 2},
            length: 5
        });

        let rightLegConstraint = Constraint.create({
            bodyA: this._body.rect,
            bodyB: this._rightLeg.rect,
            pointA: {x: 5, y: this._body.height / 2},
            pointB: {x: 0, y: -this._rightLeg.height / 2},
            length: 5
        });

        let leftArmConstraint = Constraint.create({
            bodyA: this._body.rect,
            bodyB: this._leftArm.rect,
            pointA: {x: -this._body.width / 2, y: -this._body.height / 3},
            pointB: {x: 0, y: -this._leftArm.height / 2},
            length: 5
        });

        let rightArmConstraint = Constraint.create({
            bodyA: this._body.rect,
            bodyB: this._rightArm.rect,
            pointA: {x: this._body.width / 2, y: -this._body.height / 3},
            pointB: {x: 0, y: -this._rightArm.height / 2},
            length: 5
        });

        this._ragdoll = Composite.create({
            bodies: [
                this._head,
                this._body.rect,
                this._leftLeg.rect,
                this._rightLeg.rect,
                this._leftArm.rect,
                this._rightArm.rect
            ],
            constraints: [
                bodyConstraint,
                leftLegConstraint,
                rightLegConstraint,
                leftArmConstraint,
                rightArmConstraint
            ]
        });
    }

    public get head() {
        return this._head;
    }

    public get body() {
        return this._body;
    }

    public get leftLeg() {
        return this._leftLeg;
    }

    public get rightLeg() {
        return this._rightLeg;
    }

    public get leftArm() {
        return this._leftArm;
    }

    public get rightArm() {
        return this._rightArm;
    }

    public get ragdoll() {
        return this._ragdoll;
    }
}

export default Ragdoll;
