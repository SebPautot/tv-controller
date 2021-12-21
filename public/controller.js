var address = "192.168.1.16"

function load(){
    fetch(`http://192.168.1.24:3004/${address}:8080/remoteControl/cmd?operation=10`, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
          'Content-Type': 'application/json'
        //   'Content-Type': 'application/x-www-form-urlencoded'
        },
        redirect: 'follow' // manual, *follow, error
      })
    .then(res=>res.json())
    .then(data=>{
        if(data.result.data.osdContext == "LIVE"){
        return getChannelPrograms(data.result.data.playedMediaId)
        }else{
            getSpecialChannel(data.result.data.osdContext)
        }
    }).catch(error=>{

        console.error(error);
        document.getElementById("currentChannel-infos").innerHTML = `
        <h1 class="currentChannel-infos-text">TV OFFLINE</h1>
        `
        load()
    })
}  

load()




function pushButton(e){
    var key = e.target.value;
    var mode = 0;
    fetch(`http://192.168.1.24:3004/${address}:8080/remoteControl/cmd?operation=01&key=${key}&mode=${mode}`,{
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
          'Content-Type': 'application/json'
        //   'Content-Type': 'application/x-www-form-urlencoded'
        },
        redirect: 'follow' // manual, *follow, error
      })
    .then(res=> res.json())
    .then(res=> { setTimeout(function(){load();return res},1000)})
}

function getChannel(e){
    fetch(`http://192.168.1.24:3004/${address}:8080/remoteControl/cmd?operation=09&epg_id=${code}&uui=1`)
}

//SET PUSH BUTTON E LISTENER

document.getElementById("controller").addEventListener("click", function(e){ if(e.target.tagName == "BUTTON" )pushButton(e) })


//SET CHANNEL PREVIEW //HTML INCLUDED
function getChannelPrograms(epg){
    if(!epg) console.error("Error : EPG id missing")
    fetch(`http://192.168.1.24:3004/rp-ott-mediation-tv.woopic.com/live/v3/applications/PC/programs?groupBy=channel&period=current&epgIds=${epg}&mco=OFR`,{
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
          'Content-Type': 'application/json'
        //   'Content-Type': 'application/x-www-form-urlencoded'
        },
        redirect: 'follow' // manual, *follow, error
      })
        .then(res=>res.json())
        .then(res=>{

            console.log(res[epg])

            fetch("/channels.json").then(data=>data.json())
                .then(channels=>{
                    channels.forEach(channel=>{
                        if(epg == channel.idEPG){

                            document.getElementById("currentChannel-infos").innerHTML = `
                            <div><img src="http://192.168.1.24:3004/${channel.logos[2].listLogos[0].path}"></div>
                            <h1 class="currentChannel-infos-text">${channel.name} - ${channel.slogan}</h1>
                            `





                            try{
                                document.getElementById("currentChannel-programPreviews").innerHTML = "";

                                timeToUpdateNum = 0;
                                toUpdateTime = [];

                                res[epg].forEach(prog=>{
                                    var progPrev = document.createElement("DIV");
                                    progPrev.classList="program-preview"
                                    
                                    
                                    var timeData = processTime(prog.diffusionDate, prog.duration)

                                    if(timeData.hasStarted)
                                        timeTextRemaining = `temps restant : ${timeData.remaining}`
                                    else
                                        timeTextRemaining = `durée : ${timeData.remaining}`

                                    progPrev.innerHTML = `<h2>${prog.title}</h2><div class="update-timePreview-${timeToUpdateNum}"><h3>De ${timeData.startTime} à ${timeData.endTime} <h3><h4>(${timeTextRemaining})</h4></div>`
                                    
                                    if(prog.programType == "EPISODE")
                                        progPrev.innerHTML += `<p>${prog.season.serie.title} saison ${prog.season.number} épisode ${prog.episodeNumber}`

                                    toUpdateTime.push({diffusionDate:prog.diffusionDate, duration:prog.duration})
                                    timeToUpdateNum+=1;

                                    if(prog.covers){
                                    progPrev.innerHTML += `<div class="program-imagePreview">`
                                    progPrev.innerHTML += `<img class="program-imgPreview" src="http://192.168.1.24:3004/${prog.covers[1].url}">`
                                    }
                                    progPrev.innerHTML += `</div>`
                                    
                                    

                                    
                                        document.getElementById("currentChannel-programPreviews").appendChild(progPrev);
                                })
                            }catch(err){
                                document.getElementById("currentChannel-programPreviews").innerHTML = `<p>Couldn't get the program</p>`
                                console.error(err)
                            }
                        }
                    })
                })
        })
}



