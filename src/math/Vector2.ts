// author: Jos Feenstra
// inspiration from Three.js
// note: recycle the class as much as possble, building a new class is expensive,
// especially in javascript

export class Vector2
{
    x: number;
    y: number;
    constructor(x : number, y : number)
    {
        this.x = x;
        this.y = y;
    }

	// --- factories & other statics

    static fromArray(a: Array<number>) : Vector2 {
        return new Vector2(a[0], a[1]);
    }

	static fromLerp( v1:Vector2, v2:Vector2, alpha:number ) : Vector2 
	{
		return new Vector2(
			v1.x + ( v2.x - v1.x ) * alpha,
			v1.y + ( v2.y - v1.y ) * alpha
		);
	}

    static fromRandom() : Vector2
    {
        return new Vector2(
		    Math.random(),
		    Math.random()
        )
	}

    static fromRandomAngle() : Vector2
    {
		let alpha = Math.random() * Math.PI * 2;
		
        return new Vector2(
			Math.cos(alpha),
			Math.sin(alpha)
        )
	}

	static from2Pt(from: Vector2, to: Vector2) : Vector2
	{
		return new Vector2(
			from.x - to.x,
			from.y - to.y
		)
	}

	static fromCopy(other: Vector2) : Vector2
	{
		return this.zero().copy(other);	
	}

	static zero() { return new Vector2(0, 0); }


	static NaN() { return new Vector2(NaN, NaN); }

	static fromCircumcenter(a: Vector2, b: Vector2, c: Vector2) : Vector2
    {
        const asum = a.squareSum();
        const bsum = b.squareSum();
        const csum = c.squareSum();

        // sort of cross product
        let d = 2 * (a.x * (b.y - c.y) +
                     b.x * (c.y - a.y) + 
                     c.x * (a.y - b.y));

        // if this triangle has no circumcenter? 
        if (d < 0.000001)
			return Vector2.NaN(); 

		let x = (asum * (b.y - c.y) + 
				 bsum * (c.y - a.y) + 
				 csum * (a.y - b.y)) / d;
		let y = (asum * (c.x - b.x) + 
				 bsum * (a.x - c.x) + 
				 csum * (b.x - a.x)) / d;

        return new Vector2(x,y);
    }

	static getSign(a:Vector2, b:Vector2 , c:Vector2) : number
	{
		// test half plane relationship
		// <0 : point on first half
		// 0  : points collinear
		// >0 : point on second half 
		return (a.x - c.x) * (b.y - c.y) - 
		       (b.x - c.x) * (a.y - c.y);
	}

	// --- basics

	set(x:number, y:number) : Vector2
	{
		this.x = x;
		this.y = y;
		return this 		
	}

	roughlyEquals(v: Vector2, tol:number) : boolean
	{
		return (Math.abs(this.x - v.x) < tol && 
				Math.abs(this.y - v.y) < tol)
	}

	equals(v:Vector2) : boolean
	{
		return ( ( v.x === this.x ) && ( v.y === this.y ) );
	}

    toString() : string
    {
        return `Vector3(${this.x}, ${this.y})`;
    }

    clone() : Vector2
    {
        return new Vector2(this.x, this.y);
    }

    copy(v: Vector2) : Vector2
    {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

	// --- math

    add(v: Vector2) : Vector2
    {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

	addn(arg0: number, arg1: number): Vector2 {
		this.x += arg0;
		this.y += arg1;
		return this;
    }

    sub(v: Vector2) : Vector2
    {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }


    mul(v: Vector2) : Vector2
    {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    scale(v: number) : Vector2
    {
        this.x *= v;
        this.y *= v;
        return this;
    }

    div(v: Vector2) : Vector2
    {
        this.x /= v.x;
        this.y /= v.y;
        return this;
    }

    divscale(v: number) : Vector2
    {
        this.x /= v;
        this.y /= v;
        return this;
    }

    min(other: Vector2) : Vector2 
    {
		this.x = Math.min( this.x, other.x );
		this.y = Math.min( this.y, other.y );
		return this;
	}

	max(other: Vector2) : Vector2 
	{
		this.x = Math.max( this.x, other.x );
		this.y = Math.max( this.y, other.y );
		return this;
	}

	clamp(min: Vector2, max: Vector2) : Vector2 
	{
		// assumes min < max, componentwise
		this.x = Math.max(min.x, Math.min(max.x, this.x));
		this.y = Math.max(min.y, Math.min(max.y, this.y));
		return this;
	}

	clampScalar(minVal:number, maxVal:number) : Vector2 
	{
		this.x = Math.max( minVal, Math.min(maxVal, this.x));
		this.y = Math.max( minVal, Math.min(maxVal, this.y));
		return this;
	}

	clampLength(min:number, max:number) : Vector2
	{
		const length = this.length();
		return this.divscale( length || 1 ).scale( Math.max(min, Math.min(max, length)));
	}

	floor() : Vector2 
	{
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}

	ceil() : Vector2 
	{
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	}

	round() : Vector2 
	{
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	}

	roundToZero() : Vector2 
	{
		this.x = (this.x < 0) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = (this.y < 0) ? Math.ceil( this.y ) : Math.floor( this.y );
		return this;
	}

	negate() : Vector2 
	{
		this.x = - this.x;
		this.y = - this.y;
		return this;
	}

	dot( v:Vector2 ) : number 
	{
		return this.x * v.x + this.y * v.y;
	}

	cross( v:Vector2 ) : number
	{
		return this.x * v.y - this.y * v.x; // ????
	}

	squareSum() : number
	{
		return this.x * this.x + this.y * this.y;
	}

	length() : number
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	manhat() : number
	{
		return Math.abs( this.x ) + Math.abs( this.y );
	}

	normalize() : Vector2
	{
		return this.divscale( this.length() || 1 );
	}

	angle() : number
	{
		// computes the angle in radians with respect to the positive x-axis
		const angle = Math.atan2( - this.y, - this.x ) + Math.PI;
		return angle;

	}

	disTo(v: Vector2) : number
	{
		return Math.sqrt(this.disToSquared(v));
	}

	disToSquared(v: Vector2) : number
	{
		const dx = this.x - v.x, 
			  dy = this.y - v.y;
		return dx * dx + dy * dy;
	}

	disToManhat(v: Vector2) : number
	{
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
	}

	setLength(length: number) : Vector2
	{
		return this.normalize().scale(length);
	}

	lerp(other: Vector2, alpha:number) : Vector2
	{
		this.x += ( other.x - this.x ) * alpha;
		this.y += ( other.y - this.y ) * alpha;
		return this;
	}
}