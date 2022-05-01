import express from 'express';
import {getUserFromToken} from "./UserFunctions.js";
import {getComments, getCommentById, getCommentsByRoot, postComment} from "../controllers/CommentController.js"

const router = express.Router();

router.get('/', getComments);
  
  router.get('/root/:rootId', getCommentsByRoot);
  
  router.get('/:id', getCommentById);
  
  router.post('/', postComment);

export default router