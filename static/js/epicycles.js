





var toRad = (deg) => deg / 180.0 * Math.PI


$(function() {
    var canvas = document.getElementById('art-canvas')
    var context = canvas.getContext('2d')

    var setup = function() {

    }

    var speed = 20
    var ncircles = 5
    var circles = _.flatten(_.times(ncircles, function(i) {
        return [
            {
                r: 5,
                th: (360 / ncircles) * i,
                dth: -3 * speed,
                color: 'blue'
            },
            {
                r: -5,
                th: (360 / ncircles) * i,
                dth: -3 * speed,
                color: 'transparent'
            }
        ]

    }))

    [
        {
            r: 100,
            th: 0,
            dth: 1 * speed,
            color: 'green'
        }
    ]

    var draw = function(delta) {
        var center = {x:0,y:0}
        circles = _.map(circles, function(circle) {
            var x = this.x + circle.r * Math.cos(toRad(circle.th))
            var y = this.y + circle.r * Math.sin(toRad(circle.th))
            var th = circle.th + circle.dth * delta


            context.lineWidth = 1
            context.strokeStyle = circle.color
            context.beginPath()
            if (circle.last) {
                context.moveTo(circle.last.x + canvas.width/2, circle.last.y + canvas.height/2)
                context.lineTo(x + canvas.width/2, y + canvas.height/2)
            }
            context.stroke()
            this.x = x
            this.y = y
            circle.th = th
            circle.last = {x:x,y:y}
            return circle
        }, center)
    }

    setup()
    var FPS = 30;
    var time = new Date().getTime()
    var delta = 0
    setInterval(function() {
        var newTime = new Date().getTime()
        delta = newTime - time
        draw(delta / 1000.0);
        time = newTime
    }, 1000/FPS);
})