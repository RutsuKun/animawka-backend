module.exports = function(app, theme, db, transporter){
const fileUpload = require('express-fileupload'), scrypt = require('scryptsy');

app.use(fileUpload());

app.get('/konto', (req, res, next) => {
	db.getUser(req.session.uid).then(user => {
		res.render('account', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Konto',
			user:user.data,
			db: db, 
			session: req.session
		});	
	});
});

app.post('/konto/uploadAvatar', function(req, res) {
	if (Object.keys(req.files).length == 0) {
	  return res.status(400).send('No files were uploaded.');
	}
  
	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	let avatar = req.files.avatar;
	console.log(req.body.userID);
	// Use the mv() method to place the file somewhere on your server

	var hash = scrypt(avatar.name.normalize('NFKC'), "animawka", 16384, 8, 1, 24).toString('hex');

	avatar.mv('./public/user-data/avatars/'+hash+'.png', function(err) {
	  if (err)
		return res.status(500).send(err);
  
	  db.editUserAvatar(hash+'.png', req.body.userID).then(data =>{
		console.log(data);
		res.redirect('/konto#settings');
	  });
	});
  });

  app.get('/konto/sendActivateEmail', function(req, res) {

	var code = Date.now()+"accountCode";
	console.log(Date.now());
	var hash = scrypt(code.normalize('NFKC'), "activate", 16384, 8, 1, 24).toString('hex');
	db.getUser(req.session.uid).then(user => {

console.log(user.data.email);

var mailOptions = {
	from: 'mail@animawka.pl',
	to: user.data.email,
	subject: 'Animawka Activate Account',
	text: 'Animawka Account Activation Mail',
	html:'<html><body style="background:#303030; color:white; padding:15px;"><center><img style="height:300px;" src="https://camo.githubusercontent.com/eab9f91a282aa39eccf4dca946a024c165dbd02b/68747470733a2f2f626574612e616e696d61776b612e706c2f696d672f416e696d61776b614c6f676f426c61636b4261636b67726f756e642e6a7067" /></center><br /><center><h3>Animawka Activate Email</h3></center><br/>If you want activate your account on Animawka, <a style="color:white; text-decoration:underline;" href="http://127.0.0.1:1234/konto/activateAccount/'+hash+'">click this link</a><br/><br/><i>This is an automatically generated email, please do not reply</i></body></html>'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
	if (error) {
	  console.log(error);
	} else {
	  console.log('Email sent: ' + info.response + ' to '+user.data.email);
	}
  });

db.userSendActivateEmail(req.session.uid, hash).then(data =>{
	console.log(data);
	res.redirect('/konto#settings');
  });

	});

  });

  app.get('/konto/activateAccount/:token', function(req, res) {
	var token = req.params.token;

	db.getUser(req.session.uid).then(user => {

console.log(user.data.email);

var mailOptions = {
	from: 'mail@animawka.pl',
	to: user.data.email,
	subject: 'Animawka Activate Successfull',
	text: 'Animawka Account Activated Successfull',
	html:'<html><body style="background:#303030; color:white; padding:15px;"><center><img style="height:300px;" src="https://camo.githubusercontent.com/eab9f91a282aa39eccf4dca946a024c165dbd02b/68747470733a2f2f626574612e616e696d61776b612e706c2f696d672f416e696d61776b614c6f676f426c61636b4261636b67726f756e642e6a7067" /></center><br /><center><h3>Animawka Activate Successfull</h3></center><br/>Your account has activated, go to <a style="color:white; text-decoration:underline;" href="http://127.0.0.1:1234">home page</a><br/><br/><i>This is an automatically generated email, please do not reply</i></body></html>'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
	if (error) {
	  console.log(error);
	} else {
	  console.log('Email sent: ' + info.response + ' to '+user.data.email);
	}
  });

db.userActivateAccount(token).then(data =>{
	console.log(data);
	res.redirect('/konto#settings');
  });

	});

  });


}