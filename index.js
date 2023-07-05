const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const authRouter = require("./routes/authRoute");
const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const app = express();


const port = process.env.PORT || 5001;

dbConnect();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/user', authRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
