const mongoose = require('mongoose');

var patientSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    fullName: {
        type: String,
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    age: {
        type: Number,
        validate: {
            validator: (age) => {
                return age >= 0 && age <= 120
            },
            message: 'Please insert a proper age!'
        }
    },
    dateOfVisit: {
        type: Date,
        default: Date.now(),
        get: (dov) => {
            newDate = new Date(dov)
            return formatDate(newDate);
        }
    },
    description: {
        type: String,
        validate: {
            validator: (desc) => {
                return desc.length >= 10;
            },
            message: 'Please have 10 or more character for the description!'
        }
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('Patient', patientSchema);

//functions
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}