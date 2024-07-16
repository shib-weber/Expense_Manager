const mongoose=require('mongoose')

const userSchema = new mongoose.Schema({
    Email:{
        type:String,
        required:true,
        unique:true,
    },
    Password:{
        type:String,
        required:true,
    },
    MonthlyGoal:{
        type:Number,
        required:false,
    }
},{timestamps:true})

const User= mongoose.model('expus',userSchema);

const ExpenseSchema= new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:false
    },
})

const Expense= mongoose.model('expas',ExpenseSchema)

module.exports= {User,Expense}