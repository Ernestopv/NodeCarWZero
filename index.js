const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
var rpio = require("rpio");
const app = express();

rpio.open(24, rpio.OUTPUT, rpio.LOW);
rpio.open(26, rpio.OUTPUT, rpio.LOW);
rpio.open(19, rpio.OUTPUT, rpio.LOW);
rpio.open(21, rpio.OUTPUT, rpio.LOW);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post("/motor/direction", (req, res) => {
  if (req.body.angle === "up" && req.body.direction === "FORWARD") {
    Go();
  }
  if (req.body.angle === "down" && req.body.direction === "BACKWARD") {
    Back();
  }
  if (req.body.angle === "up" && req.body.direction === "RIGHT") {
    RightUp();
  }
  if (req.body.angle === "up" && req.body.direction === "LEFT") {
    LeftUp();
  }

  if (req.body.angle === "down" && req.body.direction === "RIGHT") {
    RightDown();
  }
  if (req.body.angle === "down" && req.body.direction === "LEFT") {
    LeftDown();
  }

  if (req.body.angle === "" && req.body.direction === "RIGHT") {
    Right();
  }
  if (req.body.angle === "" && req.body.direction === "LEFT") {
    Left();
  }

  console.log(req.body);
  res.status(200);
  res.send("ok");
  res.end();
});

function Go() {
  rpio.write(19, rpio.HIGH);
  rpio.write(21, rpio.LOW);
}

function Back() {
  rpio.write(21, rpio.HIGH);
  rpio.write(19, rpio.LOW);
}

function LeftUp() {
  rpio.write(26, rpio.LOW);
  rpio.write(24, rpio.HIGH);
  Go();
}

function RightUp() {
  rpio.write(26, rpio.HIGH);
  rpio.write(24, rpio.LOW);
  Go();
}

function LeftDown() {
  rpio.write(26, rpio.LOW);
  rpio.write(24, rpio.HIGH);
  Back();
}

function Left() {
  rpio.write(26, rpio.LOW);
  rpio.write(24, rpio.HIGH);
}
function Right() {
  rpio.write(26, rpio.HIGH);
  rpio.write(24, rpio.LOW);
}

function RightDown() {
  rpio.write(26, rpio.HIGH);
  rpio.write(24, rpio.LOW);
  Back();
}

function LightsOn() {
  rpio.write(37, rpio.HIGH);
  rpio.write(35, rpio.HIGH);
}

function LightsOff() {
  rpio.write(37, rpio.LOW);
  rpio.write(35, rpio.LOW);
}

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
