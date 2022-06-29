module.exports = {
    name: 'getDeviceStatus',
    method: ["GET"],
    execute(req, res, fetch, channels, tv_address) {
        res.set('Cache-control', 'no-store')

        var device = req.query.device;
        if (!device) device = 0;
        if (device >= tv_address.length) return res.send({ status: "ERR_DEVICE_NOT_FOUND", message: "The requested device does not exist" })
        
        try {
            getStatus()
        } catch (err) {
            setTimeout(getStatus(), 500)
        }

        function getStatus() {
            fetch(`http://${tv_address[device]}:8080/remoteControl/cmd?operation=10`).then(res => res.json()).then(data => {

                res.send(data.result);
            })
        }
    }
}