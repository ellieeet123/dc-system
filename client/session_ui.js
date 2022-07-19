function a(id) {
    return document.getElementById(id);
}

function updateSessionRequestedUsersList() {
    a('session_addedusers').innerHTML = '';
    for (let i of window.requestedSessionUserList) {
        let p = document.createElement('p');
        p.innerHTML = i;
        a('session_addedusers').appendChild(p);
    }
}

function getTotalScore() {
    return (
        Number(a('session_taste').value) + 
        Number(a('session_present').value) + 
        Number(a('session_labor').value) +
        Number(a('session_creativity').value)
    )
}
    
function setTotalScore() {
    a('session_total').innerHTML = getTotalScore();
}
    
function sessionUI() {
    window.requestedSessionUserList = [];
    a('session_cancel').onclick = () => {
        a('cover_session').style.display = 'none';
        a('main').style.display = 'flex';
    }
    a('session_create').onclick = () => {
        let entries = [];
        for (let i = 0; i < document.getElementsByClassName('session_entryname').length; i++) {
            entries.push([
                document.getElementsByClassName('session_entryname')[i].value,
                document.getElementsByClassName('session_entryentry')[i].value
            ])
        };
        let str = JSON.stringify({
            name: a('session_name').value,
            judges: window.requestedSessionUserList,
            taste: Number(a('session_taste').value),
            present: Number(a('session_present').value),
            labor: Number(a('session_labor').value),
            creativity: Number(a('session_creativity').value),
            total: getTotalScore(),
            num_entries: Number(a('session_numentries').value),
            entries: entries,
            judged: [],
        });
        console.log(str);
        request('/newsession', {
            session: str,
            session_name: a('session_name').value,
            name: getCookie('username'),
            pass: getCookie('pw'),
        }).then(result => {
            if (result.msg === 'y') {
                alert('Session created');
                updateSessionList();
                a('cover_session').style.display = 'none';
                a('main').style.display = 'flex';
            } else if (result.msg === 'i') {
                alert('global password invalid or expired');
            } else {
                alert(`an error occured! message from server: \n\n${result.msg}`);
            }
        });
    }
    a('session_taste').onchange = setTotalScore;
    a('session_present').onchange = setTotalScore;
    a('session_labor').onchange = setTotalScore;
    a('session_creativity').onchange = setTotalScore;
    a('session_requestuserbtn').onclick = () => {
        if (
            !(window.requestedSessionUserList.includes(
                a('session_requestuser').value.toLowerCase()
            ))
        ) {
            request('/checkusername', {
                'name': a('session_requestuser').value.toLowerCase(),
            }).then(result => {
                if (result.msg === 'y') {
                    a('session_adduserresponse').innerHTML = '';
                    window.requestedSessionUserList.push(
                            a('session_requestuser').value.toLowerCase()
                        );
                        a('session_requestuser').value = '';
                        updateSessionRequestedUsersList();
                } else if (result.msg === 'n') {
                    a('session_adduserresponse').innerHTML = 'user not found';
                } else {
                    a('gpw_msg').innerHTML = 'global password invalid or expired. please re-enter it below:';
                    a('cover_pw').style.display = 'block';
                    a('cover_session').style.display = 'none';
                }
            })
        }
    }
    a('session_numentries').onchange = () => {
        a('session_entry_wrapper').innerHTML = '';
        for (let i = 0; i < Number(a('session_numentries').value); i++) {
            a('session_entry_wrapper').innerHTML += `
            <div class="session_entry">
            <span>entry number ${i + 1}</span>
            <br>
            <span>name: </span>
            <br>
            <input type="text" class="session_entryname">
            <br>
            <span>entry: </span>
            <br>
            <input type="text" class="session_entryentry">
            </div>
            <br>`
        }
    }
}

function delsession(name) {
    if (confirm(`are you sure you want to delete session [${name}]? this can't be undone.`)) {
        request('/delsession', {
            sessname: name,
        }).then(r => {
            if (r.msg === 'y') {
                alert(`successfully deleted session [${name}]`);
            } else if (r.msg === 'n') {
                alert(`error deleting session [${name}], likely due to invalid login`);
            } else {
                alert(`error deleting session [${name}], unknown reason`);
            }
            updateSessionList();
        })
    }
}

function updateSessionList() {
    request('/getsessions', {
        startindex: 0,
        count: 10,
    }).then(result => {
        try {
            window.sessions = JSON.parse(result.msg).data;
            window.totalsessions = JSON.parse(result.msg).total;
        } catch (e) {
            window.sessions = [];
            console.log(e, result);
            a('session_list').innerHTML = '<p>something went wrong, try reloading</p>';
        }
        if (totalsessions === 0) {
            a('session_list').innerHTML = '<p style="color: var(--accent2)">no sessions found</p>';
            return;
        }
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
            sessiondata[session.name] = data;
            let status = '';
            if (!session.judges.includes(getCookie('username'))) {
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
    <p style="color: var(--accent1)">${session.name}</p>
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
                color = '--accent3';
                break;
            case "open":
                color = '--accent2';
                btn = `<button onclick="(()=>{judge('${session.name}')})()">judge</button>`;
                break;
            case "waiting":
                color = '--accent4';
                break;
            case "done":
                color = '--accent1';
                btn = `<button onclick="(()=>{results('${session.name}', false)})()">results</button>`;
                break;
            default:
                // this shouldn't happen
                break;
        }
        if (status !== 'unauth') {
            btn += `<button onclick="details('${session.name}')">details</button>`;
        }
        if (session.createdby === getCookie('username')) {
            btn += `<button class="danger" onclick="delsession('${session.name}')">del</button>`
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
}
