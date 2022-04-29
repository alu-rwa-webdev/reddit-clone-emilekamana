import express from 'express';
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import User from "./models/User.js";
import Comment from "./models/Comment.js";
import VotingRoutes from "./routes/VotingRoutes.js";
import mongoose from 'mongoose';
import morgan from 'morgan';
import dotenv from 'dotenv';
// const tasksRoutes = require('./routes/tasksRoutes')
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');
import jwt from 'jsonwebtoken';

dotenv.config()

const secret = 'secret123';
const app = express()
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
 
const port = 4000

app.use(VotingRoutes);
// JSON body parser 
app.use(express.json())
// morgan HTTP logger
app.use(morgan('tiny'))
// Task related routes
// app.use('/v1/tasks', tasksRoutes)

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/votes", VotingRoutes);

const password = process.env.PASSWORD;
const cluster =  process.env.CLUSTER;
const dbname = process.env.DB_NAME;

mongoose.connect(
  `mongodb+srv://emile-kamana:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

// test MongoDB connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

function getUserFromToken(token) {
  const userInfo = jwt.verify(token, secret);
  return User.findById(userInfo.id);
}

app.get('/', (req, res) => {
  res.send('ok');
});



app.get('/comments',verifyLoggedInToken, (req, res) => {
  const search = req.query.search;
  const filters = search
    ? {body: {$regex: '.*'+search+'.*'}}
    : {rootId:null};
  Comment.find(filters).sort({postedAt: -1}).then(comments => {
    res.json(comments);
  });
});

app.get('/comments/root/:rootId',verifyLoggedInToken, (req, res) => {
  Comment.find({rootId:req.params.rootId}).sort({postedAt: -1}).then(comments => {
    res.json(comments);
  });
});

app.get('/comments/:id',verifyLoggedInToken, (req, res) => {
  Comment.findById(req.params.id).then(comment => {
    res.json(comment);
  });
});

app.post('/comments',verifyLoggedInToken, (req, res) => {
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
});
// generate token for another API to use in req.header
// app.post('/login', (req, res) => {
//   const user = {
//       id: 1,
//       username: 'abhishek',
//       email: "abhishek@gmail.com"
//   }
//   let token = jwt.sign({ user: user }, 'shhhhh');
//   res.send(token);
// })

// app.post('/logout', (req, res) => {
//   res.cookie('token', '').send();
// });

// // verifyToken is a function that is used for check in API that token exist or not
// // it can be put in between n number of API to check that authoriZed user loggedin or not.
// app.get('/api', verifyToken, (req, res) => {
//   try {
//       jwt.verify(req.token, 'shhhhh', (error, authData) => {
//           if (error) {
//               res.send("not logged in")
//           }
//           res.json({
//               message: "post Created",
//               authData
//           })
//       })
//   } catch (error) {
//       res.send(error)
//   }
// })

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
// // This funtion is middleware. 
// function verifyToken(req, res, next) {
//   try {
//       const bearerHeader = req.headers['authorization'];
//       if (typeof bearerHeader !== 'undefined') {
//           const bearerToken = bearerHeader.split(' ')[1];
//           req.token = bearerToken;
//           next();
//       }
//       else {
//           res.send("Not logged-in")
//       }
//   }
//   catch {
//       res.send("something went wrong")
//   }
// }

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})