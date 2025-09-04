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

storage_public = "/Applications/XAMPP/xamppfiles/htdocs/betconsulting/storage/app/public"
result_dir = os.path.join(storage_public, "resultats_bon_commande")
os.makedirs(result_dir, exist_ok=True)

driver = webdriver.Chrome()

try:
    driver.get(BASE_URL)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "connection")))
    driver.find_element(By.ID, "LOGIN_INPUT").send_keys("STEBTPCONSULTING")
    driver.find_element(By.ID, "PASSWORD_INPUT").send_keys("BTP CONSULTING 2023")
    driver.find_element(By.NAME, "CONNECT").click()

    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.LINK_TEXT, "Résultats des bons de commande"))
    ).click()
    time.sleep(3)

    rechercher_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "SAVE"))
    )
    rechercher_btn.click()

    tables = WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "table#resultTable"))
    )

    all_projects = []

    for index, table in enumerate(tables):
        project_data = {}

        try:
            ref_element = table.find_element(By.CSS_SELECTOR, "thead th:nth-child(3)")
            project_data["Référence"] = ref_element.text.strip()
        except:
            project_data["Référence"] = None

        rows = table.find_elements(By.TAG_NAME, "tr")
        for row in rows:
            ths = row.find_elements(By.TAG_NAME, "th")
            tds = row.find_elements(By.TAG_NAME, "td")
            if len(ths) >= 1 and len(tds) >= 1:
                key = ths[0].text.strip().replace(" :", "")
                value = tds[0].text.strip()
                project_data[key] = value

        # ---------------------
        # Lien DAO
        # ---------------------
        dao_link = table.find_elements(By.CSS_SELECTOR, "a.downoaldcpsicone")
        if dao_link:
            href = dao_link[0].get_attribute("href")
            if href.startswith("/"):
                href = BASE_URL + href
            project_data["Lien_DAO"] = href
        else:
            project_data["Lien_DAO"] = None

        # ---------------------
        # Extraire les fichiers DAO si lien présent
        # ---------------------
        extracted_files = []
        if project_data["Lien_DAO"]:
            zip_name = f"bon_commande_{index}.zip"
            zip_path = os.path.join(result_dir, zip_name)
            try:
                r = requests.get(project_data["Lien_DAO"], timeout=30)
                if r.status_code == 200:
                    with open(zip_path, "wb") as f:
                        f.write(r.content)

                    extract_dir = os.path.join(result_dir, f"bon_commande_{index}")
                    os.makedirs(extract_dir, exist_ok=True)

                    with zipfile.ZipFile(zip_path, "r") as zip_ref:
                        zip_ref.extractall(extract_dir)

                    for root, dirs, files in os.walk(extract_dir):
                        for file in files:
                            relative_path = os.path.relpath(os.path.join(root, file), storage_public)
                            extracted_files.append(f"/storage/{relative_path}")

            except Exception as e:
                print(f"Erreur téléchargement ou extraction ZIP pour bon {index}: {e}")

        project_data["EXTRACTED_FILES"] = extracted_files
        all_projects.append(project_data)

    all_keys = set()
    for proj in all_projects:
        all_keys.update(proj.keys())
    all_keys = list(all_keys)

    csv_path = os.path.join(result_dir, "resultats_bon_commande.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        dict_writer = csv.DictWriter(f, fieldnames=all_keys, extrasaction='ignore')
        dict_writer.writeheader()
        dict_writer.writerows(all_projects)

    json_path = os.path.join(result_dir, "resultats_bon_commande.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_projects, f, ensure_ascii=False, indent=4)

    print(f"{len(all_projects)} bons récupérés et fichiers extraits dans '{result_dir}'.")

finally:
    driver.quit()
