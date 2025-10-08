import sys
import io
import os
import re
import time
import csv
import json
import requests
import glob
import shutil
import zipfile
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# --- Force stdout to UTF-8 ---
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='ignore')

# --- Absolute path to storage/app/public/marche_public ---
storage_public = r"C:\xampp\htdocs\betconsulting\storage\app\public"
result_dir = os.path.join(storage_public, "marche_public")
os.makedirs(result_dir, exist_ok=True)
print(f"[INFO] Storage directory: {result_dir}")

# --- Global variables for JSON files ---
json_file_path = os.path.join(result_dir, "marches_publics_data.json")
csv_file_path = os.path.join(result_dir, "marches_publics_data.csv")
existing_references_file = os.path.join(result_dir, "existing_references.json")

# --- LOAD EXISTING REFERENCES ---
existing_references = set()
if os.path.exists(existing_references_file):
    try:
        with open(existing_references_file, 'r', encoding='utf-8') as f:
            existing_refs_data = json.load(f)
            existing_references = set(existing_refs_data)
        print(f"[INFO] {len(existing_references)} existing references loaded to avoid duplicates")
    except Exception as e:
        print(f"[WARN] Cannot load existing references: {e}")
        existing_references = set()
else:
    print("[INFO] No existing references file found - all markets will be processed")

# --- Optimized Chrome config ---
options = webdriver.ChromeOptions()
prefs = {
    "download.default_directory": result_dir,
    "download.prompt_for_download": False,
    "download.directory_upgrade": True,
    "safebrowsing.enabled": True,
    "profile.default_content_settings.popups": 0,
    "profile.default_content_setting_values.automatic_downloads": 1,
}
options.add_experimental_option("prefs", prefs)
options.add_argument("--start-maximized")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)
options.add_argument("--disable-extensions")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

service = Service()
driver = webdriver.Chrome(service=service, options=options)

# Allow downloads
driver.execute_cdp_cmd('Page.setDownloadBehavior', {
    'behavior': 'allow',
    'downloadPath': result_dir
})

# --- Utility functions ---
def extract_text_safe(element):
    try:
        return element.text.strip() if element else ""
    except:
        return ""

def extract_href_safe(element):
    try:
        return element.get_attribute('href') if element else ""
    except:
        return ""

def clean_text(text):
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text.strip())

def is_duplicate_reference(reference):
    """Check if reference already exists in database"""
    if not reference or not reference.strip():
        return False
    
    reference_clean = reference.strip()
    is_dup = reference_clean in existing_references
    
    if is_dup:
        print(f"[DUPLICATE] Reference {reference_clean} already in database - SKIP download/extraction")
    
    return is_dup

