import subprocess
import csv

def csv_to_audiofiles():
    with open("./models/data/safe/video_urls.csv", newline='') as csvfile:
        content = csvfile.read()
        data = [line.split(',') for line in content.splitlines()]
    
    for row in data:
        url = row[0]  # Assuming each row contains a single URL
        cmd = [
            "yt-dlp",
            "-x",
            "--audio-format", "wav",
            "--audio-quality", "0",
            "-o", "models/data/safe/%(title)s.%(ext)s",
            url
        ]

        subprocess.run(cmd)

if __name__ == "__main__":
    csv_to_audiofiles()