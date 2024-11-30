# TTC Listen 2

## Overview 

This project was developed as an exercise in real-time machine learning exercise but eventually developed a purpose when I had been on the Toronto Subway system. I realized that public transit, especially in the seedier parts of Toronto had a huge safety issue as I witnessed seeing someone get arrested by a bus station while travelling. 

This inspired me to convert the project into much more, by integrating the Twillio API and scraping and preprocessing a unique data set. On top of that, I created the whole full-stack pipeline. From the front-end interface, and client-side audio streaming logic, to the ExpressJS real-time API, to the final python deep learning algorithm.

## Development Process

### The plan:

Originally my plan was this:
There will be a ReactJS web app that someone loads onto their web browser, they click a button and a websocket is mounted to connect an audio mediastream object to a server. While the UI was simplistic, the actual client side functionality was relatively complex, as I had to make use of front-end libraries to capture and stream the data from my client to my server. I used tech like JS pipes and SocketIO to properly communicate the data with little latency. The reason I chose SocketIO over some UDP library was because I wanted to ensure that the data arrived in order since the sequential modelling I used on the data side was crucial for the sentiment analysis part of the project.

![image](https://github.com/user-attachments/assets/9ab0dc63-42f4-4145-982f-5c27de8a3452)

Next there is a server that recieves the streamed data and processes it using an algorithm known as STFT (short-time fourier transform). This algorithm is used in transforming an audio clip into sparse and compressed frequency data that can be easily stored and analyzed. I developed a version that ran in real-time, by using a sliding window algorithm that would shift over half of its size everytime a new packet was received on the server (each packet contained a 3 second audio clip). FFMPEG, an audio processing library would then conver the data to WAV format before a FFT (fast fourier transform) would then be used to convert the wav data to a frequency based data type. This provided a continuous frequency spectrum analysis of the entire audio file that could be used in my deep learning model.

This FFT algorithm was then deemed as unnecessary since I made use of an audio embedding model to better capture semantic meaning in my dataset. I noticed that my loss while training was not converging as I had hoped. So instead I made use of Wav2Vec, an audio embedding AI in Python which was good at converting speech data in noisy environments to vector data I could use with my AI model, and proved to be pretty good at generating data for my specific task. 


