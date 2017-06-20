
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}

var inputs = {}

var makeCircle = function(x, y) {
    var obj = {
        x: x,
        y: y,
        radius: 5// _.random(3,30)
    }

    return obj
}

var makeCircles = function(w, h, n) {
    var sn = Math.floor(Math.sqrt(n))
    var dx = Math.floor(w / sn)
    var dy = Math.floor(h / sn)
    return _.flatten(_.times(sn, ix => _.times(sn, iy => makeCircle(ix * dx + dx/2,iy * dy + dy/2))))
}

var colorCircles = function(circles, ctx) {
    return _.map(circles, circle => colorCircle(circle, ctx))
}

var colorCircle = function(circle, ctx) {
    var pixel = ctx.getImageData(circle.x, circle.y, 1, 1)
    if (inputs.hsv) {
        var hsv = RGBtoHSV(pixel.data[0], pixel.data[1], pixel.data[2])
        circle.hue = hsv.h
        circle.sat = hsv.s
        circle.val = hsv.v
    } else {
        circle.red = pixel.data[0]
        circle.green = pixel.data[1]
        circle.blue = pixel.data[2]
    }
    return circle
}

var drawCircles = function(circles, ctx, size) {
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,size.w,size.h)
    _.each(circles, c => drawCircle(c, ctx))
}

var drawCircle = function(circle, ctx) {
    if (inputs.hsv) {
        var rgb = HSVtoRGB(circle.hue, circle.sat, circle.val)
    } else {
        var rgb = {r:circle.red, g:circle.green, b:circle.blue}
    }
    ctx.fillStyle = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")"
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2.0*Math.PI)
    ctx.fill();
}

var difference = function(ctx1, ctx2, rect) {
    var pixels1 = ctx1.getImageData(rect.x, rect.y, rect.w, rect.h)
    var pixels2 = ctx2.getImageData(rect.x, rect.y, rect.w, rect.h)
    var sum = 0
    var count = 0
    for (var i=_.random(0,skip-1); i < pixels1.data.length; i+=skip) {

        var diff = pixels1.data[i] - pixels2.data[i]
        count++;
        sum += diff * diff
    }
    return sum / count
}

var boundingBox = function(circle) {
    var x = circle.x - circle.radius
    var y = circle.y - circle.radius
    return {
        x: x < 0 ? 0 : x,
        y: y < 0 ? 0 : y,
        w: (circle.x - x) + circle.radius,
        h: (circle.y - y) + circle.radius
    }
}

var makeChange = function(n) {
    var obj = {
        index: _.random(0, n-1),
        variable: _.sample(_(inputs).pairs().filter(_.last).map(_.first))
    }
    obj.delta = _.sample([-1,1]) * _.random(1,10)
    if (['hue','sat','val'].includes(obj.variable)) {
        obj.delta = _.sample([-1,1]) * _.random(0.01,0.2)
    }
    return obj
}

var doChange = function(circles, change) {
    var circle = circles[change.index]
    circle[change.variable] += change.delta
}

var undoChange = function(circles, change) {
    var circle = circles[change.index]
    circle[change.variable] -= change.delta
}

var validCircle = function(circle, size) {
    return ((circle.x >= 0 && circle.x <= size.w) &&
            (circle.y >= 0 && circle.y <= size.h) &&
            (circle.radius > 5 && circle.radius <= 200) &&
            (circle.red >= 0 && circle.red < 256) &&
            (circle.green >= 0 && circle.green < 256) &&
            (circle.blue >= 0 && circle.blue < 256)); // TODO: clean
}

var costFunction = function(aCtx, iCtx, circle, size) {
    // if (_.random(0,10) > 1) {
        // return difference(aCtx, iCtx, boundingBox(circle))
    // } else {
        return difference(aCtx, iCtx, {x: 0, y: 0, w: size.w, h: size.h})
    // }
}

var hillClimb = function(circles, aCtx, iCtx, size, default_change) {
    var change = default_change || makeChange(circles.length)
    var oldCost = costFunction(aCtx, iCtx, circles[change.index], size)
    doChange(circles, change)
    if (!validCircle(circles[change.index], size)) {
        undoChange(circles, change)
        return false
    }
    drawCircles(circles, aCtx, size)
    var newCost = costFunction(aCtx, iCtx, circles[change.index], size)
    if (newCost == oldCost) {
        circles.push(circles.splice(change.index, 1)[0]) // removes circle and places it at the end
    } else if (newCost >= oldCost) {
        undoChange(circles, change)
        return false
    } else {
        // return hillClimb(circles, aCtx, iCtx, size, change)
        return true
    }
}

var skip = 1

var getInputs = function() {
    var x = $('#x-checkbox').is(':checked')
    var y = $('#y-checkbox').is(':checked')
    var radius = $('#radius-checkbox').is(':checked')
    var colors = $('#colors-checkbox').is(':checked')
    skip = [1,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,
            97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,
            181,191,193,197,199][parseInt($('#skip-range').val())]
    $('#skip-range-label').text('Skip ' + skip)
    inputs = {x,y,radius,red:colors,green:colors,blue:colors}
}

$(function() {
    $('#x-checkbox,#y-checkbox,#radius-checkbox,#colors-checkbox,#skip-range').change(getInputs)
    getInputs()

    var artCanvas = document.getElementById("art-canvas")
    var artContext = artCanvas.getContext("2d")

    var imgCanvas = document.getElementById("img-canvas")
    var imgContext = imgCanvas.getContext("2d")

    var image = document.getElementById("image")

    var circles;

    var setup = function() {
        artContext.fillStyle = "black"
        artContext.fillRect(0,0, artCanvas.width, artCanvas.height)

        imgContext.drawImage(image, 0, 0, imgCanvas.width * image.width / image.height, imgCanvas.height)

        circles = makeCircles(artCanvas.width, artCanvas.height, 200)
        circles = colorCircles(circles, imgContext)

        var valid = _.every(circles, function (c) {
            var v = validCircle(c, {w: imgCanvas.width, h: imgCanvas.height})
            return v
        })
    }

    var draw = function() {
        var improved = hillClimb(circles, artContext, imgContext, {w: artCanvas.width, h: artCanvas.height})
    }

    image.onload = function () {
        setup()
        var FPS = 30;
        setInterval(function() {
          draw();
        }, 1000/FPS);
    }
})