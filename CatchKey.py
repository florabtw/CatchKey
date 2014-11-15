from flask import Flask, render_template, request
app = Flask(__name__)

questions = [
'What is your favorite design pattern?',
'What is your favorite language?'
]

submissions = {}

@app.route('/instructions')
def requestForInstructions():
    return render_template('BeginCall.xml', company='catchkey')

@app.route('/completed')
def callCompleted(): pass

@app.route('/<company>/recording', methods=['POST'])
def receiveRecording(company):
    if not submissions.has_key(company):
        submissions[company] = {}

    caller = request.form['caller']
    if not submissions[company].has_key(caller):
        submissions[company][caller] = []

    questionNo = getQuestionNumber(request.args)

    if questionNo >= len(questions):
        print submissions
        return render_template( 'Hangup.xml' )

    question = questions[ questionNo ]
    return render_template( 'Question.xml', company=company, question=question, questionNo=questionNo )

def getQuestionNumber(args):
    if not args.has_key('question'):
        return 0
    else:
        return int(args['question']) + 1

if __name__ == '__main__':
    app.run(host='0.0.0.0')
