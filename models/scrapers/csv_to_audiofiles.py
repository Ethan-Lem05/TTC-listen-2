import subprocess

def csv_to_audiofiles(file_path, output_path):

    with open(file_path, 'r') as file:
        data = [line.strip() for line in file]
    
    print(data[0])

    for url in data:
        try:
            # Construct the yt-dlp command
            cmd = [r"C:\Users\2005e\Downloads\yt-dlp.exe", "-x", "--audio-format", "wav", "-o", output_path, url]
            
            # Run the command
            result = subprocess.run(cmd, capture_output=True, text=True)

            # Check the return code to determine success
            if result.returncode == 0:
                print(f"Downloaded {url} successfully.")
            else:
                print(f"Failed to download {url}. Command failed with return code {result.returncode}")
                print(f"Error output: {result.stderr}")

        except Exception as e:
            print(f"Error: {e}")
            continue


if __name__ == '__main__':
    csv_to_audiofiles("video_urls.txt", "models/data/safe/%(title)s.%(ext)s")