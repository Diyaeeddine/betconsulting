import csv
import json
import os
import time
import requests
import zipfile
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, WebDriverException

# Configuration
BASE_URL = "https://global-marches.com"
LOGIN_USERNAME = "STEBTPCONSULTING"
LOGIN_PASSWORD = "BTP CONSULTING 2023"

# Paths
storage_public = r"C:\xampp\htdocs\betconsulting\storage\app\public"
bons_dir = os.path.join(storage_public, "bons_commande")
os.makedirs(bons_dir, exist_ok=True)

# Status file for communication with PHP
status_file = os.path.join(bons_dir, "scraping_status.json")

def update_status(status, message="", data=None):
    """Update scraping status"""
    status_data = {
        "status": status,
        "message": message,
        "timestamp": time.time(),
        "data": data or {}
    }
    try:
        with open(status_file, "w", encoding="utf-8") as f:
            json.dump(status_data, f, ensure_ascii=False, indent=2)
        print(f"Status updated: {status} - {message}")
    except Exception as e:
        print(f"Error updating status: {e}")

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    # Uncomment for headless mode
    # chrome_options.add_argument('--headless')
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.set_page_load_timeout(30)
        return driver
    except Exception as e:
        update_status("error", f"Failed to setup Chrome driver: {str(e)}")
        raise

def login(driver):
    """Login to the website"""
    try:
        update_status("running", "Connecting to website...")
        driver.get(BASE_URL)
        
        # Wait for login form
        WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.ID, "connection"))
        )
        
        # Fill login form
        driver.find_element(By.ID, "LOGIN_INPUT").send_keys(LOGIN_USERNAME)
        driver.find_element(By.ID, "PASSWORD_INPUT").send_keys(LOGIN_PASSWORD)
        driver.find_element(By.NAME, "CONNECT").click()
        
        update_status("running", "Logged in successfully")
        return True
        
    except TimeoutException:
        update_status("error", "Login timeout - website may be unavailable")
        return False
    except Exception as e:
        update_status("error", f"Login failed: {str(e)}")
        return False

def navigate_to_bons_commande(driver):
    """Navigate to Bons de commande section"""
    try:
        update_status("running", "Navigating to Bons de commande...")
        
        # Click on Bons de commande link
        bons_link = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.LINK_TEXT, "Bons de commande"))
        )
        bons_link.click()
        time.sleep(3)
        
        # Click SAVE button
        save_btn = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.ID, "SAVE"))
        )
        save_btn.click()
        time.sleep(3)
        
        # Select all checkbox
        checkbox = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input.SelectAll"))
        )
        driver.execute_script("arguments[0].click();", checkbox)
        time.sleep(2)
        
        # Click Afficher button
        afficher_btn = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button.Afficher"))
        )
        afficher_btn.click()
        time.sleep(5)
        
        update_status("running", "Successfully navigated to data section")
        return True
        
    except Exception as e:
        update_status("error", f"Navigation failed: {str(e)}")
        return False

