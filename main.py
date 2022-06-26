from cgitb import text
from pickle import GLOBAL
from sanic import Sanic
from sanic.response import html, file, json
import helpers
import json as non_sanic_json

PATH = __file__[:__file__.rfind('/')+1]

GLOBAL_PASSWORD = '123'

app = Sanic('app')

@app.get('/')
async def index(request):
    return html(
        open(PATH + 'client/index.html').read()
    )

@app.post('/checkpw')
async def checkglobalpw(request):
    # checks if the global password is correct
    if request.cookies.get('gpw') == GLOBAL_PASSWORD:
        return json({
            "msg": "y",
        })
    else:
        return json({
            "msg": "n",
        })

@app.post('/newuser')
async def newuser(request):
    if not request.cookies.get('gpw') == GLOBAL_PASSWORD:
        return json({
            "success": "n",
            "msg": "invalid global password. please reload the page."
        })
    username = request.form.get('name')
    pw       = request.form.get('pass')
    hash     = helpers.sha256(pw)
    chars    = list('abcdefghijklmnopqrstuvwxyz1234567890_')
    f = open(PATH + 'users.txt')
    contents = f.read()
    f.close()
    user_list = contents.split('\n')
    for x in user_list:
        line = x.split(',')
        if line[0] == username:
            return json({
                "success": "n",
                "msg": "name already exists",
            })
    for x in username:
        if not x in chars:
            return json({
                "success": "n",
                "msg": "invalid characters in name",
            })
    if len(username) > 20:
        return json({
            "success": "n",
            "msg": "name too long",
        })
    if len(username) < 3:
        return json({
            "success": "n",
            "msg": "name too short",
        })
    f = open(PATH + 'users.txt', 'a')
    f.write('\n' + username + ',' + hash)
    f.close()
    return json({
        "success": "y",
        "msg": "account created successfully. username: " + username,
    })

@app.post('/checkuserpw')
async def checkuserpw(request):
    if not request.cookies.get('gpw') == GLOBAL_PASSWORD:
        return json({
            "msg": "i"
        })
    username = request.form.get('name')
    pw       = request.form.get('pass')
    if helpers.checkpw(username, pw):
        return json({
            "msg": "y"
        })
    else:
        return json({
            "msg": "n"
        })

@app.post('/checkusername')
async def checkusername(request):
    if not request.cookies.get('gpw') == GLOBAL_PASSWORD:
        return json({
            "msg": "i"
        })
    username = request.form.get('name')
    f = open(PATH + 'users.txt', 'r')
    contents = f.read()
    f.close()
    for x in contents.split('\n'):
        if x.split(',')[0] == username:
            return json({
                "msg": "y"
            })
    return json({
        "msg": "n"
    })

@app.post('/newsession')
async def newsession(request):
    if not request.cookies.get('gpw') == GLOBAL_PASSWORD:
        return json({
            "msg": "i"
        })
    username = request.form.get('name')
    pw       = request.form.get('pass')
    if helpers.checkpw(username, pw):
        try:
            open(PATH + 'sessions/' + sessname + '.txt', 'r')
            return json({
                "msg": "name already in use"
            })
        except:
            sessname = request.form.get('session_name').replace(">", "")
            data = non_sanic_json.loads(request.form.get('session'))
            num_judges = len(data['judges'])
            num_entries = len(data['entries'])
            """
                sort-of spreadsheet for data. looks like this:
                    ||-----------------||
                    || 3,6,9,3|2,2,2,2 ||
                    || 6,2,3,8|3,6,3,8 ||
                    ||-----------------||
                where each row is a judge, and each column is an entry
                rows are pipe separated for each entry, 
                and comma separated for score type
                (taste, present, labor, creativity)
            """
            open(PATH + 'sessions/' + sessname + '.txt', 'w').write(
                (
                    ((',,,|' * num_entries)[:-1] + '\n') * num_judges
                )[:-1] # remove last newline
            )
            open(PATH + 'sessions.txt', 'a').write(
                sessname + '>' + request.form.get('session') + '\n'
            )
            return json({
                "msg": "y",
            })
    else:
        return json({
            "msg": "password is invalid"
        })

