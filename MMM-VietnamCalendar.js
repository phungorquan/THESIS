/**
 * This module will display your personal google calendar and VietNam events
 * Author: Anh Quan Tong 
 * Youtube: Anh Quan Tong
 * Github: phungorquan
*/

// namespace VN carlendar
var ns_VNCal = {
    numOfUrls: 0, // numOfUrls from "config.js"
    arrUrls: [], // Save all urls
    titleArr: [], // Save all event title to send notification once
    alertOnce: true, // Flag to support titleArr above
    currentCalIndex: 0, // This variable will save switch counter
    getInterval: 0
};
Module.register("MMM-VietnamCalendar", {
    defaults: {
        maximumEntries: 10, // Total Maximum Entries
        maximumNumberOfDays: 365,
        showLocation: true,
        maxTitleLength: 20,
        wrapEvents: true, // wrap events to multiple lines breaking at maxTitleLength
        maxTitleLines: 3,
        fetchInterval: 1 * 60 * 1000, // Update every 1 minutes.
        animationSpeed: 500,
        displayButton: true, // Display button to switch between calendars
        displayEndTime: false,
        displayLunarDate: false,
        displayPersonalEvents: true,
        dateEndFormat: "LT(DD/MM)",
        defaultColor: "White",
        lunarColor: "LightGreen",
        colored: true,
        tableClass: "xsmall",
        displayLunarEvents: true,
        calendars: [{
            url: "",
            color: "",
            name: ""
        }],
        personalDateEvent:[
            {
                day: 7,
                month: 7,
                title: "- Sinh nhật Quân",
            }
        ]
    },

    // Define required css.
    getStyles: function() {
        return ["MMM-VietnamCalendar.css", "font-awesome.css"];
    },
    // Define required scripts.
    getScripts: function() {
        return ["moment.js" ,"VietNamCal.js"];
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

        // Add personal events into array and also sort INC
        if(this.config.displayPersonalEvents)
        {
            var getPersonalEventsArr = this.config.personalDateEvent;
            if(getPersonalEventsArr.length > 0)
            {
                // Check whether events were added to array or not, because it will be overlaped after requested interval time
                for(index in getPersonalEventsArr)
                {
                    var addDayDigit = ("0" + getPersonalEventsArr[index].day).slice(-2);
                    var addMonthDigit = ("0" + getPersonalEventsArr[index].month).slice(-2);
                    var existFlag = false;
                    for(element in DL[getPersonalEventsArr[index].month - 1])
                    {
                        var strCombine = addDayDigit + "/" + addMonthDigit + getPersonalEventsArr[index].title;
                        if(DL[getPersonalEventsArr[index].month - 1][element] == strCombine)
                        {
                            existFlag = true;
                            break;
                        }
                    }
                    if(!existFlag)
                    {
                        DL[getPersonalEventsArr[index].month - 1] = sortDayINC(getPersonalEventsArr[index].day,getPersonalEventsArr[index].month,getPersonalEventsArr[index].title);
                    }
                }
            }
        }

        if (ns_VNCal.numOfUrls == 0) { // This condition will avoid do too much time when re-invoke start())
            Log.log("Starting module: " + this.name);
            // Set locale to setup time format environment.
            moment.updateLocale(config.language, {
                longDateFormat: {
                    LT: "HH:mm"
                },
                calendar: {
                    sameDay: '[Hôm nay, ]DD/MM[<br>]LT',
                    nextDay: '[Ngày mai, ]DD/MM[<br>]LT',
                    nextWeek: 'dd[,] DD/MM [<br>]LT',
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
            clearInterval(ns_VNCal.getInterval);
            ns_VNCal.getInterval = setInterval(function() {
                self.addCalendar(calendar.url, calendar.auth, calendarConfig);
                self.switchCalendar("All"); // Switch to first calendar (All calendar will be displayed)
                ns_VNCal.titleArr = [];
            }, self.config.fetchInterval);
        }
        ns_VNCal.numOfUrls = ns_VNCal.arrUrls.length; // Restart numOfUrls
        if (ns_VNCal.numOfUrls == 0) // This condition will avoid assigning urls too much when re-invoke start()
        {
            ns_VNCal.numOfUrls = this.config.calendars.length;
            for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                ns_VNCal.arrUrls.push(this.config.calendars[i].url); // Save all urls to ns_VNCal.arrUrls
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
                if (ns_VNCal.currentCalIndex != this.config.calendars.length + 1) {
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
                for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                    if (event.url === ns_VNCal.arrUrls[i]) {
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
                            for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                                if (ns_VNCal.titleArr[i] == event.title) {
                                    existTitle = true;
                                    break;
                                }
                            }
                            if (!existTitle) {
                                ns_VNCal.alertOnce = true;
                                ns_VNCal.titleArr.push(event.title);
                            }
                        }
                    } else {
                        timeWrapper.innerHTML = this.translate("RUNNING") + moment(event.endDate, "x").fromNow(true)
                        timeWrapper.innerHTML += "<br>" + moment(event.startDate, "x").format(this.config.dateEndFormat);
                    }

                    // If startDate > a week -> display Date
                    if (moment(event.startDate,"x")._i - Date.now() > oneDay * 7) {
                        timeWrapper.innerHTML += "<br>" + moment(event.startDate, "x").format("LT");
                    }
                    // Display endTime
                    if(this.config.displayEndTime)
                    {
                        timeWrapper.innerHTML += " - " + moment(event.endDate, "x").format(this.config.dateEndFormat);
                    }
                }
                timeWrapper.className = "time bold ";
                eventWrapper.appendChild(timeWrapper);
                wrapper.appendChild(eventWrapper);
                // Location
                if (this.config.showLocation) {
                    var myLocation = this.translate("No location");
                    if (event.location !== false) {
                        myLocation = event.location;
                    }
                    var locationRow = document.createElement("tr");
                    locationRow.className = "normal xsmall";
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
                    if (this.config.displayLunarEvents && ns_VNCal.currentCalIndex == 0 && e == events.length - 1) {
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
        if (ns_VNCal.titleArr.length != 0 && ns_VNCal.alertOnce) {
            ns_VNCal.alertOnce = false;
            var combineEventName = ""
            for (var i = 0; i < ns_VNCal.titleArr.length; i++) {
                combineEventName += ns_VNCal.titleArr[i] + "<br>";
            }
            var audio = new Audio('/modules/MyExtraResources/Alarm.mp3');
            audio.play();
            this.sendNotification("SHOW_ALERT", {
                type: "alert",
                title: "<h2>" + combineEventName + "</h2>",
                message: "EVENT IS COMING",
                timer: 7000
            });
        }

        // VIETNAM EVENTS
        var getNow = new Date();
        var getMonth = ("0" + (getNow.getMonth() + 1)).slice(-2);
        var getYear = getNow.getFullYear();
        if (this.config.displayLunarEvents == true && (ns_VNCal.currentCalIndex == 0 || ns_VNCal.currentCalIndex == ns_VNCal.numOfUrls + 1)) {
            var getVNEvent = getEvent(getNow.getMonth());
            var maxEntries = getVNEvent.length;
            if (this.config.maximumEntries <= maxEntries) {
                maxEntries = this.config.maximumEntries
            }

            for (var i = 0; i < maxEntries; i++) {
                var getTitle = getVNEvent[i].split('-'); // [date/month],[title]
                var secondSplit = getTitle[0].split('/'); // [date],[month]
                var getLunarInfo = getLunarDate(parseInt(secondSplit[0]),parseInt(secondSplit[1]),getYear);
                var getLunarDay = ("0" + getLunarInfo.day).slice(-2);
                var getLunarMonth = ("0" + getLunarInfo.month).slice(-2);
                var getDOW = TUAN[(getLunarInfo.jd+1) % 7];

                var eventWrapper = document.createElement("tr");
                eventWrapper.style.color = this.config.lunarColor;
                // Title
                var titleWrapper = document.createElement("td");
                titleWrapper.innerHTML = this.titleTransform(getTitle[1]);
                titleWrapper.style.fontFamily = "Roboto,bold";
                //titleWrapper.style.cssFloat = "left";
                eventWrapper.appendChild(titleWrapper);
                wrapper.appendChild(eventWrapper);
                // Time
                var timeWrapper = document.createElement("td");
                timeWrapper.style.fontFamily = "Roboto,bold"; // Xiu add font
                if(this.config.displayLunarDate)
                {
                    timeWrapper.innerHTML = getDOW + ", "+ getTitle[0] + "<sup style = 'font-size: 15px; vertical-align: top; position: relative; top: 4px; '>(" + getLunarDay + "/" + getLunarMonth + ")</sup>";    
                }
                else
                {
                    timeWrapper.innerHTML = getDOW + ", "+ getTitle[0];  
                }
                timeWrapper.style.cssFloat = "right";
                timeWrapper.className = "time bold ";
                eventWrapper.appendChild(timeWrapper);
                wrapper.appendChild(eventWrapper);
            }
        }

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

    // Switch calendar from external notification
    notificationReceived: function(notification, payload, sender) {
        if (notification == "SWITCH_CALENDAR") {
            this.switchCalendar(); // Switch next calendar
        } else if (notification == "SWITCH_ALL_CALENDAR") {
            this.switchCalendar("All"); // Switch to first calendar (All calendar will be displayed)
        }
    },
    // This is event func will be invoked when click button
    // This func will switch to next calendar inside ns_VNCal.arrUrls[] until reach to the last one
    switchCalendar: function(mode = "!All") {
        // If the mirror has more than 1 calendar url
        if (ns_VNCal.numOfUrls > 0) {
            if (mode == "All") {
                //this.config.displayLunarEvents = true;
                for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                    this.config.calendars[i].url = ns_VNCal.arrUrls[i];
                }
                // Reset counter
                ns_VNCal.currentCalIndex = 0;
                this.start(); // Re-invoke to update
            } else {
                // Show personalCal
                if (ns_VNCal.currentCalIndex < ns_VNCal.numOfUrls) {
                    // Display only 1 calendar at [0] with each element[ns_VNCal.currentCalIndex]
                    // hide the other by "DUMMY HIDEN"
                    this.config.calendars[0].url = ns_VNCal.arrUrls[ns_VNCal.currentCalIndex];
                    for (var i = 1; i < ns_VNCal.numOfUrls; i++) {
                        this.config.calendars[i].url = "DUMMY HIDEN";
                    }
                    ns_VNCal.currentCalIndex++;
                }
                // Show lunarCal
                else if (ns_VNCal.currentCalIndex == ns_VNCal.numOfUrls) {
                    this.config.calendars[0].url = "DUMMY HIDEN";
                    ns_VNCal.currentCalIndex++;
                    if (!this.config.displayLunarEvents) {
                        for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                            this.config.calendars[i].url = ns_VNCal.arrUrls[i];
                        }
                        // Reset counter
                        ns_VNCal.currentCalIndex = 0;
                    }
                }
                // Show all
                else {
                    for (var i = 0; i < ns_VNCal.numOfUrls; i++) {
                        this.config.calendars[i].url = ns_VNCal.arrUrls[i];
                    }
                    // Reset counter
                    ns_VNCal.currentCalIndex = 0;
                }
                this.start(); // Re-invoke to update
            }
        }
    },
    getHeader: function() {
        //First time when finished loading calendar
        if (ns_VNCal.currentCalIndex == 0) {
            return this.translate("ALL EVENTS ARE COMING");
        } else {
            if (this.config.displayLunarEvents && ns_VNCal.currentCalIndex == ns_VNCal.numOfUrls + 1) {
                return this.translate("LUNAR CALENDAR");
            } else {
                var myAvailableElement = ns_VNCal.currentCalIndex - 1; // We need to minus by 1 when using with arr[]
                if (this.config.calendars[myAvailableElement].hasOwnProperty("name")) {
                    return this.config.calendars[myAvailableElement].name;
                } else {
                    //Check my available calendar to display my sentence
                    var getIndexOfMyCalendar = ns_VNCal.arrUrls[myAvailableElement].indexOf("google");
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
                        var getFifthSlashIndex = nthIndex(ns_VNCal.arrUrls[myAvailableElement], '/', 5) + 1;
                        var getFirstPercentageIndex = ns_VNCal.arrUrls[myAvailableElement].indexOf("%");
                        var getLengthAccount = getFirstPercentageIndex - getFifthSlashIndex;
                        var getGmailAccount = ns_VNCal.arrUrls[myAvailableElement].substr(getFifthSlashIndex, getLengthAccount);
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