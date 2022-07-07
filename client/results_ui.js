function sumOfList(list) {
    let sum = 0;
    for (let i in list) {
        sum += list[i] * 100;
    }
    return sum / 100;
}

// mind the ugly round-off error prevention

function weightTaste(session, num) {
    return (num * 1000) / (session.taste * 1000 / 10000) / 1000;
}

function weightPresent(session, num) {
    return (num * 1000) / (session.present * 1000 / 10000) / 1000;
}

function weightLabor(session, num) {
    return (num * 1000) / (session.labor * 1000 / 10000) / 1000;
}

function weightCreativity(session, num) {
    return (num * 1000) / (session.creativity * 1000 / 10000) / 1000;
}

function results(name, weighted) {
    window.resultsName = name;
    a('cover_results').style.display = 'block';
    a('main').style.display = 'none';
    a('results_close').onclick = () => {
        a('cover_results').style.display = 'none';
        a('main').style.display = 'flex';
    }
    request('/getsession', {
        sessname: name
    }).then(r => {
        var session = JSON.parse(r.data);
        request('/getsessiondata', {
            sessname: name
        }).then(r => {
            var data = parsedata(r.data);
            console.log(session);
            var entries = [];
            for (let i in session.entries) {
                d = JSON.parse(JSON.stringify(data)); // deep copy
                // turn 3d list into 2d list of total entry scores
                for (let j = 0; j < d.length; j++) {
                    for (let k = 0; k < d[j].length; k++) {
                        d[j][k] = sumOfList(d[j][k]);
                    }
                }
                let scoreslist = [];
                for (let j = 0; j < d.length; j++) {
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
                    <td>${!weighted ? session.taste      : 10}</td>
                    <td>${!weighted ? session.present    : 10}</td>
                    <td>${!weighted ? session.labor      : 10}</td>
                    <td>${!weighted ? session.creativity : 10}</td>
                    <td>${!weighted ? session.total      : 40}</td>
                </tr>
            </table>
            `;
            a('weighted_scores_label').onclick = () => {
                a('results_showweighted').checked ^= 1; // toggle
                results(window.resultsName, a('results_showweighted').checked);
            }
            let temphtml = ``;
            for (let i in session.judges) {
                temphtml += `
                <p>score breakdown: 
                    <span style="color: var(--accent1)">
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
                            <td>${(()=>{
                                if (weighted) {
                                    return weightTaste(session, data[i][j][0]);
                                }
                                return data[i][j][0];
                            })()}</td>
                            <td>${(()=>{
                                if (weighted) {
                                    return weightPresent(session, data[i][j][1]);
                                }
                                return data[i][j][1];
                            })()}</td>
                            <td>${(()=>{
                                if (weighted) {
                                    return weightLabor(session, data[i][j][2]);
                                }
                                return data[i][j][2];
                            })()}</td>
                            <td>${(()=>{
                                if (weighted) {
                                    return weightCreativity(session, data[i][j][3]);
                                }
                                return data[i][j][3];
                            })()}</td>
                            <td>${
                                (()=>{
                                    if (weighted) {
                                        return (
                                            weightTaste(session, data[i][j][0]) + 
                                            weightPresent(session, data[i][j][1]) + 
                                            weightLabor(session, data[i][j][2]) + 
                                            weightCreativity(session, data[i][j][3])
                                        );
                                    }
                                    return sumOfList(data[i][j]);
                                })()
                            }</td>
                        </tr>
                    `;
                }
                temphtml += `</table><br>`;
            }
            html += temphtml;
            a('results_wrapper').innerHTML = html;
            a('results_title').innerHTML = `
                results for session <span style="color: var(--accent1)">${session.name}</span>
            `;
        });
    });
}
