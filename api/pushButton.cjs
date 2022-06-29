module.exports = {
    name: 'pushButton',
    method: ["GET"],
    execute(req, res, fetch, channels, tv_address, keys) {
        res.set('Cache-control', 'no-store')

        var device = req.query.device;
        var key = req.query.key;
        var mode = req.query.mode;
        if (!key) return res.send({ status: "ERR_KEY_REQUIRED", message: "The endpoint requires a key" })
        var hasKey = false;
        keys.forEach(k => {
            if (k.number == key) {
                hasKey = true;
                return;
            }
        })
        if (!hasKey) return res.send({ status: "ERR_KEY_NOT_FOUND", message: "The endpoint requires a valid key" })

        if (!mode) mode = 0;
        if (!device || device >= tv_address.length) device = 0;

        fetch(`http://${tv_address[device]}:8080/remoteControl/cmd?operation=01&key=${key}&mode=${mode}`).then(data => data.json()).then(data => {
            res.send(data)
        })
    }
}