import { Bodies, Body } from 'matter-js';

class Rectangle {
    private _width:number;
    private _height:number;
    private _rect:Body;

    constructor(x:number, y:number, w:number, h:number, options:any={}) {
        this._width = w;
        this._height = h;
        this._rect = Bodies.rectangle(x, y, w, h, options);
    }

    public get width() {
        return this._width;
    }

    public get height() {
        return this._height;
    }

    public get rect() {
        return this._rect;
    }
}

export default Rectangle;
