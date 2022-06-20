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
        });
        console.log(str);
        request('/newsession', {
            session: str,
            session_name: a('session_name').value,
            name: getCookie('username'),
            pass: getCookie('pw'),
        }).then(result => {
            console.log(result);
            if (result.msg === 'y') {
                a('cover_session').style.display = 'none';
                alert('Session created');
            } else if (result.msg === 'i') {
                alert('global password invalid or expired');
            } else {
                alert(`a problem happened: ${result.msg}`);
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
                a('session_requestuser').value
            ))
        ) {
            request('/checkusername', {
                'name': a('session_requestuser').value,
            }).then(result => {
                if (result.msg === 'y') {
                    a('session_adduserresponse').innerHTML = '';
                    window.requestedSessionUserList.push(
                            a('session_requestuser').value
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
