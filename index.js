const express = require("express");
const { networkInterfaces } = require("os");
const path = require("path");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
var cors = require("cors");
var rpio = require("rpio");
const L298N = require("./l298n/l298n.js");
const { reset } = require("nodemon");
const app = express();

let l298n = new L298N(12, 18, 16, 33, 35, 37);
l298n.setSpeed(l298n.NO1, 10);
l298n.setSpeed(l298n.NO2, 10);
rpio.open(7, rpio.OUTPUT, rpio.LOW);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../NodeCarWZero/build")));

app.post("/motor/direction", (req, res) => {
  let result = "";
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

  console.log(req.body);
  res.status(200);
  res.send(result);
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
  l298n.stop(l298n.NO1);
  l298n.forward(l298n.NO2);
}

function LightsOn() {
  rpio.write(7, rpio.HIGH);
}

function LightsOff() {
  rpio.write(7, rpio.LOW);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../nodecarwzero/build/index.html"));
});

app.get("/getIP", (req, res) => {
  res.status(200);
  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  res.send(results["wlan0"][0]);
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
  exec("sh Starh");

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
