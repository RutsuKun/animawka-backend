module.exports = function(app, theme, db, server, config){

app.get('/chat', function(req, res, next) {	
res.render('chat', {	
    messages: server.messages	
});

});

}