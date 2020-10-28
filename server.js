const express = require('express')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();

const database = {
	users: [
		{
			id: '123',
			name: 'John',
			email: 'john@gmail.com',
			password: 'cookies',
			entries: 10,
			joined: new Date()
		},
		{
			id: '124',
			name: 'Sally',
			email: 'sally@gmail.com',
			password: 'bananas',
			entries: 0,
			joined: new Date()
		}
	]
}

// Middleware to decode 
app.use(bodyParser.urlencoded({extended: false})) 
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send(database.users);
})

app.post('/signin', (req, res) => {
	// bcrypt.compare("cookies", '$2a$10$6nb6hGZUTGm9aq2nh2MKOOyonovTlWFrSG5jN44hY5xVoGwMpoOr2', function(err, res) {
	// 	console.log('first guess', res)
	// });
	// bcrypt.compare('testingpw', '$2a$10$6nb6hGZUTGm9aq2nh2MKOOyonovTlWFrSG5jN44hY5xVoGwMpoOr2', function(err, res) {
	// 	console.log('second guess', res)
	// });

	for (i=0; i<= database.users.length; i++) {
		if (req.body.email === database.users[i].email &&
		    req.body.password === database.users[i].password) {
			    res.json(database.users[i]);
		}
	}
	
	res.status(400).json('error logging in');
	
})

app.post('/register', (req, res) => {
	const {email, name, password} = req.body;
	bcrypt.hash(password, null, null, function(err, hash) {
		console.log(hash);
	})
	database.users.push({
		id: '125',
		name: name,
		email: email,
		password: password,
		entries: 0,
		joined: new Date()
	})
	res.json(database.users[database.users.length - 1]);
	// res.json('success');
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	let found = false;
	database.users.forEach(user => {
		if (user.id === id) {
			found = true;
			return res.json(user);
		}
	})
	if (!found) {
		res.status(400).json('not found');
	}
})

app.put('/image', (req, res) => {
	const { id } = req.body;
	let found = false;
	database.users.forEach(user => {
		if (user.id === id) {
			found = true;
			user.entries++
			return res.json(user.entries);
		}
	})
	if (!found) {
		res.status(400).json('not found');
	}
})

// app.use(express.static(__dirname + '/public'))

app.listen(3001, () => {
	console.log('app is running on port 3001')
});

/*
/ --> res = this is working
/signin   --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user  // Increase user rank

*/
