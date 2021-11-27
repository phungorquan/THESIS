Module.register("MMM-WS2812",{
    // Default module config.
    defaults: {
        initLedMMM: "WS-RAINBOW", //WS-THEATER, WS-BLINK, WS-BREATHING, WS-RAINBOW, WS-COLORFUL
        allowGA: true,
        allowGesture: true
    },  

    start: function() {
        console.log("Starting module: " + this.name);
        this.sendSocketNotification(this.config.initLedMMM, "DUMMY_DATA");
    },

    notificationReceived: function(notification, payload, sender) {
        if (notification === "WS2812") {
            if(sender.name == "MMM-GoogleAssistant" && this.config.allowGA)
            {
                this.sendSocketNotification(payload,"DUMMY_DATA");
            }
            if(sender.name == "MMM-GroveGestures" && this.config.allowGesture)
            {
                if(payload == "REQUEST_ACCESS_COLOR_MODE")
                {
                    this.sendNotification("ACCESS_COLOR_MODE", "DUMMY_DATA")
                }
                else if(payload == "REQUEST_EXIT_COLOR_MODE")
                {
                    this.sendNotification("EXIT_COLOR_MODE", "DUMMY_DATA")
                }
                else
                {
                    this.sendSocketNotification(payload,"DUMMY_DATA");
                }     
            }      
        }
    },  
});
