#define swPin 12
int x = 0, y = 0;
int xpos = 0, ypos = 0;
int swStatus = 0;
int sensitivity=20;    // you can adjust the sensitivity based on your comfort

void setup() {
  Serial.begin(9600);
  pinMode(swPin,INPUT_PULLUP);     // SW pin
}

void loop() {
  // x and y were reverse in python on Raspberry :)) 
  x = analogRead(A0);
  y = analogRead(A2);
  if(x>=550)                     
  xpos=map(x,550,1023,0,-sensitivity); 
  if(x<=450)                   
  xpos=map(x,450,0,0,sensitivity);   
  if(y>=550)                   
  ypos=map(y,550,1023,0,-sensitivity);  
  if(y<=450)                  
  ypos=map(y,450,0,0,sensitivity); 

  if(digitalRead(swPin)==0)
  {
    while(digitalRead(swPin)==0);
    swStatus = 1;
//    delay(500);
//    if(digitalRead(swPin)==0) // If press < 1s -> left click
//    {
//      delay(2000);
//      if(digitalRead(swPin)==0) // If press > 2.5s -> right click 
//        {
//          delay(3000);
//            if(digitalRead(swPin)==0)
//              {
//                while(digitalRead(swPin) == 0); // Avoid press too long
//                swStatus = 3; // Press alt
//              }
//            else 
//              swStatus = 2; // Right button
//        }
//      else
//        swStatus = 1; // Left button
//    }
  }

    if(xpos!=0 || ypos!=0 || swStatus != 0) // prints only when the joystick is moved or pressed
  {
    // Combine to : x,y,status -> xpos, ypos, click status
    // click status = 0: Not click , 1: left click , 2: right click, 3: press 'Alt'
    String combine = String(xpos) + "," + String(ypos) + "," + String(swStatus);
    Serial.println(combine);
  }
  delay(100);         
  // Reset variables
  xpos = 0;
  ypos = 0;
  swStatus = 0;
}
