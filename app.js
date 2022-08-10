const express = require("express")
const bodyParser = require("body-parser");
const mongoose = require ("mongoose");
const encrypt = require("mongoose-encryption");
const ejs = require("ejs");
const dotenv = require("dotenv");

dotenv.config()

const app = express()

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({
    email: {
        type:String
    },
    password: {
        type: String
    }
});

userSchema.plugin(encrypt, { secret: process.env.SECRET_KEY , encryptedFields: ['password'] });

const User = new mongoose.model("User" , userSchema);

app.get("/" , function(req, res){
    res.render("home")
}); 


app.get("/login" , function(req, res){
    res.render("login" , {errMsg:"" ,username:"", password:"" });
});


app.get("/register" , function(req, res) {
    res.render("register")
});


app.post("/register"  , function(req, res) {
    const newUser = new User ({
        email: req.body.username ,
        password: req.body.password
    })
    newUser.save(function(err){
        if (!err){
        res.render("secrets");
        } else {
            console.log(err);
        }
    })
});

app.post("/login" , function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser) => {
        if (err) {
          console.log(err);
        } else {
          if (foundUser) {
            if (foundUser.password === password) {
              res.render("secrets");
              console.log("New login (" + username + ")");
            } else {
              res.render("login", {errMsg: "Email or password incorrect", username: username, password: password});
            }
          } else {
            res.render("login", {errMsg: "Email or password incorrect", username: username, password: password});
          }
        }
      });
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