def extract_zip_file(zip_path, reference):
    """Enhanced extraction function with robust error handling"""
    extract_dir = os.path.join(result_dir, f"{reference}_extrait")
    extracted_files = []
    
    try:
        if not os.path.exists(zip_path):
            print(f"[ERROR] ZIP file not found: {zip_path}")
            return False, []
            
        if os.path.getsize(zip_path) == 0:
            print(f"[ERROR] Empty ZIP file: {zip_path}")
            return False, []
        
        if os.path.exists(extract_dir):
            try:
                shutil.rmtree(extract_dir)
                print(f"[INFO] Old extraction folder removed: {extract_dir}")
            except Exception as e:
                print(f"[WARN] Cannot remove old folder: {e}")
        
        os.makedirs(extract_dir, exist_ok=True)
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as test_zip:
                bad_file = test_zip.testzip()
                if bad_file:
                    print(f"[ERROR] Corrupted ZIP, faulty file: {bad_file}")
                    return False, []
        except zipfile.BadZipFile:
            print(f"[ERROR] Invalid or corrupted ZIP file: {zip_path}")
            return False, []
        except Exception as e:
            print(f"[ERROR] Error testing ZIP: {e}")
            return False, []
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
            
            for root, dirs, files in os.walk(extract_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    relative_path = file_path.replace(storage_public, "").replace("\\", "/")
                    if relative_path.startswith("/"):
                        relative_path = relative_path[1:]
                    laravel_path = f"/storage/{relative_path}"
                    extracted_files.append(laravel_path)
            
            if not extracted_files:
                print(f"[ERROR] No files extracted from ZIP: {reference}")
                return False, []
            
            print(f"[INFO] ZIP extracted successfully: {reference}")
            print(f"[INFO] → Folder: {extract_dir}")
            print(f"[INFO] → {len(extracted_files)} files extracted")
            
            return True, extracted_files
            
    except Exception as e:
        print(f"[ERROR] Error extracting {reference}: {str(e)}")
        if os.path.exists(extract_dir):
            try:
                shutil.rmtree(extract_dir)
            except:
                pass
        return False, []

def extract_table_data():
    """Extract data from results table"""
    data = []
    try:
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "table.table-results tbody tr"))
        )
        table = driver.find_element(By.CSS_SELECTOR, "table.table-results tbody")
        rows = table.find_elements(By.TAG_NAME, "tr")
        print(f"[INFO] Table loaded with {len(rows)} rows")

        for i, row in enumerate(rows):
            try:
                row_data = {}
                cells = row.find_elements(By.TAG_NAME, "td")

                if len(cells) >= 5:
                    # Cell 1
                    cell_procedure = cells[1]
                    try:
                        procedure_div = cell_procedure.find_element(By.CSS_SELECTOR, "div.line-info-bulle")
                        row_data['type_procedure'] = clean_text(extract_text_safe(procedure_div))
                    except: row_data['type_procedure'] = ""
                    try:
                        procedure_bulle = cell_procedure.find_element(By.CSS_SELECTOR, "div.info-bulle div")
                        row_data['detail_procedure'] = clean_text(extract_text_safe(procedure_bulle))
                    except: row_data['detail_procedure'] = ""
                    try:
                        categorie_div = cell_procedure.find_element(By.CSS_SELECTOR, "div[id*='panelBlocCategorie']")
                        row_data['categorie'] = clean_text(extract_text_safe(categorie_div))
                    except: row_data['categorie'] = ""
                    try:
                        date_divs = cell_procedure.find_elements(By.TAG_NAME, "div")
                        for div in date_divs:
                            text = extract_text_safe(div)
                            if re.match(r'\d{2}/\d{2}/\d{4}', text):
                                row_data['date_publication'] = text
                                break
                        if 'date_publication' not in row_data:
                            row_data['date_publication'] = ""
                    except: row_data['date_publication'] = ""

                    # Cell 2
                    cell_details = cells[2]
                    try:
                        ref_span = cell_details.find_element(By.CSS_SELECTOR, "span.ref")
                        row_data['reference'] = clean_text(extract_text_safe(ref_span))
                    except: row_data['reference'] = ""
                    try:
                        objet_div = cell_details.find_element(By.CSS_SELECTOR, "div[id*='panelBlocObjet']")
                        objet_text = extract_text_safe(objet_div).replace('Objet :', '').strip()
                        row_data['objet'] = clean_text(objet_text)
                    except: row_data['objet'] = ""
                    try:
                        objet_bulle = cell_details.find_element(By.CSS_SELECTOR, "div[id*='infosBullesObjet'] div")
                        row_data['objet_complet'] = clean_text(extract_text_safe(objet_bulle))
                    except: row_data['objet_complet'] = row_data['objet']
                    try:
                        acheteur_div = cell_details.find_element(By.CSS_SELECTOR, "div[id*='panelBlocDenomination']")
                        row_data['acheteur_public'] = clean_text(extract_text_safe(acheteur_div).replace('Acheteur public :','').strip())
                    except: row_data['acheteur_public'] = ""

                    # Cell 3
                    cell_lieu = cells[3]
                    try:
                        lieu_div = cell_lieu.find_element(By.CSS_SELECTOR, "div[id*='panelBlocLieuxExec']")
                        row_data['lieu_execution'] = clean_text(extract_text_safe(lieu_div))
                    except: row_data['lieu_execution'] = ""
                    try:
                        lieu_bulle = cell_lieu.find_element(By.CSS_SELECTOR, "div[id*='infosLieuExecution'] div")
                        row_data['lieu_execution_complet'] = clean_text(extract_text_safe(lieu_bulle))
                    except: row_data['lieu_execution_complet'] = row_data['lieu_execution']
                    try:
                        lot_link = cell_lieu.find_element(By.CSS_SELECTOR, "a[href*='PopUpDetailLots']")
                        row_data['lien_detail_lots'] = extract_href_safe(lot_link)
                    except: row_data['lien_detail_lots'] = ""

                    # Cell 4
                    cell_date = cells[4]
                    try:
                        date_div = cell_date.find_element(By.CSS_SELECTOR, "div.cloture-line")
                        row_data['date_limite'] = clean_text(extract_text_safe(date_div))
                    except: row_data['date_limite'] = ""
                    try:
                        img_elec = cell_date.find_element(By.CSS_SELECTOR, "img.certificat")
                        row_data['type_reponse_electronique'] = img_elec.get_attribute('alt')
                    except: row_data['type_reponse_electronique'] = ""

                    # Cell 5
                    cell_actions = cells[5] if len(cells) > 5 else cells[4]
                    try:
                        consultation_link = cell_actions.find_element(By.CSS_SELECTOR, "a[href*='EntrepriseDetailConsultation']")
                        row_data['lien_consultation'] = extract_href_safe(consultation_link)
                    except: row_data['lien_consultation'] = ""

                    try:
                        ref_cons_input = row.find_element(By.CSS_SELECTOR, "input[name*='refCons']")
                        row_data['ref_consultation_id'] = ref_cons_input.get_attribute('value')
                    except: row_data['ref_consultation_id'] = ""

                    row_data['extracted_at'] = datetime.now().isoformat()
                    row_data['row_index'] = i + 1
                    row_data['storage_link_csv'] = "storage/marche_public/marches_publics_data.csv"
                    row_data['storage_link_json'] = "storage/marche_public/marches_publics_data.json"
                    row_data['chemin_zip'] = ""
                    row_data['EXTRACTED_FILES'] = []
                    row_data['files_updated_at'] = ""

                    data.append(row_data)
                    print(f"[INFO] Row {i+1} extracted: {row_data['reference']}")

            except Exception as e:
                print(f"[ERROR] Error extracting row {i+1}: {str(e)}")
                continue

    except Exception as e:
        print(f"[ERROR] Error extracting table: {str(e)}")

    return data

