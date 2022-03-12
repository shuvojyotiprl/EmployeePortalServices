const mongoose = require('mongoose');
var validator = require('validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

/*** validation functions ***/
function arrayLimit(val) {
    console.log('***** Array Limit validation ****')
    return val.length >= 2;
}



function validateDistinctAddrType(val){
    console.log('***** Employeee address type validation ******')
    if(val.length == 2){
        return val[0].Type != val[1].Type
    }
    else{
        return val.length == 2
    }

}

function checkDocTypes(val) {
    console.log('***** Checking Doc Types for ID Proof *******')
    var doc_type = new Array();
    for (var x = 0; x < val.length; x++) {
        doc_type.push(val[x].IdProofType)
    }
    console.log('doc types ==> ' + doc_type)
    if (doc_type[0] == doc_type[1]) {
        return false
    }
    else {
        return true
    }
}
/****************************/

var AddressSchema = new mongoose.Schema({
    Type: { type: String, enum: ['RESIDENTIAL', 'PERMANENT'], required: true },
    HouseNo: { type: String },
    WardNo: { type: Number },
    Street: { type: String },
    LandMark: { type: String },
    City: { type: String },
    State: { type: String, required: true },
    Country: { type: String, required: true },
    PinCode: { type: Number, required: true }
})

var EmpPersonalDetailsSchema = new mongoose.Schema(
    {
        Name: { type: String, required: true },
        Dob: { type: Date, required: true },
        Gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHERS'], required: true },
        EmailId: {
            type: String, required: true, unique: true,
            validate(data) {
                if (!validator.isEmail(data)) {
                    throw Error('Invalid Email ID')
                }
            }
        },
        Nationality: {
            type: String
        },
        ContactNo: {
            type: String,
            required: true,

            validate(v) {
                var re = /^\d{10}$/;
                return (v == null || v.trim().length < 1) || re.test(v)
            }


        },
        ProfilePic: {
            type: Buffer
        },
        EmpAddress: {type:[AddressSchema],required:true,
            validate:[validateDistinctAddrType,'Both address type can not be same and both type of address are required']},
        MarritalStatus: {
            type: String, enum: ['MARRIED', 'UNMARRIED'], required: true
        }
    }
)

var EducationDetailsSchema = new mongoose.Schema(

    {
        DegreeName: { type: String, required: true },
        PassingYear: { type: Number, required: true },
        Percentage: { type: Number, required: true },
        University: { type: String, required: true },
        Institution: { type: String, require: true }
    }

);

var CertificationSchema = new mongoose.Schema({
    CertifiedOn: { type: String },
    ProviderOrganization: { type: String },
    IssuedYear: { type: Number },
    ValidTill: { type: Number }
})

var IdentificationProof = new mongoose.Schema({
    IdProofType: { type: String, enum: ['AADHAR_ID', 'VOTER_ID', 'PAN_CARD', 'DRIVING_L', 'PASSPORT'], required: true },
    DocumentUploaded: { type: Buffer },
    FileName:{type:String,require:false}
})

var AuthenticationSchema = new mongoose.Schema({
    Password: { type: String, required: true },
    UserId: { type: String, required: true, unique: true },
    LastUpdated: { type: Date }
});



var EmpDetails = new mongoose.Schema({
    EmpPersonalDetails: EmpPersonalDetailsSchema,
    EducationDetails: [EducationDetailsSchema],
    Certification: [CertificationSchema],
    AuthenticationDetails: AuthenticationSchema,
    IdentificationProof: {
        type: [IdentificationProof], required: true,
        validate: [arrayLimit, '{PATH} validation failed - AT least 2 value required'],
        validate: [checkDocTypes, '{PATH} validation failed - Multiple Documents of same type, Please correct']
    },
    Tokens: [{
        token: {
            type: "String",
            required: true
        }
    }]
},
{
    timestamps : true
})

EmpDetails.pre('save', async function (next) {
    const user = this;

    console.log('**** Encrypting Password before saving user *****')

    if (user.isModified('AuthenticationDetails.Password')) {
        console.log('****** Encyption Process Runs ******')
        user.AuthenticationDetails.Password = await bcrypt.hash(user.AuthenticationDetails.Password, 8)
    }

    next();
})

EmpDetails.statics.findByCredentials = async (userid, password) => {
    console.log("*** Fetching User Details By Credentials ***")
    //console.log(userid,password)
    const user = await EmployeeDetails.findOne({ 'AuthenticationDetails.UserId': userid })
    if (!user)
        throw Error("User id " + userid + " is not valid")

    const isMatch = await bcrypt.compare(password, user.AuthenticationDetails.Password)
    if (!isMatch)
        throw Error("Invalid password")

    return user;
}

EmpDetails.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ UserId: user.AuthenticationDetails.UserId.toString() }, process.env.JWT_KEY)
    user.Tokens = user.Tokens.concat({ token })
    await user.save()
    return token
}

EmpDetails.methods.usePublicProfile = async function () {

    const user = this
    const publicUser = user.toObject();

    delete publicUser._id
    delete publicUser.EmpPersonalDetails._id
    delete publicUser.EmpPersonalDetails.ProfilePic

    delete publicUser.AuthenticationDetails._id
    delete publicUser.AuthenticationDetails.Password
    delete publicUser.AuthenticationDetails.LastUpdated

    delete publicUser.Tokens

    delete publicUser.__v

    for(var x=0 ; x<publicUser.EmpPersonalDetails.EmpAddress.length;x++){
        delete publicUser.EmpPersonalDetails.EmpAddress[x]._id
    }

    // for(var x=0 ; x<publicUser.EducationDetails.length;x++){
    //    delete publicUser.EducationDetails[x]._id
    // }

    // for(var x=0 ; x<publicUser.Certification.length;x++){
    //     delete publicUser.Certification[x]._id
    // }

    for(var x=0 ; x<publicUser.IdentificationProof.length;x++){
        delete publicUser.IdentificationProof[x]._id
        delete publicUser.IdentificationProof[x].DocumentUploaded
    }

    return publicUser

}




const EmployeeDetails = mongoose.model('EmpDetails', EmpDetails)
