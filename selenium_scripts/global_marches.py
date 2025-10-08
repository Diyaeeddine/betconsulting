import csv
import json
import os
import time
import requests
import zipfile
import platform
import sys
import traceback
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

BASE_URL = "https://global-marches.com"

# Configuration paths
if platform.system() == "Windows":
    storage_public = r"C:\xampp\htdocs\betconsulting\storage\app\public"
else:
    storage_public = "/Applications/XAMPP/xamppfiles/htdocs/betconsulting/storage/app/public"

result_dir = os.path.join(storage_public, "global-marches")

def setup_logging():
    """Setup basic logging"""
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(os.path.join(result_dir, 'scraping.log')),
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger(__name__)

def setup_chrome_driver():
    """Setup Chrome driver with proper options"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in background
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except WebDriverException as e:
        raise Exception(f"Failed to setup Chrome driver: {str(e)}")

def safe_find_element(driver, by, value, timeout=10, required=True):
    """Safely find element with timeout"""
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )
        return element
    except TimeoutException:
        if required:
            raise Exception(f"Required element not found: {by}={value}")
        return None

def safe_find_elements(driver, by, value, timeout=10):
    """Safely find multiple elements"""
    try:
        elements = WebDriverWait(driver, timeout).until(
            EC.presence_of_all_elements_located((by, value))
        )
        return elements
    except TimeoutException:
        return []

def safe_get_text(element):
    """Safely get text from element"""
    try:
        return element.text.strip() if element else None
    except Exception:
        return None

def safe_get_attribute(element, attribute):
    """Safely get attribute from element"""
    try:
        return element.get_attribute(attribute) if element else None
    except Exception:
        return None

def download_and_extract_zip(url, index, result_dir, base_url, logger):
    """Download and extract ZIP file with proper error handling"""
    extracted_files = []
    
    if not url:
        return extracted_files
        
    zip_name = f"resultat_offre_{index}.zip"
    zip_path = os.path.join(result_dir, zip_name)
    
    try:
        logger.info(f"Downloading ZIP from: {url}")
        
        # Add headers to mimic real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/zip,*/*',
            'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        response = requests.get(url, timeout=60, headers=headers, stream=True)
        response.raise_for_status()
        
        # Check if response is actually a ZIP file
        content_type = response.headers.get('content-type', '')
        if 'zip' not in content_type.lower() and 'application/octet-stream' not in content_type.lower():
            logger.warning(f"Unexpected content type for ZIP: {content_type}")
        
        # Write ZIP file
        with open(zip_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        logger.info(f"ZIP downloaded successfully: {zip_path}")
        
        # Extract ZIP
        extract_dir = os.path.join(result_dir, f"resultat_offre_{index}")
        os.makedirs(extract_dir, exist_ok=True)
        
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(extract_dir)
            logger.info(f"ZIP extracted to: {extract_dir}")
        
        # List extracted files with relative paths
        for root, dirs, files in os.walk(extract_dir):
            for file in files:
                full_path = os.path.join(root, file)
                relative_path = os.path.relpath(full_path, storage_public)
                web_path = f"/storage/{relative_path.replace(os.sep, '/')}"
                extracted_files.append(web_path)
        
        # Clean up ZIP file
        try:
            os.remove(zip_path)
        except Exception as e:
            logger.warning(f"Could not remove ZIP file {zip_path}: {e}")
            
    except requests.exceptions.Timeout:
        logger.error(f"Timeout downloading ZIP for result {index}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error downloading ZIP for result {index}: {e}")
    except zipfile.BadZipFile:
        logger.error(f"Invalid ZIP file for result {index}")
    except Exception as e:
        logger.error(f"Unexpected error downloading/extracting ZIP for result {index}: {e}")
    
    return extracted_files

def scrape_results():
    """Main scraping function"""
    # Ensure result directory exists
    os.makedirs(result_dir, exist_ok=True)
    
    logger = setup_logging()
    logger.info("Starting scraping process...")
    
    driver = None
    all_projects = []
    
    try:
        # Setup driver
        driver = setup_chrome_driver()
        logger.info("Chrome driver setup successful")
        
        # Navigate to website
        logger.info(f"Navigating to: {BASE_URL}")
        driver.get(BASE_URL)
        
        # Login process
        logger.info("Attempting to login...")
        safe_find_element(driver, By.ID, "connection", timeout=15)
        
        login_input = safe_find_element(driver, By.ID, "LOGIN_INPUT")
        password_input = safe_find_element(driver, By.ID, "PASSWORD_INPUT")
        connect_button = safe_find_element(driver, By.NAME, "CONNECT")
        
        if not all([login_input, password_input, connect_button]):
            raise Exception("Login elements not found")
        
        login_input.clear()
        login_input.send_keys("STEBTPCONSULTING")
        
        password_input.clear()
        password_input.send_keys("BTP CONSULTING 2023")
        
        connect_button.click()
        logger.info("Login submitted")
        
        # Navigate to results page
        time.sleep(3)
        logger.info("Navigating to results page...")
        
        results_link = safe_find_element(
            driver, 
            By.LINK_TEXT, 
            "Résultats des Appels d'offre",
            timeout=15
        )
        results_link.click()
        time.sleep(5)
        
        # Click search button
        logger.info("Clicking search button...")
        search_button = safe_find_element(driver, By.ID, "SAVE", timeout=15)
        search_button.click()
        time.sleep(5)
        
        # Wait for and find result tables
        logger.info("Waiting for result tables...")
        tables = safe_find_elements(driver, By.CSS_SELECTOR, "table#resultTable", timeout=30)
        
        if not tables:
            logger.warning("No result tables found")
            return
        
        logger.info(f"Found {len(tables)} result tables")
        
        # Process each table
        for index, table in enumerate(tables):
            try:
                logger.info(f"Processing table {index + 1}/{len(tables)}")
                project_data = {}
                
                # Get reference from header
                ref_elements = table.find_elements(By.CSS_SELECTOR, "thead th")
                if len(ref_elements) >= 3:
                    project_data["Référence"] = safe_get_text(ref_elements[2])
                
                # Process tbody rows
                rows = table.find_elements(By.TAG_NAME, "tr")
                for row in rows:
                    ths = row.find_elements(By.TAG_NAME, "th")
                    tds = row.find_elements(By.TAG_NAME, "td")
                    
                    if len(ths) == 1 and len(tds) >= 1:
                        key = safe_get_text(ths[0])
                        value = safe_get_text(tds[0])
                        
                        if key and value:
                            key = key.replace(" :", "").strip()
                            project_data[key] = value
                
                # Get DAO link
                dao_links = table.find_elements(By.CSS_SELECTOR, "a.downoaldcpsicone")
                dao_url = None
                if dao_links:
                    href = safe_get_attribute(dao_links[0], "href")
                    if href:
                        dao_url = BASE_URL + href if href.startswith("/") else href
                        project_data["Lien_DAO"] = dao_url
                
                # Get PV link
                pv_links = table.find_elements(By.CSS_SELECTOR, "a.downoaldpvicone")
                if pv_links:
                    href = safe_get_attribute(pv_links[0], "href")
                    if href:
                        pv_url = BASE_URL + href if href.startswith("/") else href
                        project_data["Lien_PV"] = pv_url
                
                # Download and extract DAO if available
                extracted_files = download_and_extract_zip(
                    dao_url, index, result_dir, BASE_URL, logger
                )
                project_data["EXTRACTED_FILES"] = extracted_files
                
                # Add to results
                all_projects.append(project_data)
                logger.info(f"Successfully processed project: {project_data.get('Référence', 'Unknown')}")
                
            except Exception as e:
                logger.error(f"Error processing table {index}: {str(e)}")
                logger.error(traceback.format_exc())
                continue
        
        # Save results
        logger.info("Saving results to files...")
        
        # Determine all CSV columns
        all_keys = set()
        for proj in all_projects:
            all_keys.update(proj.keys())
        all_keys = sorted(list(all_keys))
        
        # Save CSV
        csv_path = os.path.join(result_dir, "global-marches.csv")
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            dict_writer = csv.DictWriter(f, fieldnames=all_keys, extrasaction="ignore")
            dict_writer.writeheader()
            dict_writer.writerows(all_projects)
        
        logger.info(f"CSV saved: {csv_path}")
        
        # Save JSON
        json_path = os.path.join(result_dir, "global-marches.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(all_projects, f, ensure_ascii=False, indent=2)
        
        logger.info(f"JSON saved: {json_path}")
        
        logger.info(f"Successfully processed {len(all_projects)} projects")
        
    except Exception as e:
        logger.error(f"Critical error in scraping process: {str(e)}")
        logger.error(traceback.format_exc())
        raise
    
    finally:
        if driver:
            try:
                driver.quit()
                logger.info("Driver closed successfully")
            except Exception as e:
                logger.error(f"Error closing driver: {e}")

if __name__ == "__main__":
    try:
        scrape_results()
        print("Scraping completed successfully")
        sys.exit(0)
    except Exception as e:
        print(f"Scraping failed: {str(e)}", file=sys.stderr)
        sys.exit(1)