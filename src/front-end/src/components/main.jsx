import React, { Component } from "react";
import { Joystick } from "react-joystick-component";
import { Jumbotron, Navbar, Card, Button } from "react-bootstrap";
import img from "./image.svg";
import axios from "axios";
import {  Range, getTrackBackground } from "react-range";
const STEP = 0.1;
const MIN = 0.0;
const MAX = 1.0;
class Main extends Component {
  constructor() {
    super();
    this.handleMove = this.handleMove.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.state = {
      lights: "on",
      ip: "",
      values :[1.0]
    };
  }

  componentDidMount() {
    this.Status();
  }


  handleVideoOn = async () => {
    await axios.post("/camera/on");
    setTimeout(() => this.handleIP(), 3000);
  };

  handleVideOff = async () => {
    await axios.post("/camera/off");
    this.setState({ ip: "" });
  };

  handleLights = () => {
    if (this.state.lights === "on") {
      this.setState({ lights: "off" });
      this.requestLights("off");
    }
    if (this.state.lights === "off") {
      this.setState({ lights: "on" });
      this.requestLights("on");
    }
  };

    Status = async () => {
    let response = await axios.get("util/ConfigStatus");
    this.setState({ values: [response.data.speed] });
  };

  setSpeed = (speed) => {
    let requestSpeed = {
      Speed: speed[0].toFixed(1),
    };
    console.log(requestSpeed.Speed);
    this.setState({ values: speed });
    axios.post("motor/speed", requestSpeed);
  };

  GetPercentage() {
    return this.state.values[0].toFixed(1) * 100;
  }

  handleMove = async (e) => {
    let directionObj = {
      direction: e.direction,
    };

    await axios.post("/motor/direction", directionObj);
  };

  handleStop = async (e) => {
    let request = { response: e.type };
    await axios.post("/motor/off", request);
  };

  async handleIP() {
    const { data } = await axios.get("/getIP");

    this.setState({ ip: data });
  }

  requestLights = async (mode) => {
    const req = { response: mode };
    await axios.post("light", req);
  };

  render() {
    return (
      <div className="d-flex h-100 text-center text-white bg-dark ">
        <div className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
           
        <div
          style={{
            display: "flex",
              justifyContent: "center",
            flexWrap: "wrap",
            margin: "2em",
          }}
            >
          <Range
            values={this.state.values}
            step={STEP}
            min={MIN}
            max={MAX}
            onChange={(values) => this.setSpeed(values)}
            renderTrack={({ props, children }) => (
              <div
                onMouseDown={props.onMouseDown}
                onTouchStart={props.onTouchStart}
                style={{
                  ...props.style,
                  height: "1px",
                  display: "flex",
                  width: "100%",
                }}
              >
                <div
                  ref={props.ref}
                  style={{
                    height: "5px",
                    width: "100%",
                    borderRadius: "4px",
                    background: getTrackBackground({
                        
                      values: this.state.values,
                      colors: ["#548BF4", "#ccc"],
                      min: MIN,
                      max: MAX,
                    }),
                    alignSelf: "center",
                  }}
                >
                  {children}
                </div>
              </div>
            )}
            renderThumb={({ props, isDragged }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: "42px",
                  width: "42px",
                  borderRadius: "4px",
                  backgroundColor: "#FFF",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0px 2px 6px #AAA",
                }}
              >
                <div
                  style={{
                    height: "5px",
                    width: "16px",
                    backgroundColor: isDragged ? "#548BF4" : "#CCC",
                  }}
                />
              </div>
            )}
          />
          <output style={{ marginTop: "30px" }} id="output">
            {this.GetPercentage() + "%"}
          </output>
        </div>
      
          <header className="mb-auto">
            <Navbar>
            
             
              <Navbar.Toggle />
              <Navbar.Collapse className="justify-content-end">
              
                <Button variant="primary" onClick={this.handleVideoOn}>
                  on
                </Button>{" "}
                <Button variant="secondary" onClick={this.handleVideOff}>
                  off
                </Button>
                <Button variant="secondary" onClick={this.handleLights}>
                  Lights {this.state.lights}
                </Button>
              </Navbar.Collapse>
            </Navbar>
          </header>

          <Jumbotron fluid={false}>
            <Card className="bg-dark text-white ">
              <Card.Img
                src={
                  this.state.ip === ""
                    ? img
                    : "http://" + this.state.ip + ":8090/?action=stream"
                }
                alt="Card image"
                width="620"
                height="310"
              />
              <Card.ImgOverlay>
                <Card.Title>CarVideo</Card.Title>
              </Card.ImgOverlay>
            </Card>
          </Jumbotron>

          <Jumbotron className="containerStyle">
            <div className="controlPad">
              <Joystick
                size={150}
                baseColor="gray"
                stickColor="white"
                move={this.handleMove}
                stop={this.handleStop}
                throttle={500}
              />
            </div>
          </Jumbotron>
        </div>
      </div>
    );
  }
}

export default Main;
