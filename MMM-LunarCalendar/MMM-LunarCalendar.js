// namespace lunar carlendar
var ns_lunarcal = {
    numOfUrls: 0, // numOfUrls from "config.js"
    arrUrls: [], // Save all urls
    titleArr: [], // Save all event title to send notification once
    alertOnce: true, // Flag to support titleArr above
    currentCalIndex: 0, // This variable will save switch counter
    getCalendar: "", // For DB
    getInterval: 0
};
Module.register("MMM-LunarCalendar", {
    defaults: {
        maximumEntries: 10, // Total Maximum Entries
        maximumNumberOfDays: 365,
        showLocation: true,
        maxTitleLength: 15,
        wrapEvents: true, // wrap events to multiple lines breaking at maxTitleLength
        maxTitleLines: 3,
        fetchInterval: 1 * 60 * 1000, // Update every 1 minutes.
        animationSpeed: 500,
        displayButton: true, // Display button to switch between calendars
        dateEndFormat: "LT(DD/MM)",
        defaultColor: "White",
        lunarColor: "LightGreen",
        colored: true,
        tableClass: "xsmall",
        lunarShow: true,
        calendars: [{
            url: "",
            color: "",
            name: ""
        }],
    },
    // Define required css.
    getStyles: function() {
        return ["MMM-LunarCalendar.css", "font-awesome.css"];
    },
    // Define required scripts.
    getScripts: function() {
        return ["moment.js"];
    },
    // Define required translations.
    getTranslations: function() {
        // The translations for the default modules are defined in the core translation files.
        // Therefore we can just return false. Otherwise we should have returned a dictionary.
        // If you're trying to build your own module including translations, check out the documentation.
        if (config.language == "vi") return {
            vi: "../../../translations/vi.json" // Vietnamese 
        }
        else return false;
    },
    start: function() {
        if (ns_lunarcal.numOfUrls == 0) { // This condition will avoid do too much time when re-invoke start())
            Log.log("Starting module: " + this.name);
            // Set locale to setup time format environment.
            moment.updateLocale(config.language, {
                longDateFormat: {
                    LT: "HH:mm"
                },
                calendar: {
                    sameDay: '[Hôm nay, ]DD/MM[<br>]LT',
                    nextDay: '[Ngày mai, ]DD/MM[<br>]LT',
                    nextWeek: 'dd[,] DD/MM[<br>]LT',
                    lastDay: '[Hôm qua ]LT',
                    lastWeek: 'dddd [rồi ]LT',
                    sameElse: 'L'
                },
            });
        }
        for (var c in this.config.calendars) {
            var calendar = this.config.calendars[c];
            calendar.url = calendar.url.replace("webcal://", "http://");
            var calendarConfig = {
                maximumEntries: calendar.maximumEntries,
                maximumNumberOfDays: calendar.maximumNumberOfDays,
            };
            this.addCalendar(calendar.url, calendar.auth, calendarConfig);
            // Trigger ADD_CALENDAR every fetchInterval to make sure there is always a calendar
            // fetcher running on the server side.
            var self = this;
            clearInterval(ns_lunarcal.getInterval);
            ns_lunarcal.getInterval = setInterval(function() {
                self.addCalendar(calendar.url, calendar.auth, calendarConfig);
                self.switchCalendar("All"); // Switch to first calendar (All calendar will be displayed)
                ns_lunarcal.titleArr = [];
            }, self.config.fetchInterval);
        }
        ns_lunarcal.numOfUrls = ns_lunarcal.arrUrls.length; // Restart numOfUrls
        if (ns_lunarcal.numOfUrls == 0) // This condition will avoid assigning urls too much when re-invoke start()
        {
            ns_lunarcal.numOfUrls = this.config.calendars.length;
            for (var i = 0; i < ns_lunarcal.numOfUrls; i++) {
                ns_lunarcal.arrUrls.push(this.config.calendars[i].url); // Save all urls to ns_lunarcal.arrUrls
            }
        }
        this.calendarData = {};
        this.loaded = false;
    },
    socketNotificationReceived: function(notification, payload) {
        if (notification === "CALENDAR_EVENTS") {
            if (this.hasCalendarURL(payload.url)) {
                this.calendarData[payload.url] = payload.events;
                this.loaded = true;
            }
        } else if (notification === "FETCH_ERROR") {
            Log.error("Calendar Error. Could not fetch calendar: " + payload.url);
            this.loaded = true;
        } else if (notification === "INCORRECT_URL") {
            // Check whether myUrl is DUMMY(self-defined) or Wrong(wrong url input)
            if (payload.url != "DUMMY HIDEN") {
                Log.error("Calendar Error. Incorrect url: " + payload.url);
            }
        }
        this.updateDom(this.config.animationSpeed);
    },
    getDom: function() {
        var events = this.createEventList();
        var wrapper = document.createElement("table");
        wrapper.className = this.config.tableClass;
        if (events.length === 0) {
            if (this.loaded) {
                wrapper.innerHTML = this.translate("EMPTYPERSONALCALENDAR") + "<br>";
            } else {
                // Only show loading when there is not Lunar Calendars
                if (ns_lunarcal.currentCalIndex != this.config.calendars.length + 1) {
                    wrapper.innerHTML = this.translate("LOADING") + "<br>";
                }
            }
            wrapper.className = this.config.tableClass + " dimmed";
        } else {
            for (var e in events) {
                var existTitle = false;
                var event = events[e];
                var eventWrapper = document.createElement("tr");
                // Color calendars
                for (var i = 0; i < ns_lunarcal.numOfUrls; i++) {
                    if (event.url === ns_lunarcal.arrUrls[i]) {
                        if (this.config.calendars[i].hasOwnProperty("color")) {
                            eventWrapper.style.color = this.config.calendars[i].color;
                        } else {
                            eventWrapper.style.color = this.config.defaultColor;
                        }
                    }
                }
                eventWrapper.className = "normal";
                // Title
                var titleWrapper = document.createElement("td");
                titleWrapper.innerHTML = this.titleTransform(event.title);
                titleWrapper.style.fontFamily = "Roboto,bold";
                // Time
                var timeWrapper = document.createElement("td");
                timeWrapper.style.fontFamily = "Roboto,bold"; // Xiu add font
                eventWrapper.appendChild(titleWrapper);
                // Define second, minute, hour, and day variables
                var now = new Date();
                var oneSecond = 1000; // 1,000 milliseconds
                var oneMinute = 60000; // oneSec * 60
                var oneHour = 3600000; // oneMin * 60
                var oneDay = 86400000; // oneHour * 24
                // If event occur all day
                if (event.fullDayEvent) {
                    timeWrapper.innerHTML = moment(event.startDate, "x").format('[Hôm nay]');
                    timeWrapper.innerHTML += "<br> Cả ngày đến " + moment(event.endDate - oneDay, "x").format(this.config.dateEndFormat);
                } else {
                    if (event.startDate >= new Date()) {
                        timeWrapper.innerHTML = moment(event.startDate, "x").calendar();
                        // Check < 5' to pop-up alert
                        if ((event.startDate - now) < (5 * oneMinute)) {
                            for (var i = 0; i < ns_lunarcal.numOfUrls; i++) {
                                if (ns_lunarcal.titleArr[i] == event.title) {
                                    existTitle = true;
                                    break;
                                }
                            }
                            if (!existTitle) {
                                ns_lunarcal.alertOnce = true;
                                ns_lunarcal.titleArr.push(event.title);
                            }
                        }
                    } else {
                        timeWrapper.innerHTML = this.translate("RUNNING") + moment(event.endDate, "x").fromNow(true)
                        timeWrapper.innerHTML += "<br>" + moment(event.startDate, "x").format(this.config.dateEndFormat);
                    }
                    // If startDate > a month -> display Date
                    if (now.getMonth() + 1 < moment(event.startDate, "x").format("MM")) {
                        timeWrapper.innerHTML += "<br>" + moment(event.startDate, "x").format("LT");
                    }
                    // Display endTime
                    timeWrapper.innerHTML += " - " + moment(event.endDate, "x").format(this.config.dateEndFormat);
                }
                timeWrapper.className = "time light ";
                eventWrapper.appendChild(timeWrapper);
                wrapper.appendChild(eventWrapper);
                // Location
                if (this.config.showLocation) {
                    var myLocation = this.translate("No location");
                    if (event.location !== false) {
                        myLocation = event.location;
                    }
                    var locationRow = document.createElement("tr");
                    locationRow.className = "normal xxsmall";
                    locationRow.style.fontFamily = "Courier New, monospace";
                    locationRow.style.fontStyle = "italic";
                    locationRow.style.letterSpacing = "0.5px";
                    var descCell = document.createElement("td");
                    descCell.className = "location";
                    descCell.colSpan = "2";
                    descCell.innerHTML = myLocation;
                    locationRow.appendChild(descCell);
                    wrapper.appendChild(locationRow);
                    // Display a line to separate peronalCal and lunarCal
                    if (this.config.lunarShow && ns_lunarcal.currentCalIndex == 0 && e == events.length - 1) {
                        var lineCol = document.createElement("td");
                        lineCol.colSpan = "2";
                        var getLine = document.createElement("hr");
                        getLine.style.border = "0.5px solid #666";
                        lineCol.appendChild(getLine);
                        wrapper.appendChild(lineCol);
                    }
                }
            }
        }
        if (ns_lunarcal.titleArr.length != 0 && ns_lunarcal.alertOnce) {
            ns_lunarcal.alertOnce = false;
            var combineEventName = ""
            for (var i = 0; i < ns_lunarcal.titleArr.length; i++) {
                combineEventName += ns_lunarcal.titleArr[i] + " ";
            }
            var audio = new Audio('/modules/MyExtraResources/Alarm.mp3');
            audio.play();
            this.sendNotification("SHOW_ALERT", {
                type: "alert",
                title: "<h1>" + combineEventName + "</h1>",
                message: "EVENT IS COMING",
                timer: 7000
            });
        }
        // LUNAR CALENDAR
        var getNow = new Date();
        var getMonth = ("0" + (getNow.getMonth() + 1)).slice(-2);
        var getYear = getNow.getFullYear();
        var combineQueryWhere = "POSCAL like " + "'%/" + getMonth + "' AND YEAR = " + "'" + getYear + "'";
        this.getDataFromDB("SELECT", "*", "lunarcalendar", combineQueryWhere);
        // 	if(ns_lunarcal.getCalendar == "ERROR")
        // {	var eventWrapperz = document.createElement("tr");
        // 		eventWrapperz.style.color = "red";
        // 		var titleWrapperz = document.createElement("td");
        // 		titleWrapperz.innerHTML = this.translate("ERROR DATABASE");
        // 		eventWrapperz.appendChild(titleWrapperz);	
        // 	wrapper.appendChild(eventWrapperz);
        // }
        // 	else {
        // Wait until getCalendar has been loaded from Database
        if (ns_lunarcal.getCalendar.length != 0 && this.config.lunarShow == true && (ns_lunarcal.currentCalIndex == 0 || ns_lunarcal.currentCalIndex == ns_lunarcal.numOfUrls + 1)) {
            var maxEntries = ns_lunarcal.getCalendar.length;
            if (this.config.maximumEntries <= maxEntries) {
                maxEntries = this.config.maximumEntries
            }
            for (var i = 0; i < maxEntries; i++) {
                var eventWrapper = document.createElement("tr");
                eventWrapper.style.color = this.config.lunarColor;
                // Title
                var titleWrapper = document.createElement("td");
                titleWrapper.innerHTML = this.titleTransform(ns_lunarcal.getCalendar[i].EVENT);
                titleWrapper.style.fontFamily = "Roboto,bold";
                eventWrapper.appendChild(titleWrapper);
                // Time
                var timeWrapper = document.createElement("td");
                timeWrapper.style.fontFamily = "Roboto,bold"; // Xiu add font
                timeWrapper.innerHTML = ns_lunarcal.getCalendar[i].DOW + ", " + ns_lunarcal.getCalendar[i].POSCAL;
                timeWrapper.className = "time light ";
                eventWrapper.appendChild(timeWrapper);
                wrapper.appendChild(eventWrapper);
                var lunarDate = document.createElement("tr");
                lunarDate.className = "normal xxsmall";
                lunarDate.style.fontFamily = "Courier New, monospace"; // Xiu add font style
                lunarDate.style.fontStyle = "italic"; // Xiu add font style
                lunarDate.style.letterSpacing = "0.5px"; // Xiu add font style
                var descCell = document.createElement("td");
                descCell.className = "location";
                descCell.colSpan = "2";
                descCell.innerHTML = ns_lunarcal.getCalendar[i].NEGCAL + "(ÂL)";
                lunarDate.appendChild(descCell);
                wrapper.appendChild(lunarDate);
            }
        }
        //}
        // Create a button with css = switchBtn, onClick event = switchCalendar()
        if (this.config.displayButton == true) {
            var switchBtn = document.createElement("BUTTON");
            switchBtn.setAttribute("id", "idLunarSwitch");
            switchBtn.innerHTML = this.translate("SWITCH CALENDARS");
            switchBtn.addEventListener("click", () => this.switchCalendar());
            switchBtn.className = "calendarSwitchBtn"; // This is Xiu's CSS 
            wrapper.appendChild(switchBtn);
        }
        return wrapper;
    },
    // Send query to DB, E.g: getDataFromDB("SELECT","*","your_table","your_conditions")
    getDataFromDB: function(fn, what, from, where = "") {
        var host = "http://localhost/MMM/MMMDB.php?";
        var queryStr = host + "fn=" + fn + "&what=" + what + "&from=" + from + "&where=" + where;
        var xhttp;
        if (window.XMLHttpRequest) xhttp = new XMLHttpRequest(); // code for modern browsers
        else xhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                if (this.responseText != "FAILED") {
                    var parseJSON = JSON.parse(this.responseText);
                    if (ns_lunarcal.getCalendar.length == 0) {
                        ns_lunarcal.getCalendar = parseJSON;
                    }
                }
            }
        };
        xhttp.open("GET", queryStr, true);
        xhttp.send();
    },
    // Switch calendar from external notification
    notificationReceived: function(notification, payload, sender) {
        if (notification == "SWITCH_CALENDAR") {
            this.switchCalendar(); // Switch next calendar
        } else if (notification == "SWITCH_ALL_CALENDAR") {
            this.switchCalendar("All"); // Switch to first calendar (All calendar will be displayed)
        }
    },
    // This is event func will be invoked when click button
    // This func will switch to next calendar inside ns_lunarcal.arrUrls[] until reach to the last one
    switchCalendar: function(mode = "!All") {
        // If the mirror has more than 1 calendar url
        if (ns_lunarcal.numOfUrls > 0) {
            if (mode == "All") {
                //this.config.lunarShow = true;
                for (var i = 0; i < ns_lunarcal.numOfUrls; i++) {
                    this.config.calendars[i].url = ns_lunarcal.arrUrls[i];
                }
                // Reset counter
                ns_lunarcal.currentCalIndex = 0;
                this.start(); // Re-invoke to update
            } else {
                // Show personalCal
                if (ns_lunarcal.currentCalIndex < ns_lunarcal.numOfUrls) {
                    // Display only 1 calendar at [0] with each element[ns_lunarcal.currentCalIndex]
                    // hide the other by "DUMMY HIDEN"
                    this.config.calendars[0].url = ns_lunarcal.arrUrls[ns_lunarcal.currentCalIndex];
                    for (var i = 1; i < ns_lunarcal.numOfUrls; i++) {
                        this.config.calendars[i].url = "DUMMY HIDEN";
                    }
                    ns_lunarcal.currentCalIndex++;
                }
                // Show lunarCal
                else if (ns_lunarcal.currentCalIndex == ns_lunarcal.numOfUrls) {
                    this.config.calendars[0].url = "DUMMY HIDEN";
                    ns_lunarcal.currentCalIndex++;
                    if (!this.config.lunarShow) {
                        for (var i = 0; i < ns_lunarcal.numOfUrls; i++) {
                            this.config.calendars[i].url = ns_lunarcal.arrUrls[i];
                        }
                        // Reset counter
                        ns_lunarcal.currentCalIndex = 0;
                    }
                }
                // Show all
                else {
                    for (var i = 0; i < ns_lunarcal.numOfUrls; i++) {
                        this.config.calendars[i].url = ns_lunarcal.arrUrls[i];
                    }
                    // Reset counter
                    ns_lunarcal.currentCalIndex = 0;
                }
                this.start(); // Re-invoke to update
            }
        }
    },
    getHeader: function() {
        //First time when finished loading calendar
        if (ns_lunarcal.currentCalIndex == 0) {
            return this.translate("ALL EVENTS ARE COMING");
        } else {
            if (this.config.lunarShow && ns_lunarcal.currentCalIndex == ns_lunarcal.numOfUrls + 1) {
                return this.translate("LUNAR CALENDAR");
            } else {
                var myAvailableElement = ns_lunarcal.currentCalIndex - 1; // We need to minus by 1 when using with arr[]
                if (this.config.calendars[myAvailableElement].hasOwnProperty("name")) {
                    return this.config.calendars[myAvailableElement].name;
                } else {
                    //Check my available calendar to display my sentence
                    var getIndexOfMyCalendar = ns_lunarcal.arrUrls[myAvailableElement].indexOf("google");
                    if (getIndexOfMyCalendar > 0) {
                        // Function to get character at N times
                        function nthIndex(str, pat, n) {
                            var L = str.length,
                                i = -1;
                            while (n-- && i++ < L) {
                                i = str.indexOf(pat, i);
                                if (i < 0) break;
                            }
                            return i;
                        }
                        var getFifthSlashIndex = nthIndex(ns_lunarcal.arrUrls[myAvailableElement], '/', 5) + 1;
                        var getFirstPercentageIndex = ns_lunarcal.arrUrls[myAvailableElement].indexOf("%");
                        var getLengthAccount = getFirstPercentageIndex - getFifthSlashIndex;
                        var getGmailAccount = ns_lunarcal.arrUrls[myAvailableElement].substr(getFifthSlashIndex, getLengthAccount);
                        return this.translate("EVENT OF - ") + getGmailAccount;
                    }
                }
            }
        }
    },
    /* hasCalendarURL(url)
     * Check if this config contains the calendar url.
     *
     * argument url string - Url to look for.
     *
     * return bool - Has calendar url
     */
    hasCalendarURL: function(url) {
        for (var c in this.config.calendars) {
            var calendar = this.config.calendars[c];
            if (calendar.url === url) {
                return true;
            }
        }
        return false;
    },
    /* createEventList()
     * Creates the sorted list of all events.
     *
     * return array - Array with events.
     */
    createEventList: function() {
        var events = [];
        var today = moment().startOf("day");
        var now = new Date();
        var future = moment().startOf("day").add(this.config.maximumNumberOfDays, "days").toDate();
        for (var c in this.calendarData) {
            var calendar = this.calendarData[c];
            for (var e in calendar) {
                var event = JSON.parse(JSON.stringify(calendar[e])); // clone object
                if (event.endDate < now) {
                    continue;
                }
                if (this.listContainsEvent(events, event)) {
                    continue;
                }
                event.url = c;
                event.today = event.startDate >= today && event.startDate < (today + 24 * 60 * 60 * 1000);
                var maxCount = Math.ceil(((event.endDate - 1) - moment(event.startDate, "x").endOf("day").format("x")) / (1000 * 60 * 60 * 24)) + 1;
                events.push(event);
            }
        }
        events.sort(function(a, b) {
            return a.startDate - b.startDate;
        });
        return events.slice(0, this.config.maximumEntries);
    },
    listContainsEvent: function(eventList, event) {
        for (var evt of eventList) {
            if (evt.title === event.title && parseInt(evt.startDate) === parseInt(event.startDate)) {
                return true;
            }
        }
        return false;
    },
    /* createEventList(url)
     * Requests node helper to add calendar url.
     *
     * argument url string - Url to add.
     */
    addCalendar: function(url, auth, calendarConfig) {
        this.sendSocketNotification("ADD_CALENDAR", {
            url: url,
            maximumEntries: calendarConfig.maximumEntries || this.config.maximumEntries,
            maximumNumberOfDays: calendarConfig.maximumNumberOfDays || this.config.maximumNumberOfDays,
            fetchInterval: this.config.fetchInterval,
            titleClass: calendarConfig.titleClass,
            timeClass: calendarConfig.timeClass,
        });
    },
    /**
     * Shortens a string if it's longer than maxLength and add a ellipsis to the end
     *
     * @param {string} string Text string to shorten
     * @param {number} maxLength The max length of the string
     * @param {boolean} wrapEvents Wrap the text after the line has reached maxLength
     * @param {number} maxTitleLines The max number of vertical lines before cutting event title
     * @returns {string} The shortened string
     */
    shorten: function(string, maxLength, wrapEvents, maxTitleLines) {
        if (typeof string !== "string") {
            return "";
        }
        if (wrapEvents === true) {
            var temp = "";
            var currentLine = "";
            var words = string.split(" ");
            var line = 0;
            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                if (currentLine.length + word.length < (typeof maxLength === "number" ? maxLength : 25) - 1) { // max - 1 to account for a space
                    currentLine += (word + " ");
                } else {
                    line++;
                    if (line > maxTitleLines - 1) {
                        if (i < words.length) {
                            currentLine += "&hellip;";
                        }
                        break;
                    }
                    if (currentLine.length > 0) {
                        temp += (currentLine + "<br>" + word + " ");
                    } else {
                        temp += (word + "<br>");
                    }
                    currentLine = "";
                }
            }
            return (temp + currentLine).trim();
        } else {
            if (maxLength && typeof maxLength === "number" && string.length > maxLength) {
                return string.trim().slice(0, maxLength) + "&hellip;";
            } else {
                return string.trim();
            }
        }
    },
    /* titleTransform(title)
     * Transforms the title of an event for usage.
     * Replaces parts of the text as defined in config.titleReplace.
     * Shortens title based on config.maxTitleLength and config.wrapEvents
     *
     * argument title string - The title to transform.
     *
     * return string - The transformed title.
     */
    titleTransform: function(title) {
        title = this.shorten(title, this.config.maxTitleLength, this.config.wrapEvents, this.config.maxTitleLines);
        return title;
    },
});