setCookie('gpw', getCookie('gpw'), 1 / 12);

if (getCookie('gpw') !== '') {
    request('/checkpw', {
        'pw': getCookie('gpw')
    }).then(result => {
        if (result.msg === 'y') {
            a('cover_pw').style.display = 'none';
            a('main').style.display = 'flex';
        }
    })
}

a('pw_btn').onclick = () => {
    setCookie('gpw', a('pw').value, 1 / 12);
    request('/checkpw', {}).then(result => {
        if (result.msg === 'y') {
            a('response').innerHTML = 'Correct';
            a('cover_pw').style.display = 'none';
            a('main').style.display = 'flex';
            window.location.reload();
        } else {
            a('response').innerHTML = 'Incorrect';
        }
    })
}

// create account
a('create_account').onclick = () => {
    a('cover_newacc').style.display = 'block';
    a('main').style.display = 'none';
}
a('newacc_cancel').onclick = () => {
    a('cover_newacc').style.display = 'none';
    a('main').style.display = 'flex';
}
a('newacc_create').onclick = () => {
    a('newacc_response').innerHTML = 'please wait...';
    var username = a('newacc_username').value.toLowerCase();
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
                a('main').style.display = 'flex';
                setCookie('username', username, 9999);
                setCookie('pw', pw1, 9999);
                window.location.reload();
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
    a('main').style.display = 'none';
}
a('signin_cancel').onclick = () => {
    a('cover_signin').style.display = 'none';
    a('main').style.display = 'flex';
}
a('signin_signin').onclick = () => {
    a('signin_response').innerHTML = 'please wait...';
    var username = a('signin_username').value.toLowerCase();
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
    a('settings_wrapper').innerHTML = 'please sign in to change settings<br>';
} else {
    a('account_notsignedin').style.display = 'none';
    a('username').innerHTML = getCookie('username');
}

a('session_new').onclick = () => {
    if (getCookie('username') === '') {
        alert('please sign in');
    } else {
        a('cover_session').style.display = 'block';
        a('main').style.display = 'none';
    }
}
sessionUI();
updateSessionList(0);
