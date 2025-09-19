import csv
import json
import os
import time
import requests
import zipfile
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "https://global-marches.com"

storage_public = "C:/Users/ghazi/OneDrive/Desktop/betconsulting/storage/app/public"
bons_dir = os.path.join(storage_public, "bons_commande")
os.makedirs(bons_dir, exist_ok=True)

driver = webdriver.Chrome()

try:
    driver.get(BASE_URL)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "connection")))
    driver.find_element(By.ID, "LOGIN_INPUT").send_keys("STEBTPCONSULTING")
    driver.find_element(By.ID, "PASSWORD_INPUT").send_keys("BTP CONSULTING 2023")
    driver.find_element(By.NAME, "CONNECT").click()

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.LINK_TEXT, "Bons de commande"))).click()
    time.sleep(3)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "SAVE"))).click()
    time.sleep(3)
    checkbox = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input.SelectAll"))
    )
    driver.execute_script("arguments[0].click();", checkbox)
    time.sleep(1)
    afficher_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button.Afficher"))
    )
    afficher_btn.click()
    time.sleep(3)

    result_items = driver.find_elements(By.CSS_SELECTOR, "tbody")
    all_bons = []

    for index, item in enumerate(result_items):
        bon_data = {}
        rows = item.find_elements(By.TAG_NAME, "tr")

        for row in rows:
            ths = row.find_elements(By.TAG_NAME, "th")
            tds = row.find_elements(By.TAG_NAME, "td")
            if ths and not tds:
                for th in ths:
                    key = th.text.split(":")[0].strip()
                    span = th.find_elements(By.TAG_NAME, "span")
                    value = " | ".join([s.text.strip() for s in span if s.text.strip()]) if span else ""
                    bon_data[key] = value
            elif ths and tds:
                key = ths[0].text.strip().replace(":", "")
                value = " | ".join(td.text.strip() for td in tds)
                span_texts = [span.text.strip() for span in ths[0].find_elements(By.TAG_NAME, "span") if span.text.strip()]
                if span_texts:
                    value = " | ".join(span_texts + [value]) if value else " | ".join(span_texts)
                bon_data[key] = value

        download_link = item.find_elements(By.CSS_SELECTOR, "a.downoaldcps")
        bon_data["Téléchargement_DAO"] = download_link[0].get_attribute("href") if download_link else None
        cliquer_link = item.find_elements(By.CSS_SELECTOR, "a.btn.mini.btn-info")
        bon_data["Lien_Cliquer_Ici"] = cliquer_link[0].get_attribute("href") if cliquer_link else None

        # ---------------------
        # ✅ Extraire fichiers DAO si lien présent
        # ---------------------
        extracted_files = []
        if bon_data["Téléchargement_DAO"]:
            zip_name = f"bon_{index}.zip"
            zip_path = os.path.join(bons_dir, zip_name)
            try:
                r = requests.get(bon_data["Téléchargement_DAO"], timeout=30)
                if r.status_code == 200:
                    with open(zip_path, "wb") as f:
                        f.write(r.content)

                    extract_dir = os.path.join(bons_dir, f"bon_{index}")
                    os.makedirs(extract_dir, exist_ok=True)

                    with zipfile.ZipFile(zip_path, "r") as zip_ref:
                        zip_ref.extractall(extract_dir)

                    for root, dirs, files in os.walk(extract_dir):
                        for file in files:
                            relative_path = os.path.relpath(os.path.join(root, file), storage_public)
                            extracted_files.append(f"/storage/{relative_path}")

            except Exception as e:
                print(f"Erreur téléchargement ou extraction ZIP pour bon {index}: {e}")

        bon_data["EXTRACTED_FILES"] = extracted_files
        all_bons.append(bon_data)

    all_keys = set()
    for bon in all_bons:
        all_keys.update(bon.keys())
    all_keys = list(all_keys)

    csv_path = os.path.join(bons_dir, "bons_commande.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        dict_writer = csv.DictWriter(f, fieldnames=all_keys, extrasaction='ignore')
        dict_writer.writeheader()
        dict_writer.writerows(all_bons)

    json_path = os.path.join(bons_dir, "bons_commande.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_bons, f, ensure_ascii=False, indent=4)

    print(f"{len(all_bons)} bons récupérés et fichiers DAO extraits dans '{bons_dir}'.")

finally:
    driver.quit()