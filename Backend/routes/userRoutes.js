import express from 'express';
import {getUserFromToken} from "../UserFunctions.js";
import User from "../models/User.js";

const router = express.Router();
router.post('/register', (req, res) => {
    const {email,username} = req.body;
    const password = bcrypt.hashSync(req.body.password, 10);
    const user = new User({email,username,password});
    user.save().then(user => {
      jwt.sign({id:user._id}, secret, (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.status(201).cookie('token', token).send();
        }
      });
    }).catch(e => {
      console.log(e);
      res.sendStatus(500);
    });
  });
  
  router.get('/user',verifyLoggedInToken, (req, res) => {
    const token = req.cookies.token;
  
    getUserFromToken(token)
      .then(user => {
        res.json({username:user.username});
      })
      .catch(err => {
        console.log(err);
        res.sendStatus(500);
      });
  
  });
  
  router.post('/login', (req, res) => {
    const {username, password} = req.body;
    User.findOne({username}).then(user => {
      if (user && user.username) {
        const passOk = bcrypt.compareSync(password, user.password);
        if (passOk) {
          jwt.sign({id:user._id}, secret, (err, token) => {
            res.cookie('token', token).send();
          });
        } else {
          res.status(422).json('Invalid username or password');
        }
      } else {
        res.status(422).json('Invalid username or password');
      }
    });
  });
  
  router.post('/logout', (req, res) => {
    res.cookie('token', '').send();
  });

  // // This funtion is middleware for verifying the user is logged in. 
function verifyLoggedInToken(req, res, next) {
    try {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearerToken = bearerHeader.split(' ')[1];
            req.token = bearerToken;
            try {
              jwt.verify(req.token, secret, (error, authData) => {
                  if (error) {
                      res.send("token error: not logged in")
                  }
                  next();
                  // res.json({
                  //     message: "post Created",
                  //     authData
                  // })
              })
          } catch (error) {
              res.send(error)
          }
        }
        else {
            res.send("token error: No token. Not logged-in")
        }
    }
    catch {
        res.send("something went wrong")
    }
  }

  export default router;