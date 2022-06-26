setCookie('gpw', getCookie('gpw'), 1 / 12);

if (getCookie('gpw') !== '') {
    request('/checkpw', {
        'pw': getCookie('gpw')
    }).then(result => {
        if (result.msg === 'y') {
            a('cover_pw').style.display = 'none';
        }
    })
}

a('pw_btn').onclick = () => {
    setCookie('gpw', a('pw').value, 1 / 12);
    request('/checkpw', {}).then(result => {
        if (result.msg === 'y') {
            a('response').innerHTML = 'Correct';
            a('cover_pw').style.display = 'none';
            window.location.reload();
        } else {
            a('response').innerHTML = 'Incorrect';
        }
    })
}

// create account
a('create_account').onclick = () => {
    a('cover_newacc').style.display = 'block';
}
a('newacc_cancel').onclick = () => {
    a('cover_newacc').style.display = 'none';
}
a('newacc_create').onclick = () => {
    a('newacc_response').innerHTML = 'please wait...';
    var username = a('newacc_username').value;
    var pw1 = a('newacc_pw1').value;
    var pw2 = a('newacc_pw2').value;
    if (pw1 === pw2) {
        request('/newuser', {
            'name': username,
            'pass': pw1
        }).then(result => {
            if (result.success === 'y') {
                a('newacc_response').innerHTML = '';
                alert(result.msg);
                a('cover_newacc').style.display = 'none';
            } else {
                a('newacc_response').innerHTML = result.msg;
            }
        })
    } else {
        a('newacc_response').innerHTML = 'passwords do not match';
    }
}

// sign in
a('sign_in').onclick = () => {
    a('cover_signin').style.display = 'block';
}
a('signin_cancel').onclick = () => {
    a('cover_signin').style.display = 'none';
}
a('signin_signin').onclick = () => {
    a('signin_response').innerHTML = 'please wait...';
    var username = a('signin_username').value;
    var pw = a('signin_pw').value;
    if (pw !== '' && username !== '') {
        request('/checkuserpw', {
            'name': username,
            'pass': pw
        }).then(result => {
            if (result.msg === 'y') {
                setCookie('username', username, 9999);
                setCookie('pw', pw, 9999);
                a('newacc_response').innerHTML = '';
                alert('signed in successfully');
                window.location.reload();
            } else if (result.msg === 'n') {
                a('signin_response').innerHTML = 'incorrect username or password';
            } else {
                a('gpw_msg').innerHTML = 'global password invalid or expired. please re-enter it below:';
                a('cover_pw').style.display = 'block';
                a('cover_signin').style.display = 'none';
            }
        })
    } else {
        a('signin_response').innerHTML = 'one or both fields is blank';
    }
}

a('sign_out').onclick = () => {
    setCookie('username', '', 9999);
    setCookie('pw', '', 9999);
    window.location.reload();
}

request('/checkuserpw', {
    'name': getCookie('username'),
    'pass': getCookie('pw')
}).then(result => {
    if (result.msg === 'n') {
        // signs the user out if login is invalid
        setCookie('username', '', 9999);
        setCookie('pw', '', 9999);
    }
})

if (getCookie('username') === '') {
    // hasn't signed in
    a('account_signedin').style.display = 'none';
} else {
    a('account_notsignedin').style.display = 'none';
    a('username').innerHTML = getCookie('username');
}

a('session_new').onclick = () => {
    a('cover_session').style.display = 'block';
}
sessionUI();

request('/getsessions', {}).then(result => {
    try {
        window.sessions = JSON.parse(result.msg).data;
        window.totalsessions = JSON.parse(result.msg).total;
    } catch (e) {
        window.sessions = [];
        console.log(e, result);
        a('session_list').innerHTML = '<p>something went wrong, try reloading</p>';
    }
    console.log(sessions);
    let newsessions = [];
    window.sessiondata = {};
    for (let i = 0; i < sessions.length; i += 2) {
        newsessions.push(sessions[i]);
        sessiondata[sessions[i].name] = sessions[i + 1];
    }
    sessions = newsessions;
    a('session_list').innerHTML = '';
    window.sessionobject = {};
    for (var i of window.sessions) {
        window.sessionobject[i.name] = i;
    }
    for (var i = 0; i < sessions.length; i++) {
        var session = sessions[i];
        data = sessiondata[session.name].split('&');
        for (let i in data) {
            data[i] = data[i].split('|');
            for (let j in data[i]) {
                data[i][j] = data[i][j].split(',');
                for (let k in data[i][j]) {
                    data[i][j][k] = parseFloat(data[i][j][k]);
                }
            }
        }
        console.log(data);
        sessiondata[session.name] = data;
        let status = '';
        let index = session.judges.indexOf(getCookie('username'));
        if (index === -1) {
            status = "unauth"
        }
        else if (session.judged.indexOf(getCookie('username')) === -1) {
            status = "open"
        }
        else if (
            session.judged.includes(getCookie('username')) 
            && session.judges.length !== session.judged.length
        ) {
            status = "waiting"
        } else {
            status = "done";
        }
        a('session_list').innerHTML += `
<div class="session">
<p style="color: var(--accent)">${session.name}</p>
<p> | </p>
<p style="color: var(${(() => {
    /*
    status codes:
        unauth = not authorized to judge this session
        open = waiting for user to judge this session
        waiting = user has judged this session, but waiting for others to do the same
        done = all users have judged this session
    */
    let color = '';
    let btn = '';
    switch (status) {
        case "unauth":
            color = '--accent_red';
            break;
        case "open":
            color = '--accent_blue';
            btn = `<button onclick="(()=>{judge('${session.name}')})()">judge</button>`;
            break;
        case "waiting":
            color = '--accent_purple';
            break;
        case "done":
            color = '--accent';
            btn = `<button onclick="(()=>{results('${session.name}')})()">view results</button>`;
            break;
        default:
            // this shouldn't happen
            break;
    }
    return color + ')">' + status + '</p>' + btn;
})()}
</div>
    `;
    }
    if (window.totalsessions > 10) {
        a('session_list').innerHTML += 'note: some sessions are not shown due to there being too many.';
    }
});
