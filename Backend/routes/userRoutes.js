import express from 'express';
import {getUserFromToken} from "./UserFunctions.js";
import User from "../models/User.js";
import {registerUser, getUsers, loginUser, logoutUser} from "../controllers/UserController.js"

const router = express.Router();

router.post('/register', registerUser);
  
  router.get('/', getUsers);
  
  router.post('/login', loginUser);
  
  router.post('/logout', logoutUser);

  export default router;