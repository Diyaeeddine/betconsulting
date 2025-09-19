import csv
import json
import requests
import zipfile
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os

# Chemin absolu vers storage/app/public de ton projet
storage_public = r"C:\xampp\htdocs\betconsulting\storage\app\public"
dao_dir = os.path.join(storage_public, "dao")
os.makedirs(dao_dir, exist_ok=True)  # Créer le dossier dao s'il n'existe pas

driver = webdriver.Chrome()

try:
    # Connexion et navigation
    driver.get("https://global-marches.com/")
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "connection")))
    driver.find_element(By.ID, "LOGIN_INPUT").send_keys("STEBTPCONSULTING")
    driver.find_element(By.ID, "PASSWORD_INPUT").send_keys("BTP CONSULTING 2023")
    driver.find_element(By.NAME, "CONNECT").click()
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.LINK_TEXT, "Tous les appels d'offres"))).click()
    time.sleep(3)

    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "SAVE"))).click()
    time.sleep(2)
    checkbox = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "input.SelectAll")))
    driver.execute_script("arguments[0].click();", checkbox)
    time.sleep(2)

    afficher_btn = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button.Afficher")))
    afficher_btn.click()
    time.sleep(3)

    # Récupérer tous les projets
    result_items = driver.find_elements(By.CSS_SELECTOR, "div.resultItem")
    all_projects = []

    for index, item in enumerate(result_items):
        project_data = {}
        rows = item.find_elements(By.TAG_NAME, "tr")
        for row in rows:
            ths = row.find_elements(By.TAG_NAME, "th")
            tds = row.find_elements(By.TAG_NAME, "td")
            if ths and tds:
                key = ths[0].text.strip().replace(":", "")
                value = " | ".join(td.text.strip() for td in tds)
                project_data[key] = value

        # Lien de téléchargement ZIP
        download_link = item.find_elements(By.CSS_SELECTOR, "a.downoaldcps")
        zip_url = download_link[0].get_attribute("href") if download_link else None
        project_data["Téléchargement"] = zip_url

        extracted_files = []

        # Télécharger et extraire si lien existe
        if zip_url:
            zip_name = f"projet_{index}.zip"
            zip_path = os.path.join(dao_dir, zip_name)

            try:
                # Télécharger le ZIP
                r = requests.get(zip_url, timeout=30)
                if r.status_code == 200:
                    with open(zip_path, "wb") as f:
                        f.write(r.content)

                    # Extraire le ZIP
                    extract_dir = os.path.join(dao_dir, f"projet_{index}")
                    os.makedirs(extract_dir, exist_ok=True)

                    with zipfile.ZipFile(zip_path, "r") as zip_ref:
                        zip_ref.extractall(extract_dir)

                    # Lister tous les fichiers extraits (chemins relatifs)
                    for root, dirs, files in os.walk(extract_dir):
                        for file in files:
                            relative_path = os.path.relpath(os.path.join(root, file), storage_public)
                            extracted_files.append(f"/storage/{relative_path}")

            except Exception as e:
                print(f"Erreur téléchargement ou extraction ZIP pour projet {index}: {e}")

        project_data["EXTRACTED_FILES"] = extracted_files
        all_projects.append(project_data)

    # Déterminer dynamiquement toutes les clés pour le CSV
    all_keys = set()
    for proj in all_projects:
        all_keys.update(proj.keys())
    all_keys = list(all_keys)

    # Sauvegarde CSV
    csv_path = os.path.join(storage_public, "projets.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        dict_writer = csv.DictWriter(f, fieldnames=all_keys, extrasaction='ignore')
        dict_writer.writeheader()
        dict_writer.writerows(all_projects)

    # Sauvegarde JSON
    json_path = os.path.join(storage_public, "projets.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_projects, f, ensure_ascii=False, indent=4)

    print(f"{len(all_projects)} projets récupérés, ZIP téléchargés et fichiers extraits.")
    print(f"Fichiers CSV et JSON sauvegardés dans '{storage_public}'.")

finally:
    driver.quit()
