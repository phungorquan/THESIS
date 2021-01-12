var currentUserDetected = "";

Module.register("MMM-FaceNet", {
    // Default module configurations
    defaults: {
        streamVideo: true,
        displayRate: false,
        updateInterval: 300000, // Refresh text every 5'
        userName:{
            "ThayDuy":"ThayDuy",
            "ThayDuong":"ThayDuong",
            "Quan":"QuanXiu",
            "Khanh":"KhanhKoi",
            "Bao":"Bao",
            "BuiPhungHuuDuc":"BuiPhungHuuDuc",
            "ChauMinhDuc":"ChauMinhDuc",
            "Dat":"Dat",
            "Dung":"Dung",
            "Duy":"Duy",
            "Giang":"Giang",
            "Huy":"Huy",
            "LAnh":"LAnh",
            "Nhu":"Nhu",
            "Phong":"Phong",
            "Quoc":"Quoc",
            "Tin":"Tin",
            "Van":"Van"
        }
    },
    start: function() {
        console.log("Starting module: " + this.name);
        this.sendSocketNotification("STARTUP", "STARTUP");
        this.scheduleUpdate();
    },

    // This function will be called when 'node_helper.js' send data
    socketNotificationReceived: function(notification, payload) {
        if (notification == "FACENET_RESULT") {
            var splitSpecificUser = payload.split('/');
            var strCombine = "";
            if (splitSpecificUser[0].length > 0)
            {
                if(this.config.displayRate)
                {
                    for(index in splitSpecificUser)
                    {
                        var splitNameAndRate = splitSpecificUser[index].split(',');
                        
                        // Change user namespace
                        var getName = splitNameAndRate[0];
                        if(this.config.userName.hasOwnProperty(getName))
                        {
                            getName = this.config.userName[getName];
                        }
                        strCombine += getName + splitNameAndRate[1] + "<br>";
                    }
                }
                else // Only display text
                {
                    for(index in splitSpecificUser)
                    {
                        var splitNameAndRate = splitSpecificUser[index].split(',');
                        
                        // Change user namespace
                        var getName = splitNameAndRate[0];
                        if(this.config.userName.hasOwnProperty(getName))
                        {
                            getName = this.config.userName[getName];
                        }
                        strCombine += getName + "<br>";
                    }
                }

                // Display beautiful notification but it is ERROR now.
                //this.sendNotification("SHOW_ALERT",{type: "notification",title: "Hello" , message:"<h1>"+strCombine+"</h1>", timer : 2000});

                // Display
                document.getElementById("facenetResult").innerHTML = "Chào " + strCombine;
            }
            else{
                // Display hello to nobody
                document.getElementById("facenetResult").innerHTML = "Chào";
            }
        }
        else if (notification == "CAMERA_STATUS")
        {
            // Display error information to user
            document.getElementById("facenetResult").innerHTML = payload;
            console.log(payload);
        }
    },
    // Override dom generator.
    getDom: function() {
        // Create a table contain text and stream frame
        var wrapper = document.createElement("div");
        var aTable = document.createElement("table");
        var row1 = aTable.insertRow(0);
        var row2 = aTable.insertRow(1);

        var userRecog = document.createElement("span");
        userRecog.setAttribute("id", "facenetResult");
        userRecog.innerHTML = "Chào";
        userRecog.style.color = "pink";
        row1.appendChild(userRecog);

        // Check whether user want to streaming or not
        if(this.config.streamVideo)
        {
            var fullArticle = document.createElement("iframe");
            fullArticle.setAttribute("id","ps3Iframe");
            fullArticle.style.width = "320px"; 
            fullArticle.style.height = "240px";
            fullArticle.style.border = "thick solid #000";
            fullArticle.style.background = "#000000";
            fullArticle.style.zIndex = "998"; // Highest layer
            fullArticle.src = "http://localhost:8081/"; // Get image from motion url
            row2.appendChild(fullArticle);
        }

        wrapper.appendChild(aTable);
        return wrapper;
    },
    scheduleUpdate: function() {
        // Refresh text to "Chào" after a period of time
        setInterval(() => {
            document.getElementById("facenetResult").innerHTML = "Chào";
        }, this.config.updateInterval);
    },
});