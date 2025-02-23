const BAUD_RATE = 9600; // This should match the baud rate in your Arduino sketch

let port, connectBtn; // Declare global variables
let xValue = 0;
let yValue = 0;
let buttonState = 1;
let ledState = false;

function setup() {
  setupSerial(); // Run our serial setup function (below)

  // Create a canvas that is the size of our browser window.
  // windowWidth and windowHeight are p5 variables
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  const portIsOpen = checkPort(); // Check whether the port is open (see checkPort function below)
  if (!portIsOpen) return; // If the port is not open, exit the draw loop

  let str = port.readUntil("\n"); // Read from the port until the newline
  if (str.length == 0) return; // If we didn't read anything, return.

  let arr = str.trim().split(","); // Trim whitespace and split on commas

  // Convert values to numbers and map them to screen dimensions
  xValue = map(Number(arr[0]), 0, 1023, 0, windowWidth);
  yValue = map(Number(arr[1]), 0, 1023, 0, windowHeight);
  buttonState = Number(arr[2]);

  background(220);
  fill(0);
  textSize(16);
  text(`Joystick X: ${xValue}`, 20, 50);
  text(`Joystick Y: ${yValue}`, 20, 80);
  text(`Button State: ${buttonState}`, 20, 110);
  text(`LED: ${ledState ? "ON" : "OFF"}`, 20, 140);

  // Draw joystick position
  fill(255, 0, 0);
  ellipse(xValue, yValue, 20, 20);
}

// Three helper functions for managing the serial connection.

function setupSerial() {
  port = createSerial();

  // Check to see if there are any ports we have used previously
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    // If there are ports we've used, open the first one
    port.open(usedPorts[0], BAUD_RATE);
  }

  // create a connect button
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(5, 5); // Position the button in the top left of the screen.
  connectBtn.mouseClicked(onConnectButtonClicked); // When the button is clicked, run the onConnectButtonClicked function
}

function checkPort() {
  if (!port.opened()) {
    // If the port is not open, change button text
    connectBtn.html("Connect to Arduino");
    // Set background to gray
    background("gray");
    return false;
  } else {
    // Otherwise we are connected
    connectBtn.html("Disconnect");

    return true;
  }
}

function onConnectButtonClicked() {
  // When the connect button is clicked
  if (!port.opened()) {
    // If the port is not opened, we open it
    port.open(BAUD_RATE);
  } else {
    // Otherwise, we close it!
    port.close();
  }

  function toggleLED() {
    ledState = !ledState;
    port.write(ledState ? '1' : '0');
  }
}
