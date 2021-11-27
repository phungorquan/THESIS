import board
import neopixel
import time
import signal
import sys

pixels = neopixel.NeoPixel(board.D18, 14)

def OFF():
	pixels.fill((0, 0, 0))

def handler_stop_signals(signum, frame):
	print("OUT - WS2812")
	OFF()

OFF()

def wheel(pos):
    # Input a value 0 to 255 to get a color value.
    # The colours are a transition r - g - b - back to r.
    if pos < 0 or pos > 255:
        r = g = b = 0
    elif pos < 85:
        r = int(pos * 3)
        g = int(255 - pos * 3)
        b = 0
    elif pos < 170:
        pos -= 85
        r = int(255 - pos * 3)
        g = 0
        b = int(pos * 3)
    else:
        pos -= 170
        r = 0
        g = int(pos * 3)
        b = int(255 - pos * 3)
    return (r, g, b)

def ON():
    pixels.fill((255, 255, 255))

def BLINK():
	pixels.fill((0, 0, 0))
	time.sleep(0.5)
	pixels.fill((255, 0, 0))
	time.sleep(0.5)
	pixels.fill((0, 0, 0))
	time.sleep(0.5)
	pixels.fill((0, 255, 0))
	time.sleep(0.5)
	pixels.fill((0, 0, 0))
	time.sleep(0.5)
	pixels.fill((0, 0, 255))
	time.sleep(0.5)
	pixels.fill((0, 0, 0))

def THEATER():
    """Movie theater light style chaser animation."""
    for j in range(2):
        for q in range(2):
            for i in range(0, 14, 2):
                pixels[i+q] = wheel((int(i * 256 / 14) + j*16) & 255)
            pixels.show()
            time.sleep(0.5)
            for i in range(0, 14, 2):
                pixels[i+q] = 0

# Rainbow chasing, 50 is time, /14 is speed
def RAINBOW():
    for j in range(50):
        for i in range(14):
            pixels[i] = wheel((int(i * 256 / 14) + j*16) & 255)
        pixels.show()
        time.sleep(0.02)

#Breathing twice
# 2*256 but 2 is breath time, 16 is speed
def BREATHING():
    for i in range(0, 2 * 256, 16):
        for j in range(14):
            if (i // 256) % 2 == 0:
                val = i & 0xff
            else:
                val = 255 - (i & 0xff)
            pixels[j] = (val, 0, 0)
        pixels.write()
    for i in range(0, 2 * 256, 16):
        for j in range(14):
            if (i // 256) % 2 == 0:
                val = i & 0xff
            else:
                val = 255 - (i & 0xff)
            pixels[j] = (0, 0, val)
        pixels.write()
    for i in range(0, 2 * 256, 16):
        for j in range(14):
            if (i // 256) % 2 == 0:
                val = i & 0xff
            else:
                val = 255 - (i & 0xff)
            pixels[j] = (0, val, 0)
        pixels.write()

#Rainbow not move
def COLORFUL():
    for i in range(14):
        pixel_index = (i * 256 // 14)
        pixels[i] = wheel(pixel_index & 255)
    pixels.show()
    time.sleep(0.5)

def doActivities(act):
	if act == "ON":
		ON()
	elif act == "OFF":
		OFF()
	elif act == "BLINK":
		BLINK()
	elif act == "THEATER":
		THEATER()
		OFF()
	elif act == "RAINBOW":
		RAINBOW()
		OFF()
	elif act == "BREATHING":
		BREATHING()
		OFF()
	elif act == "COLORFUL":
		COLORFUL()
	else:
		OFF()

signal.signal(signal.SIGINT, handler_stop_signals)

doActivities(sys.argv[1])


