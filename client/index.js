setCookie('gpw', getCookie('gpw'), 1 / 12);

if (getCookie('gpw') !== '') {
    request('/checkpw', {
        'pw': getCookie('gpw')
    }).then(result => {
        if (result.msg === 'y') {
            document.getElementById('cover_pw').style.display = 'none';
        }
    })
}

document.getElementById('pw_btn').onclick = () => {
    setCookie('gpw', document.getElementById('pw').value, 1 / 12);
    request('/checkpw', {}).then(result => {
        if (result.msg === 'y') {
            document.getElementById('response').innerHTML = 'Correct';
            document.getElementById('cover_pw').style.display = 'none';
            window.location.reload();
        } else {
            document.getElementById('response').innerHTML = 'Incorrect';
        }
    })
}

// create account
document.getElementById('create_account').onclick = () => {
    document.getElementById('cover_newacc').style.display = 'block';
}
document.getElementById('newacc_cancel').onclick = () => {
    document.getElementById('cover_newacc').style.display = 'none';
}
document.getElementById('newacc_create').onclick = () => {
    document.getElementById('newacc_response').innerHTML = 'please wait...';
    var username = document.getElementById('newacc_username').value;
    var pw1 = document.getElementById('newacc_pw1').value;
    var pw2 = document.getElementById('newacc_pw2').value;
    if (pw1 === pw2) {
        request('/newuser', {
            'name': username,
            'pass': pw1
        }).then(result => {
            if (result.success === 'y') {
                document.getElementById('newacc_response').innerHTML = '';
                alert(result.msg);
                document.getElementById('cover_newacc').style.display = 'none';
            } else {
                document.getElementById('newacc_response').innerHTML = result.msg;
            }
        })
    } else {
        document.getElementById('newacc_response').innerHTML = 'passwords do not match';
    }
}

// sign in
document.getElementById('sign_in').onclick = () => {
    document.getElementById('cover_signin').style.display = 'block';
}
document.getElementById('signin_cancel').onclick = () => {
    document.getElementById('cover_signin').style.display = 'none';
}
document.getElementById('signin_signin').onclick = () => {
    document.getElementById('signin_response').innerHTML = 'please wait...';
    var username = document.getElementById('signin_username').value;
    var pw = document.getElementById('signin_pw').value;
    if (pw !== '' && username !== '') {
        request('/checkuserpw', {
            'name': username,
            'pass': pw
        }).then(result => {
            if (result.msg === 'y') {
                setCookie('username', username, 9999);
                setCookie('pw', pw, 9999);
                document.getElementById('newacc_response').innerHTML = '';
                alert('signed in successfully');
                window.location.reload();
            } else if (result.msg === 'n') {
                document.getElementById('signin_response').innerHTML = 'incorrect username or password';
            } else {
                document.getElementById('gpw_msg').innerHTML = 'global password invalid or expired. please re-enter it below:';
                document.getElementById('cover_pw').style.display = 'block';
                document.getElementById('cover_signin').style.display = 'none';
            }
        })
    } else {
        document.getElementById('signin_response').innerHTML = 'one or both fields is blank';
    }
}

document.getElementById('sign_out').onclick = () => {
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
    document.getElementById('account_signedin').style.display = 'none';
} else {
    document.getElementById('account_notsignedin').style.display = 'none';
    document.getElementById('username').innerHTML = getCookie('username');
}

document.getElementById('session_new').onclick = () => {
    document.getElementById('cover_session').style.display = 'block';
}
sessionUI();

request('/getsessions', {}).then(result => {
    try {
        window.sessions = JSON.parse(result.msg).data;
        window.totalsessions = JSON.parse(result.msg).total;
    } catch (e) {
        window.sessions = [];
        console.log(e, result);
        document.getElementById('session_list').innerHTML = '<p>something went wrong, try reloading</p>';
    }
    window.sessionobject = {};
    for (var i of window.sessions) {
        window.sessionobject[i.name] = i;
    }
    for (var i = 0; i < sessions.length; i++) {
        var session = sessions[i];
        document.getElementById('session_list').innerHTML += `
<div class="session">
<p style="color: var(--accent)">${session.name}</p>
<p> | </p>
<p style="color: var(--accent_blue)">${(()=>{
    return "status";
})()}</p>
<button onclick="(()=>{judge('${session.name}')})()">judge</button>
</div>
    `;
    }
    if (window.totalsessions > 10) {
        document.getElementById('session_list').innerHTML += 'note: some sessions are not shown due to there being too many.';
    }
});
