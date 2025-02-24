const BAUD_RATE = 9600;     // This should match the baud rate in your Arduino sketch

let port, connectBtn;       // Declare global variables
let joyX = 355, joyY = 200; // Start at canvas center
let buttonState = 0;        // Stores the current state of the joystick button
let isDrawing = false;      // Track if drawing mode is on
let ledState = false;       // Track LED state

function setup() {
  setupSerial();            // Run our serial setup function (below)
  createCanvas(windowWidth, windowHeight); // create canvas size
  background(0);            // Set to black background
  strokeWeight(20);         // thickness of the drawn lines
  colorMode(HSB);           // Use Hue-Saturation-Brightness color mode for dynamic colors
  describe("A blank canvas where the user draws using a joystick."); // Accessibility description
}

function draw() {
  const portIsOpen = checkPort(); // Check whether the port is open (see checkPort function below)
  if (!portIsOpen) return; // If the port is not open, exit the draw loop

  let str = port.readUntil("\n"); // Read from the port until the newline
  if (str.length == 0) return; // If we didn't read anything, return.

  let arr = str.trim().split(","); // Trim whitespace and split on commas
  
  // make sure we have exactly three values (joystick X, Y, and button state)
  if (arr.length === 3) {
    joyX = map(Number(arr[0]), 0, 1023, 0, width);  // Map joystick X value to canvas width
    joyY = map(Number(arr[1]), 0, 1023, 0, height); // Map joystick Y value to canvas height
    let newButtonState = Number(arr[2]);      // Convert joystick button state to a number

    // Detect when button press to toggle drawing mode
    if (newButtonState === 1 && buttonState === 0) {
      isDrawing = !isDrawing; // Toggle drawing mode
      console.log(`Drawing mode: ${isDrawing ? "ON" : "OFF"}`);
    }
    buttonState = newButtonState; // Update button state
  }


  if (isDrawing) {
    let lineHue = map(joyX - joyY, -width, width, 0, 360);
    stroke(lineHue, 90, 90);
    strokeWeight(10);

    if (prevX !== undefined && prevY !== undefined) {
      line(prevX, prevY, joyX, joyY);
    }
  }

  prevX = joyX;
  prevY = joyY;

}

// Handle spacebar press
function keyPressed() {
  if (key === " ") {
    // Clear the board (reset background)
    background(0);
    console.log("Canvas cleared!");
    
    ledState = true;
    port.write("LED_ON\n"); // Send signal to Arduino
  }
}

// Handle spacebar release
function keyReleased() {
  if (key === " ") {
    ledState = false;
    port.write("LED_OFF\n"); // Send signal to Arduino
  }
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
