function a(a){return document.getElementById(a)}function updateSessionRequestedUsersList(){a("session_addedusers").innerHTML="";for(let b of window.requestedSessionUserList){let c=document.createElement("p");c.innerHTML=b,a("session_addedusers").appendChild(c)}}function getTotalScore(){return+a("session_taste").value+ +a("session_present").value+ +a("session_labor").value+ +a("session_creativity").value}function setTotalScore(){a("session_total").innerHTML=getTotalScore()}function sessionUI(){window.requestedSessionUserList=[],a("session_cancel").onclick=()=>{a("cover_session").style.display="none",a("main").style.display="flex"},a("session_create").onclick=()=>{let b=[];for(let a=0;a<document.getElementsByClassName("session_entryname").length;a++)b.push([document.getElementsByClassName("session_entryname")[a].value,document.getElementsByClassName("session_entryentry")[a].value]);let c=JSON.stringify({name:a("session_name").value,judges:window.requestedSessionUserList,taste:+a("session_taste").value,present:+a("session_present").value,labor:+a("session_labor").value,creativity:+a("session_creativity").value,total:getTotalScore(),num_entries:+a("session_numentries").value,entries:b,judged:[]});console.log(c),request("/newsession",{session:c,session_name:a("session_name").value,name:getCookie("username"),pass:getCookie("pw")}).then(b=>{"y"===b.msg?(alert("Session created"),updateSessionList(),a("cover_session").style.display="none",a("main").style.display="flex"):"i"===b.msg?alert("global password invalid or expired"):alert(`an error occured! message from server: \n\n${b.msg}`)})},a("session_taste").onchange=setTotalScore,a("session_present").onchange=setTotalScore,a("session_labor").onchange=setTotalScore,a("session_creativity").onchange=setTotalScore,a("session_requestuserbtn").onclick=()=>{window.requestedSessionUserList.includes(a("session_requestuser").value.toLowerCase())||request("/checkusername",{name:a("session_requestuser").value.toLowerCase()}).then(b=>{"y"===b.msg?(a("session_adduserresponse").innerHTML="",window.requestedSessionUserList.push(a("session_requestuser").value.toLowerCase()),a("session_requestuser").value="",updateSessionRequestedUsersList()):"n"===b.msg?a("session_adduserresponse").innerHTML="user not found":(a("gpw_msg").innerHTML="global password invalid or expired. please re-enter it below:",a("cover_pw").style.display="block",a("cover_session").style.display="none")})},a("session_numentries").onchange=()=>{a("session_entry_wrapper").innerHTML="";for(let b=0;b<+a("session_numentries").value;b++)a("session_entry_wrapper").innerHTML+=`<div class="session_entry"><span>entry number ${b+1}</span><br><span>name: </span><br><input type="text" class="session_entryname"><br><span>entry: </span><br><input type="text" class="session_entryentry"></div><br>`}}function delsession(a){confirm(`are you sure you want to delete session [${a}]? this can't be undone.`)&&request("/delsession",{sessname:a}).then(b=>{"y"===b.msg?alert(`successfully deleted session [${a}]`):"n"===b.msg?alert(`error deleting session [${a}], likely due to invalid login`):alert(`error deleting session [${a}], unknown reason`),updateSessionList()})}function updateSessionList(){request("/getsessions",{startindex:0,count:10}).then(b=>{try{window.sessions=JSON.parse(b.msg).data,window.totalsessions=JSON.parse(b.msg).total}catch(c){window.sessions=[],console.log(c,b),a("session_list").innerHTML="<p>something went wrong, try reloading</p>"}if(0===totalsessions)return void(a("session_list").innerHTML="<p style=\"color: var(--accent2)\">no sessions found</p>");let c=[];window.sessiondata={};for(let a=0;a<sessions.length;a+=2)c.push(sessions[a]),sessiondata[sessions[a].name]=sessions[a+1];sessions=c,a("session_list").innerHTML="",window.sessionobject={};for(var e of window.sessions)window.sessionobject[e.name]=e;for(var f,e=0;e<sessions.length;e++){for(let a in f=sessions[a],data=sessiondata[f.name].split("&"),data)for(let b in data[a]=data[a].split("|"),data[a])for(let c in data[a][b]=data[a][b].split(","),data[a][b])data[a][b][c]=parseFloat(data[a][b][c]);sessiondata[f.name]=data;let b="";b=f.judges.includes(getCookie("username"))?-1===f.judged.indexOf(getCookie("username"))?"open":f.judged.includes(getCookie("username"))&&f.judges.length!==f.judged.length?"waiting":"done":"unauth",a("session_list").innerHTML+=`<div class="session"><p style="color: var(--accent1)">${f.name}</p><p> | </p><p style="color: var(${(()=>{let a="",c="";switch(b){case"unauth":a="--accent3";break;case"open":a="--accent2",c=`<button onclick="(()=>{judge('${f.name}')})()">judge</button>`;break;case"waiting":a="--accent4";break;case"done":a="--accent1",c=`<button onclick="(()=>{results('${f.name}', false)})()">results</button>`;break;default:}return"unauth"!==b&&(c+=`<button onclick="details('${f.name}')">details</button>`),f.createdby===getCookie("username")&&(c+=`<button class="danger" onclick="delsession('${f.name}')">del</button>`),a+")\">"+b+"</p>"+c})()}</div>`}10<window.totalsessions&&(a("session_list").innerHTML+="note: some sessions are not shown due to there being too many.")})}function details(b){a("details_close").onclick=()=>{a("cover_details").style.display="none",a("main").style.display="flex"},request("/getsession",{sessname:b}).then(b=>{if("y"!==b.msg)return void alert("something went wrong, please try again");var c=JSON.parse(b.data);console.log(c),a("details_title").innerHTML=`details for session<span style="color: var(--accent1)">${c.name}</span>`;var e=`<p>created by: <span class=c>${c.createdby}</p><p>created on: <span class=c>${new Date(parseInt(parseFloat(c.timestamp).toFixed(3).replace(".",""))).toString().replace(/\(.+\)/g,"")}</p><p>taste weight: <span class=c>${c.taste}</p><p>presentation weight: <span class=c>${c.present}</p><p>labor weight: <span class=c>${c.labor}</p><p>creativity weight: <span class=c>${c.creativity}</p><p>total score: <span class=c>${c.total}</p><p>entries</p>`,f=`<table><tr><th>name</th><th>entry</th></tr>`;for(var g of c.entries)f+=`<tr><td>${g[0]}</td><td>${g[1]}</td></tr>`;f+="</table>",e+=f,e+="<p>judges</p>",f=`<table><tr><th>haven't judged</th><th>have judged</th></tr>`;let h=[],j=[];for(let a in c.judges)c.judged.includes(c.judges[a])?j.push(c.judges[a]):h.push(c.judges[a]);for(let a=0;!0&&!(h[a]===void 0&&j[a]===void 0);a++)f+=`<tr><td>${h[a]?h[a]:""}</td><td>${j[a]?j[a]:""}</td></tr>`;f+="</table>",e+=f,a("details_wrapper").innerHTML=e,a("cover_details").style.display="block",a("main").style.display="none"})}function sumOfList(a){let b=0;for(let c in a)b+=100*a[c];return b/100}function weightTaste(a,b){return 1e3*b/(1e3*a.taste/1e4)/1e3}function weightPresent(a,b){return 1e3*b/(1e3*a.present/1e4)/1e3}function weightLabor(a,b){return 1e3*b/(1e3*a.labor/1e4)/1e3}function weightCreativity(a,b){return 1e3*b/(1e3*a.creativity/1e4)/1e3}function results(b,c){window.resultsName=b,a("cover_results").style.display="block",a("main").style.display="none",a("results_close").onclick=()=>{a("cover_results").style.display="none",a("main").style.display="flex"},request("/getsession",{sessname:b}).then(e=>{var f=JSON.parse(e.data);request("/getsessiondata",{sessname:b}).then(b=>{var e=parsedata(b.data);console.log(f);var g=[];for(let a in f.entries){d=JSON.parse(JSON.stringify(e));for(let a=0;a<d.length;a++)for(let b=0;b<d[a].length;b++)d[a][b]=sumOfList(d[a][b]);let b=[];for(let c=0;c<d.length;c++)b.push(d[c][a]);g.push({name:f.entries[a][0],entry:f.entries[a][1],score:sumOfList(b)})}g.sort((c,a)=>a.score-c.score);let h=`<table id="results_table"><tr class="header"><th>place</th><th>name</th><th>entry</th><th>score/${f.total*f.judges.length}</th></tr>`;for(let a in g)h+=`<tr><td>${parseInt(a)+1}</td><td>${g[a].name}</td><td>${g[a].entry}</td><td>${g[a].score.toPrecision(3).replace(/\.0+/g,"")}</td></tr>`;h+=`</table><div id="max_scores_container"><p>maximum scores</p><table><tr class="header"><th>taste</th><th>presentation</th><th>labor</th><th>creativity</th><th>total</th></tr><tr><td>${c?10:f.taste}</td><td>${c?10:f.present}</td><td>${c?10:f.labor}</td><td>${c?10:f.creativity}</td><td>${c?40:f.total}</td></tr></table><br></div>`,a("weighted_scores_label").onclick=()=>{a("results_showweighted").checked^=1,results(window.resultsName,a("results_showweighted").checked)};let k=``;for(let a in f.judges){for(let b in k+=`<p>score breakdown: <span style="color: var(--accent1)">${f.judges[a]}</span></p><table><tr class="header"><th>name</th><th>entry</th><th>taste</th><th>present.</th><th>labor</th><th>creat.</th><th>total</th></tr>`,g)k+=`<tr><td>${g[b].name}</td><td>${g[b].entry}</td><td>${(()=>c?weightTaste(f,e[a][b][0]).toPrecision(3).replace(/\.0+/g,""):e[a][b][0])()}</td><td>${(()=>c?weightPresent(f,e[a][b][1]).toPrecision(3).replace(/\.0+/g,""):e[a][b][1])()}</td><td>${(()=>c?weightLabor(f,e[a][b][2]).toPrecision(3).replace(/\.0+/g,""):e[a][b][2])()}</td><td>${(()=>c?weightCreativity(f,e[a][b][3]).toPrecision(3).replace(/\.0+/g,""):e[a][b][3])()}</td><td>${(()=>c?(weightTaste(f,e[a][b][0])+weightPresent(f,e[a][b][1])+weightLabor(f,e[a][b][2])+weightCreativity(f,e[a][b][3])).toPrecision(3).replace(/\.0+/g,""):sumOfList(e[a][b]))()}</td></tr>`;k+=`</table><br>`}for(let a in h+=k,h+=`<p>score breakdown:<span style="color: var(--accent1)">total</span></p><table><tr class="header"><th>name</th><th>entry</th><th>taste/${(c?10:f.taste)*f.judges.length}</th><th>present./${(c?10:f.present)*f.judges.length}</th><th>labor/${(c?10:f.labor)*f.judges.length}</th><th>creat./${(c?10:f.creativity)*f.judges.length}</th><th>total/${(c?40:f.total)*f.judges.length}</th></tr>`,g)h+=`<tr><td>${g[a].name}</td><td>${g[a].entry}</td><td>${(()=>{let b=[];for(let g in e)b.push(c?weightTaste(f,e[g][a][0]):e[g][a][0]);return sumOfList(b).toPrecision(3).replace(/\.0+/g,"")})()}</td><td>${(()=>{let b=[];for(let g in e)b.push(c?weightPresent(f,e[g][a][1]):e[g][a][1]);return sumOfList(b).toPrecision(3).replace(/\.0+/g,"")})()}</td><td>${(()=>{let b=[];for(let g in e)b.push(c?weightLabor(f,e[g][a][2]):e[g][a][2]);return sumOfList(b).toPrecision(3).replace(/\.0+/g,"")})()}</td><td>${(()=>{let b=[];for(let g in e)b.push(c?weightCreativity(f,e[g][a][3]):e[g][a][3]);return sumOfList(b).toPrecision(3).replace(/\.0+/g,"")})()}</td><td>${(()=>{let b=[];for(let g in e)b.push(c?weightTaste(f,e[g][a][0])+weightPresent(f,e[g][a][1])+weightLabor(f,e[g][a][2])+weightCreativity(f,e[g][a][3]):sumOfList(e[g][a]));return console.log(b),sumOfList(b).toPrecision(3).replace(/\.0+/g,"")})()}</td></tr>`;a("results_wrapper").innerHTML=h,a("results_title").innerHTML=`results for session <span style="color: var(--accent1)">${f.name}</span>`})})}function alert(b){let c=document.createElement("div");c.innerHTML=b,c.className="alert",c.onload=(()=>{setTimeout(()=>{c.classList.add("alert_fade"),setTimeout(()=>{c.remove()},500)},1e4)})(),c.onclick=()=>{c.classList.add("alert_fade"),setTimeout(()=>{c.remove()},500)},a("alert_container").appendChild(c)}function submit(){if(judgedata[current_judge_entry-1]=[+a("judge_taste").value,+a("judge_present").value,+a("judge_labor").value,+a("judge_present").value],!confirm("are you sure? you can't change your scores after this."))return;console.log(judgedata);let b="";for(let a=0;a<judgedata.length;a++)for(let b=0;b<judgedata[a].length;b++)if(""===judgedata[a][b])return void alert("not all values have been filled out. please try again.");for(let a=0;a<judgedata.length;a++)b+=judgedata[a]+"",b+="|";b=b.substring(0,b.length-1),console.log(b),request("/judge",{data:b,sessname:sessiondata.name}).then(b=>(console.log(b),"y"===b.msg?(alert("successfully saved scores"),a("cover_judge").style.display="none",a("main").style.display="flex",void updateSessionList()):void alert("something went wrong. server message: "+b.msg)))}function validate(a){10<a.value&&(a.value=10)}function disp(b,c){a("judge_input_container").innerHTML=`<p>session: ${b.name}</p><p>entry number: ${c}</p><p style="color:var(--accent1)">${b.entries[c-1][1]} made by ${b.entries[c-1][0]}</p><span>taste (0-10):</span><br><input type="number" id="judge_taste" value="${judgedata[c-1][0]}" onchange="validate(this)"><br><span>presentation (0-10):</span><br><input type="number" id="judge_present" value="${judgedata[c-1][1]}" onchange="validate(this)"><br><span>labor (0-10):</span><br><input type="number" id="judge_labor" value="${judgedata[c-1][2]}" onchange="validate(this)"><br><span>creativity (0-10):</span><br><input type="number" id="judge_creativity" value="${judgedata[c-1][3]}" onchange="validate(this)"><br>${(a=>a===window.entry_num?"<button onclick=\"submit()\">finish</button>":"")(c)}`}function judge(b){var c=window.sessionobject[b];if(console.log(c.name),!c)return void alert("session not found");request("/checkuserpw",{name:getCookie("username"),pass:getCookie("pw")}).then(a=>{if("n"===a.msg)return void alert("please sign in")});let e;request("/getsession",{sessname:c.name}).then(b=>{if("y"===b.msg){e=JSON.parse(b.data),console.log(e),window.current_judge_entry=1,window.entry_num=c.entries.length,window.sessiondata=e;let f=[];for(let a=0;a<c.entries.length;a++)f.push([]);window.judgedata=f,a("judge_left").onclick=()=>{1<current_judge_entry&&(f[current_judge_entry-1]=[+a("judge_taste").value,+a("judge_present").value,+a("judge_labor").value,+a("judge_present").value],current_judge_entry--,disp(window.sessiondata,current_judge_entry))},a("judge_right").onclick=()=>{current_judge_entry<entry_num&&(f[current_judge_entry-1]=[+a("judge_taste").value,+a("judge_present").value,+a("judge_labor").value,+a("judge_present").value],current_judge_entry++,disp(window.sessiondata,current_judge_entry))},disp(e,1),a("cover_judge").style.display="block",a("main").style.display="none"}else return void alert("something went wrong, please try again.")})}function request(a,b){return new Promise(c=>{var e=new FormData;for(var f in b)e.append(f,b[f]);fetch(a,{method:"POST",body:e}).then(a=>{c(a.json())})})}function parsedata(a){for(let b in a=a.split("\n"),a)for(let c in a[b]=a[b].split("|"),a[b])for(let e in a[b][c]=a[b][c].split(","),a[b][c])a[b][c][e]=parseFloat(a[b][c][e]);return a}function setCookie(a,b,c){const e=new Date;e.setTime(e.getTime()+1e3*(60*(60*(24*c))));let f="expires="+e.toUTCString();document.cookie=a+"="+b+";"+f+";path=/"}function getCookie(a){let b=a+"=",e=document.cookie.split(";");for(let f,c=0;c<e.length;c++){for(f=e[c];" "==f.charAt(0);)f=f.substring(1);if(0==f.indexOf(b))return f.substring(b.length,f.length)}return""}setCookie("gpw",getCookie("gpw"),1/12),""!==getCookie("gpw")&&request("/checkpw",{pw:getCookie("gpw")}).then(b=>{"y"===b.msg&&(a("cover_pw").style.display="none",a("main").style.display="flex")}),a("pw_btn").onclick=()=>{setCookie("gpw",a("pw").value,1/12),request("/checkpw",{}).then(b=>{"y"===b.msg?(a("response").innerHTML="Correct",a("cover_pw").style.display="none",a("main").style.display="flex",window.location.reload()):a("response").innerHTML="Incorrect"})},a("create_account").onclick=()=>{a("cover_newacc").style.display="block",a("main").style.display="none"},a("newacc_cancel").onclick=()=>{a("cover_newacc").style.display="none",a("main").style.display="flex"},a("newacc_create").onclick=()=>{a("newacc_response").innerHTML="please wait...";var b=a("newacc_username").value.toLowerCase(),c=a("newacc_pw1").value,e=a("newacc_pw2").value;c===e?request("/newuser",{name:b,pass:c}).then(b=>{"y"===b.success?(a("newacc_response").innerHTML="",alert(b.msg),a("cover_newacc").style.display="none",a("main").style.display="flex"):a("newacc_response").innerHTML=b.msg}):a("newacc_response").innerHTML="passwords do not match"},a("sign_in").onclick=()=>{a("cover_signin").style.display="block",a("main").style.display="none"},a("signin_cancel").onclick=()=>{a("cover_signin").style.display="none",a("main").style.display="flex"},a("signin_signin").onclick=()=>{a("signin_response").innerHTML="please wait...";var b=a("signin_username").value.toLowerCase(),c=a("signin_pw").value;""!==c&&""!==b?request("/checkuserpw",{name:b,pass:c}).then(e=>{"y"===e.msg?(setCookie("username",b,9999),setCookie("pw",c,9999),a("newacc_response").innerHTML="",alert("signed in successfully"),window.location.reload()):"n"===e.msg?a("signin_response").innerHTML="incorrect username or password":(a("gpw_msg").innerHTML="global password invalid or expired. please re-enter it below:",a("cover_pw").style.display="block",a("cover_signin").style.display="none")}):a("signin_response").innerHTML="one or both fields is blank"},a("sign_out").onclick=()=>{setCookie("username","",9999),setCookie("pw","",9999),window.location.reload()},request("/checkuserpw",{name:getCookie("username"),pass:getCookie("pw")}).then(a=>{"n"===a.msg&&(setCookie("username","",9999),setCookie("pw","",9999))}),""===getCookie("username")?a("account_signedin").style.display="none":(a("account_notsignedin").style.display="none",a("username").innerHTML=getCookie("username")),a("session_new").onclick=()=>{""===getCookie("username")?alert("please sign in"):(a("cover_session").style.display="block",a("main").style.display="none")},sessionUI(),updateSessionList();