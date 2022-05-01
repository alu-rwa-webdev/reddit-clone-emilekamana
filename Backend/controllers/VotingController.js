import {getUserFromToken} from "./UserFunctions.js";
import Vote from "../models/Vote.js";

export const voteComment =  async(req, res) => {
  const token = req.cookies.token;
    if (!token) {
      res.sendStatus(401);
      return;
    }
  getUserFromToken(token)
    .then(userInfo => {

      // removing my existing votes
      Vote.remove({commentId:req.params.commentId,author:userInfo.username})
        .then(() => {

          if (['up','down'].indexOf(req.params.direction) === -1) {
            res.json(true);
            return;
          }

          // creating my new vote
          const vote = new Vote({
            author: userInfo.username,
            direction: req.params.direction === 'up' ? 1 : -1,
            commentId: req.params.commentId,
          });
          vote.save().then(() => {
            res.json(true);
          });

        });
    })
}

export const getCommentVotes =  async(req,res) => {
  const {commentsIds} = req.body;
  const token = req.cookies.token;
    if (!token) {
      res.sendStatus(401);
      return;
    }
  getUserFromToken(token).then(userInfo => {

    Vote.find({commentId: {'$in': commentsIds}})
      .then(votes => {
        let commentsTotals = {};
        votes.forEach(vote => {
          if (typeof commentsTotals[vote.commentId] === 'undefined') {
            commentsTotals[vote.commentId] = 0;
          }
          commentsTotals[vote.commentId] += vote.direction;
        });

        let userVotes = {};
        votes.forEach(vote => {
          if (vote.author === userInfo.username) {
            userVotes[vote.commentId] = vote.direction;
          }
        });

        res.json({commentsTotals, userVotes});
      });

  });
}