@app.post('/getsessions')
async def getsessions(request):
    if not request.cookies.get('gpw') == GLOBAL_PASSWORD:
        return json({
            "msg": "i"
        })
    contents = open(PATH + 'sessions.txt', 'r').read().split('\n')
    result = '{PLACEHOLD"data":['
    index = 0
    for i in reversed(contents):
        if index >= 10:
            break;
        if i != '':
            result += i.split('>', 1)[1] + ',"' + (
                open(PATH + 'sessions/' + i.split('>', 1)[0] + '.txt', 'r')
                .read()
                .replace('\n', '&')
            )  + '",'
        index += 1
    result = result[:-1] + ']}'
    result = result.replace(
        'PLACEHOLD',
        '"total":' + str(len(contents) - 1) + ',',
        1
    )
    return json({
        "msg": result
    })

@app.post('/getsession/<sessname:str>')
async def getsession(request, sessname):
    sessname = sessname.replace('%20', ' ')
    if not request.cookies.get('gpw') == GLOBAL_PASSWORD:
        return json({
            "msg": "i",
            "data": "",
        })
    data = helpers.get_session(sessname)
    if data != '':
        return json({
            "msg": "y",
            "data": data,
        })
    return json({
        "msg": "n",
        "data": "",
    })

@app.post('/judge')
async def judge(request):
    if not request.cookies.get('gpw') == GLOBAL_PASSWORD:
        return json({
            "msg": "i",
        })
    if not helpers.checkpw(
        request.cookies.get('username'),
        request.cookies.get('pw'),
    ):
        return json({
            "msg": "invalid credentials. try logging in again"
        })
    data = request.form.get('data')
    session = non_sanic_json.loads(
        helpers.get_session(
            request.form.get('sessname')
        )
    )
    data = data.split('|')
    for i in range(len(data)):
        data[i] = data[i].split(',')
        if len(data[i]) != 4:
            return json({
                "msg": "one or more entries does not have four values",
            })
        for j in range(4):
            data[i][j] = int(data[i][j])
            if data[i][j] > 10:
                return json({
                    "msg": "one or more values above 10",
                })
        data[i][0] = round(data[i][0] * (session['taste'] / 10), 3)
        data[i][1] = round(data[i][1] * (session['present'] / 10), 3)
        data[i][2] = round(data[i][2] * (session['labor'] / 10), 3)
        data[i][3] = round(data[i][3] * (session['creativity'] / 10), 3)
        data[i] = ','.join(str(x) for x in data[i])
    data = '|'.join(data)
    if request.cookies.get('username') in session['judged']:
        return json({
            "msg": "you already judged this session",
        })
    if not request.cookies.get('username') in session['judges']:
        return json({
            "msg": "you're not authorized to judge this session",
        })
    index = session['judges'].index(request.cookies.get('username'))
    f = open(PATH + 'sessions/' + request.form.get('sessname') + '.txt', 'r')
    contents = f.read()
    f.close()
    contents = contents.split('\n')
    contents[index] = data
    print(contents)
    f = open(PATH + 'sessions/' + request.form.get('sessname') + '.txt', 'w')
    f.write('\n'.join(contents))
    f.close()
    session['judged'].append(request.cookies.get('username'))
    contents = open(PATH + 'sessions.txt', 'r').read().split('\n')
    index = 0
    for i in contents:
        if i != '':
            line = i.split('>')
            if line[0] == session['name']:
                line[1] = non_sanic_json.dumps(session)
                contents[index] = '>'.join(line)
                open(PATH + 'sessions.txt', 'w').write(
                    '\n'.join(contents)
                )
                break
        index += 1

    print(non_sanic_json.dumps(session))
    return json({
        "msg": "y",
    })

@app.post('/getsessiondata/<sessname:str>')
async def getsessiondata(request, sessname):
    sessname = sessname.replace('%20', ' ')
    if not request.cookies.get('gpw') == GLOBAL_PASSWORD:
        return json({
            "msg": "i"
        })
    try:
        return json({
            "msg": "y",
            "data": open(
                PATH + 'sessions/' + sessname + '.txt', 'r'
            ).read()
        })
    except:
        return json({
            "msg": "n",
            "data": "",
        });

@app.route('/client/<filename:str>')
async def clientFile(request, filename):
    return await file(PATH + 'client/' + filename)

@app.route('/font/<filename:str>')
async def clientFile(request, filename):
    return await file(PATH + 'client/font/' + filename)

app.run(
    host = '0.0.0.0',
    port = '8444',
    debug = False
)
