function parsedata(data) {
    data = data.split('\n');
    for (let i in data) {
        data[i] = data[i].split('|');
        for (let j in data[i]) {
            data[i][j] = data[i][j].split(',');
            for (let k in data[i][j]) {
                data[i][j][k] = parseFloat(data[i][j][k]);
            }
        }
    }
    return data;
}
