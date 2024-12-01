from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def get_video_urls(playlist_url):
    driver = webdriver.Chrome()
    
    try:
        driver.get(playlist_url)
        time.sleep(5)  # Allow some time for the page to load

        # Find video links
        video_elements = driver.find_elements(By.XPATH, "//a[@id='video-title']")
        video_urls = [f"{elem.get_attribute('href')}" for elem in video_elements]

        # Save URLs to a file
        with open('dangerous_video_urls.txt', 'w') as f:
            if len(video_urls) == 0:
                f.write('No videos found in the playlist')
            else:
                for url in video_urls:
                    f.write(f'{url}\n')  # Write each URL on a new line

        print(f"Found {len(video_urls)} videos.")
    finally:
        driver.quit()

def run():
    get_video_urls("https://www.youtube.com/playlist?list=PLaDeBbQSkY-VtaZjbzKYfPxBVFEATwYAc")

if __name__ == '__main__':
    run()
