//python -m inference.video_classifier
Module.register("MMM-FaceNet", {
    requiresVersion: "2.1.0",
    start: function() {
        console.log("Starting module: " + this.name);
        this.sendSocketNotification("STARTUP", "STARTUP");
    },
    socketNotificationReceived: function(notification, payload) {
        if (notification == "FACENET_RESULT") {
            // Split string "user - rate" from Python
            var result = payload.split('-');
            //console.log(result[0]); // getUser
            console.log(result);
            if (result.length != 0) {
                document.getElementById("facenetresult").innerHTML = "Hello: ";
                for (var i = 0; i < result.length; i++) {
                    document.getElementById("facenetresult").innerHTML += result[i] + "-";
                }
            }
        }
    },
    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");
        var userRecog = document.createElement("span");
        userRecog.setAttribute("id", "facenetresult");
        userRecog.innerHTML = "Chào Quân - Khánh";
        userRecog.style.color = "pink";
        wrapper.appendChild(userRecog);
        return wrapper;
    },
});