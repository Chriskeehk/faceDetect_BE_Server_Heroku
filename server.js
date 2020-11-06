const express = require('express')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const Clarifai = require('clarifai');


const db = knex({
  client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: true,
    // port : '5433',
    // user : 'postgres',
    password : 'Happy_ecy!!',
  }
});

const app = express();


// Middleware to decode 
app.use(bodyParser.urlencoded({extended: false})) 
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send("It is working");
})

// app.post('/imageurl', (req,res) => { image.handleApiCall(req,res)})

app.post('/signin', (req, res) => {
	const {email, password} = req.body;
	if (!email || !password) {
	   return	res.status(400).json('incorrect form submission')
	} 

	//console.log("Start signin");
	db.select('email','hash').from('login')
		.where('email', '=', email)
		.then(data => {
			const isValid = bcrypt.compareSync(password, data[0].hash);
			if (isValid) {
				return db.select('*').from('users')
					.where('email', '=', email)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.json(400).json('error logging in'))
			} else {
				res.status(400).json('error logging in')
			}
		})
		.catch(err => res.status(400).json('error logging in'))
	
})



app.post('/register', (req, res) => {
	const {email, name, password} = req.body;
	if (!email || !name || !password) {
	   return	res.status(400).json('incorrect form submission')
	} 
	//console.log("Start register");
	const hash = bcrypt.hashSync(password);
		db.transaction(trx => {
			trx.insert({
				hash: hash,
				email: email
			})
			.into('login')
			.returning('email')
			.then(loginEmail => {
				return trx('users')
					.returning('*')
					.insert({
						email: loginEmail[0],
						name: name,
						joined: new Date()
					})
					.then(user => {
						res.json(user[0]);
					})
			})
		
			.then(trx.commit)
			.catch(trx.rollback)
		})
		.catch(err => res.status(400).json('unable to register'))
		
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	let found = false;
	db.select('*').from('users').where({id})
		.then(user => {
		if (user.length) {
			res.json(user[0])
		} else {
			res.status(400).json('Not found')
		}
	})
	.catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => {
	const { id } = req.body;
	db('users')
	.where('id', '=', id)
	.increment('entries',1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0]);
	})
	.catch(err => res.status(400).json('unable to get entries'))
})



app.post('/imageurl', (req, res) => {
	const app2 = new Clarifai.App({
		 apiKey: 'c75512e42bd64032b45f220afaf0ccb7'
	});
	app2.models
	.predict(Clarifai.FACE_DETECT_MODEL,req.body.input)
	.then(data => {
		res.json(data)
	})
	.catch(err => res.status(400).json('unable to work with API'))
})

// app.use(express.static(__dirname + '/public'))


app.listen(process.env.PORT || 3000, () => {
	console.log('app is running on port ${}process.env.PORT')
});

