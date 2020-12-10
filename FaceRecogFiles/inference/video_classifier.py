#!/usr/bin/env python

import joblib
import cv2
import numpy as np
from PIL import Image   
from face_recognition import preprocessing
from .util import draw_bb_on_img
from .constants import MODEL_PATH
import requests
import time

def main():

    URL_STREAM = "/home/xiu/Facenet/face-recognition/DatasetAtUitLab.mp4"
    # URL_STREAM = "/home/xiu/Facenet/face-recognition/Untitled.png"

    #URL_STREAM = "http://192.168.1.26:8081" # tren ras 
    cap = cv2.VideoCapture(URL_STREAM)

    face_recogniser = joblib.load(MODEL_PATH)
    preprocess = preprocessing.ExifOrientationNormalize()
    strCombine = "" # String to combine all data which were recognized
    
    # Raspberry url to get DATA
    URL = "http://192.168.1.24:8080/facenetroute" # magicmirror
    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()
        if ret > 0:
            img = Image.fromarray(frame)
            faces = face_recogniser(preprocess(img))
            if faces is not None:
                userArr = [] # All users name which were recognized 
                rateArr = [] # All users rate which were recognized 

                for face in faces:
                    _user = face.top_prediction.label # Get name
                    _rate = float("{:.2f}".format(face.top_prediction.confidence)) # Get rate

                    if _rate > 0.90:
                        flagExist = True
                        # Assign user to userArr if not exist
                        # Assign greater rate to user who was existed
                        if len(userArr) > 0:
                            for index in range(len(userArr)):
                                if _user == userArr[index]:
                                    if _rate > rateArr[index]:
                                        rateArr[index] = _rate # Re-assign rate
                                    
                                    flagExist = True
                                    break
                                else:
                                    flagExist = False
                        else:
                            userArr.append(_user)
                            rateArr.append(_rate)
    
                        if flagExist == False:
                            userArr.append(_user)
                            rateArr.append(_rate)
                    else:
                        userArr.append("UNKNOWN")
                        rateArr.append(_rate)

                # Combine data        
                currentData = ""
                for index in range(len(userArr)):
                    if index != (len(userArr) - 1):
                        currentData = currentData + userArr[index] + "," + str(rateArr[index]) + "/"
                    else:
                        currentData = currentData + userArr[index] + "," + str(rateArr[index])

                if currentData != strCombine:
                    strCombine = currentData
                    print(strCombine)

                    # Prepare data with feild 'data'
                    PARAMS = {'data':strCombine}
                    try:
                        requests.get(url = URL, params = PARAMS) 
                    except requests.ConnectionError as exception:
                        print("URL is not exist, please check MMM")
                    
                # No need to draw if you are not debugging
                draw_bb_on_img(faces, img)

            # Display the resulting frame
            cv2.imshow('video', np.array(img))
        else:
            print("Camera not available")
            try:
                requests.get(url = URL, params = {'data':"CAMERA_ERROR"}) 
            except requests.ConnectionError as exception:
                print("URL is not exist, please check MMM")
            time.sleep(5)
            cap = cv2.VideoCapture(URL_STREAM)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    # When everything done, release the captureq
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
