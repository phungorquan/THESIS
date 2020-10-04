// 1Begin Xiu add some variables
var numOfUrls = 0; // numOfUrls from "config.js"
var currentCalendarElement = 0; // This variable will save switch counter
var arrUrls = []; // Save all urls
var eventArr = []; // Save all event title to send notification once
var existTitle = false; // Flag to support eventArr above
var getCalendar = "";
var displayLunar = false;
// 1End Xiu add

Module.register("MMM-LunarCalendar", {

	// Define module defaultSymbol
	defaults: {
		maximumEntries: 10, // Total Maximum Entries
		maximumNumberOfDays: 365,
		displaySymbol: false,
		showLocation: true,
		displayRepeatingCountTitle: true,
		defaultRepeatingCountTitle: "",
		maxTitleLength: 20,
		wrapEvents: false, // wrap events to multiple lines breaking at maxTitleLength
		maxTitleLines: 3,
		fetchInterval: 1 * 60 * 1000, // Update every 5 minutes.
		animationSpeed: 500,
		fade: false,
		urgency: 7,
		displayButton: true, // Display button to switch between calendars
		dateFormat: "DD MMM",
		dateEndFormat: "LT(DD/MM)",
		fullDayEventDateFormat: "DD/MM",
		showEnd: true, // Xiu add - Actually i had to plus "endDate" by 1, had no idea why it was minus by 1 :v
		defaultColor: "LightGreen",
		getRelative: 6,
		fadePoint: 0.25, // Start on 1/4th of the list.
		hidePrivate: true,
		hideOngoing: false,
		colored: true,
		tableClass: "xsmall",
		calendars: [
			{
				url: "",
				color: "",
				name: ""
			}
		],
		titleReplace: {
			"Xiu": "",
			"'s birthday": ""
		},
		//broadcastEvents: true,
		excludedEvents: [],
		sliceMultiDayEvents: false,
		broadcastPastEvents: false,
		nextDaysRelative: false
	},

	// Define required scripts.
	getStyles: function () {
		return ["MMM-LunarCalendar.css", "font-awesome.css"];
	},

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	// Define required translations.
	getTranslations: function () {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		//return false;
		// Xiu add
		if(config.language == "vi")
			return {vi: "../../../translations/vi.json"}
		else return false;
	},

	// Override start method.
	start: function () {
		Log.log("Starting module: " + this.name);
		// Set locale.
		moment.updateLocale(config.language, { longDateFormat: {LT: moment.localeData().longDateFormat("LT")} });

		for (var c in this.config.calendars) {
			var calendar = this.config.calendars[c];
			calendar.url = calendar.url.replace("webcal://", "http://");

			var calendarConfig = {
				maximumEntries: calendar.maximumEntries,
				maximumNumberOfDays: calendar.maximumNumberOfDays,
				broadcastPastEvents: calendar.broadcastPastEvents,
			};
			if (calendar.symbolClass === "undefined" || calendar.symbolClass === null) {
				calendarConfig.symbolClass = "";
			}
			if (calendar.titleClass === "undefined" || calendar.titleClass === null) {
				calendarConfig.titleClass = "";
			}
			if (calendar.timeClass === "undefined" || calendar.timeClass === null) {
				calendarConfig.timeClass = "";
			}

			// we check user and password here for backwards compatibility with old configs
			if(calendar.user && calendar.pass) {
				Log.warn("Deprecation warning: Please update your calendar authentication configuration.");
				Log.warn("https://github.com/MichMich/MagicMirror/tree/v2.1.2/modules/default/calendar#calendar-authentication-options");
				calendar.auth = {
					user: calendar.user,
					pass: calendar.pass
				};
			}

			this.addCalendar(calendar.url, calendar.auth, calendarConfig);

			// Trigger ADD_CALENDAR every fetchInterval to make sure there is always a calendar
			// fetcher running on the server side.
			var self = this;
			setInterval(function() {
				self.addCalendar(calendar.url, calendar.auth, calendarConfig);
				eventArr = [];
				existTitle = false;
				getCalendar = "";
				displayLunar = false;
				//currentCalendarElement = arrUrls.length;
				//this.switchCalendar(); // Switch to first calendar (All calendar will be displayed)
			}, self.config.fetchInterval);
		}

		// 2Begin Xiu add
		// Get urls and save to arrUrls
		numOfUrls = arrUrls.length; // Get current arrUrls
		if(numOfUrls == 0) // This condition will avoid assigning urls too much when re-invoke start()
		{
			numOfUrls = this.config.calendars.length; // Assign numOfUrls
			for(var i = 0; i < numOfUrls; i++)
				arrUrls.push(this.config.calendars[i].url); // Save all urls to arrUrls
		}
		// 2End Xiu add 

		this.calendarData = {};
		this.loaded = false;
	},
	// Override socket notification handler.
	socketNotificationReceived: function (notification, payload) {
		if (notification === "CALENDAR_EVENTS") {
			if (this.hasCalendarURL(payload.url)) {
				this.calendarData[payload.url] = payload.events;
				this.loaded = true;

				// if (this.config.broadcastEvents) {
				// 	this.broadcastEvents();
				// }
			}
		} else if (notification === "FETCH_ERROR") {
			Log.error("Calendar Error. Could not fetch calendar: " + payload.url);
			this.loaded = true;
		} else if (notification === "INCORRECT_URL") {
			Log.error("Calendar Error. Incorrect url: " + payload.url);
		}

		this.updateDom(this.config.animationSpeed);
	},

	// Override dom generator.
	getDom: function () {
		
		var events = this.createEventList();
		var wrapper = document.createElement("table");
		wrapper.className = this.config.tableClass;

		if (events.length === 0) {
			wrapper.innerHTML = (this.loaded) ? this.translate("EMPTYPERSONALCALENDAR") + "<br>" : this.translate("LOADING") + "<br>";
			wrapper.className = this.config.tableClass + " dimmed";
		}
		else
		{
			if(!displayLunar)
			{

			
				if (this.config.fade && this.config.fadePoint < 1) {
				if (this.config.fadePoint < 0) {
					this.config.fadePoint = 0;
				}
				var startFade = events.length * this.config.fadePoint;
				var fadeSteps = events.length - startFade;
			}
			var currentFadeStep = 0;
			var lastSeenDate = "";
			for (var e in events) {
				var event = events[e];
				var dateAsString = moment(event.startDate, "x").format(this.config.dateFormat);
				var eventWrapper = document.createElement("tr");
	
				// 3Begin Xiu add 
				// Change calender color
				if (this.config.colored) {

					if(currentCalendarElement == 0)
					{
						for(var i = 0; i < arrUrls.length; i++)
						{
							if(event.url === arrUrls[i])
							{
								if(this.config.calendars[i].hasOwnProperty("color"))
									eventWrapper.style.color = this.config.calendars[i].color;
								else eventWrapper.style.color = this.config.defaultColor;
							}
							
						}
					}
					else{
						var myAvailableElement = currentCalendarElement - 1;

						if(this.config.calendars[myAvailableElement].hasOwnProperty("color"))
							eventWrapper.style.color = this.config.calendars[myAvailableElement].color;
						else
							eventWrapper.style.color = this.config.defaultColor;
					}
				}
				// 3End Xiu add

				eventWrapper.className = "normal";

				var titleWrapper = document.createElement("td"),
					repeatingCountTitle = "";

				// Ten su kien o day 
				// Xiu add, this is a TIPS: we can translate all calendar title here 
				titleWrapper.innerHTML = this.titleTransform(event.title);// + repeatingCountTitle;

				 	titleWrapper.style.fontFamily = "Roboto,bold"; // Xiu add font

					// Cho nay la time ne

					var timeWrapper = document.createElement("td");
					timeWrapper.style.fontFamily = "Roboto,bold"; // Xiu add font
					eventWrapper.appendChild(titleWrapper);
					//console.log(event.today);
					var now = new Date();
					// Define second, minute, hour, and day variables
					var oneSecond = 1000; // 1,000 milliseconds
					var oneMinute = oneSecond * 60;
					var oneHour = oneMinute * 60;
					var oneDay = oneHour * 24;
					if (event.fullDayEvent) {
						//subtract one second so that fullDayEvents end at 23:59:59, and not at 0:00:00 one the next day
						event.endDate -= oneSecond;
						if (event.today) {
							timeWrapper.innerHTML = this.translate("TODAY");
						} else if (event.startDate - now < oneDay && event.startDate - now > 0) {
							timeWrapper.innerHTML = this.translate("TOMORROW");
						} else if (event.startDate - now < 2 * oneDay && event.startDate - now > 0) {
							if (this.translate("DAYAFTERTOMORROW") !== "DAYAFTERTOMORROW") {
								timeWrapper.innerHTML = this.translate("DAYAFTERTOMORROW");
							} else {
								timeWrapper.innerHTML = moment(event.startDate, "x").fromNow();
							}
						} else {
							timeWrapper.innerHTML = moment(event.startDate, "x").from(moment().format("YYYYMMDD"));
						}
						// Xiu add, plus oneDay here, not inside else condition below
						if(this.config.showEnd){
							//timeWrapper.innerHTML += " - ";
							timeWrapper.innerHTML += "("+ moment(event.endDate + oneDay , "x").format(this.config.fullDayEventDateFormat) + ")";
						}
					} else {
						if (event.startDate >= new Date()) {
							// Xiu add alarm sound
							// Check < 5' and check whether this event from google(USER's calendar) or holiday calendars
							if(event.startDate - now < 5*oneMinute && event.url.indexOf("google") != -1)
							{	
								for(var index = 0; index < eventArr.length; index++)
								{
									if(eventArr[index] == event.title)
									{
										existTitle = true;
										break;
									}
								}
								if (!existTitle)
								{
									eventArr.push(event.title);
									var combineEventName = ""
									for(var i = 0 ; i < eventArr.length;i++)
									{
										combineEventName += eventArr[i] + " ";
									}
									var audio = new Audio('/modules/MyExtraResources/Alarm.mp3');
									audio.play();
									this.sendNotification("SHOW_ALERT",{type: "alert",title: "<h1>" + combineEventName + "</h1>", message:"EVENT IS COMING", timer: 7000});
								}
							}
							// End Xiu add
							if (event.startDate - now < 2 * oneDay) {
								// This event is within the next 48 hours (2 days)
								if (event.startDate - now < this.config.getRelative * oneHour) {
									// If event is within 6 hour, display 'in xxx' time format or moment.fromNow()
									timeWrapper.innerHTML = moment(event.startDate, "x").fromNow();
								} else {
										// Otherwise just say 'Today/Tomorrow at such-n-such time'
										timeWrapper.innerHTML = moment(event.startDate, "x").calendar();
								}
							} else {
								timeWrapper.innerHTML = moment(event.startDate, "x").fromNow();

							}
						} else {
							timeWrapper.innerHTML = 
								this.translate("RUNNING", {
									fallback: this.translate("RUNNING") + " {timeUntilEnd}",
									timeUntilEnd: moment(event.endDate, "x").fromNow(true)
								});
						}
						if (this.config.showEnd) {
							timeWrapper.innerHTML += " - ";
							timeWrapper.innerHTML += moment(event.endDate, "x").format(this.config.dateEndFormat);
						}
					}
					timeWrapper.className = "time light ";
					eventWrapper.appendChild(timeWrapper);
				
				wrapper.appendChild(eventWrapper);

				if (this.config.showLocation) {
				
					// 4Begin Xiu add
					// Display "No location" when the location of event not available instead of putting EMPTY
					var myLocation = this.translate("No location");
					if (event.location !== false) {
						myLocation = event.location;
					}
					if (myLocation === "Vietnam")
						myLocation = "VietNam";
					

					var locationRow = document.createElement("tr");
					locationRow.className = "normal xsmall";
					locationRow.style.fontFamily = "Courier New, monospace"; // Xiu add font style
					locationRow.style.fontStyle = "italic"; // Xiu add font style
					locationRow.style.letterSpacing = "0.5px"; // Xiu add font style

					// 4End Xiu add :)) 

					if (this.config.displaySymbol) {
						var symbolCell = document.createElement("td");
						locationRow.appendChild(symbolCell);
					}
	
					var descCell = document.createElement("td");
					descCell.className = "location";
					descCell.colSpan = "2";
					descCell.innerHTML = myLocation;
					locationRow.appendChild(descCell);
					wrapper.appendChild(locationRow);
					
					if(currentCalendarElement == 0)
					{
						var lineCol = document.createElement("td");
						lineCol.colSpan = "2";
						var getLine = document.createElement("hr");
						getLine.style.border = "0.5px solid #666";
						lineCol.appendChild(getLine);
						wrapper.appendChild(lineCol);
					}
				}
				}
			}}

			var getMonthYear = new Date();
			var getMonth = ("0" + (getMonthYear.getMonth() + 1)).slice(-2);
			var getYear = getMonthYear.getFullYear();
			var combineQueryWhereStr = "POSCAL like " + "'%-" + getMonth + "' AND YEAR = " + "'" + getYear + "'" ;
			this.getDataFromDB("SELECT","*","lunarcalendar",combineQueryWhereStr);
		// 	if(getCalendar == "ERROR")
		// {	var eventWrapperz = document.createElement("tr");
		// 		eventWrapperz.style.color = "red";
		// 		var titleWrapperz = document.createElement("td");
		// 		titleWrapperz.innerHTML = this.translate("ERROR DATABASE");
		// 		eventWrapperz.appendChild(titleWrapperz);	
		// 	wrapper.appendChild(eventWrapperz);
		// }
		// 	else {
			
			if(getCalendar.length != 0 && (currentCalendarElement == 0 || currentCalendarElement == arrUrls.length + 1))
			{
				for(var i = 0 ; i < getCalendar.length; i++)
			{
				var eventWrapperz = document.createElement("tr");
				eventWrapperz.style.color = this.config.defaultColor;
				var titleWrapperz = document.createElement("td");
				titleWrapperz.innerHTML = getCalendar[i].EVENT;//"A";
				titleWrapperz.style.fontFamily = "Roboto,bold";
				eventWrapperz.appendChild(titleWrapperz);
				var timeWrapperz = document.createElement("td");
					timeWrapperz.style.fontFamily = "Roboto,bold"; // Xiu add font
					timeWrapperz.innerHTML = "(" + getCalendar[i].DOW + ") "+getCalendar[i].POSCAL;//"MAI";
					timeWrapperz.className = "time light ";
					eventWrapperz.appendChild(timeWrapperz);
					wrapper.appendChild(eventWrapperz);
					//	eventWrapperz.style.opacity = 1 - (1 / fadeSteps * i);

					var locationRowz = document.createElement("tr");
					locationRowz.className = "normal xsmall";
					locationRowz.style.fontFamily = "Courier New, monospace"; // Xiu add font style
					locationRowz.style.fontStyle = "italic"; // Xiu add font style
					locationRowz.style.letterSpacing = "0.5px"; // Xiu add font style

					var descCellz = document.createElement("td");
					descCellz.className = "location";
					descCellz.colSpan = "2";
					descCellz.innerHTML = getCalendar[i].NEGCAL + "(ÂL)";
					locationRowz.appendChild(descCellz);

					wrapper.appendChild(locationRowz);
					//locationRowz.style.opacity = 1 - (1 / fadeSteps * i);
					
			}
			
			}
		//}
		
		
		// console.log("X1");
		
		// console.log("X2");
		// 5Begin Xiu add
		// Create a button with css = calendarSwitchBtn, onClick event = switchCalendar()
		if(this.config.displayButton == true)
		{
			var calendarSwitchBtn = document.createElement("BUTTON");
			calendarSwitchBtn.setAttribute("id","idCalendarSwitchBtn");
			calendarSwitchBtn.innerHTML = this.translate("SWITCH CALENDARS");
			calendarSwitchBtn.addEventListener("click", () => this.switchCalendar());
			calendarSwitchBtn.className = "calendarSwitchBtn"; // This Xiu's CSS putting "calendar.css" file
			wrapper.appendChild(calendarSwitchBtn);
		}
		// 5End Xiu add

		return wrapper;
	},
	getDataFromDB: function(fn, what, from, where = ""){
        var xhttp;
        if (window.XMLHttpRequest) 
            xhttp = new XMLHttpRequest();// code for modern browsers
        else 
            xhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) 
            {
            	if(this.responseText != "FAILED")
            	{
            		var parseJSON = JSON.parse(this.responseText);
                	if(getCalendar.length == 0)
                	{
                		getCalendar = parseJSON;
                	}
            	}             
            }
        };
        xhttp.open("GET", "http://localhost/MMM/MMMDB.php?fn="+fn+"&what="+what+"&from="+from+"&where="+where,true); 
        xhttp.send();   
    },

	// XBegin Xiu add
	// Add notification to switch calendar from external signal
	notificationReceived: function(notification, payload, sender) {
		if (notification == "SWITCH_CALENDAR") {
			this.switchCalendar(); // Switch next calendar
		} 
		else if (notification == "SWITCH_ALL_CALENDAR")
		{
			currentCalendarElement = arrUrls.length;
			this.switchCalendar(); // Switch to first calendar (All calendar will be displayed)
		}
	},
	// XEnd Xiu add

	// 6Begin Xiu add
	// This is event func will be invoked when click button
	// This func will switch to next calendar inside arrUrls[] until reach to the last one
	switchCalendar: function(){
		// If the mirror has more than 1 calendar url
		if(arrUrls.length > 1)
		{
			if(currentCalendarElement < arrUrls.length)
			{
				// Display only 1 calendar at [0] with each element[currentCalendarElement], hide the other by ""
				this.config.calendars[0].url = arrUrls[currentCalendarElement];
				for(var i = 1; i < arrUrls.length; i++)
					this.config.calendars[i].url = "";
			}
			// If reach to the last one
			if(currentCalendarElement == arrUrls.length + 1)
			{
				// Display all calenders
				for(var i = 0; i < arrUrls.length; i++)
					this.config.calendars[i].url = arrUrls[i];

				// Reset counter
				currentCalendarElement = 0;
			}
			else currentCalendarElement++; // Increase counter until reach to last url
			
			// this.updateDom(this.config.animationSpeed);
			this.start(); // Re-invoke to update
		}
	},
	// 6End Xiu add

	// 7Begin Xiu add
	// Override getHeader method.
	// This method is only available for mycalendar on google and from ical website
	getHeader: function() {
		

		//First time when finished loading calendar
		if(currentCalendarElement == 0)
			return this.translate("ALL EVENTS ARE COMING");
		else
		{
			if(currentCalendarElement == arrUrls.length + 1)
				{
					return this.translate("LUNAR CALENDAR");
				}
				else {
			var myAvailableElement = currentCalendarElement - 1; // We need to minus by 1 when using with arr[]
			if(this.config.calendars[myAvailableElement].hasOwnProperty("name"))
			{
				return this.config.calendars[myAvailableElement].name;
			}
			else 
			{

				
				//Check my available calendar to display my sentence
				var getIndexOfMyCalendar = arrUrls[myAvailableElement].indexOf("google");
				if(getIndexOfMyCalendar > 0)
				{
					function nthIndex(str, pat, n){
    					var L= str.length, i= -1;
    					while(n-- && i++<L){
    					    i= str.indexOf(pat, i);
    					    if (i < 0) break;
    					}
    					return i;
					}	
					var getFifthSlashIndex = nthIndex(arrUrls[myAvailableElement],'/',5) + 1;
					var getFirstPercentageIndex = arrUrls[myAvailableElement].indexOf("%");
					var getLengthAccount = getFirstPercentageIndex - getFifthSlashIndex;
					var getGmailAccount = arrUrls[myAvailableElement].substr(getFifthSlashIndex,getLengthAccount);
					return this.translate("EVENT OF - ") + getGmailAccount;
				}

				// Check countries available calendar to display
				var getIndexOfLastSlash = arrUrls[myAvailableElement].lastIndexOf("/")+1;
				var getIndexOfLastDot = arrUrls[myAvailableElement].lastIndexOf(".");

				// If there is not any url countries are available
				if(getIndexOfLastSlash < 0 && getIndexOfLastDot < 0)
					return this.translate("ALL EVENTS ARE COMING");
				else
				{
					// Cut countries name from URL
					var getLengthTitle = getIndexOfLastDot - getIndexOfLastSlash;
					var getLocationTitle = arrUrls[myAvailableElement].substr(getIndexOfLastSlash,getLengthTitle);
					return this.translate("EVENT OF - ") + getLocationTitle;
				} 
			}
		}
			
		}
	},
	// 7End Xiu add

	/* hasCalendarURL(url)
	 * Check if this config contains the calendar url.
	 *
	 * argument url string - Url to look for.
	 *
	 * return bool - Has calendar url
	 */
	hasCalendarURL: function (url) {
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
	createEventList: function () {
		var events = [];
		var today = moment().startOf("day");
		var now = new Date();
		var future = moment().startOf("day").add(this.config.maximumNumberOfDays, "days").toDate();
		for (var c in this.calendarData) {
			var calendar = this.calendarData[c];
			for (var e in calendar) {
				var event = JSON.parse(JSON.stringify(calendar[e])); // clone object
				if(event.endDate < now) {
					continue;
				}
				if(this.config.hidePrivate) {
					if(event.class === "PRIVATE") {
						  // do not add the current event, skip it
						  continue;
					}
				}
				if(this.config.hideOngoing) {
					if(event.startDate < now) {
						continue;
					}
				}
				if(this.listContainsEvent(events,event)){
					continue;
				}
				event.url = c;
				event.today = event.startDate >= today && event.startDate < (today + 24 * 60 * 60 * 1000);

				/* if sliceMultiDayEvents is set to true, multiday events (events exceeding at least one midnight) are sliced into days,
				* otherwise, esp. in dateheaders mode it is not clear how long these events are.
				*/
				var maxCount = Math.ceil(((event.endDate - 1) - moment(event.startDate, "x").endOf("day").format("x"))/(1000*60*60*24)) + 1;
				if (this.config.sliceMultiDayEvents && maxCount > 1) {
					var splitEvents = [];
					var midnight = moment(event.startDate, "x").clone().startOf("day").add(1, "day").format("x");
					var count = 1;
					while (event.endDate > midnight) {
						var thisEvent = JSON.parse(JSON.stringify(event)); // clone object
						thisEvent.today = thisEvent.startDate >= today && thisEvent.startDate < (today + 24 * 60 * 60 * 1000);
						thisEvent.endDate = midnight;
						thisEvent.title += " (" + count + "/" + maxCount + ")";
						splitEvents.push(thisEvent);

						event.startDate = midnight;
						count += 1;
						midnight = moment(midnight, "x").add(1, "day").format("x"); // next day
					}
					// Last day
					event.title += " ("+count+"/"+maxCount+")";
					splitEvents.push(event);

					for (event of splitEvents) {
						if ((event.endDate > now) && (event.endDate <= future)) {
							events.push(event);
						}
					}
				} else {
					events.push(event);
				}
			}
		}

		events.sort(function (a, b) {
			return a.startDate - b.startDate;
		});
		return events.slice(0, this.config.maximumEntries);
	},

	listContainsEvent: function(eventList, event){
		for(var evt of eventList){
			if(evt.title === event.title && parseInt(evt.startDate) === parseInt(event.startDate)){
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
	addCalendar: function (url, auth, calendarConfig) {
		this.sendSocketNotification("ADD_CALENDAR", {
			url: url,
			excludedEvents: calendarConfig.excludedEvents || this.config.excludedEvents,
			maximumEntries: calendarConfig.maximumEntries || this.config.maximumEntries,
			maximumNumberOfDays: calendarConfig.maximumNumberOfDays || this.config.maximumNumberOfDays,
			fetchInterval: this.config.fetchInterval,
			symbolClass: calendarConfig.symbolClass,
			titleClass: calendarConfig.titleClass,
			timeClass: calendarConfig.timeClass,
			auth: auth,
			broadcastPastEvents: calendarConfig.broadcastPastEvents || this.config.broadcastPastEvents,
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
	shorten: function (string, maxLength, wrapEvents, maxTitleLines) {
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
	titleTransform: function (title) {
		for (var needle in this.config.titleReplace) {
			var replacement = this.config.titleReplace[needle];

			var regParts = needle.match(/^\/(.+)\/([gim]*)$/);
			if (regParts) {
			  // the parsed pattern is a regexp.
			  needle = new RegExp(regParts[1], regParts[2]);
			}

			title = title.replace(needle, replacement);
		}

		title = this.shorten(title, this.config.maxTitleLength, this.config.wrapEvents, this.config.maxTitleLines);
		return title;
	},
});