def save_to_csv(data, filename="marches_publics_data.csv"):
    if not data:
        print("[WARN] No data to save to CSV")
        return
    filepath = os.path.join(result_dir, filename)
    with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f"[INFO] CSV saved to {filepath} ({len(data)} rows)")
    return filepath

def save_to_json(data, filename="marches_publics_data.json"):
    if not data:
        print("[WARN] No data to save to JSON")
        return
    filepath = os.path.join(result_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as jsonfile:
        json.dump(data, jsonfile, ensure_ascii=False, indent=2)
    print(f"[INFO] JSON saved to {filepath} ({len(data)} rows)")
    return filepath

def cancel_active_downloads():
    try:
        driver.execute_script("window.open('chrome://downloads');")
        downloads_tab = driver.window_handles[-1]
        driver.switch_to.window(downloads_tab)
        time.sleep(1)

        driver.execute_script("""
            let manager = document.querySelector('downloads-manager');
            if (manager) {
                let items = manager.shadowRoot.querySelectorAll('downloads-item');
                for (let item of items) {
                    let cancelButton = item.shadowRoot.querySelector('#cancel');
                    if (cancelButton) cancelButton.click();
                }
            }
        """)
        print("[INFO] Active downloads cancelled.")

    except Exception as e:
        print(f"[WARN] Cannot cancel downloads: {e}")

    finally:
        if len(driver.window_handles) > 1:
            driver.close()
            driver.switch_to.window(driver.window_handles[0])

def update_data_with_files(data, reference, zip_path=None, extracted_files=None):
    """Update in-memory data with downloaded/extracted file information"""
    for item in data:
        if item.get('reference') == reference:
            if zip_path and os.path.exists(zip_path):
                item['chemin_zip'] = f"storage/marche_public/{os.path.basename(zip_path)}"
                print(f"[INFO] Data updated - chemin_zip for {reference}")
            
            if extracted_files:
                item['EXTRACTED_FILES'] = extracted_files
                print(f"[INFO] Data updated - {len(extracted_files)} extracted files for {reference}")
            
            item['files_updated_at'] = datetime.now().isoformat()
            break
    return data

success_count = 0
fail_count = 0
extract_success_count = 0
extract_fail_count = 0
skipped_duplicates_count = 0

def download_dce(row, data):
    global success_count, fail_count, extract_success_count, extract_fail_count, skipped_duplicates_count
    
    reference = row.get('reference', 'UNKNOWN')
    print(f"\n[INFO] === Processing {reference} ===")
    
    if is_duplicate_reference(reference):
        skipped_duplicates_count += 1
        print(f"[SKIP] Reference {reference} ignored (duplicate detected)")
        return

    try:
        if not row.get('lien_consultation'):
            print(f"[ERROR] No consultation link for {reference}")
            fail_count += 1
            return

        driver.execute_script("window.open(arguments[0]);", row['lien_consultation'])
        consult_tab = driver.window_handles[-1]
        driver.switch_to.window(consult_tab)
        time.sleep(2)
        window_start = time.time()

        try:
            acces_consultation = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "img[alt='Accéder à la consultation']"))
            )
            acces_consultation.click()
            time.sleep(1)
        except:
            pass

        try:
            download_dce_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.ID, "ctl0_CONTENU_PAGE_linkDownloadDce"))
            )
            download_dce_btn.click()
            time.sleep(1)
        except:
            pass

        try:
            checkbox = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.ID, "ctl0_CONTENU_PAGE_EntrepriseFormulaireDemande_accepterConditions"))
            )
            driver.execute_script("arguments[0].click();", checkbox)
            time.sleep(1)
        except:
            pass

        try:
            valider_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.ID, "ctl0_CONTENU_PAGE_validateButton"))
            )
            valider_btn.click()
            time.sleep(2)
        except:
            pass

        try:
            telecharger_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "ctl0_CONTENU_PAGE_EntrepriseDownloadDce_completeDownload"))
            )
            driver.execute_script("arguments[0].scrollIntoView(true);", telecharger_btn)
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", telecharger_btn)
            print(f"[INFO] Download button clicked for {reference}")
        except Exception as e:
            print(f"[WARN] Cannot click Download for {reference}: {e}")
            fail_count += 1
            driver.close()
            driver.switch_to.window(driver.window_handles[0])
            return

        # Enhanced download waiting
        timeout = 120
        downloaded_file = None
        last_size = 0
        last_check = time.time()
        stall_count = 0

        print(f"[INFO] Waiting for download for {reference}...")

        while time.time() - window_start < timeout:
            zip_files = glob.glob(os.path.join(result_dir, "*.zip"))
            cr_files = glob.glob(os.path.join(result_dir, "*.crdownload"))

            if zip_files and not cr_files:
                newest_zip = max(zip_files, key=os.path.getctime)
                if os.path.getctime(newest_zip) > window_start:
                    downloaded_file = newest_zip
                    break

            if cr_files:
                cr_file = cr_files[0]
                try:
                    current_size = os.path.getsize(cr_file)
                except:
                    current_size = 0

                if current_size == last_size:
                    if (time.time() - last_check) > 30:
                        stall_count += 1
                        print(f"[WARN] Download stalled ({stall_count}/3) for {reference}")
                        if stall_count >= 3:
                            print(f"[ERROR] Download permanently stalled for {reference}")
                            cancel_active_downloads()
                            if os.path.exists(cr_file):
                                try:
                                    os.remove(cr_file)
                                    print("[INFO] .crdownload file removed")
                                except:
                                    pass
                            fail_count += 1
                            return
                        last_check = time.time()
                else:
                    last_size = current_size
                    last_check = time.time()
                    stall_count = 0
                    if current_size > 0:
                        print(f"[INFO] Download in progress... ({current_size} bytes)")

            time.sleep(3)

        if len(driver.window_handles) > 1:
            driver.close()
            driver.switch_to.window(driver.window_handles[0])

        if downloaded_file:
            print(f"[INFO] File downloaded: {os.path.basename(downloaded_file)}")
            
            new_name = f"{reference}.zip"
            new_path = os.path.join(result_dir, new_name)
            
            try:
                if os.path.exists(new_path) and new_path != downloaded_file:
                    os.remove(new_path)
                shutil.move(downloaded_file, new_path)
                print(f"[INFO] ZIP renamed: {new_name}")
            except Exception as e:
                print(f"[WARN] Error renaming: {e}")
                new_path = downloaded_file

            time.sleep(2)

            print(f"[INFO] Starting extraction for {reference}")
            success_extract, extracted_files = extract_zip_file(new_path, reference)
            
            if success_extract:
                extract_success_count += 1
                print(f"[INFO] Extraction successful for {reference}")
                update_data_with_files(data, reference, new_path, extracted_files)
            else:
                extract_fail_count += 1
                print(f"[ERROR] Extraction failed for {reference}")
                update_data_with_files(data, reference, new_path)

            success_count += 1
            print(f"[INFO] Download successful for {reference}")
            
        else:
            print(f"[ERROR] Timeout ({timeout}s) for {reference}")
            cancel_active_downloads()
            fail_count += 1

    except Exception as e:
        print(f"[ERROR] General error for {reference}: {str(e)}")
        cancel_active_downloads()
        fail_count += 1

    finally:
        if len(driver.window_handles) > 1:
            try:
                driver.close()
                driver.switch_to.window(driver.window_handles[0])
            except:
                pass

