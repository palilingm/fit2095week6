const mongoose = require('mongoose');

var doctorSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    fullName: {
        firstName: {
            type: String,
            required: true
        },
        lastName: String
    },
    dateOfBirth: {
        type: Date,
        get: (dob) => {
            newDate = new Date(dob)
            return formatDate(newDate);
        }
    },
    address: {
        state: {
            type: String,
            validate: {
                validator: (value) => {
                    return value.length >= 2 && value.length <= 3;
                },
                message: 'State shold be between 2 or 3 characters'
            }
        },
        suburb: String,
        street: String,
        unit: String //Saving Unit as a string as it is not required for math expression and some unit number may contain letters
    },
    numPatients: {
        type: Number,
        min: 0,
        default: 0
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('Doctor', doctorSchema);

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