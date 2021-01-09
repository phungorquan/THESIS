{
    "position": "top_left",
    "module": "MMM-Assistant2Display",
    "config": {
        "debug": false,
        "useYoutube": true,
        "links": {
            "useLinks": false,
            "displayDelay": 60000,
            "scrollStep": 25,
            "scrollInterval": 1000,
            "scrollStart": 5000,
            "scrollActivate": false,
            "verbose": false
        },
        "photos": {
            "usePhotos": true,
            "displayDelay": 10000
        },
        "internet": {
            "useInternet": true,
            "displayPing": false,
            "delay": 120000,
            "scan": "google.fr",
            "command": "pm2 restart 0",
            "showAlert": true
        }
    }
}