function alert(msg) {
    let div = document.createElement('div');
    div.innerHTML = msg;
    div.className = 'alert';
    div.onload = (()=>{
        setTimeout(()=>{
            div.classList.add('alert_fade');
            setTimeout(()=>{
                div.remove();
            }, 500);
        }, 10000);
    })();
    div.onclick = (()=>{
        div.classList.add('alert_fade');
        setTimeout(()=>{
            div.remove();
        }, 500);
    });
    a('alert_container').appendChild(div);
}
