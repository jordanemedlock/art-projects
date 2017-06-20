


var clearScreen = function(cnv, ctx, fillStyle) {
    ctx.fillStyle = fillStyle
    ctx.fillRect(0, 0, cnv.width, cnv.height)
}

var getInputs = function() {
    var x = parseInt($('#x-range').val())
    var y = parseInt($('#y-range').val())
    var r = parseInt($('#r-range').val())
    var th = parseInt($('#th-range').val())

    $('#x-range-label').text('X: ' + x)
    $('#y-range-label').text('Y: ' + y)
    $('#r-range-label').text('R: ' + r)
    $('#th-range-label').text('TH: ' + th)

    return {
        x: x,
        y: y,
        r: r,
        th: th
    }
}

var toRad = deg => deg / 180 * Math.PI

var clipTriangle = function(inputs, cnv, ctx, img) {
    var x = inputs.x
    var y = inputs.y
    var r = inputs.r
    var th = inputs.th
    var d = 0.5

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + r*Math.sin(toRad(th - d)), y + r*Math.cos(toRad(th - d)))
    ctx.arc(x, y,r,-toRad(th - d + 90),-toRad(th + 30 + d + 90), true)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(img, 0,0, cnv.width, cnv.height)



}

var drawWedge = function(inputs, cnv, ctx, img, rot, flip) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save()
    ctx.translate(cnv.width/2, cnv.height/2)
    if (flip) {
        ctx.rotate(-toRad(inputs.th + 30 + rot))
        ctx.scale(-1,1)
    } else {
        ctx.rotate(toRad(inputs.th + 0 - rot))
    }
    ctx.scale(cnv.width/2/inputs.r, cnv.width/2/inputs.r)
    ctx.translate(-inputs.x, -inputs.y)
    clipTriangle(inputs, cnv, ctx, img)
    ctx.restore()
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // ctx.translate(cnv.width/2, cnv.height/2)
}

var drawKaleidoscope = function(inputs, cnv, ctx, img) {
    for (var i=0; i < 12; i++) {
        drawWedge(inputs, cnv, ctx, img, i*30, i % 2)
    }
}

var updateImage = function(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function(e) {
            $('#image').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

var saveToImage = function() {
    var image = document.getElementById("canvas1").toDataURL("image/png").replace("image/png");

    $('#output').attr('src', image)
}

$(function() {
    var cnv1 = document.getElementById("canvas1")
    var ctx1 = cnv1.getContext("2d")
    var cnv2 = document.getElementById("canvas2")
    var ctx2 = cnv2.getContext("2d")

    var draw = function() {
        clearScreen(cnv1, ctx1, "white")
        clearScreen(cnv2, ctx2, "white")

        var img = document.getElementById("image")

        var inputs = getInputs()

        ctx2.save()
        clipTriangle(inputs, cnv2, ctx2, img)
        ctx2.restore()
        drawKaleidoscope(inputs, cnv1, ctx1, img)
    }

    var dragging
    $('#canvas2')
    .mousedown(function(){ dragging = true; })
    .mouseup(function(){ dragging = false; })
    .mousemove(function(e) {
        if (dragging) {
            var rect = this.getBoundingClientRect()
            var x = e.clientX - rect.x
            var y = e.clientY - rect.y
            $('#x-range').val(x)
            $('#y-range').val(y)
        }
    })
    // .bind('mousewheel DOMMouseScroll', function(e) {
    //     $('#th-range').val(parseInt($('#th-range').val()) + (e.wheelDelta > 0 || event.originalEvent.detail < 0 ? 1 : -1) * 10)
    // })
    $(window).keydown(function(e) {
        // 37 left
        // 39 right
        var d = 0;
        if (e.keyCode == 38) { // up
            d = 1
        } else if (e.keyCode == 40) { // down
            d = -1
        }
        if (d) {
            var val = parseInt($('#th-range').val()) + d * 10
            if (val > 360) val = 10
            if (val < 0) val = 350
            $('#th-range').val(val)
        }
        e.preventDefault()
        return false;
    })

    var FPS = 30;
    setInterval(function() {
        draw();
    }, 1000/FPS);
})