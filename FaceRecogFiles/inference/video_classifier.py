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

    URL_STREAM = "/home/xiu/Facenet/face-recognition/TestVideo2.mp4"
    #URL_STREAM = "http://192.168.1.20:8081"
    cap = cv2.VideoCapture(URL_STREAM)

    face_recogniser = joblib.load(MODEL_PATH)
    preprocess = preprocessing.ExifOrientationNormalize()
    faceReceived = ""
    # Raspberry url to get DATA
    URL = "http://192.168.1.30:8080/facenetroute"
    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()
        if ret > 0:
            img = Image.fromarray(frame)
            faces = face_recogniser(preprocess(img))
            if faces is not None:
                for face in faces:
                    _user = face.top_prediction.label.upper()
                    _rate = face.top_prediction.confidence * 100
                    if faceReceived != _user:
                        if _rate > 50 :
                            faceReceived = _user
                            getNumOfUsers = str(len(faces))
                            getUser = str(faceReceived)
                            getRate = str(_rate)
                            print("\x1b[6;30;42m [OK] \x1b[0m -- num: "+getNumOfUsers + ", id: "  + getUser + ", rate: " +getRate)
                            PARAMS = {'user': getUser,'rate':getRate,'quantity':getNumOfUsers} 
                            #requests.get(url = URL, params = PARAMS) 
                        else:
                            faceReceived = _user
                            getNumOfUsers = str(len(faces))
                            getUser = "Unknown"
                            getRate = str(_rate)
                            print("\x1b[0;30;41m [ERR] \x1b[0m -- num: "+getNumOfUsers + ", id: "  + getUser + ", rate: " +getRate)
                            PARAMS = {'user': getUser,'rate':getRate,'quantity':getNumOfUsers} 
                            #requests.get(url = URL, params = PARAMS) 
                    # else:
                    #     print("...")

                # No need to draw if you are not debugging
                draw_bb_on_img(faces, img)
    
            # Display the resulting frame
            cv2.imshow('video', np.array(img))
        else:
            print("Camera not available")
            time.sleep(5)
            cap = cv2.VideoCapture(URL_STREAM)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # When everything done, release the captureq
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
