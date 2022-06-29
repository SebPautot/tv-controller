import express from 'express';
import proxy from "express-http-proxy";
const app = express();
import find from 'local-devices';
import fetch from 'node-fetch';
import * as fs from 'node:fs';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

//DATA
var tv_address = [];
var channels = require("./data/channels.json")
var keys = require("./data/keys.json");


app.use(express.static('public'));

const listener = app.listen("3003", function () {
    console.log('Your app is listening on port ' + listener.address().port);
});


function findTV() {
    console.log(tv_address);
    //CHECK CURRENT DEVICE IF STILL CONNECTED/DISCONNECTED
    tv_address.forEach(ip => {
        fetch(`http://${ip}:8080/remoteControl/cmd?operation=10`).catch(err => {
            tv_address.remove(ip);
        })
    })
    //CHECK NETWORK FOR NEW DEVICES
    find().then(devices => {
        devices.forEach(device => {
            fetch(`http://${device.ip}:8080/remoteControl/cmd?operation=10`).then(res => res.json()).then(res => {
                if (!res.result.data.macAddress) return;
                if (tv_address.includes(device.ip)) return;

                tv_address.push(device.ip);

            }).catch(err => { })
        })
    })
}
findTV();
setInterval(findTV, 6000);


app.use("/api", function (req, res, next) {
    var endpoints = new Map();//list of endpoints

    var main = "./api/"; //endpoints's main directory

    function searchfiles(directory) {
        var commandFiles = fs.readdirSync(directory).filter(file => file.endsWith('.cjs'));
        var subdirectories = fs.readdirSync(directory, { withFileTypes: true }).filter(file => file.isDirectory());
        for (const file of commandFiles) {

            const command = require(`${directory}/${file}`);
            // console.log(command, directory.replace(main, "") + "/" + command.name)
            endpoints.set(directory.replace(main, "") + "/" + command.name, command);
        }
        subdirectories.forEach(subdirectory => searchfiles(directory + "/" + subdirectory.name))
    }

    searchfiles("./api/")//look up all the files and put them in endpoint


    var endpoint = req.path;
    if (endpoint.slice(-1) == "/") endpoint = endpoint.slice(0, -1);

    // console.log("Endpoint requested : "+endpoint)

    if (endpoints.get(endpoint)) {
        //if endpoint is found
        // console.log("Selected endpoint : "+endpoints.get(endpoint))
        // console.log(endpoints.get(endpoint).method, req.method)
        if (endpoints.get(endpoint).method && !endpoints.get(endpoint).method.includes(req.method)) return res.status(404).send("{error:'404', message:'The requested endpoint does not exist for this method'}")


        //executes the endpoint's program
        if (tv_address.length > 0)
            endpoints.get(endpoint).execute(req, res, fetch, channels, tv_address, keys);
        else
            res.send("No device")
    }

    else res.status(404).json({ status: "ERR_ENDPOINT_NOT_FOUND", message: "The requested endpoint does not exist" });

})