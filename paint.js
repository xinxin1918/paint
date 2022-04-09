
function distance(point1, point2) {
    const dx = point1.x - point2.x
    const dy = point1.y - point2.y
    const d2 = Math.pow(dx, 2) + Math.pow(dy, 2)
    return Math.sqrt(d2);
}

class App {
    constructor() {
        this.container = e("#canvas")
        this.ctx = this.container.getContext("2d");
        Shape.ctx = this.ctx
        this.start = {
            x: 0,
            y: 0,
        }
        this.end = {
            x: 0,
            y: 0,
        }
        this.isDown = false
        this.toolsElement = e('.tools')
        this.tool = undefined
        this.shapes = {
            lines: [],
            rects: [],
            ellipses: [],
            polygons: [],
            curves: [],
            radiusRects: [],
        }
        this.points = []
    }

    clearCtx() {
        const w = this.container.width
        const h = this.container.height
        this.ctx.clearRect(0, 0, w, h);
    }

    bindEvents() {
        bindEvent(this.toolsElement, 'click', (event) => {
            const t = event.target
            if (t.classList.contains('tool-button')) {
                const toolAttr = t.dataset.tool
                this.tool = toolAttr
                this.points = []
                const toolButtons = es('.tool-button', this.toolsElement)
                removeAllClass(toolButtons, 'tool-active')
                t.classList.add('tool-active')
            }
        })

        bindEvent(e('.clear-button'), 'click', (event) => {
            this.clearCtx()
            this.shapes = {
                lines: [],
                rects: [],
                ellipses: [],
                polygons: [],
                curves: [],
                radiusRects: [],
            }
        })

        bindEvent(this.container, 'mousedown', (event) => {
            const c = this.container
            console.log('convas mousedown');
            this.start.x = event.clientX - c.clientLeft
            this.start.y = event.clientY - c.clientTop
            // if points is empty, add end point
            if (this.points.length === 0) {
                this.points.push({...this.start})
            }
            this.isDown = true
        })

        bindEvent(this.container, 'mousemove', (event) => {
            console.log('convas mousemove');
            const c = this.container
            this.end.x = event.clientX - c.clientLeft
            this.end.y = event.clientY - c.clientTop

            if (this.isDown) {
                this.clearCtx()
                this.drawShapes()
                this.drawCurrentShape()
                if (this.tool === 'polygon') {
                    this.drawLinesByPoints({...this.end})
                }
            }
        })

        bindEvent(this.container, 'mouseup',  (event) => {
            console.log('convas mouseup');
            const c = this.container
            this.end.x = event.clientX - c.clientLeft
            this.end.y = event.clientY - c.clientTop
            this.isDown = false
            this.points.push({...this.end})

            this.addNewShape()
            this.drawShapes()
            if (this.tool === 'polygon') {

                this.drawLinesByPoints()
            }
        })
    }

    drawLinesByPoints(end) {
        const ps = this.points
        for (var i = 0; i < ps.length - 1; i++) {
            const p1 = ps[i]
            const p2 = ps[i + 1]
            const l = new Line(p1, p2)
            l.draw()
        }
        if (ps.length > 0 && end !== undefined) {
            const p = ps.slice(-1)[0]
            const l = new Line(p, end)
            l.draw()
        }
    }

    drawCurrentShape() {
        if (this.tool === 'line') {
            console.log('draw line in move');
            const l = new Line(this.start, this.end)
            l.draw()
        } else if (this.tool === 'rect') {
            const l = new Rect(this.start, this.end)
            l.draw()
        } else if (this.tool === 'ellipse') {
            const l = new Ellipse(this.start, this.end)
            l.draw()
        } else if (this.tool === 'curve') {
            if (this.points.length === 1) {
                const l = new BezierCurve(this.points[0], this.end)
                l.draw()
            } else if (this.points.length === 2) {
                const l = new BezierCurve(this.points[0], this.points[1], this.end)
                l.draw()
            }  else if (this.points.length === 3) {
                const l = new BezierCurve(this.points[0], this.points[1], this.points[2], this.end)
                l.draw()
            }
        } else if (this.tool === 'radiusRect') {
            const s = {...this.start}
            const e = {...this.end}
            if (s.x > e.x) {
                [s.x, e.x] = [e.x, s.x]
            }
            if (s.y > e.y) {
                [s.y, e.y] = [e.y, s.y]
            }
            console.log('this.start, this.end', this.start, this.end);
            const l = new RadiusRect(s, e)
            l.draw()
        }

    }

    addNewShape() {
        const tool = this.tool
        const start = this.start
        const end = this.end
        const lines = this.shapes.lines
        const rects = this.shapes.rects
        const ellipses = this.shapes.ellipses
        const polygons = this.shapes.polygons
        const curves = this.shapes.curves
        console.log('tool', tool);
        if (start.x === end.x && start.y === end.y) {
            return
        }
        if (tool === 'line') {
            const l = new Line({...start}, {...end},)
            lines.push(l)
        } else if (tool === 'rect') {
            const l = new Rect({...start}, {...end},)
            rects.push(l)
        } else if (tool === 'ellipse') {
            const l = new Ellipse({...start}, {...end},)
            ellipses.push(l)
        } else if (tool === 'polygon') {
            if (this.points.length >= 3) {
                const p1 = this.points[0]
                const p2 = this.points.slice(-1)[0]
                const minDistance = 10
                if (distance(p1, p2) < minDistance) {
                    const l = new Polygon(this.points)
                    polygons.push(l)
                    this.points = []
                }
            }
        } else if (tool === 'curve') {
            if (this.points.length === 4) {
                const l = new BezierCurve(this.points[0], this.points[1], this.points[2], this.points[3],)
                curves.push(l)
                this.points = []
            }
        } else if (tool === 'radiusRect') {
            console.log('this.start, this.end', this.start, this.end);
            const s = {...start}
            const e = {...end}
            if (s.x > e.x) {
                [s.x, e.x] = [e.x, s.x]
            }
            if (s.y > e.y) {
                [s.y, e.y] = [e.y, s.y]
            }
            const l = new RadiusRect(s, e,)
            ellipses.push(l)
        }
    }

    drawShapes() {
        for (var line of this.shapes.lines) {
            line.draw()
        }
        for (var rect of this.shapes.rects) {
            rect.draw()
        }
        for (var ellipse of this.shapes.ellipses) {
            ellipse.draw()
        }
        for (var polygon of this.shapes.polygons) {
            console.log('通过 draw shapes 画')
            polygon.draw()
        }

        for (var curve of this.shapes.curves) {
            curve.draw()
        }

        for (var r of this.shapes.radiusRects) {
            r.draw()
        }
    }
}

const __main = function() {
    app = new App()
    app.bindEvents()

}
__main()
// 1. app 记录 points
// 2. points 清空条件, tools 切换
// 3. points 清空条件, end point 逼近 begin point
// 4. points 清空时, push 新的 polygon
// 解决拖动画多边形的问题
// 1. mouse move 开始的时候, 如果 points 里面没有点, 则需要把点加进去
// 2. move的时候要画所有的点, 加上 move 的end
// 如何画曲线
// 1. 画一条直线
// 2. 两次mouse up 确定调整点
