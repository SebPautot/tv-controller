module.exports = {
    name: 'setChannelByEPG',
    method: ["GET"],
    execute(req, res, fetch, channels, tv_address) {
        res.set('Cache-control', 'no-store')

        var device = req.query.device;
        if (!device) device = 0;
        if (device >= tv_address.length) return res.send({ status: "ERR_DEVICE_NOT_FOUND", message: "The requested device does not exist" })

        var epg = req.query.epg;
        if (!epg) res.send({ status: "ERR_EPG_REQUIRED", message: "The endpoint requires an epg parameter" })

        fetch(`http://${tv_address[device]}:8080/remoteControl/cmd?operation=09&epg_id=${epg}&uui=1`).then(r => r.json()).then(data => {
            res.send(data.result);
        })
    },
}