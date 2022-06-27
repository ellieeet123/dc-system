function sumOfList(list) {
    let sum = 0;
    for (let i in list) {
        sum += list[i] * 100;
    }
    return sum / 100;
}

function results(name) {
    a('cover_results').style.display = 'block';
    a('results_close').onclick = () => {
        a('cover_results').style.display = 'none';
    }
    request('/getsession/' + name, {}).then(r => {
        var session = JSON.parse(r.data);
        request('/getsessiondata/' + name, {}).then(r => {
            var data = parsedata(r.data);
            console.log(session);
            console.log(data);
            var entries = [];
            for (let i in session.entries) {
                d = JSON.parse(JSON.stringify(data)); // deep copy
                for (let j = 0; j < d.length; j++) {
                    for (let k = 0; k < d[j].length; k++) {
                        d[j][k] = sumOfList(d[j][k]);
                    }
                }
                let scoreslist = [];
                for (let j = 0; j < d[0].length; j++) {
                    scoreslist.push(d[j][i]);
                }
                entries.push({
                    name: session.entries[i][0],
                    entry: session.entries[i][1],
                    score: sumOfList(scoreslist),
                });
            }
            entries.sort((a, b) => {
                return b.score - a.score;
            });
            let html = `<table id="results_table">
            <tr class="header">
                <th>place</th>
                <th>name</th>
                <th>entry</th>
                <th>score/${session.total * session.judges.length}</th>
            </tr>`;
            for (let i in entries) {
                html += `
                    <tr>
                        <td>${parseInt(i) + 1}</td>
                        <td>${entries[i].name}</td>
                        <td>${entries[i].entry}</td>
                        <td>${entries[i].score}</td>
                    </tr>
                `;
            }
            html += `</table>
            <p>maximum scores</p>
            <table>
                <tr class="header">
                    <th>taste</th>
                    <th>presentation</th>
                    <th>labor</th>
                    <th>creativity</th>
                    <th>total</th>
                </tr>
                <tr>
                    <td>${session.taste}</td>
                    <td>${session.present}</td>
                    <td>${session.labor}</td>
                    <td>${session.creativity}</td>
                    <td>${session.total}</td>
                </tr>
            </table>
            `;
            let temphtml = ``;
            for (let i in session.judges) {
                temphtml += `
                <p>score breakdown: 
                    <span style="color: var(--accent)">
                        ${session.judges[i]}
                    </span>
                </p>
                <table>
                <tr class="header">
                    <th>name</th>
                    <th>entry</th>
                    <th>taste</th>
                    <th>present.</th>
                    <th>labor</th>
                    <th>creat.</th>
                    <th>total</th>
                </tr>
                `;
                for (let j in entries) {
                    temphtml += `
                        <tr>
                            <td>${entries[j].name}</td>
                            <td>${entries[j].entry}</td>
                            <td>${data[i][j][0]}</td>
                            <td>${data[i][j][1]}</td>
                            <td>${data[i][j][2]}</td>
                            <td>${data[i][j][3]}</td>
                            <td>${
                                data[i][j][0] + 
                                data[i][j][1] + 
                                data[i][j][2] + 
                                data[i][j][3]
                            }</td>
                        </tr>
                    `;
                }
                temphtml += `</table><br>`;
            }
            html += temphtml;
            a('results_wrapper').innerHTML = html;
            a('results_title').innerHTML = `
                results for session <span style="color: var(--accent)">${session.name}</span>
            `;
        });
    });
}
