{
    "address": "0.0.0.0",
    "electronOptions":
    {
        "webPreferences":
        {
            "webviewTag": true
        }
    },
    "port": 8080,
    "ipWhitelist": [],
    "useHttps": false,
    "httpsPrivateKey": "",
    "httpsCertificate": "",
    "language": "vi",
    "timeFormat": 24,
    "units": "metric",
    "modules": [
    {
        "position": "top_center",
        "header": "",
        "module": "clock",
        "config":
        {
            "displayType": "digital",
            "displaySeconds": false,
            "showPeriod": false,
            "showPeriodUpper": false,
            "clockBold": false,
            "showDate": true,
            "showWeek": false,
            "dateFormat": "ddd, DD/MM",
            "timeFormat": 24,
            "lunarShow": true,
            "analogSize": "200px",
            "analogFace": "simple",
            "analogPlacement": "bottom",
            "analogShowDate": "top",
            "secondsColor": "#111111",
            "showSunTimes": false,
            "showMoonTimes": false,
            "lat": 47.630539,
            "lon": -122.344147
        }
    },
    {
        "position": "bottom_bar",
        "module": "newsfeed",
        "config":
        {
            "showSourceTitle": true,
            "showPublishDate": true,
            "showDescription": true,
            "wrapTitle": true,
            "wrapDescription": true,
            "truncDescription": false,
            "lengthDescription": 100,
            "hideLoading": false,
            "reloadInterval": 300000,
            "updateInterval": 10000,
            "animationSpeed": 1500,
            "maxNewsItems": 0,
            "ignoreOldItems": true,
            "ignoreOlderThan": 604800000,
            "logFeedWarnings": false,
            "feeds": [
            {
                "title": "24h",
                "url": "https://cdn.24h.com.vn/upload/rss/tintuctrongngay.rss"
            },
            {
                "title": "VNExpress",
                "url": "https://vnexpress.net/rss/tin-moi-nhat.rss"
            },
            {
                "title": "24h",
                "url": "https://cdn.24h.com.vn/upload/rss/bongda.rss"
            }]
        }
    },
    {
        "module": "currentweather",
        "position": "top_right",
        "header": "",
        "config":
        {
            "location": "Thành phố Hồ Chí Minh",
            "locationID": "1566083",
            "updateInterval": 600000,
            "animationSpeed": 1000,
            "showPeriod": false,
            "showPeriodUpper": false,
            "showWindDirection": false,
            "showWindDirectionAsArrow": false,
            "useBeaufort": false,
            "appendLocationNameToHeader": false,
            "useKMPHwind": false,
            "decimalSymbol": ".",
            "showHumidity": true,
            "degreeLabel": false,
            "showIndoorTemperature": true,
            "showIndoorHumidity": true,
            "showFeelsLike": false,
            "initialLoadDelay": 0,
            "retryDelay": 2500,
            "roundTemp": false
        }
    }]
}