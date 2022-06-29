module.exports = {
    name: 'hello_world',
    method:["GET"],
    execute(req, res) {
        res.send("hello world");
    },
}