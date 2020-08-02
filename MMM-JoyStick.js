Module.register("MMM-JoyStick",{
	requiresVersion: "2.1.0",
	defaults: {
		
	},	

    start: function() {
        console.log("Starting module: " + this.name);
        this.sendSocketNotification("RUN_JOYSTICK","DUMMY_DATA");
    },


});