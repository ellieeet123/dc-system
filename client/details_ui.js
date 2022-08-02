function details(name) {
    a('details_close').onclick = () => {
        a('cover_details').style.display = 'none';
        a('main').style.display = 'flex';
    }
    request('/getsession', {
        sessname: name,
    }).then(r => {
        if (r.msg !== 'y') {
            alert('something went wrong, please try again');
            return;
        }
        var session = JSON.parse(r.data);
        a('details_title').innerHTML = `
        details for session
        <span style="color: var(--accent1)">${session.name}</span>
        `;
        var html = `
        <p>created by: <span class=c>${session.createdby}</p>
        <p>created on: <span class=c>${
            // awful conversion of python time.time() to js date
            new Date(
                parseInt(
                    parseFloat(
                        session.timestamp
                    ).toFixed(3).replace('.', '')
                )
            ).toString().replace(
                /\(.+\)/g, 
                ''
            )
        }</p>
        <p>taste weight: <span class=c>${session.taste}</p>
        <p>presentation weight: <span class=c>${session.present}</p>
        <p>labor weight: <span class=c>${session.labor}</p>
        <p>creativity weight: <span class=c>${session.creativity}</p>
        <p>total score: <span class=c>${session.total}</p>
        <p>entries</p>
        `;
        var table = `
        <table>
            <tr>
                <th>name</th>
                <th>entry</th>
            </tr>`;
        for (var i of session.entries) {
            table += `
            <tr>
                <td>${i[0]}</td>
                <td>${i[1]}</td>
            </tr>`;
        }
        table += '</table>';
        html += table;
        html += '<p>judges</p>'
        table = `
        <table>
            <tr>
                <th>haven't judged</th>
                <th>have judged</th>
            </tr>`;
        let judges = [];
        let judged = [];
        for (let i in session.judges) {
            if (
                session.judged.includes(
                    session.judges[i]
                )
            ) {
                judged.push(session.judges[i]);
            } else {
                judges.push(session.judges[i]);
            }
        }
        for (let i = 0; true; i++) {
            if (
                judges[i] === undefined &&
                judged[i] === undefined
            ) {
                break;
            }
            table += `
            <tr>
                <td>${judges[i] ? judges[i] : ''}</td>
                <td>${judged[i] ? judged[i] : ''}</td>
            </tr>
            `;
        }
        table += '</table>';
        html += table;
        if (settings.show_json) {
            html += `<br>
            <span>raw session JSON</span><br>
            <div id="raw_json">
                <code>${JSON.stringify(session)}</code>
            </div>
            `;
        }
        a('details_wrapper').innerHTML = html;
        a('cover_details').style.display = 'block';
        a('main').style.display = 'none';
    });
}
