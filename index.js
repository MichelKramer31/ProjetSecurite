
const path = require('path');
const express = require('express');
const session = require('express-session');
const favicon = require('serve-favicon');
const Keycloak = require('keycloak-connect');
var bodyParser = require('body-parser');

const app = express();
const memoryStore = new session.MemoryStore();

app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, '/view'));
app.use(express.static('static'));
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(session({
    secret: 'KWhjV<T=-*VW<;cC5Y6U-{F.ppK+])Ub',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const notes = {
    ue1:{
        michel:20,
        rafael:20,
        valide:"Notes non validées"
    },
    ue2:{
        michel:15,
        rafael: 15,
        valide:"Notes non validées"
    },
    ue3:{
        michel:10,
        rafael:10,
        valide:"Notes non validées"
    }}

const keycloak = new Keycloak({
    store: memoryStore,
});

app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/',
}));

app.get('/', (req, res) => res.redirect('/home'));

const parseToken = raw => {
    if (!raw || typeof raw !== 'string') return null;

    try {
        raw = JSON.parse(raw);
        const token = raw.id_token ? raw.id_token : raw.access_token;
        const content = token.split('.')[1];

        return JSON.parse(Buffer.from(content, 'base64').toString('utf-8'));
    } catch (e) {
        console.error('Error while parsing token: ', e);
    }
};

app.get('/home', keycloak.protect(), (req, res, next) => {
    const details = parseToken(req.session['keycloak-token']);
    const params = {};

    if (details) {
        params.name = details.name;
        params.email = details.email;
        params.username = details.preferred_username;
    }

    res.render('home', {
        user: params,
    });
});



app.get('/login', keycloak.protect(), (req, res) => {
    return res.redirect('home');
});

app.get('/ue1', keycloak.enforcer(['UE1:lire']), (req, res) => {
    const details = parseToken(req.session['keycloak-token']);
    const params = {};

    if (details) {
        params.name = details.name;
        params.email = details.email;
        params.username = details.preferred_username;
    }

    res.render('ressource',{
        ue:'1',
        user:params,
        notes:notes.ue1,
        message:''
    })

});

app.get('/ue1/valider', keycloak.enforcer(['UE1:valider']), (req, res) => {

    const details = parseToken(req.session['keycloak-token']);
    const params = {};

    if (details) {
        params.name = details.name;
        params.email = details.email;
        params.username = details.preferred_username;
    }

    notes.ue1.valide = "Notes validées"

    res.render('ressource',{
        ue:'1',
        user:params,
        notes:notes.ue1,
        message:"Les notes ont bien été validé"
    })

});

app.post('/ue1/enregistrer', keycloak.enforcer(['UE1:ecrire']), (req, res) => {

    var nouvellesNotes = req.body;

    notes.ue1.michel = nouvellesNotes.note_michel;
    notes.ue1.rafael = nouvellesNotes.note_rafael;

    res.redirect('/ue1')

});

app.get('/ue2', keycloak.enforcer(['UE2:lire']), (req, res) => {
    const details = parseToken(req.session['keycloak-token']);
    const params = {};

    if (details) {
        params.name = details.name;
        params.email = details.email;
        params.username = details.preferred_username;
    }

    res.render('ressource',{
        ue:'2',
        user:params,
        notes:notes.ue2,
        message:''
    })

});

app.get('/ue2/valider', keycloak.enforcer(['UE2:valider']), (req, res) => {

    const details = parseToken(req.session['keycloak-token']);
    const params = {};

    if (details) {
        params.name = details.name;
        params.email = details.email;
        params.username = details.preferred_username;
    }

    notes.ue1.valide = "Notes validées"

    res.render('ressource',{
        ue:'2',
        user:params,
        notes:notes.ue2,
        message:"Les notes ont bien été validé"
    })

});

app.post('/ue2/enregistrer', keycloak.enforcer(['UE2:ecrire']), (req, res) => {

    var nouvellesNotes = req.body;

    notes.ue2.michel = nouvellesNotes.note_michel;
    notes.ue2.rafael = nouvellesNotes.note_rafael;

    res.redirect('/ue2')

});

app.get('/ue3', keycloak.enforcer(['UE3:lire']), (req, res) => {
    const details = parseToken(req.session['keycloak-token']);
    const params = {};

    if (details) {
        params.name = details.name;
        params.email = details.email;
        params.username = details.preferred_username;
    }

    res.render('ressource',{
        ue:'3',
        user:params,
        notes:notes.ue3,
        message:''
    })

});

app.get('/ue3/valider', keycloak.enforcer(['UE3:valider']), (req, res) => {

    const details = parseToken(req.session['keycloak-token']);
    const params = {};

    if (details) {
        params.name = details.name;
        params.email = details.email;
        params.username = details.preferred_username;
    }

    notes.ue1.valide = "Notes validées"

    res.render('ressource',{
        ue:'3',
        user:params,
        notes:notes.ue3,
        message:"Les notes ont bien été validé"
    })

});

app.post('/ue3/enregistrer', keycloak.enforcer(['UE3:ecrire']), (req, res) => {

    var nouvellesNotes = req.body;

    notes.ue3.michel = nouvellesNotes.note_michel;
    notes.ue3.rafael = nouvellesNotes.note_rafael;

    res.redirect('/ue3')

});



app.use((req, res, next) => {
    return res.status(404).end('Not Found');
});

app.use((err, req, res, next) => {
    return res.status(req.errorCode ? req.errorCode : 500).end(req.error ? req.error.toString() : 'Internal Server Error');
});

const server = app.listen(3000, '192.168.1.49', () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log('Application running at http://%s:%s', host, port);
});
