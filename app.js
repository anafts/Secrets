const express = require("express")
const bodyParser = require("body-parser");
const mongoose = require ("mongoose");
const ejs = require("ejs");
const dotenv = require("dotenv");
const session = require('express-session')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

dotenv.config()

const app = express()

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// set up express session
app.use(session({
  secret: "little secret",
  resave: false,
  saveUninitialized: false
}));

// initialize and start using passport.js
app.use(passport.initialize());
/// allow passport to use express-session
app.use(passport.session());


//Connect to mongoDB
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({
    email: {
        type:String
    },
    password: {
        type: String
    }
});


// to hash and salt the passwords and to save the users into the mongoDB database
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User" , userSchema);

// passport-local Configuration
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/" , function(req, res){
    res.render("home")
}); 


app.get("/login" , function(req, res){
    res.render("login" , {errMsg:"" ,username:"", password:"" });
});


app.get("/register" , function(req, res) {
    res.render("register")
});

app.get("/secrets", function(req, res) {

  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res) {
 
  req.logout(function(err) {
      if (!err) {
          res.redirect("/");
      }
  });
});


app.post("/register"  , function(req, res) {

  User.register({username:req.body.username}, req.body.password , function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets")
      });
    }
  });
});

app.post("/login" , function(req, res) {
    
  User.findOne({username: req.body.username}, function(err, foundUser){
    if(foundUser){
      const user = new User({
      username: req.body.username,
      password: req.body.password
    });

      passport.authenticate("local", function(err, user){
        if(err){
          console.log(err);
        } else {
          if(user){
            req.login(user, function(err){
            res.redirect("/secrets");
            });
          } else {
            res.redirect("/login");
          }
        }
      })(req, res);
    } else {
      res.redirect("/login")
    }
  });
});


app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
