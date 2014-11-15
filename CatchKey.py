from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/instructions')
def receiveCall():
    return render_template('receiveCall.xml')

@app.route('/completed')
def callCompleted():
    return 'thanks'

@app.route('/recording')
def receiveRecording():
    print request;
    return 'thanks'

if __name__ == '__main__':
    app.run(host='0.0.0.0')
