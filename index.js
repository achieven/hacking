var client = require('redis').createClient()
client.on('connect', function () {
    var app = require('express')()
    app.listen(3000)
    app.get('/', function (req, res) {
        res.send('<div><a href="/htmlinjection">Click here to run malicious html script</a></div><div><a href="/javascriptnosqlinjection">Click here to run malicous script that changes database</a></div>')
    })
    app.get('/htmlinjection', function (req, res) {
        function htmlInjection() {
            var malicousScript = '<div>Look into local storage, at item "a", we changed it!</div> <script>window.localStorage.setItem("a", "You have been hacked")</script>'
            client.set('a', malicousScript, function () {
                client.get('a', function (err, reply) {
                    res.send(reply)
                })
            })
        }

        htmlInjection()
    })
    app.get('/javascriptnosqlinjection', function (req, res) {
        function javascriptNosqlInjection() {
            client.set('a', "a old value", function () {
                var malicousCode = "client.set('a', 'a new value')"
                eval(malicousCode)
                setTimeout(function () {
                    client.get('a', function (err, reply) {
                        if (reply === 'a new value') {
                            res.send("a's value in database was changed!")
                        } else {
                            res.send("a's value in database was not changed!")
                        }
                    })
                }, 100)
            })
        }

        javascriptNosqlInjection()
    })
})