from flask import Flask, render_template, request
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

@app.route('/<company>/recording', methods=['POST'])
def receiveRecording(company):
    if not request.args.has_key('question'):
        questionNo = 0
    else:
        questionNo = int(request.args['question']) + 1

    if questionNo >= len(questions):
        return render_template( 'Hangup.xml' )

    question = questions[ questionNo ]
    return render_template( 'Question.xml', company=company, question=question, questionNo=questionNo )

if __name__ == '__main__':
    app.run(host='0.0.0.0')
