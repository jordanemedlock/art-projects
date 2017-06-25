
var layout = [ 0, 0, 1, 0, 0
             , 0, 1, 1, 1, 0
             , 1, 1, 1, 1, 1
             , 0, 1, 1, 1, 0
             , 0, 0, 1, 0, 0
             ]


$(function() {
    var canvas = document.getElementById('art-canvas')
    var context = canvas.getContext('2d')

    var data = {}

    data.setup = function() {
        this.width = 5
        this.height = 5
        this.grid = layout.slice()
        this.getTile = function(x, y) {
            return this.grid[y * this.width + x]
        }
        this.setTile = function(x, y, val) {
            this.grid[y * this.width + x] = val
        }

        this.genRows = function() {
            return _.times(this.height, (y) => {
                var contig = [0]
                var i = 0
                _.times(this.width, (x) => {
                    var item = this.getTile(x, y)
                    if (tile) {
                        contig[i]++
                    } else {
                        i++
                        contig[i] = 0
                    }
                })
                var noZero = _.filter(contig, (x) => x > 0)
                return noZero.length > 0 ? noZero : [0]
            })
        }

        this.genCols = function() {
            return _.times(this.width, (x) => {
                var contig = [0]
                var i = 0
                _.times(this.height, (y) => {
                    var item = this.getTile(x, y)
                    if (tile) {
                        contig[i]++
                    } else {
                        i++
                        contig[i] = 0
                    }
                })
                var noZero = _.filter(contig, (x) => x > 0)
                return noZero.length > 0 ? noZero : [0]
            })
        }

        this.rows = this.genRows()
        this.cols = this.genCols()
    }

    data.update = function() {

    }

    data.draw = function(delta) {

        // TODO: Continue here

    }

    data.click = function(x, y) {

    }

    $('#art-canvas').click(function(e) {
        var x, y
        data.click(x, y)
    })

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