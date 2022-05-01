import {getUserFromToken} from "./UserFunctions.js";
import User from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const secret = 'secret123';
export const registerUser =  async(req, res) => {
    const {email,username} = req.body;
    const password = bcrypt.hashSync(req.body.password, 10);
    const user = new User({email,username,password});
    user.save().then(user => {
      jwt.sign({id:user._id}, secret, (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.status(201).cookie('token', token, { sameSite: 'none', secure: true }).send();
        }
      });
    }).catch(e => {
      console.log(e);
      res.sendStatus(500);
    });
  }
  
  export const getUsers =  async(req, res) => {
    const token = req.cookies.token;
    if (!token) {
      res.sendStatus(401);
      return;
    }
    getUserFromToken(token)
      .then(user => {
        res.json({username:user.username});
      })
      .catch(err => {
        console.log(err);
        res.sendStatus(500);
      });
  }
  
  export const loginUser =  async(req, res) => {
    const {username, password} = req.body;
    User.findOne({username}).then(user => {
      if (user && user.username) {
        const passOk = bcrypt.compareSync(password, user.password);
        if (passOk) {
          jwt.sign({id:user._id}, secret, (err, token) => {
            res.cookie('token', token,{ sameSite: 'none', secure: true }).send();
          });
        } else {
          res.status(422).json('Invalid username or password');
        }
      } else {
        res.status(422).json('Invalid username or password');
      }
    });
  }
  
  export const logoutUser =  async(req, res) => {
    res.cookie('token', '').send();
  }
