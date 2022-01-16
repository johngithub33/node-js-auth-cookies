// src/index.js

// import all the modules/packages
const express = require("express");
const path = require("path");
const cookieparser = require("cookie-parser");
const session = require('express-session');
const app = express();

app.use(session({
    secret:'randomstring23234243asldkfjsdfssldkj',
    resave: true, //default is true, resaves to session store even if not modified
    httpOnly: false,
    saveUninitialized: true,
    cookie: {
      secure: false, //send back cookie if HTTPS connection or not
      signed: false}
  }))

// allow the app to use express

app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "..", "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//*******************************************************************************************************
//can protect all routes after here
function checkLoggedIn(req,res,next){

  console.log('in checkloggedin, sessionID is: ', req.sessionID);
  console.log('in checkloggedin, req.session.username is: ', req.session.username);
  
  if(!req.session.loggedIn){
    console.log('session info: ', req.session, req.sessionID);
    res.render("notLoggedIn.ejs") 
  }

  else{
    console.log('session info: ', req.session, req.sessionID);
    next();
  }

}
//*******************************************************************************************************


//try global var over several requests
var failedLogin = false;

//test data
//put users, userid, pdwd, and shopping cart data in database later
let userdetails = { username: "bob", password: "123" };




//logic in ejs file if not logged in
app.get("/", (req, res) => {  

  if(req.session.loggedIn)
  {
    console.log(req.session);
    let username = req.session.username;
    res.render("home.ejs", {username})  
  }
  
  else
  {
    res.render("notLoggedIn.ejs") 
  }

  
});

app.use('/login',(req,res,next) => {
  console.log('test for LOGIN MIDDLEAWARE ONLY!!! function!')
  next();
})

app.get("/login", (req, res) => {

  console.log('in login, sessionID is: ', req.sessionID);
  console.log('in login, req.session.username is: ', req.session.username);

  if(req.session.loggedIn) res.redirect('/welcome')
  else res.render('login');

});


//LOGIN PROCESS ********************************
//login page posts here!
app.post("/process_login", (req, res) => {
  
        // user and pdwd match then login
        if (req.body.username === userdetails["username"] && req.body.password === userdetails["password"]
        ) {
              req.session.loggedIn = true;
              req.session.username = req.body.username;

              res.redirect("/welcome");
          } 

        else {
          res.render('login', { error: "Username or Password Incorrect." })
        }
});



//only if logged in
//logic in welcome.ejs if not logged in
app.get("/welcome", checkLoggedIn, (req, res) => {
  
    console.log('in welcome, sessionID is: ', req.sessionID);
    console.log('in welcome, req.session.username is: ', req.session.username);
    
    let username = req.session.username;
    res.render("welcome", {username})

});


app.get('/authorizedPage',checkLoggedIn, (req,res) => {

  console.log('in authorizedPage, sessionID is: ', req.sessionID);
  console.log('in authorizedPage, req.session.username is: ', req.session.username);

  let username = req.session.username;
  if(req.session.loggedIn) res.render('authorizedPage.ejs', {username})
  else res.render('login')

})

app.get("/logout", (req, res) => {

  res.clearCookie("connect.sid");
  // req.session.loggedIn = false;
  req.session.destroy();
  
  failedLogin = false;

  return res.redirect("/login");
  
});





app.listen(4000, () => console.log(`server started on port: 4000`));