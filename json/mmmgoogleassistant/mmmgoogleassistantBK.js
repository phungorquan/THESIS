{
  "position": "center",
  "module": "MMM-GoogleAssistant",
  "config": {
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