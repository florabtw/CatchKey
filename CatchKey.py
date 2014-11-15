from flask import Flask, render_template
app = Flask(__name__)

questions = [
'What is your favorite design pattern?',
'What is your favorite language?'
]



@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/instructions')
def requestForInstructions():
    return render_template('BeginCall.xml', company='catchkey')

@app.route('/completed')
def callCompleted():
    return 'thanks'

@app.route('/<company>/recording')
def receiveRecording(company):
    if not request.args['questionNo']:
        questionNo = 0
    else:
        questionNo = request.args['questionNo'] + 1

    if questionNo >= len(question):
        return render_template( 'Hangup.xml' )

    question = questions[ questionNo ]
    render_template( 'Question.xml',
     company=company,
     question=question,
     questionNo=questionNo )

if __name__ == '__main__':
    app.run(host='0.0.0.0')
