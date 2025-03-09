const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require('path');

//Importing Functions
const authRouter = require("./routers/authRouter");
const postRouter = require("./routers/postRouter");

const app = express();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per window
});

//Middleware
app.use(cors());
app.use(limiter);
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//MongoDB Connection..
mongoose.connect(process.env.MONGO_URI)
.then(()=>{ console.log("Mongodb conected..")})
.catch((err)=>{ console.log("ERROR : ",err) });

//Routes
app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);
app.get("/", (req,res)=>{
    res.end("hello");
});

app.listen(process.env.PORT, ()=>{console.log("Server started on ",process.env.PORT);});
