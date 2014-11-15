from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/instructions')
def receiveCall():
    return render_template('receive_call.xml')

if __name__ == '__main__':
    app.run(host='0.0.0.0')