def download_and_extract_dao(url, index):
    """Download and extract DAO files"""
    extracted_files = []
    if not url:
        return extracted_files
        
    try:
        zip_name = f"bon_{index}.zip"
        zip_path = os.path.join(bons_dir, zip_name)
        
        # Download ZIP file
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            with open(zip_path, "wb") as f:
                f.write(response.content)
            
            # Extract ZIP
            extract_dir = os.path.join(bons_dir, f"bon_{index}")
            os.makedirs(extract_dir, exist_ok=True)
            
            with zipfile.ZipFile(zip_path, "r") as zip_ref:
                zip_ref.extractall(extract_dir)
            
            # Get list of extracted files
            for root, dirs, files in os.walk(extract_dir):
                for file in files:
                    relative_path = os.path.relpath(os.path.join(root, file), storage_public)
                    extracted_files.append(f"/storage/{relative_path.replace(os.sep, '/')}")
            
            # Clean up ZIP file
            os.remove(zip_path)
            
        else:
            print(f"Failed to download DAO for bon {index}: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"Error downloading/extracting DAO for bon {index}: {e}")
    
    return extracted_files

def extract_bon_data(item, index):
    """Extract data from a bon de commande item"""
    bon_data = {}
    rows = item.find_elements(By.TAG_NAME, "tr")
    
    for row in rows:
        ths = row.find_elements(By.TAG_NAME, "th")
        tds = row.find_elements(By.TAG_NAME, "td")
        
        if ths and not tds:
            # Header row with spans
            for th in ths:
                key = th.text.split(":")[0].strip()
                spans = th.find_elements(By.TAG_NAME, "span")
                if spans:
                    value = " | ".join([s.text.strip() for s in spans if s.text.strip()])
                    bon_data[key] = value
                    
        elif ths and tds:
            # Mixed header-data row
            key = ths[0].text.strip().replace(":", "")
            value = " | ".join(td.text.strip() for td in tds if td.text.strip())
            
            # Also check for spans in the header
            span_texts = [span.text.strip() for span in ths[0].find_elements(By.TAG_NAME, "span") if span.text.strip()]
            if span_texts:
                value = " | ".join(span_texts + ([value] if value else []))
            
            bon_data[key] = value
    
    # Get download links
    download_links = item.find_elements(By.CSS_SELECTOR, "a.downoaldcps")
    bon_data["Téléchargement_DAO"] = download_links[0].get_attribute("href") if download_links else None
    
    cliquer_links = item.find_elements(By.CSS_SELECTOR, "a.btn.mini.btn-info")
    bon_data["Lien_Cliquer_Ici"] = cliquer_links[0].get_attribute("href") if cliquer_links else None
    
    return bon_data

def scrape_bons_commande(driver):
    """Main scraping function"""
    try:
        update_status("running", "Starting data extraction...")
        
        # Find all result items
        result_items = WebDriverWait(driver, 15).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "tbody"))
        )
        
        all_bons = []
        total_items = len(result_items)
        
        update_status("running", f"Found {total_items} bons de commande to process")
        
        for index, item in enumerate(result_items):
            try:
                update_status("running", f"Processing bon {index + 1}/{total_items}")
                
                # Extract basic data
                bon_data = extract_bon_data(item, index)
                
                # Download and extract DAO files
                extracted_files = download_and_extract_dao(bon_data.get("Téléchargement_DAO"), index)
                bon_data["EXTRACTED_FILES"] = extracted_files
                
                all_bons.append(bon_data)
                
                # Small delay to avoid overwhelming the server
                time.sleep(1)
                
            except Exception as e:
                print(f"Error processing bon {index}: {e}")
                continue
        
        return all_bons
        
    except Exception as e:
        update_status("error", f"Scraping failed: {str(e)}")
        return []

def save_data(all_bons):
    """Save data to CSV and JSON files"""
    try:
        update_status("running", f"Saving {len(all_bons)} records to files...")
        
        if not all_bons:
            update_status("error", "No data to save")
            return False
        
        # Get all unique keys
        all_keys = set()
        for bon in all_bons:
            all_keys.update(bon.keys())
        all_keys = list(all_keys)
        
        # Save to CSV
        csv_path = os.path.join(bons_dir, "bons_commande.csv")
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            dict_writer = csv.DictWriter(f, fieldnames=all_keys, extrasaction='ignore')
            dict_writer.writeheader()
            dict_writer.writerows(all_bons)
        
        # Save to JSON
        json_path = os.path.join(bons_dir, "bons_commande.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(all_bons, f, ensure_ascii=False, indent=2)
        
        update_status("completed", f"Successfully saved {len(all_bons)} records", {
            "total_records": len(all_bons),
            "csv_path": csv_path,
            "json_path": json_path
        })
        
        return True
        
    except Exception as e:
        update_status("error", f"Failed to save data: {str(e)}")
        return False

def main():
    """Main execution function"""
    driver = None
    
    try:
        update_status("starting", "Initializing scraping process...")
        
        # Setup driver
        driver = setup_driver()
        
        # Login
        if not login(driver):
            return
        
        # Navigate to bons de commande
        if not navigate_to_bons_commande(driver):
            return
        
        # Scrape data
        all_bons = scrape_bons_commande(driver)
        
        # Save data
        if save_data(all_bons):
            print(f"✅ Scraping completed successfully! {len(all_bons)} records saved.")
        else:
            print("❌ Failed to save data")
            
    except Exception as e:
        update_status("error", f"Unexpected error: {str(e)}")
        print(f"❌ Scraping failed: {e}")
        
    finally:
        if driver:
            try:
                driver.quit()
            except Exception as e:
                print(f"Error closing driver: {e}")

if __name__ == "__main__":
    main()