interface ParticleOptions {
    maxSize: number;
    maxVelocity: number;
    radiusDecay: number;
}

class Particle {
    private _x: number;
    private _y: number;
    private _color: string;
    private _radius: number;
    private _xVelocity: number;
    private _yVelocity: number;
    private _radiusDecay: number;

    constructor(x: number, y: number, color: string = 'white', options?: Partial<ParticleOptions>) {
        // defaults for options
        let maxSize = options?.maxSize || 50;
        let maxVelocity = options?.maxVelocity || 15;
        let radiusDecay = options?.radiusDecay || 3;

        this._x = x;
        this._y = y;
        this._color = color;
        this._radius = Math.random() * maxSize;
        this._xVelocity = Math.random() * maxVelocity * (Math.random() < 0.5 ? -1: 1);
        this._yVelocity = Math.random() * maxVelocity * (Math.random() < 0.5 ? -1: 1);
        this._radiusDecay = radiusDecay;
    }

    public update() {
        if(this._radius >= 0.2) {
            this._radius -= this._radiusDecay;
            this._x += this._xVelocity;
            this._y += this._yVelocity;
        }
    }

    public get x() {
        return this._x;
    }

    public get y() {
        return this._y;
    }

    public get color() {
        return this._color;
    }

    public get radius() {
        return this._radius;
    }
}

export default Particle;
