
# dessert contest system backend
# warning, this is a messy file

from sanic import Sanic
from sanic.response import html, file, json, redirect, text
import helpers
import json as non_sanic_json
import time
import os

PATH = __file__[:__file__.rfind('/')+1]

SERVER_CONFIG = non_sanic_json.loads(open(PATH + 'serverconfig.json').read())

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
    chars    = list('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_')
    f = open(PATH + 'users.txt')
    contents = f.read()
    f.close()
    user_list = contents.split('\n')
    for x in user_list:
        if x != '':
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
    f = open(PATH + 'users/' + username + '.json', 'w')
    f.write('{"theme":"dark"}')
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
    if helpers.checkusername(request.form.get('name')):
        return json({
            "msg": "y"
        })
    else:
        return json({
            "msg": "n"
        })

@app.post('/newsession')
# warning, input validation here is
# kind of ugly 
async def newsession(request):
    if not request.cookies.get('gpw') == GLOBAL_PASSWORD:
        return json({
            "msg": "i"
        })
    username = request.form.get('name')
    pw       = request.form.get('pass')
    obj      = {}
    try:
        obj = non_sanic_json.loads(
            request.form.get('session')
        )
        keys = [
            'name',
            'judges',
            'entries',
            'taste',
            'present',
            'labor',
            'creativity',
        ]
        for i in keys:
            if not i in obj:
                return json({
                    "msg": "one or more necesary keys not found in json",
                })
        for i in obj['name']:
            if not i in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_ ,.!?-=':
                return json({
                    "msg": "invalid characters in session name",
                })
        try:
            obj['taste'] = float(obj['taste'])
            obj['present'] = float(obj['present'])
            obj['labor'] = float(obj['labor'])
            obj['creativity'] = float(obj['creativity'])
        except:
            return json({
                "msg": "score weights not convertable to float values"
            })
        obj['total'] = (
            obj['taste'] + 
            obj['present'] +
            obj['labor'] +
            obj['creativity']
        )
        if (
            obj['taste'] <= 0 or 
            obj['present'] <= 0 or
            obj['labor'] <= 0 or
            obj['creativity'] <= 0
        ):
            return json({
                "msg": "score weights must be above zero",
            })
        for i in obj['entries']:
            if not isinstance(i, list):
                return json({
                    "msg": "contents of list `judges` must be arrays"
                })
            if len(i) != 2:
                return json({
                    "msg": "items of list `judges` must be arrays with two items"
                })
        obj['judged'] = []
        if len(obj['judges']) < 1:
            return json({
                "msg": "you must include at least one judge"
            })
        if len(obj['entries']) < 1:
            return json({
                "msg": "you must include at least one entry"
            })
        for i in obj['judges']:
            if not helpers.checkusername(i):
                return json({
                    "msg": "one or more requested judges does not exist"
                })
    except:
        return json({
            "msg": "an error occured while parsing & validating json input, please try again",
        })
    if helpers.checkpw(username, pw):
        try:
            open(PATH + 'sessions/' + obj['name'] + '.txt', 'r')
            return json({
                "msg": "name already in use"
            })
        except:
            sessname    = obj['name']
            num_judges  = len(obj['judges'])
            num_entries = len(obj['entries'])
            obj['createdby'] = username
            obj['timestamp'] = str(time.time())
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
                sessname + '>' + non_sanic_json.dumps(obj) + '\n'
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
    count = int(request.form.get('count'))
    if count > 20:
        count = 20
    startindex = int(request.form.get('startindex'))
    contents = open(PATH + 'sessions.txt', 'r').read().split('\n')
    if contents == ['']:
        return json({
            "msg": non_sanic_json.dumps({
                "total": 0,
                "data": [],
            }),
        })
    if startindex > len(contents) - 1 or count == 0:
        return json({
            "msg": non_sanic_json.dumps({
                "total": str(len(contents) - 1),
                "data": [],
            }),
        })
    if startindex < 0:
        startindex = 0
    result = '{PLACEHOLD"data":['
    index = startindex
    amount = 0
    contents.reverse()
    while True:
        if amount >= count or index > len(contents) - 1:
            break;
        i = contents[index]
        if i != '':
            result += i.split('>', 1)[1] + ',"' + (
                open(PATH + 'sessions/' + i.split('>', 1)[0] + '.txt', 'r')
                .read()
                .replace('\n', '&')
            )  + '",'
            amount += 1
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

