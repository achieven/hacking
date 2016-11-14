var client = require('redis').createClient()
client.on('connect', function () {
    var app = require('express')()
    app.listen(3000)
    var fs = require('fs')
    app.get('/', function (req, res) {
        var html = fs.readFileSync('./index.html', 'utf8')
        res.send(html)
    })
    app.get('/xss', function (req, res) {
        function htmlInjection() {
            res.send('<div>Look into local storage, at item "a", we changed it!</div>')
        }

        var script = req.query.script
        var malicousScriptDanger = script.indexOf('<') > -1 && script.indexOf('>') > -1
        if (malicousScriptDanger)
            if (req.query.defence === 'true')
                res.send('You wanted defence, so server blocked what you inserted')
            else
                res.send(script)
        else
            res.send('You didnt insert anything malicous')

    })
    app.get('/javascriptinjection', function (req, res) {
        console.log(req.query)
        var script = req.query.script, defence = req.query.defence
        if (defence === 'no') {
            eval(script)
            res.send('Your action was processed at the server, you injected successfully!')
        }
        else {
            res.send('You wanted defence, so server didnt use what you inserted')
        }
    })

    app.get('/sqlinjection', function (req, res) {
        const sqlite = require('sqlite3').verbose()
        var db = new sqlite.Database('./sqlInjection.db')

        db.serialize(function () {
            var query = 'CREATE TABLE if not exists profiles (id INTEGER NOT NULL PRIMARY KEY, name varchar)'
            db.run(query)
        })
        var id = req.query.id, defence = req.query.defence
        if (defence === 'yes') {
            res.send('You wanted defence, so server blocked whatever it is you inserted')
        }
        else {
            
            var query = 'SELECT * from profiles WHERE id="' + id + '"'
            var idIsMalicous = query.indexOf('OR') > 0 || id.indexOf('"') > 0
            if (idIsMalicous) {
                db.all(query, function (err, people) {
                    res.send('You have successfully injected sql and there you have all the people in the table: ' + JSON.stringify(people))
                })
            }
            else {
                db.all(query, function (err, people) {
                    res.send('There is nothing malicous in what you inserted, the result is here: ' + JSON.stringify(people))
                })
            }

        }

    })
})