const express = require("express");
const session = require("express-session");
const { networkInterfaces } = require("os");
const path = require("path");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
var cors = require("cors");
var rpio = require("rpio");
const L298N = require("./node_modules/rpio-l298n/l298n.js");
const { reset } = require("nodemon");
const app = express();

let l298n = new L298N(12, 16, 18, 33, 35, 37);
l298n.setSpeed(l298n.NO1, 40);
l298n.setSpeed(l298n.NO2, 40);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../NodeCarWZero/build")));

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

app.post("/motor/direction", (req, res) => {
  let result = "";

  if (req.session.direction !== req.body.direction) {
    req.session.direction = req.body.direction;
    if (req.body.direction === "FORWARD") {
      Go();
      result = "go";
    }
    if (req.body.direction === "BACKWARD") {
      Back();
      result = "back";
    }
    if (req.body.direction === "RIGHT") {
      Right();
      result = "right";
    }
    if (req.body.direction === "LEFT") {
      Left();
      result = "left";
    }
  }
  result = req.session.direction;
  console.log(req.session.direction);
  res.status(200);
  res.send(result);
  res.end();
});

app.post("/motor/speed", (req, res) => {
  var speed = parseFloat(req.body.Speed) * 100;
  l298n.setSpeed(l298n.NO1, speed);
  l298n.setSpeed(l298n.NO2, speed);
  var objSpeed = { speed: speed };
  res.status(200);
  res.send(objSpeed);
  res.end();
});

function Go() {
  l298n.forward(l298n.NO1);
  l298n.forward(l298n.NO2);
}

function Back() {
  l298n.backward(l298n.NO1);
  l298n.backward(l298n.NO2);
}
function Left() {
  l298n.forward(l298n.NO1);
  l298n.stop(l298n.NO2);
}
function Right() {
  l298n.forward(l298n.NO2);
  l298n.stop(l298n.NO1);
}

function LightsOn() {
  // rpio.write(11, rpio.HIGH);
  // rpio.write(37, rpio.HIGH);
  // rpio.write(35, rpio.HIGH);
  // rpio.write(33, rpio.HIGH);
}

function LightsOff() {
  // rpio.write(11, rpio.LOW);
  // rpio.write(37, rpio.LOW);
  // rpio.write(35, rpio.LOW);
  // rpio.write(33, rpio.LOW);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../nodecarwzero/build/index.html"));
});

app.get("/getIP", (req, res) => {
  res.status(200);
  res.send("nodecarwzero.local");
  res.end();
});

app.post("/light", (req, res) => {
  console.log(req.body);
  if (req.body.response === "on") {
    LightsOn();
    res.send("on");
  }
  if (req.body.response === "off") {
    LightsOff();
    res.send("off");
  }
});

app.post("/camera/on", (req, res) => {
  exec("sh Start_mjpg_Streamer.sh");

  res.status(200);
  res.send("camera On");
  res.end();
});

app.post("/camera/off", (req, res) => {
  exec("killall mjpg_streamer");

  res.status(200);
  res.send("camera Off");
  res.end();
});

app.post("/motor/off", (req, res) => {
  if (req.body.response === "stop") {
    l298n.stop(l298n.NO1);
    l298n.stop(l298n.NO2);
    res.send("off");
  } else {
    res.send("not available");
  }
});

app.listen(80, () => console.log("Listenint on Port 80"));