@app.post('/getsession')
async def getsession(request):
    sessname = request.form.get('sessname')
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
            data[i][j] = float(data[i][j])
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
    f = open(PATH + 'sessions/' + request.form.get('sessname') + '.txt', 'w')
    f.write('\n'.join(contents))
    f.close()
    session['judged'].append(request.cookies.get('username'))
    contents = open(PATH + 'sessions.txt', 'r').read().split('\n')
    index = 0
    for i in contents:
        if i != '':
            line = i.split('>', 1)
            if line[0] == session['name']:
                line[1] = non_sanic_json.dumps(session)
                contents[index] = '>'.join(line)
                open(PATH + 'sessions.txt', 'w').write(
                    '\n'.join(contents)
                )
                break
        index += 1
    return json({
        "msg": "y",
    })

@app.post('/getsessiondata')
async def getsessiondata(request):
    sessname = request.form.get('sessname')
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

@app.post('/delsession')
async def delsession(request):
    if not request.cookies.get('gpw') == GLOBAL_PASSWORD:
        return json({
            "msg": "i"
        })
    sessname = request.form.get('sessname')
    username = request.cookies.get('username')
    pw = request.cookies.get('pw')
    if not helpers.checkpw(username, pw):
        return json({
            "msg": "n",
        })
    session = non_sanic_json.loads(
        helpers.get_session(sessname)
    )
    if session['createdby'] != username:
        return json({
            "msg": "n"
        })
    f = open(PATH + 'sessions.txt')
    contents = f.read().split('\n')
    f.close()
    index = 0
    for i in contents:
        if i != '':
            line = i.split('>', 1)
            if line[0] == sessname:
                break
        index += 1
    del contents[index]
    f = open(PATH + 'sessions.txt', 'w')
    f.write('\n'.join(contents))
    f.close()
    os.remove(PATH + 'sessions/' + sessname + '.txt')
    return json({
        "msg": "y"
    })

@app.post('/settings')
async def settings(request):
    theme = request.form.get('theme')
    username = request.cookies.get('username')
    pw = request.cookies.get('pw')
    if not helpers.checkpw(username, pw):
        return redirect('/')
    f = open(PATH + 'users/' + username + '.json', 'w')
    f.write(non_sanic_json.dumps({
        "theme": theme,
    }))
    f.close()
    return redirect('/')

@app.get('/client/<filename:str>')
async def clientFile(request, filename):
    return await file(PATH + 'client/' + filename)

@app.get('/font/<filename:str>')
async def clientFont(request, filename):
    return await file(PATH + 'client/font/' + filename)

@app.get('/theme.css')
async def clientStyle(request):
    username = request.cookies.get('username')
    if username is None:
        username = ''
    try:
        usersettings = non_sanic_json.loads(
            open(
                PATH + 'users/' + username + '.json', 'r'
            ).read()
        )
        theme = usersettings['theme']
        response = await file(PATH + 'client/theme/' + theme + '.css')
    except:
        response = await file(PATH + 'client/theme/' + SERVER_CONFIG['default_settings']['theme'] + '.css')
    return response

@app.get('/docs')
async def docs(request):
    return html(
        open(PATH + 'client/docs/index.html', 'r').read()
    )

print()
print(' === starting dcsys === ')
print()

app.run(
    host = SERVER_CONFIG['host'],
    port = SERVER_CONFIG['port'],
    debug = False,
)