def process_existing_zips(data):
    """Process all existing ZIPs that haven't been extracted yet"""
    print("\n[INFO] === Checking existing ZIPs to extract ===")
    
    zip_files = glob.glob(os.path.join(result_dir, "*.zip"))
    if not zip_files:
        print("[INFO] No ZIP files found")
        return
    
    print(f"[INFO] {len(zip_files)} ZIP files found")
    
    global extract_success_count, extract_fail_count
    
    for zip_path in zip_files:
        zip_name = os.path.basename(zip_path)
        reference = os.path.splitext(zip_name)[0]
        
        if is_duplicate_reference(reference):
            print(f"[SKIP] ZIP ignored (duplicate): {reference}")
            continue
        
        extract_dir = os.path.join(result_dir, f"{reference}_extrait")
        if os.path.exists(extract_dir) and os.listdir(extract_dir):
            print(f"[INFO] {reference} already extracted, updating data...")
            extracted_files = []
            for root, dirs, files in os.walk(extract_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    relative_path = file_path.replace(storage_public, "").replace("\\", "/")
                    if relative_path.startswith("/"):
                        relative_path = relative_path[1:]
                    laravel_path = f"/storage/{relative_path}"
                    extracted_files.append(laravel_path)
            update_data_with_files(data, reference, zip_path, extracted_files)
            continue
        
        print(f"[INFO] Extracting {reference}...")
        success_extract, extracted_files = extract_zip_file(zip_path, reference)
        
        if success_extract:
            extract_success_count += 1
            update_data_with_files(data, reference, zip_path, extracted_files)
        else:
            extract_fail_count += 1
            update_data_with_files(data, reference, zip_path)

# --- MAIN EXECUTION (FIXED) ---
if __name__ == "__main__":  # FIXED: Double underscores
    try:
        print("[INFO] === Starting public markets extraction ===")
        print(f"[INFO] Existing references loaded: {len(existing_references)}")
        start_time = time.time()

        # --- AUTHENTICATION ---
        print("[INFO] Starting authentication...")
        driver.get("https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseHome")

        # Wait for page to fully load
        time.sleep(2)

        bouton_login = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.LINK_TEXT, "S'identifier"))
        )
        bouton_login.click()
        print("[INFO] Clicked on 'S'identifier'")

        # Wait for login form to appear and stabilize
        time.sleep(2)

        # Re-find elements after the page transition to avoid stale references
        login_input = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "ctl0_CONTENU_PAGE_login"))
        )
        # Clear field first in case there's any pre-filled text
        login_input.clear()
        time.sleep(0.5)
        login_input.send_keys("BTPCONSULTING")
        print("[INFO] Username entered")

        # Re-find password field to avoid stale reference
        password_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "ctl0_CONTENU_PAGE_password"))
        )
        password_input.clear()
        time.sleep(0.5)
        password_input.send_keys("Imane2804")
        print("[INFO] Password entered")

        # Re-find and click submit button
        ok_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "ctl0_CONTENU_PAGE_authentificationButton"))
        )
        ok_button.click()
        print("[INFO] Login button clicked")

        # Wait for authentication to complete and page to redirect
        time.sleep(5)
        print("[INFO] Authentication successful")

        # --- NAVIGATE TO ADVANCED SEARCH ---
        print("[INFO] Navigating to advanced search...")
        driver.get("https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch&searchAnnCons")
        
        # Wait for the search page to load
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "ctl0_CONTENU_PAGE_AdvancedSearch_lancerRecherche"))
        )
        print("[INFO] Advanced search page loaded")
        
        # Add a small delay to ensure page is fully loaded
        time.sleep(2)
        
        # Optional: Fill in search criteria if needed
        # Example (uncomment and adjust if the site requires filled fields):
        # try:
        #     keyword_input = driver.find_element(By.ID, "keyword_field_id")
        #     keyword_input.send_keys("your keyword")
        #     print("[INFO] Search keyword entered")
        # except:
        #     print("[INFO] No keyword field found or not required")

        # Click the search button
        print("[INFO] Clicking search button...")
        bouton = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.ID, "ctl0_CONTENU_PAGE_AdvancedSearch_lancerRecherche"))
        )
        
        # Scroll to button and click
        driver.execute_script("arguments[0].scrollIntoView(true);", bouton)
        time.sleep(1)
        bouton.click()
        print("[INFO] Search button clicked")

        # --- WAIT FOR RESULTS TABLE ---
        print("[INFO] Waiting for results table...")
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "table.table-results tbody tr"))
        )
        print("[INFO] Results table loaded successfully")

        # Set results per page
        print("[INFO] Setting results per page to 10...")
        select_element = WebDriverWait(driver, 30).until(
            EC.element_to_be_clickable((By.ID, "ctl0_CONTENU_PAGE_resultSearch_listePageSizeTop"))
        )
        select = Select(select_element)
        select.select_by_value("10")
        time.sleep(3)
        print("[INFO] Results per page set to 10")

        # Extract table data
        print("[INFO] Extracting table data...")
        data = extract_table_data()

        if data:
            print(f"[INFO] {len(data)} markets extracted from table")
            
            # Filter duplicates
            filtered_data = []
            for row in data:
                reference = row.get('reference', '')
                if is_duplicate_reference(reference):
                    continue
                filtered_data.append(row)
            
            print(f"[INFO] {len(filtered_data)} new markets after duplicate filtering")
            print(f"[INFO] {len(data) - len(filtered_data)} duplicates detected and ignored")
            
            # Process existing ZIPs
            process_existing_zips(data)
            
            # Download and extract new markets
            print(f"\n[INFO] === Starting download of {len(filtered_data)} new markets ===")
            for i, row in enumerate(filtered_data, 1):
                print(f"\n[INFO] === New market {i}/{len(filtered_data)} ===")
                download_dce(row, data)
                time.sleep(1)  # Small pause between downloads

            duration = time.time() - start_time
            print(f"\n[INFO] === DOWNLOAD/EXTRACTION SUMMARY WITH DUPLICATE FILTERING ===")
            print(f"[INFO] Total duration: {duration:.2f} seconds")
            print(f"[INFO] Markets in table: {len(data)}")
            print(f"[INFO] Duplicates ignored: {skipped_duplicates_count + (len(data) - len(filtered_data))}")
            print(f"[INFO] New markets processed: {len(filtered_data)}")
            print(f"[INFO] Successful downloads: {success_count}")
            print(f"[INFO] Failed downloads: {fail_count}")
            print(f"[INFO] Successful extractions: {extract_success_count}")
            print(f"[INFO] Failed extractions: {extract_fail_count}")
            
            # Generate final CSV and JSON files
            print(f"\n[INFO] === GENERATING FINAL CSV/JSON FILES ===")
            save_to_csv(data)
            save_to_json(data)
            
            print(f"\n[INFO] === FINAL FILES GENERATED WITH DUPLICATE OPTIMIZATION ===")
            print(f"[INFO] Final CSV generated with all data")
            print(f"[INFO] Final JSON generated with all data") 
            print(f"[INFO] All ZIP paths and extracted files are included")
            print(f"[INFO] Time and bandwidth saved by avoiding duplicates")
            
        else:
            print("[WARN] No data extracted")

    except TimeoutException as e:
        print(f"[ERROR] Timeout error: {str(e)}")
        print("[ERROR] The page took too long to load. Possible causes:")
        print("[ERROR] - Website is slow or down")
        print("[ERROR] - Network connection issues")
        print("[ERROR] - Incorrect page elements or selectors")
        
    except NoSuchElementException as e:
        print(f"[ERROR] Element not found: {str(e)}")
        print("[ERROR] The page structure may have changed")
        print("[ERROR] Check if selectors are still valid")
        
    except Exception as e:
        print(f"[ERROR] General error: {str(e)}")
        import traceback
        print(f"[ERROR] Stack trace:")
        traceback.print_exc()

    finally:
        print("\n[INFO] === Script finished (Chrome will remain open for debugging) ===")
        print("[INFO] Check the logs above for any errors")
        print(f"[INFO] Files saved to: {result_dir}")
        # Don't close the browser for debugging
        # driver.quit()