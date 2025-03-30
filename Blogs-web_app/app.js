/*const express = require('express');
const mongoose = require('mongoose');

const app = express();

// middleware
app.use(express.static('public'));

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb+srv://shaun:test1234@cluster0.del96.mongodb.net/node-auth';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

// routes
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', (req, res) => res.render('smoothies'));*/

//const people = require('./models');
/*const xyz = require('./models');
console.log(xyz);
console.log(xyz.people);
console.log(xyz.ages);*/

//connecting without express
/*
const http = require('http');
const server = http.createServer((req,res)=>{
console.log('request made');
console.log(req.rawHeaders);
res.setHeader('content-type','text/plain');
//res.write('hello niggas');
res.write('<h1>hello niggas</h1>');

res.end();
});

server.listen(3000,'localhost',()=>{
  console.log('server is listening for request on port 3000');
});

*/

// using express :
 const express = require('express');
 const mongoose = require("mongoose");
 const Blog = require('./models/blog');
 const authRoutes = require('./routes/authRoutes');
 const cookieParser = require('cookie-parser');
 const User = require('./models/user'); 
 const jwt = require('jsonwebtoken');
 const { requireAuth, checkUser } = require('./middleware/authMiddleware');
 app.set('view engine','ejs');

 const app = express();

// middleware
app.use(express.static('views'));
app.use(express.json());
app.use(cookieParser());

app.get('*', checkUser);
app.use(authRoutes);
 const DbURL = "mongodb+srv://naderelfeel:nader123@cluster0.tiq3b.mongodb.net/node-blogs-tuts?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(DbURL,{useNewUrlParser:true, useUnifiedTopology:true})
  .then((result)=> app.listen(3000,(req,res)=>{
    console.log('connected to the server on port 5000');
  }))
  .catch((error)=>console.log("error in connecting to DB"));

  





app.use((req, res, next) => {
  console.log('new request made:');
  console.log('host: ', req.hostname);
  console.log('path: ', req.path);
  console.log('method: ', req.method);
  next();
});

app.use(express.urlencoded({extended:true}));  //chatches the data posted in the url and makes a object with it (req.body)

 app.get('/',(req,res)=>{

  res.redirect('/blogs');
 });
 app.get('/blogs',async(req,res)=>{
     //
     const loggedInUserId = await getLoggedInUser(req);
     //
     const user = await User.findById(loggedInUserId);

    Blog.find().then(async(result)=>{
      //const user = await User.findById(result.author);
      //const users = await Blog.find({ _id: { $in: user.blogs } });
      res.render('home',{title:'All Blogs',blogs:result});
    }).catch((error)=>{
      console.log(error);
    })

 });
 
app.get('/about',requireAuth,(req,res)=>{
  res.render('about',{title:'about'});
});

app.get('/blogs/create',requireAuth,(req,res)=>{
  res.render('create',{title:'create Blogs'});
});

const getLoggedInUser = async (req) => {
  const token = req.cookies.jwt; // Retrieve the JWT from cookies

  if (token) {
    try {
      // Decode the token
      const decodedToken = await jwt.verify(token, 'nader elfeel');
      console.log("decoded token : ",decodedToken);
      // Find the user by ID
      return decodedToken.id
      //const user = await User.findById(decodedToken.id);
      //console.log("decoded token id : ",decodedToken.id);
      //return user; // Return the user
    } catch (err) {
      console.error('JWT verification failed:', err.message);
      return 0; // Return null if verification fails
    }
  }

  return null; // Return null if no token is provided
};



app.post('/blogs',requireAuth,async(req,res)=>{
  const loggedInUserId = await getLoggedInUser(req);
  //const blog = new Blog(req.body);
  const user = await User.findById(loggedInUserId)
  console.log("my fucking user is :",user);
  const blog = new Blog({
    ...req.body,
    author: user._id // Attach logged-in user's ID as the author
  });

  await blog.save().then(res.redirect('/')).catch((err)=>{
    console.log(err);
  });
  await User.findByIdAndUpdate(
    user._id, 
    { $push: { blogs: blog._id } },  // Use the $push operator to add the blog ID
    { new: true }  // Return the updated user document
  );

  console.log(user.blogs);

  console.log(blog);
});

app.get('/blogs/:id',requireAuth,async(req,res)=>{
  //console.log(req.params.id);
  const loggedInUserId = await getLoggedInUser(req);
  const user = await User.findById(loggedInUserId); 
  const id = req.params.id;
 
  console.log(user.blogs);
  if(user.blogs.includes(id.toString())){
  Blog.findById(id).then((result)=>{
       //console.log(result.title);
      res.render('details',{title:result.title , blog:result,userEmail : user.email});
  }).catch((err)=>{
    console.log(err);
  });}else{
    res.render('error404',{title:"error"});
  }
}); 
app.delete('/blogs/:id', requireAuth,(req, res) => {
  const id = req.params.id;
  
  Blog.findByIdAndDelete(id)
    .then(result => {
      res.json({ redirect: '/blogs' });
    })
    .catch(err => {
      console.log(err);
    });
});

app.post('/blogs/:id/edit',requireAuth, async (req, res) => {
  
  try {
      const blogId = req.params.id;

      // Update the blog with new data from the form
      const updatedBlog = await Blog.findByIdAndUpdate(
          blogId,
          {
              title: req.body.title,
              snippet: req.body.snippet,
              body: req.body.body,
          },
          { new: true } // Return the updated document
      );

      res.redirect(`/blogs/${updatedBlog._id}`);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

app.get('/add-blog',requireAuth,(req,res)=>{

  const blog = new Blog({
     title:'new blog',
     snippet:'about my new blog',
     body:'more about my new blog'
  });

  blog.save().then((result)=>{
    res.send(result);
  }).catch((err)=>{
    console.log(err);
  });

});

app.get('/all-blogs',requireAuth,(req,res) => {

   Blog.find().then((result)=>{
    res.send(result);
   }).catch((err)=>{
    console.log(err);
   })
});
app.get('/my-blogs',requireAuth,async(req,res)=>{
  const loggedInUserId = await getLoggedInUser(req);
  const user = await User.findById(loggedInUserId); 
  console.log(user);
  const blogs = await Blog.find({ _id: { $in: user.blogs } });
  //const author = await User.e
  res.render('my-blogs',{title:'my-Blogs', blogs,userEmail : user.email});
});

app.get('/user-blogs/:author',requireAuth,async(req,res)=>{
  const authorId = req.params.author;
  const user = await User.findById(authorId);
  const blogs = await Blog.find({_id:{$in:user.blogs}});
  res.render('user-blogs',{title:authorId+'-blogs', blogs,userEmail : user.email})
  //res.send(req.params.author);
});
app.get('/login',(req,res)=>{
   res.render('login');
});
app.get('/verifyEmail',  (req,res)=>{
  res.render('verifyEmail');
})
app.get('/forgotPassword',(req,res)=>{
    res.render('forgotPassword');
})
app.get('/resetPassword/:token',(req,res)=>{
  const token = req.params.token;
  res.render('resetPassword',{token});

});
// error 404 (middle ware)
// if the other pathes is not reached it means it's a not valid path
 

app.use((req,res)=>{

  res.status(404).render('error404',{title:"error"});
});
