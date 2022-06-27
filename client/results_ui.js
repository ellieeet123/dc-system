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
            let html = '';
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
            a('results_table').innerHTML += html;
        });
    });
}
