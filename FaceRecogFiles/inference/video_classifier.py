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
import argparse

# Command to run image process on Server: python -m inference.video_classifier


def parse_args():
    parser = argparse.ArgumentParser(
        'Input ip of Raspberry')
    parser.add_argument('--ip', required=True, help='Ip of Raspberry')
    return parser.parse_args()

def main():
    args = parse_args()
    getIP = args.ip

    #URL_STREAM = "/home/xiu/Facenet/face-recognition/3Nguoi.mp4" # Local video from your computer
    URL_STREAM = "http://"+getIP+":8081/" # Get image from Ras

    cap = cv2.VideoCapture(URL_STREAM)

    face_recogniser = joblib.load(MODEL_PATH)
    preprocess = preprocessing.ExifOrientationNormalize()
    strCombine = "" # String to combine all data which were recognized
    
    # Raspberry url to receive result from Server
    URL = "http://"+getIP+":8080/facenetroute" # Host from MMM-FaceNet

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
                    _rate = float("{:.2f}".format(face.top_prediction.confidence)) # Get rate with 2 digits

                    if _rate > 0.5:
                        flagExist = True
                        # Assign user to userArr if not exist
                        # Assign greater rate to user who was existed
                        if len(userArr) > 0:
                            for index in range(len(userArr)):
                                if _user == userArr[index]:
                                    if _rate > rateArr[index]:
                                        rateArr[index] = _rate # Re-assign greater rate
                                    
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

                # If rate between 50 - threshold
                if len(userArr) != 0:
                    # Combine data        
                    currentData = ""
                    for index in range(len(userArr)):
                        # With rate
                        if index != (len(userArr) - 1):
                            currentData = currentData + userArr[index] + "," + str(rateArr[index]) + "/"
                        else:
                            currentData = currentData + userArr[index] + "," + str(rateArr[index])

                    if currentData != strCombine:
                        strCombine = currentData
                        print("this is ", strCombine)

                        # Prepare data with feild 'data'
                        PARAMS = {'data':strCombine}

                        # Send to host 
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
            # Send to host CAMERA_ERROR to inform user check camera again
            try:
                requests.get(url = URL, params = {'data':"CAMERA_ERROR"}) 
            except requests.ConnectionError as exception:
                print("CAMERA is ERROR, please check CAMERA")
            time.sleep(1)
            cap = cv2.VideoCapture(URL_STREAM)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    # When everything done, release the capture
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
