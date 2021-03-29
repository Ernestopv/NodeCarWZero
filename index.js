const express = require("express");
const { networkInterfaces } = require("os");
const path = require("path");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
var cors = require("cors");
var rpio = require("rpio");
const { reset } = require("nodemon");
const app = express();

rpio.open(24, rpio.OUTPUT, rpio.LOW);
rpio.open(26, rpio.OUTPUT, rpio.LOW);
rpio.open(19, rpio.OUTPUT, rpio.LOW);
rpio.open(21, rpio.OUTPUT, rpio.LOW);
rpio.open(11, rpio.OUTPUT, rpio.LOW);
rpio.open(37, rpio.OUTPUT, rpio.LOW);
rpio.open(35, rpio.OUTPUT, rpio.LOW);
rpio.open(33, rpio.OUTPUT, rpio.LOW);

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
  rpio.write(21, rpio.LOW);
  rpio.write(26, rpio.LOW);
  rpio.write(19, rpio.HIGH);
  rpio.write(24, rpio.HIGH);
}

function Back() {
  rpio.write(21, rpio.HIGH);
  rpio.write(26, rpio.HIGH);
  rpio.write(19, rpio.LOW);
  rpio.write(24, rpio.LOW);
}
function Left() {
  rpio.write(21, rpio.LOW);
  rpio.write(26, rpio.LOW);
  rpio.write(19, rpio.LOW);
  rpio.write(24, rpio.HIGH);
}
function Right() {
  rpio.write(21, rpio.LOW);
  rpio.write(26, rpio.LOW);
  rpio.write(19, rpio.HIGH);
  rpio.write(24, rpio.LOW);
}
function LightsOn() {
  rpio.write(11, rpio.HIGH);
  rpio.write(37, rpio.HIGH);
  rpio.write(35, rpio.HIGH);
  rpio.write(33, rpio.HIGH);
}

function LightsOff() {
  rpio.write(11, rpio.LOW);
  rpio.write(37, rpio.LOW);
  rpio.write(35, rpio.LOW);
  rpio.write(33, rpio.LOW);
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
  exec("motion");

  res.status(200);
  res.send("camera On");
  res.end();
});

app.post("/camera/off", (req, res) => {
  exec("killall motion");

  res.status(200);
  res.send("camera Off");
  res.end();
});

app.post("/motor/off", (req, res) => {
  if (req.body.response === "stop") {
    rpio.write(24, rpio.LOW);
    rpio.write(26, rpio.LOW);
    rpio.write(19, rpio.LOW);
    rpio.write(21, rpio.LOW);
    res.send("off");
  } else {
    res.send("not available");
  }
});

app.listen(3001, () => console.log("Listenint on Port 3001"));
