module.exports = {
    name: 'world',
    method:["GET"],
    execute(req, res) {
        res.send("hello world");
    },
}