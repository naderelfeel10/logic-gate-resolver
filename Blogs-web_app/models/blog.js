const mongoose = require('mongoose');
const schema = mongoose.Schema;

const blogSchema = new schema({

    title :{ 
        type:String,
        required : true,
        maxLength:20
    },
    snippet:{
        type:String,
        required:true,
        
    },
    body:{
        type:String,
        required:true,
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true});

const Blog = mongoose.model('blog',blogSchema);
module.exports = Blog;

