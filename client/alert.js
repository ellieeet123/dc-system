function alert(msg) {
    let div = document.createElement('div');
    div.innerHTML = msg;
    div.className = 'alert';
    a('alert_container').appendChild(div);
}
