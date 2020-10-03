const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

//3rd step
const admin = require("firebase-admin");
// 4th step 
require('dotenv').config()
console.log(process.env.DB_USER)


const app = express();

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zcwe.mongodb.net/arabSecond?retryWrites=true&w=majority`;

// 3rd step
var serviceAccount = require("./configs/burj-al-arab-9777d-firebase-adminsdk-4u5lg-ca4d3684bb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB,
});

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("This is your server site");
});


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const bookings = client.db("arabSecond").collection("bookings");

  //   1st step //sending data to database // create data
  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    // console.log(newBooking)
    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  // 1st step end

  // 2nd step reading data form data base // loading data
  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      console.log({ idToken });
      // idToken comes from the client app 3rd step second
      admin
        .auth()
        .verifyIdToken(idToken)
        .then(function (decodedToken) {
          let tokenEmail = decodedToken.email;
          if (tokenEmail == req.query.email) {
            bookings
              .find({ email: req.query.email })
              .toArray((err, documents) => {
                res.send(documents);
              });
          }
          // ...
        })
        .catch(function (error) {
          // Handle error
        });
    }
    // 3rd second step 
    else{
        res.status(401).send('unauthorized access')
    }
  });
  //2nd step ends here
});

app.listen(4200, () => {
  console.log("Everything is fine");
});

//create read & load jwt token verification 
