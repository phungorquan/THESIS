/*  https://circuitdigest.com/microcontroller-projects/iot-firebase-controlled-led-using-esp8266-nodemcu?fbclid=IwAR38H0ak-CIH5o_yIzf2ri0ZSl9Ye6XxRgHt8_cKMmNK-21IxWRSdLKDrhE
 *  https://www.grc.com/fingerprints.htm  Change fingerprint in Documents\Arduino\libraries\firebase-arduino-master\src\FirebaseHttpClient.h when still connect but don't know why can not commutenicate 
 *  https://tapit.vn/tong-hop-huong-dan-dieu-khien-thiet-bi-su-dung-nodemcu-esp8266-va-google-assistant/?fbclid=IwAR0MGaT0QkvZOOFISDPyFtkHukIGLp4J_R7FcECzce5c-Botxq-395hCba0
 *  
 */
#include <ESP8266WiFi.h>
#include <FirebaseArduino.h>
#include <WiFiManager.h>
WiFiManager wifiManager; // Lib to support find Wifi via Phone

#define FIREBASE_HOST "xiutestesp.firebaseio.com" // Project name address from firebase id
#define FIREBASE_AUTH "VucwzqKzjNK5l3dpBYLl893XaByXCnHm8sUS5Nai" // Secret key generated from firebase

#define WIFI_LED 2
#define LIGHT 12
#define FAN 13
#define BTN_LIGHT 4
#define BTN_FAN 0

// Status from fire
String lightFireStt = "";
String fanFireStt = "";

// Status led local
bool lightStt = false;
bool fanStt = false;

void lightControl()
{
    /* !!! Brief
     *  1. Get status from fire
     *  2. Check that status valid or not
     *    + Not valid : Turn ON WifiLed if lost wifi connection, Blink led if lost internet connection
     *    + Valid: Compare and turn light ON/OFF
     */

    lightFireStt = Firebase.getString("ESP8266/light/value");
    delay(500);
    Serial.println("light " + lightFireStt); 
    if (lightFireStt == "")
    {
        if (WiFi.status() != WL_CONNECTED)
            digitalWrite(WIFI_LED, LOW); // If lost wifi connection
        else
        {
            // If lost internet connection
            digitalWrite(WIFI_LED, LOW);
            delay(500);
            digitalWrite(WIFI_LED, HIGH);
            delay(500);
        }
    }
    else
    {   
        // Turn off Wifi led (normal)
        digitalWrite(WIFI_LED, HIGH);

        // Control light
        if (lightFireStt == "on")
            lightStt = true;
        else
            lightStt = false;
        if (digitalRead(LIGHT) != lightStt)
            digitalWrite(LIGHT, lightStt);
    }
}

void fanControl()
{
    /* !!! Brief
     *  1. Get status from fire
     *  2. Check that status valid or not
     *    + Not valid : Turn ON WifiLed if lost wifi connection, Blink led if lost internet connection
     *    + Valid: Compare and turn fan ON/OFF
     */
    fanFireStt = Firebase.getString("ESP8266/fan/value");
    delay(500);
    Serial.println("fan " + fanFireStt);
    if (fanFireStt == "")
    {
        if (WiFi.status() != WL_CONNECTED)
            digitalWrite(WIFI_LED, LOW); // If lost wifi connection
        else
        {
            // If lost internet connection
            digitalWrite(WIFI_LED, LOW);
            delay(500);
            digitalWrite(WIFI_LED, HIGH);
            delay(500);
        }
    }
    else
    {   
        // Turn off Wifi led (normal)
        digitalWrite(WIFI_LED, HIGH);

        // Control fan
        if (fanFireStt == "on")
            fanStt = true;
        else
            fanStt = false;
        if (digitalRead(FAN) != fanStt)
            digitalWrite(FAN, fanStt);
    }
}

void setup()
{
    Serial.begin(9600);
    pinMode(WIFI_LED, OUTPUT);
    pinMode(LIGHT, OUTPUT);
    pinMode(FAN, OUTPUT);
    pinMode(BTN_LIGHT, INPUT_PULLUP);
    pinMode(BTN_FAN, INPUT_PULLUP);

    //wifiManager.resetSettings();  // Uncomment if you want to reset wifi which saved to autoconnect
    // Create wifi AP to select wifi if there are not any wifi connection saved before
    wifiManager.autoConnect("MMM-NODEMCU"); 
    WiFi.setAutoReconnect(true); // Auto reconnect if lost wifi connection
    Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH); // Connect to firebase
    delay(500);
}

void loop()
{
    lightControl(); // Check and control light
    fanControl(); // Check and control fan
    
    if (Firebase.failed()) {                  
      Serial.print(Firebase.error());    
      delay(500);    
    }
    // If press to toggle light status
    if (digitalRead(BTN_LIGHT) == 0)
    {
        while (digitalRead(BTN_LIGHT) == 0)
            delay(0); // This delay will avoid WDT reset (FEED)
            
        lightStt = !lightStt; // Toggle

        // This will if/else condition will check whether status ON/OFF was updated to Firebase or not
        if (lightStt)
        {
            lightFireStt = Firebase.getString("ESP8266/light/value"); // Get current status from Firebase

            // Update until it's OK
            while (lightFireStt == "off")
            {
                Firebase.setString("ESP8266/light/value", "on");
                delay(500);
                lightFireStt = Firebase.getString("ESP8266/light/value");
                delay(500);
            }
        }
        else
        {
            lightFireStt = Firebase.getString("ESP8266/light/value");
            while (lightFireStt == "on")
            {
                Firebase.setString("ESP8266/light/value", "off");
                delay(500);
                lightFireStt = Firebase.getString("ESP8266/light/value");
                delay(500);
            }
        }
        digitalWrite(LIGHT, lightStt); // After update to Firebase, we change led status 
    }

    // Read comment above because it's similar
    else if (digitalRead(BTN_FAN) == 0)
    {
        while (digitalRead(BTN_FAN) == 0)
            delay(0);
        fanStt = !fanStt;
        if (fanStt)
        {
            fanFireStt = Firebase.getString("ESP8266/fan/value");
            while (fanFireStt == "off")
            {
                Firebase.setString("ESP8266/fan/value", "on");
                delay(500);
                fanFireStt = Firebase.getString("ESP8266/fan/value");
                delay(500);
            }
        }
        else
        {
            fanFireStt = Firebase.getString("ESP8266/fan/value");
            while (fanFireStt == "on")
            {
                Firebase.setString("ESP8266/fan/value", "off");
                delay(500);
                fanFireStt = Firebase.getString("ESP8266/fan/value");
                delay(500);
            }
        }
        digitalWrite(FAN, fanStt);
    }
}
