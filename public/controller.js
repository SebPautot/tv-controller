var device_int = 0;



function load() {
    loadDevices()

    fetch(`/api/getDeviceStatus?device=${device_int}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        headers: {
            'Content-Type': 'application/json'
            //   'Content-Type': 'application/x-www-form-urlencoded'
        },
        redirect: 'follow' // manual, *follow, error
    })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.data.osdContext == "LIVE") {
                return getChannelPrograms(data.data.playedMediaId)
            } else {
                getSpecialChannel(data.data.osdContext)
            }
        }).catch(error => {

            console.error(error);
            document.getElementById("currentChannel-infos").innerHTML = `
        <h1 class="currentChannel-infos-text">TV OFFLINE</h1>
        `
            // load()
        })
}

load()

function loadDevices() {
    fetch("/api/getDeviceList").then(res => res.json()).then(data => {
        console.log(data);
        var listContainer = document.getElementById("device-list")
        listContainer.innerHTML = "";
        var i = 0;
        data.forEach(device => {
            var newDevice = document.createElement("BUTTON");
            newDevice.value = i;
            newDevice.innerHTML = `
            <h1>${device.data.friendlyName}</h1>
            <p>${device.data.osdContext}</p>
            `

            var channelName = document.createElement("h2");
            newDevice.appendChild(channelName);

            fetch(`/api/getChannelByEPG?epg=${device.data.playedMediaId}`).then(res => res.json()).then(data => {
                if(data.channel)
                channelName.innerHTML = data.channel.name;
            })

            newDevice.addEventListener("click", function (e) {
                device_int = newDevice.value;
                load();
            })

            listContainer.appendChild(newDevice);
            i++;
        })

    })
}




function pushButton(e) {
    var key = e;
    var mode = 0;
    fetch(`/api/pushButton?device=${device_int}&key=${key}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow'
    })
        .then(res => res.json())
        .then(res => { setTimeout(function () { load(); return res }, 1000) })
}

function getChannel(e) {
    fetch(`/api/setChannelByEPG?device=${device_int}&epg=${code}`)
}


//SET CHANNEL PREVIEW //HTML INCLUDED
function getChannelPrograms(epg) {
    if (!epg) console.error("Error : EPG id missing")
    fetch(`/api/getChannelByEPG?epg=${epg}&program=true`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow'
    })
        .then(res => res.json())
        .then(res => {
            var channel = res.channel;


            document.getElementById("currentChannel-infos").innerHTML = `
                <div><img src="${channel.logos.default}"></div>
                <h1 class="currentChannel-infos-text">${channel.zappingNumber} - ${channel.name}}</h1>
            `





            document.getElementById("currentChannel-programPreviews").innerHTML = "";

            timeToUpdateNum = 0;
            toUpdateTime = [];


            res.program.forEach(prog => {



                var timeData = processTime(prog.diffusionDate, prog.duration)
                if (timeData) {
                    var progPrev = document.createElement("DIV");
                    progPrev.classList = "program-preview"

                    if (timeData.hasStarted)
                        timeTextRemaining = `temps restant : ${timeData.remaining}`
                    else
                        timeTextRemaining = `durée : ${timeData.remaining}`

                    progPrev.innerHTML = `<h2>${prog.title}</h2><div class="update-timePreview-${timeToUpdateNum}"><h3>De ${timeData.startTime} à ${timeData.endTime} <h3><h4>(${timeTextRemaining})</h4></div>`

                    if (prog.programType == "EPISODE")
                        progPrev.innerHTML += `<p>${prog.season.serie.title} saison ${prog.season.number} épisode ${prog.episodeNumber}`

                    toUpdateTime.push({ diffusionDate: prog.diffusionDate, duration: prog.duration })
                    timeToUpdateNum += 1;

                    if (prog.covers) {
                        progPrev.innerHTML += `<div class="program-imagePreview">`
                        progPrev.innerHTML += `<img class="program-imgPreview" src="${prog.covers[1].url}">`
                    }
                    progPrev.innerHTML += `</div>`




                    document.getElementById("currentChannel-programPreviews").appendChild(progPrev);
                }
            })

        })
}



