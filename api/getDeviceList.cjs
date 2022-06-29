module.exports = {
    name: 'getDeviceList',
    method: ["GET"],
    execute(req, res, fetch, channels, tv_address) {
        res.set('Cache-control', 'no-store')
        
        reqList = []
        tv_address.forEach(ip => {
            reqList.push(fetch(`http://${ip}:8080/remoteControl/cmd?operation=10`).then(res => res.json()))
        })

        Promise.allSettled(reqList).then(v => {
            result = []
            v.forEach(value => {
                result.push(value.value.result);
            })
            res.send(result);
        })
    }
}