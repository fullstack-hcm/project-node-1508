const express       = require('express');
const server        = express();
const bodyParser    = require('body-parser');
const mongoose      = require('mongoose');
const PORT          = 3000;
const expressSession = require('express-session');

server.set('view engine', 'ejs');
server.set('views', './views/');
/**
 * setup express-session
 */
server.use(expressSession({
    secret: 'MERN_STACK_1508',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 10000
    }
}));

const { USER_ROUTER } = require('./routers/user.router');

server.use(express.static('./public/'));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json({}));

server.use('/user', USER_ROUTER);

server.get('/', async (req, res) => {
    res.json({})
});

server.get('*', (req, res) => res.render('error', { message: undefined } ));

const uri = 'mongodb://localhost:27017/project_ref_1508';
mongoose.connect(uri);
mongoose.connection.once('open', () => {
    console.log(`mongodb connected`);
    server.listen(PORT, () => console.log(`server started at port ${PORT}`));
});