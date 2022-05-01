import express from 'express';
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import mongoose from "mongoose";
import cors from 'cors';
import UserRoutes from "./routes/UserRoutes.js";
import CommentRoutes from "./routes/CommentRoutes.js";
import VotingRoutes from "./routes/VotingRoutes.js";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' assert {type: "json"};


const secret = 'secret123';
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors({
  origin: 'https://em-reddit-clone-client.herokuapp.com',
  credentials: true,
}));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'https://em-reddit-clone-client.herokuapp.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/vote", VotingRoutes);
app.use("/user", UserRoutes);
app.use("/comment", CommentRoutes);

await mongoose.connect('mongodb+srv://victory:6uzyWvxvi3ilOeSI@redditdb.xaeix.mongodb.net/reddit_db?retryWrites=true&w=majority', {useNewUrlParser:true,useUnifiedTopology:true,});
const db = mongoose.connection;
db.on('error', console.log);

app.get('/', (req, res) => {
  res.send('ok');
});
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});
var port_number = app.listen(process.env.PORT || 3000);
app.listen(port_number);
// console.log(port_number)