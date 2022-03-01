const mongoose = require('mongoose');



var ProjectSchema = new mongoose.Schema({
    Type: { type: String },
    CostCenter: { type: String },
    Location: { type: String },
    ProjectName: { type: String },
    Description: { type: String },
    ClientName: { type: String },
    ContractStartDate: { type: Date},
    ContractEndDate: { type: Date},
    Manager : {type:String},
    Technology : [{type:String}]
})


mongoose.model('ProjectDetails', ProjectSchema);