{
    "position": "center",
    "module": "MMM-GoogleAssistant",
    "config": {
        "debug": false,
        "assistantConfig": {
            "lang": "en-US",
            "projectId": "", 
            "modelId": "", 
            "instanceId": "", 
            "latitude": 10.8698858,
            "longitude": 106.7976355
        },
        "responseConfig": {
            "useScreenOutput": true,
            "screenOutputCSS": "screen_output.css",
            "screenOutputTimer": 5000,
            "screenRotate": false,
            "activateDelay": 0,
            "useAudioOutput": true,
            "useChime": true,
            "newChime": false,
            "useNative": true,
            "playProgram": "mpg321"
        },
        "micConfig": { 
            "recorder": "arecord",
            "device": "plughw:2"
        },
        "snowboy": {
            "usePMDL": false,
            "audioGain": 2.0,
            "Frontend": true,
            "Model": "jarvis",
            "Sensitivity": 0.7
        },
        "A2DServer": {
            "useA2D": true,
            "stopCommand": "stop",
            "useYouTube": true,
            "youtubeCommand": "youtube",
            "displayResponse": true
        },
		"recipes": ["myCustomRecipe.js"]
    }
}