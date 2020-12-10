//python -m inference.video_classifier

var currentUserDetected = "";

Module.register("MMM-FaceNet", {
    requiresVersion: "2.1.0",
    start: function() {
        console.log("Starting module: " + this.name);
        this.sendSocketNotification("STARTUP", "STARTUP");
    },
    socketNotificationReceived: function(notification, payload) {
        if (notification == "FACENET_RESULT") {
            var splitSpecificUser = payload.split('/');
            var userArr = [];
            var rateArr = [];
            var strCombine = "";
            if (splitSpecificUser[0].length > 0)
            {
                for(index in splitSpecificUser)
                {
                    strCombine += splitSpecificUser[index] + "<br>";
                }

                //this.sendNotification("SHOW_ALERT",{type: "notification",title: "Hello" , message:"<h1>"+strCombine+"</h1>", timer : 2000});

                // Only display text
                document.getElementById("facenetresult").innerHTML = strCombine ;//+= splitSpecificUser[index] + "<br>";
            }
            else{
                document.getElementById("facenetresult").innerHTML = "...";
            }
        }
        else if (notification == "CAMERA_STATUS")
        {
            console.log(payload);
            document.getElementById("facenetresult").innerHTML = payload;
        }
    },
    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");
        var userRecog = document.createElement("span");
        userRecog.setAttribute("id", "facenetresult");
        userRecog.innerHTML = "...";
        userRecog.style.color = "pink";
        wrapper.appendChild(userRecog);
        return wrapper;
    },
});