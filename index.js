var client = require('redis').createClient()
client.on('connect', function () {
    
    var app = require('express')()
    app.listen(3000)
    app.get('/', function(req, res){
        res.send('<div><a href="/htmlinjection">html injection</a></div><div><a href="/javascriptnosqlinjection">javascript nosql injection</a></div>')
    })
    app.get('/htmlinjection', function(req, res){
        function htmlInjection(){
            var malicousScript = '<div>You will be redirected to google in just a second...</div> <script>setTimeout(function(){window.location.href="http://google.com"}, 2000)</script>'
            client.set('a',malicousScript , function(){
                client.get('a', function(err, reply){
                    res.send(reply)
                })
            })
        }
        
        htmlInjection()
        
        
        
        
    })
    app.get('/javascriptnosqlinjection', function(req, res){
        function javascripInjection(){
            var malicousCode = "function malicousFunction(){client.set('a', 'new password')}; malicousFunction();"
            var x = escape('1')
            console.log(x)
            eval(malicousCode)
            setTimeout(function(){
                client.get('a', function(err, reply){
                    res.send("a's value in database was changed!")
                })
            },100)
        }

        javascripInjection()
    })
  
})