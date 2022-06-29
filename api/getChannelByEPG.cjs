module.exports = {
    name: 'getChannelByEPG',
    method: ["GET"],
    execute(req, res, fetch, channels, tv_address) {
        res.set('Cache-control', 'no-store')
        
        var epg = req.query.epg;
        if (!epg) return res.send({ status: "ERR_EPG_REQUIRED", message: "The endpoint requires an epg parameter" })
        channels.forEach(channel => {
            if (channel.id == epg) {
                if (req.query.program) {
                    fetch(`https://rp-ott-mediation-tv.woopic.com/live/v3/applications/PC/programs?groupBy=channel&period=current&epgIds=${epg}&mco=OFR`)
                        .then((response) => {
                            return response.json();
                        })
                        .then((text) => {
                            res.send({ "program": text[epg], "channel": channel })
                        })
                        .catch((e) => {
                            res.send({ "program" : [],  "channel": channel })
                        });
                } else {
                    res.send({ "channel": channel })
                }
            }
        })

    }
}