function processTime(startTime, duration){
    var translation = {y:" ans",mo:" mois",w:" semaines",d:" jours",h:" heures",m:" minutes",s:" secondes"}


    //START
    var start = new Date(startTime*1000);
    var startTimeStr = `${addZero(start.getHours())}h ${addZero(start.getMinutes())}`;
    //NOW
    var now = new Date();
    //END
    var end = new Date(startTime*1000 + (duration*1000));
    var endTimeStr =  `${addZero(end.getHours())}h ${addZero(end.getMinutes())}`;
    //REMAINING
    if(start.getTime()<now.getTime()){
        var remaining = (end.getTime() - now.getTime())/1000;
        var hasStarted = true;
    }else{
        var remaining = (end.getTime() - start.getTime())/1000;
        var hasStarted = false;
    }

    var remainingTimeStr = parseTimeRemaining(remaining, translation);

    
    return {
        endTime: endTimeStr,
        remaining: remainingTimeStr,
        startTime: startTimeStr,
        hasStarted: hasStarted
    }
}

function addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

function parseTimeRemaining(time, translation) {
    const years = Math.floor(time / 31556952);
    time = time % 31556952;
    const months = Math.floor(time / 2592000);
    time = time % 2592000;
    const weeks = Math.floor(time / 604800);
    time = time % 604800;
    const days = Math.floor(time / 86400);
    time = time % 86400;
    const hours = Math.floor(time / 3600);
    time = time % 3600;
    const minutes = Math.floor(time / 60);
    time = time % 60;
    const seconds = Math.floor(time);

    return [
        `${years}${translation.y}`,
        `${months}${translation.mo}`,
        `${weeks}${translation.w}`,
        `${days}${translation.d}`,
        `${hours}${translation.h}`,
        `${minutes}${translation.m}`,
        `${seconds}${translation.s}`
    ]
        .filter(item => item[0] !== '0')
        .join(' ');
}







//SET CHANNELS //HTML INCLUDED
fetch("/channels.json").then(data=>data.json())
    .then(channels=>{
        console.log(channels);
        channels.forEach(channel=>{
            var chanElem = document.createElement("DIV");
            chanElem.innerHTML = `
            <p>${channel.name}</p>
            <img src="http://192.168.1.24:3004/${channel.logos[2].listLogos[0].path}">
            `;
            chanElem.value = channel.idEPG;
            chanElem.addEventListener("click", function(e){
                // /remoteControl/cmd?operation=09&epg_id=CODE_CHAINE&uui=1
                fetch(`http://192.168.1.24:3004/${address}:8080/remoteControl/cmd?operation=09&epg_id=${channel.idEPG}&uui=1`,{
                    method: 'GET', // *GET, POST, PUT, DELETE, etc.
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
                    headers: {
                    'Content-Type': 'application/json'
                    //   'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    redirect: 'follow' // manual, *follow, error
                })
                    .then(res=>res.json())
                    .then(res=>{
                        load()
                    })
            })
            document.getElementById("channels").appendChild(chanElem);
        })
    })


//UPDATE TIME
var toUpdateTime = []
setInterval(function(){
    var elementNum = 0;

    toUpdateTime.forEach(prog =>{
        var timeData = processTime(prog.diffusionDate, prog.duration)
        var element = document.getElementsByClassName(`update-timePreview-${elementNum}`)[0]
        if(timeData.hasStarted)
            timeTextRemaining = `temps restant : ${timeData.remaining}`
        else
            timeTextRemaining = `durée : ${timeData.remaining}`

        element.innerHTML = `<h3>De ${timeData.startTime} à ${timeData.endTime} <h3><h4>(${timeTextRemaining})</h4>`
        elementNum+=1;
        
    })
},1000)


//OTHER CONTEXT

function getSpecialChannel(context){
    switch(context){
    case "home" : setSpecialChannel("HOME");
        break;
    case "MAIN_PROCESS" : setSpecialChannel("En veille");
        break;
    case "TVEP": setSpecialChannel("TVEP");
        break;
    case "netflix": setSpecialChannel("Netflix", "http://192.168.1.24:3004/https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png");
        break;
    case "PROMO_TV": setSpecialChannel("Ecran promotionnel");
        break;
    case "DisneyPlus": setSpecialChannel("Disney +","http://192.168.1.24:3004/https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/1200px-Disney%2B_logo.svg.png");
        break;
    case "LEGUIDETV": setSpecialChannel("Guide TV");
        break;
    }
}

function setSpecialChannel(name, logoURL){
    if(!logoURL)
        logoURL = "https://c.woopic.com/logo-orange.png"
    document.getElementById("currentChannel-infos").innerHTML = `
                            <div><img src="http://192.168.1.24:3004/${logoURL}"></div>
                            <h1 class="currentChannel-infos-text">${name}</h1>
                            `
}


//ANIMATIONS AND CONTROLLER

document.getElementById("controller-modifier").addEventListener("click",function(e){
    controller(e);
})

var isControllerHidden = true;

function controller(e){
    
    if(isControllerHidden){
        document.getElementById("controller").style.animation = "slidein 1s forwards"
    }else{
        document.getElementById("controller").style.animation = "slideout 1s forwards"
    }

    isControllerHidden = !isControllerHidden;

}

document.getElementById("controller").addEventListener("animationstart", function(){console.log("anim-iteration")});
document.getElementById("controller").addEventListener("animationend", function(){console.log("anim-iteration")});
document.getElementById("controller").addEventListener("animationiteration", function(){console.log("anim-iteration")});

