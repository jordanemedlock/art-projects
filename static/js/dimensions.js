
var lerp = function(start, end, delta) {
    return {
        x: start.x + (end.x - start.x) * delta,
        y: start.y + (end.y - start.y) * delta
    }
}


$(function() {
    var canvas = document.getElementById('art-canvas')
    var context = canvas.getContext('2d')

    var data = {}

    data.setup = function() {
        this.tick = 0
        this.width = 50
        this.height = 50
        this.padding = 50
        this.end = [
            {
                points: [{x: this.padding, y: this.padding}],
                stroke: "black",
                fill: "white"
            }
        ]
        this.polys = []
        this.states = [
            { // load d0
                time: 30,
                end: (end) => { // end is a deep clone of start
                    end[0].points[1] = end[0].points[0]
                }
            },
            { // d0 -> d1
                time: 30,
                end: (end) => {
                    end[0].points[1].x += this.width
                }
            },
            { // load d1
                time: 30,
                end: (end) => {
                    end[0].points[2] = end[0].points[1]
                    end[0].points[3] = end[0].points[0]
                }
            },
            { // d1 -> d2
                time: 30,
                end: (end) => {
                    end[0].points[2].y += this.height
                    end[0].points[3].y += this.height
                }
            },
            { // load d2
                time: 30,
                end: (end) => {
                    end[1] = {
                        points: [
                            end[0].points[3],
                            end[0].points[2],
                            end[0].points[2],
                            end[0].points[3],
                        ],
                        fill: 'green',
                        stroke: 'black'
                    }
                }
            },
            { // d2 -> d3.x
                time: 30,
                end: (end) => {
                    end[0].points[2].x += 0
                    end[0].points[2].y -= 10
                    end[0].points[3].x -= 10
                    end[0].points[3].y -= 10

                    end[1].points[0] = end[0].points[3]
                    end[1].points[1] = end[0].points[2]
                    end[1].points[2].y += 30
                    end[1].points[3].y += 30
                }
            },
            {
                time: 1,
                end: (end) => {
                    end[2] = {
                        points: [
                            end[0].points[1],
                            end[1].points[1],
                            end[1].points[2],
                            end[1].points[1]
                        ],
                        fill: 'blue',
                        stroke: 'black'
                    }
                }
            },
            {
                time: 30,
                end: (end) => {
                    end[0].points[2].x -= 15
                    end[1].points[1].x -= 15
                    end[2].points[1].x -= 15

                    end[2].points[3].x += 15
                    end[2].points[3].y += 5
                }
            }
        ]
    }

    data.transition = function(delta) {
        this.polys = _.chain(this.start).zip(this.end).map(function([start, end]) {
            var points = _.chain(start.points).zip(end.points).map(function([s,e]) {
                if (!s) {
                    return e
                } else {
                    return lerp(s, e, delta)
                }
            }).value()
            return {
                points: points,
                stroke: start.stroke,
                fill: start.fill
            }
        }).value()
    }

    data.update = function() {
        var tick = this.tick
        _.find(this.states, (state, i) => {
            if (tick == 0) {
                this.start = this.end
                this.end = $.extend(true, [], this.start)
                this.polys = null
                state.end(this.end)
                this.transition(0)
                return true
            } else if (tick < state.time) {
                var delta = tick * (1 / state.time)
                this.transition(delta)
                return true
            }
            tick -= state.time
            return false
        })
        this.tick++
    }

    data.draw = function(delta) {
        context.fillStyle = 'grey'
        context.fillRect(0, 0, canvas.width, canvas.height)
        _.each(this.polys, function(poly) {
            context.strokeStyle = poly.stroke
            context.fillStyle = poly.fill
            context.beginPath()
            context.moveTo(poly.points[0].x, poly.points[0].y)
            _.times(poly.points.length - 1, function (i) {
                context.lineTo(poly.points[i+1].x, poly.points[i+1].y)
            })
            context.closePath()
            context.fill()
            context.stroke()
        })
    }

    data.setup()
    var FPS = 30;
    var time = new Date().getTime()
    var delta = 0
    setInterval(function() {
        var newTime = new Date().getTime()
        delta = newTime - time
        data.update()
        data.draw(delta / 1000.0);
        time = newTime
    }, 1000/FPS);
})