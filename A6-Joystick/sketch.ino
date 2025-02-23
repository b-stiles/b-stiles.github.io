// Joystick and Web Interaction

// Joystick pins
const int joyX = A0;
const int joyY = A1;
const int joyButton = 2;
const int ledPin = 9;

void setup() {
  Serial.begin(9600); // Start serial communication
  pinMode(joyButton, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int xValue = analogRead(joyX); // Read X-axis
  int yValue = analogRead(joyY); // Read Y-axis
  int buttonState = digitalRead(joyButton); // Read button state

  // Send data as comma-separated values for p5.js
  Serial.print(xValue);
  Serial.print(",");
  Serial.print(yValue);
  Serial.print(",");
  Serial.println(buttonState);

  // Check for incoming data from webpage
  if (Serial.available() > 0) {
    char command = Serial.read(); // Read command from p5.js
    if (command == '1') {
      digitalWrite(ledPin, HIGH); // Turn LED ON
    } else if (command == '0') {
      digitalWrite(ledPin, LOW); // Turn LED OFF
    }
  }
  delay(100); // Small delay for stability
}