function processTime(startTime, duration) {
    var translation = { y: " ans", mo: " mois", w: " semaines", d: " jours", h: " heures", m: " minutes", s: " secondes" }


    //START
    var start = new Date(startTime * 1000);
    var startTimeStr = `${addZero(start.getHours())}h ${addZero(start.getMinutes())}`;
    //NOW
    var now = new Date();
    //END
    var end = new Date(startTime * 1000 + (duration * 1000));
    var endTimeStr = `${addZero(end.getHours())}h ${addZero(end.getMinutes())}`;
    //REMAINING
    if (start.getTime() < now.getTime()) {
        var remaining = (end.getTime() - now.getTime()) / 1000;
        var hasStarted = true;
    } else {
        var remaining = (end.getTime() - start.getTime()) / 1000;
        var hasStarted = false;
    }

    if (remaining < 0)
        return;

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
fetch("/channels.json").then(data => data.json())
    .then(channels => {
        console.log(channels);
        channels.forEach(channel => {
            var chanElem = document.createElement("BUTTON");
            chanElem.innerHTML = `
            <h2>${channel.zappingNumber}</h2>
            <p>${channel.name}</p>
            <img src="${channel.logos.default}">
            `;
            chanElem.value = channel.id;
            chanElem.addEventListener("click", function (e) {
                // /remoteControl/cmd?operation=09&epg_id=CODE_CHAINE&uui=1
                fetch(`/api/setChannelByEPG?device=${device_int}&epg=${channel.id}`, {
                    method: 'GET', // *GET, POST, PUT, DELETE, etc.
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
                    headers: {
                        'Content-Type': 'application/json'
                        //   'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    redirect: 'follow' // manual, *follow, error
                })
                    .then(res => res.json())
                    .then(res => {
                        load()
                    })
            })
            document.getElementById("channels").appendChild(chanElem);
        })
    })


//UPDATE TIME
var toUpdateTime = []
setInterval(function () {
    var elementNum = 0;

    toUpdateTime.forEach(prog => {
        var timeData = processTime(prog.diffusionDate, prog.duration)
        var element = document.getElementsByClassName(`update-timePreview-${elementNum}`)[0]
        if (timeData.hasStarted)
            timeTextRemaining = `temps restant : ${timeData.remaining}`
        else
            timeTextRemaining = `durée : ${timeData.remaining}`

        element.innerHTML = `<h3>De ${timeData.startTime} à ${timeData.endTime} <h3><h4>(${timeTextRemaining})</h4>`
        elementNum += 1;

    })
}, 1000)


//OTHER CONTEXT

function getSpecialChannel(context) {
    switch (context) {
        case "home": setSpecialChannel("HOME");
            break;
        case "MAIN_PROCESS": setSpecialChannel("En veille");
            break;
        case "TVEP": setSpecialChannel("TVEP");
            break;
        case "netflix": setSpecialChannel("Netflix", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png");
            break;
        case "PROMO_TV": setSpecialChannel("Ecran promotionnel");
            break;
        case "DisneyPlus": setSpecialChannel("Disney +", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/1200px-Disney%2B_logo.svg.png");
            break;
        case "LEGUIDETV": setSpecialChannel("Guide TV");
            break;
    }
}

function setSpecialChannel(name, logoURL) {
    if (!logoURL)
        logoURL = "https://c.woopic.com/logo-orange.png"
    document.getElementById("currentChannel-infos").innerHTML = `
                            <div><img src="${logoURL}"></div>
                            <h1 class="currentChannel-infos-text">${name}</h1>
                            `
}


//ANIMATIONS AND CONTROLLER

document.getElementById("controller-modifier").addEventListener("click", function (e) {
    controller(e);
})

var isControllerHidden = true;

function controller(e) {

    if (isControllerHidden) {
        document.getElementById("controller").style.animation = "slidein 1s forwards"
    } else {
        document.getElementById("controller").style.animation = "slideout 1s forwards"
    }

    isControllerHidden = !isControllerHidden;

}

document.getElementById("controller").addEventListener("animationstart", function () { console.log("anim-iteration") });
document.getElementById("controller").addEventListener("animationend", function () { console.log("anim-iteration") });
document.getElementById("controller").addEventListener("animationiteration", function () { console.log("anim-iteration") });

