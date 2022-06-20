function a(id) {
    return document.getElementById(id);
}

function submit() {
    judgedata[current_judge_entry - 1] = [
        Number(a('judge_taste').value),
        Number(a('judge_present').value),
        Number(a('judge_labor').value),
        Number(a('judge_present').value),
    ]
    if (!confirm("are you sure? you can't change your scores after this.")) {
        return;
    }
    let data = [];
    for (let i = 0; i < judgedata.length; i++) {
        let sum = 0;
        for (let j = 0; j < judgedata[i].length; j++) {
            sum += judgedata[i][j];
        }
        data.push(sum);
    }
    console.log(data);
    request('/judge', {
        'data': String([])
    }).then(r => {
        console.log(r);
    })
}

function disp(sessiondata, num) {
    a('judge_input_container').innerHTML = `
    <p>session: ${sessiondata.name}</p>
    <p>entry number: ${num}</p>
    <p style="color:var(--accent)">${sessiondata.entries[num - 1][1]} made by ${sessiondata.entries[num - 1][0]}</p>
    <span>taste (0-${sessiondata.taste}):</span>
    <br>
    <input type="number" id="judge_taste" value="${judgedata[num - 1][0]}">
    <br>
    <span>presentation (0-${sessiondata.present}):</span>
    <br>
    <input type="number" id="judge_present" value="${judgedata[num - 1][1]}">
    <br>
    <span>labor (0-${sessiondata.labor}):</span>
    <br>
    <input type="number" id="judge_labor" value="${judgedata[num - 1][2]}">
    <br>
    <span>creativity: (0-${sessiondata.creativity})</span>
    <br>
    <input type="number" id="judge_creativity" value="${judgedata[num - 1][3]}">
    <br>
    ${(num => {
        return num === window.entry_num ? '<button onclick="submit()">finish</button>' : ''
    })(num)}
`
}

function judge(name) {
    var session = window.sessionobject[name];
    console.log(session.name);
    if (!session) {
        alert('session not found');
        return;
    }
    request('/checkuserpw', {
        name: getCookie('username'),
        pass: getCookie('pw'),
    }).then(result => {
        if (result.msg === 'n') {
            alert('please sign in');
            return;
        }
    });
    let sessiondata;
    request('/getsession/' + session.name).then(r => {
        if (r.msg === 'y') {
            sessiondata = JSON.parse(r.data);
            console.log(sessiondata);
            window.current_judge_entry = 1;
            window.entry_num = session.entries.length;
            window.sessiondata = sessiondata;
            let judgedata = [];
            for (let i = 0; i < session.entries.length; i++) {
                judgedata.push([]);
            }
            window.judgedata = judgedata;
            a('judge_left').onclick = () => {
                if (current_judge_entry > 1) {
                    judgedata[current_judge_entry - 1] = [
                        Number(a('judge_taste').value),
                        Number(a('judge_present').value),
                        Number(a('judge_labor').value),
                        Number(a('judge_present').value),
                    ]
                    current_judge_entry--;
                    disp(window.sessiondata, current_judge_entry);
                }
            }
            a('judge_right').onclick = () => {
                if (current_judge_entry < entry_num) {
                    judgedata[current_judge_entry - 1] = [
                        Number(a('judge_taste').value),
                        Number(a('judge_present').value),
                        Number(a('judge_labor').value),
                        Number(a('judge_present').value),
                    ]
                    current_judge_entry++;
                    disp(window.sessiondata, current_judge_entry);
                }
            }
            disp(sessiondata, 1);
            a('cover_judge').style.display = 'block';
        } else {
            alert('something went wrong, please try again.');
            return;
        }
    });
}
