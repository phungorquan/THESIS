//python -m inference.video_classifier
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

            for(index in splitSpecificUser)
            {
                strCombine += splitSpecificUser[index] + "<br>";
            }

            this.sendNotification("SHOW_ALERT",{type: "notification",title: "Hello" , message:"<h1>"+strCombine+"</h1>", timer : 2000});


            // Only display text

            // document.getElementById("facenetresult").innerHTML = "";
            // for(index in splitSpecificUser)
            // {
            //     document.getElementById("facenetresult").innerHTML += splitSpecificUser[index] + "<br>";
                
                
            //     //Uncomment if you want to do something
            //     // var tmp = splitSpecificUser[index].split(',');
            //     //userArr.push(tmp[0]);
            //     //rateArr.push(tmp[1]); 
            // }
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