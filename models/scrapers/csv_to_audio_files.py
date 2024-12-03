import subprocess
import csv

def csv_to_audiofiles(input_path, output_path, username, password):
    with open(input_path, newline='') as csvfile:
        content = csvfile.read()
        data = [line.split(',') for line in content.splitlines()]
    
    for row in data:
        url = row[0]  # Assuming each row contains a single URL
        cmd = [
            r"C:\Users\2005e\Downloads\yt-dlp.exe",
            "-x",
            "--ffmpeg-location", r"C:\Users\2005e\Downloads\ffmpeg-7.1-essentials_build\ffmpeg-7.1-essentials_build\bin\ffmpeg.exe",
            "--audio-format", "wav",
            "--audio-quality", "0",
            "-o", f"{output_path}/%(title)s.%(ext)s",
            "--cookies", r"C:\Users\2005e\OneDrive\Documents\GitHub\TTC-Listen-2\models\data\cookies.txt",  # Path to your cookies file
            url
        ]

        subprocess.run(cmd)

if __name__ == "__main__":
    csv_to_audiofiles("dangerous_video_urls.txt","models\data\dangerous","skullerboy88@gmail.com","charizard91")