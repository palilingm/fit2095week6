const express = require('express');
const mongoose = require('mongoose');
const path = require('path/posix');

const app = express();

const Doctors = require('./models/doctor');
const Patients = require('./models/patient');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('PORT', 80);

app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('public/img'));
app.use(express.static('public/css'));

app.listen(app.get('PORT'), () => {
    console.log(`Listening on port ${app.get('PORT')}`)
});

var dbUrl = 'mongodb://localhost:27017/Week6Lab';

mongoose.connect(dbUrl, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("Connected to database successfully");
});
//GET Requests
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/addDoctor', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addDoctor.html'));
});

app.get('/addPatient', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addPatient.html'));
});

app.get('/deletePatient', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'deletePatient.html'));
});

app.get('/updateDoctor', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'updateDoctor.html'));
});

app.get('/extraPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'extraPage.html'));
});

app.get('/listDoctor', (req, res) => {
    Doctors.find({}, (err, docs) => {
        res.render('listDoctor.html', {
            data: docs
        });
    });
});

app.get('/listPatient', (req, res) => {
    Patients.find({}).populate('doctor').exec((err, docs) => {
        res.render('listPatient.html', {
            data: docs
        });
    });
});

app.get('/invalid', (req, res) => {
    res.render('invalid.html', {
        message: 'Invalid Input'
    });
});

app.get('/*', (req, res) => {
    res.render('invalid.html', {
        message: '404 No Such Page Existed'
    });
});

//POST Requests
app.post('/addDoctor', (req, res) => {
    newDoctor = createDoctor(req.body);
    if (saveDocument(newDoctor, res)) {
        res.redirect('/listDoctor');
    }
});

app.post('/addPatient', (req, res) => {
    newPatient = createPatient(req.body);
    if (saveDocument(newPatient, res)) {
        res.redirect('/listPatient');
    }
});

app.post('/deletePatient', (req, res) => {
    Patients.deleteOne({
        'fullName': `${req.body.fullName}`
    }, (err, doc) => {});
    res.redirect('/listPatient');
});

app.post('/updateDoctor', (req, res) => {
    if (req.body.doctor != undefined && req.body.doctor.length == 24) {
        req.body.doctor = ObjectId(req.body.doctor);
    } else {
        res.redirect('/invalid');
        return;
    }
    Doctors.updateOne({
        '_id': `${req.body.doctor}`
    }, {
        $set: {
            'numPatients': `${req.body.numPatients}`
        }
    }, (err, doc) => {
        if (err) {
            res.redirect('/invalid');
        }
    });
    res.redirect('/listDoctor');
});

app.post('/extraPage', (req, res) => {
    Doctors.find({'numPatients':`${req.body.numPatients}`},(err, docs) => {
            res.render('listDoctor.html', {
            data: docs
        });
    });
});

//functions
function createDoctor(body) {
    let newDoctor = new Doctors({
        fullName: {
            firstName: body.firstName,
            lastName: body.lastName
        },
        dateOfBirth: body.dateOfBirth,
        address: {
            state: body.state,
            suburb: body.suburb,
            street: body.street,
            unit: body.unit
        },
        numPatients: body.numPatients
    });
    return newDoctor;
}

function createPatient(body) {
    let newPatient = new Patients({
        fullName: body.fullName,
        doctor: body.doctor,
        age: body.age,
        dateOfVisit: body.dateOfVisit || undefined,
        description: body.description
    });
    if (newPatient.doctor != undefined && newPatient.doctor.length == 24) {
        newPatient.doctor = ObjectId(newPatient.doctor);
    }
    Doctors.updateOne({
        '_id': newPatient.doctor
    }, {
        $inc: {
            numPatients: 1
        }
    }, (err, doc) => {});
    return newPatient;
}

function saveDocument(document, res) {
    let noError;
    document.save((err) => {
        if (err) {
            res.redirect('/invalid');
            noError = false;
            return;
        }
        console.log('Saved successfully')
        noError=true;
    });
    return noError;
}