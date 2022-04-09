class Shape {
    constructor() {
    }
    static ctx = undefined
    draw() {

    }
}

class Line extends Shape {
    constructor(start, end) {
        super()
        this.start = start
        this.end = end
    }
    draw() {
        const ctx = Shape.ctx
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
    }
}

class Rect extends Shape {
    constructor(start, end) {
        super()
        this.start = start
        this.end = end
    }
    draw() {
        const ctx = Shape.ctx
        const x = this.start.x
        const y = this.start.y
        const height = this.end.y - y
        const width = this.end.x - x
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.rect(x, y, width, height);
        ctx.stroke();
    }
}

class Ellipse extends Shape {
    constructor(start, end) {
        super()
        this.start = start
        this.end = end
    }
    draw() {
        const ctx = Shape.ctx
        // 1. 确定 startx, 半径x
        // 2. 确定 start y 半径x
        // 注意处理 end 在 start 前面或上面的情况
        let x = this.start.x
        if (this.end.x < this.start.x) {
            x = this.end.x
        }
        const rx = Math.abs(this.end.x - this.start.x) / 2
        const cx = x + rx

        let y = this.start.y
        if (this.end.y < this.start.y) {
            y = this.end.y
        }
        const ry = Math.abs(this.end.y - this.start.y) / 2
        const cy = y + ry

        const rotation = 0
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, rotation, 0, 2 * Math.PI);
        ctx.stroke();
    }
}


class Polygon extends Shape {
    constructor(points) {
        super()
        const ps = [...points, points[0]]
        this.lines = []
        for (var i = 0; i < ps.length - 1; i++) {
            const p1 = ps[i]
            const p2 = ps[i + 1]
            const l = new Line(p1, p2)
            this.lines.push(l)
        }
    }
    draw() {
        for (var line of this.lines) {
            line.draw()
        }
    }
}

function drawPoint(ctx, x, y, color="#000", size=1) {
      	// to increase smoothing for numbers with decimal part
      	var pointX = Math.round(x);
        var pointY = Math.round(y);

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(pointX, pointY, size, 0 * Math.PI, 2 * Math.PI);
        ctx.fill();
}


class BezierCurve extends Shape {
    constructor(start, end, p1, p2) {
        super()
        this.start = start
        this.end = end
        this.p1 = p1 || start
        this.p2 = p2 || end
        this.points = []
        this.updatePoints()
    }

    update(para) {
        this.start = para.start || this.start
        this.end = para.end || this.end
        this.p1 = para.p1 || this.p1
        this.p2 = para.p2 || this.p2
        this.updatePoints()
    }

    interpolate(a, b, factor) {
        return a + (b - a) * factor;
    }

    vectorInterpolate(a, b, factor) {
        const x = this.interpolate(a.x, b.x, factor)
        const y = this.interpolate(a.y, b.y, factor)
        return {x, y};
    }

    bezier(start, end, p1, p2, factor) {
        const c1 = this.vectorInterpolate(p1, p2, factor)
        const c2 = this.vectorInterpolate(start, c1, factor)
        const c3 = this.vectorInterpolate(c1, end, factor)
        const p = this.vectorInterpolate(c2, c3, factor)
        return p
    }
    updatePoints() {
        const steps = 300
        for (var i = 0; i < steps; i++) {
            const factor = i / (steps - 1)
            const p = this.bezier(this.start, this.end, this.p1, this.p2, factor)
            this.points.push(p)
        }
    }
    draw() {
        const ctx = Shape.ctx
        for (var point of this.points) {
            const x = point.x
            const y = point.y
            drawPoint(ctx, x, y)
        }
    }
}


class RadiusRect extends Shape {
    constructor(start, end) {
        super()
        this.start = start
        this.end = end

    }

    draw() {
        const ctx = Shape.ctx
        const radius = 15
        // top
        ctx.beginPath();
        var x1 = this.start.x + radius
        var y1 = this.start.y
        var x2 = this.end.x - radius
        var y2 = this.start.y
        const l1 = new Line({x: x1, y: y1}, {x: x2, y: y2})
        l1.draw()
        var xr = this.end.x - radius
        var yr = this.start.y + radius
        ctx.arc(xr, yr, radius,  1.5 * Math.PI, 2 * Math.PI);
        ctx.stroke()
        // right
        ctx.beginPath();
        x1 = this.end.x
        y1 = this.start.y + radius
        x2 = this.end.x
        y2 = this.end.y - radius
        const l2 = new Line({x: x1, y: y1}, {x: x2, y: y2})
        l2.draw()
        var xr = this.end.x - radius
        var yr = this.end.y - radius
        ctx.arc(xr, yr, radius,  2 * Math.PI, 0.5 * Math.PI);
        ctx.stroke()
        // bottom
        ctx.beginPath();
        x1 = this.end.x - radius
        y1 = this.end.y
        x2 = this.start.x + radius
        y2 = this.end.y
        const l3 = new Line({x: x1, y: y1}, {x: x2, y: y2})
        l3.draw()
        var xr = this.start.x + radius
        var yr = this.end.y - radius
        ctx.arc(xr, yr, radius,  0.5 * Math.PI, 1 * Math.PI);
        ctx.stroke()
        // left
        ctx.beginPath();
        x1 = this.start.x
        y1 = this.end.y - radius
        x2 = this.start.x
        y2 = this.start.y + radius
        const l4 = new Line({x: x1, y: y1}, {x: x2, y: y2})
        l4.draw()
        var xr = this.start.x + radius
        var yr = this.start.y + radius
        ctx.arc(xr, yr, radius,  1 * Math.PI, 1.5 * Math.PI);
        ctx.stroke()

    }
}
