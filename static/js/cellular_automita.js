


var Grid = function(width, height) {
    this.width = width
    this.height = height
    this.tiles = new Array(width*height)
    this.getTile = function(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return inputs.edge(x, y)
        }
        return this.tiles[y * this.width + x]
    }
    this.setTile = function(x, y, val) {
        this.tiles[y * this.width + x] = val
    }
    this.drawGrid = function(canvas, context) {
        var tileWidth = canvas.width / this.width
        var tileHeight = canvas.height / this.height
        for (var y=0; y < this.height; y++) {
            for (var x=0; x < this.width; x++) {
                context.fillStyle = this.valueToColor(this.getTile(x, y))
                context.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight)
            }
        }
    }
    this.valueToColor = i => inputs.colorFunction(i)

    this.clone = function() {
        var grid = new Grid(this.width, this.height)
        for (var i=0; i < this.tiles.length; i++) {
            grid.tiles[i] = this.tiles[i]
        }
        return grid
    }

    this.transition = function(transitionFunction) {
        var grid = this.clone()
        for (var y=0; y < this.height; y++) {
            for (var x=0; x < this.width; x++) {
                var newValue = transitionFunction(
                    this.getTile(x, y),
                    [
                        this.getTile(x-1, y-1),
                        this.getTile(x+0, y-1),
                        this.getTile(x+1, y-1),
                        this.getTile(x+1, y+0),
                        this.getTile(x+1, y+1),
                        this.getTile(x+0, y+1),
                        this.getTile(x-1, y+1),
                        this.getTile(x-1, y+0)
                    ]
                )
                grid.setTile(x, y, newValue)
            }
        }
        return grid
    }

    this.initialize = function(func) {
        for (var y=0; y < this.height; y++) {
            for (var x=0; x < this.width; x++) {
                this.setTile(x, y, func(x, y))
            }
        }
    }
}


var inputs = {}

var getInputs = function() {
    inputs.saveName = $('#save-name').val()
    inputs.edgeString = $('#edge-function').val()
    inputs.edge = eval(inputs.edgeString)
    inputs.transitionString = $('#transition-function').val()
    inputs.transition = eval(inputs.transitionString)
    inputs.initializationString = $('#initialization-function').val()
    inputs.initialization = eval(inputs.initializationString)
    inputs.colorFunctionString = $('#value-to-color-function').val()
    inputs.colorFunction = eval(inputs.colorFunctionString)
    inputs.playing = $('#play-checkbox').is(':checked')

    loadSaveSelect()
}
var setInputs = function(ins) {
    inputs = ins
    $('#save-name').val(inputs.saveName)
    $('#edge-function').val(inputs.edgeString)
    inputs.edge = eval(inputs.edgeString)
    $('#transition-function').val(inputs.transitionString)
    inputs.transition = eval(inputs.transitionString)
    $('#initialization-function').val(inputs.initializationString)
    inputs.initialization = eval(inputs.initializationString)
    $('#value-to-color-function').val(inputs.colorFunctionString)
    inputs.colorFunction = eval(inputs.colorFunctionString)
    $('#play-checkbox').prop('checked', inputs.playing)

}

var save = function() {
    getInputs()
    var string = JSON.stringify(inputs)
    localStorage.setItem(inputs.saveName, string)
}

var load = function() {
    var saveName = $('#save-select').val()
    var ins = JSON.parse(localStorage.getItem(saveName))
    setInputs(ins)
}

var loadSaveSelect = function(saveName) {
    var $select = $('#save-select')
    $select.html('')
    for (var i=0; i < localStorage.length; i++) {
        var k = localStorage.key(i)
        $select.append('<option ' + (k == saveName ? 'selected' : '') + '>' + k + "</option>")
    }
}

$(function() {
    var canvas = document.getElementById('art-canvas')
    var context = canvas.getContext('2d')

    var grid = {}

    var gif

    var setup = function() {
        gif = new GIF({
            workers: 1,
            quality: 30,
            workerScript: '/static/js/lib/gif.worker.js'
        })
        gif.on('finished', function(blob) {
            $('#gif-holder').attr('src', URL.createObjectURL(blob))
        })
        gif.on('abort', function(){
            console.log('gif aborted')
        });
        gif.on('start', function(){
            console.log('gif started')
        });
        gif.on('progress', function(progress) {
            console.log('gif progress:', progress);
        });
        grid = new Grid(50,50)
        grid.initialize(inputs.initialization)
        grid.drawGrid(canvas, context)
        gif.addFrame(canvas, {copy: true})
    }

    var draw = function(delta) {
        if (inputs.playing) {
            _.times(10, function() {
                grid = grid.transition(inputs.transition)
            })
            grid.drawGrid(canvas, context)
            gif.addFrame(canvas, {copy: true})
        }
    }

    $('.change').change(getInputs)
    getInputs()

    $('#init-button').click(function() {
        setup()
    })

    $('#render-button').click(function() {
        gif.render()
    })

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