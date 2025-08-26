import csv
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os

# Chemin absolu vers storage/app/public de ton projet
storage_public = "/Applications/XAMPP/xamppfiles/htdocs/betconsulting/storage/app/public"

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

    for item in result_items:
        project_data = {}
        rows = item.find_elements(By.TAG_NAME, "tr")
        for row in rows:
            ths = row.find_elements(By.TAG_NAME, "th")
            tds = row.find_elements(By.TAG_NAME, "td")
            if ths and tds:
                key = ths[0].text.strip().replace(":", "")
                value = " | ".join(td.text.strip() for td in tds)
                project_data[key] = value
        download_link = item.find_elements(By.CSS_SELECTOR, "a.downoaldcps")
        project_data["Téléchargement"] = download_link[0].get_attribute("href") if download_link else None
        all_projects.append(project_data)

    # Déterminer dynamiquement toutes les clés pour le CSV
    all_keys = set()
    for proj in all_projects:
        all_keys.update(proj.keys())
    all_keys = list(all_keys)

    # **Enregistrer directement dans storage/app/public**
    csv_path = os.path.join(storage_public, "projets.csv")
    json_path = os.path.join(storage_public, "projets.json")

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        dict_writer = csv.DictWriter(f, fieldnames=all_keys, extrasaction='ignore')
        dict_writer.writeheader()
        dict_writer.writerows(all_projects)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_projects, f, ensure_ascii=False, indent=4)

    print(f"{len(all_projects)} projets récupérés et sauvegardés dans '{csv_path}' et '{json_path}'.")

finally:
    driver.quit()
