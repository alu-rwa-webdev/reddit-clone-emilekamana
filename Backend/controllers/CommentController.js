import {getUserFromToken} from "./UserFunctions.js";
import Comment from "../models/Comment.js";

export const getComments =  async(req, res) => {
    const search = req.query.search;
    const filters = search
      ? {body: {$regex: '.*'+search+'.*'}}
      : {rootId:null};
    Comment.find(filters).sort({postedAt: -1}).then(comments => {
      res.json(comments);
    });
  }
  
  export const getCommentsByRoot =  async(req, res) => {
    Comment.find({rootId:req.params.rootId}).sort({postedAt: -1}).then(comments => {
      res.json(comments);
    });
  }
  
  export const getCommentById =  async(req, res) => {
    Comment.findById(req.params.id).then(comment => {
      res.json(comment);
    });
  }
  
  export const postComment =  async(req, res) => {
    const token = req.cookies.token;
    if (!token) {
      res.sendStatus(401);
      return;
    }
    getUserFromToken(token)
      .then(userInfo => {
        const {title,body,parentId,rootId} = req.body;
        const comment = new Comment({
          title,
          body,
          author:userInfo.username,
          postedAt:new Date(),
          parentId,
          rootId,
        });
        comment.save().then(savedComment => {
          res.json(savedComment);
        }).catch(console.log);
      })
      .catch(() => {
        res.sendStatus(401);
      });
  }
