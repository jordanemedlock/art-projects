
# A very simple Flask Hello World app for you to get started with...

from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/kaleidoscope')
def kaleidoscope():
    return render_template('kaleidoscope.html')

@app.route('/cyclic_art')
def cyclic_art():
    return render_template('cyclic_art.html')

@app.route('/epicycles')
def epicycles():
    return render_template('epicycles.html')


@app.route('/cellular_automita')
def cellular_automita():
    return render_template('cellular_automita.html')

@app.route('/dimensions')
def dimensions():
    return render_template('dimensions.html')


@app.route('/block_game')
def dimensions():
    return render_template('block_game.html')

