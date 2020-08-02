#!/usr/bin/python
# -*- coding: utf-8 -*-
import pyautogui
import time
import serial
import signal

pyautogui.FAILSAFE = False
run = True

ser = serial.Serial(  # port = '/dev/ttyAMA0',
    port='/dev/ttyS0',
    baudrate=9600,
    parity=serial.PARITY_NONE,
    stopbits=serial.STOPBITS_ONE,
    bytesize=serial.EIGHTBITS,
    timeout=1,
    )


def handler_stop_signals(signum, frame):
    print ('OUT - JOYSTICK')
    global run
    run = False
    
signal.signal(signal.SIGINT, handler_stop_signals)

try:
    while run:
        s = ser.readline()
        if len(s) > 0:
            data = s.decode('utf-8')  # decode s

            # print (data)

            data = data.rstrip()  # cut "\r\n" at last of string
            arr = data.split(',')
            (X, Y) = pyautogui.position()
            if '1' in arr[2]:
                pyautogui.click(button='left')
            elif '2' in arr[2]:
                pyautogui.click(button='right')
            elif '3' in arr[2]:
                pyautogui.press('alt')
            else:
                pyautogui.moveTo(X + int(arr[1]), Y - int(arr[0]),
                                 duration=0)
except KeyboardInterrupt:
    ser.close()
