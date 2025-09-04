import csv
import json
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "https://global-marches.com"

# ✅ Chemin absolu vers storage/app/public/resultats_bon_commande
storage_public = "/Applications/XAMPP/xamppfiles/htdocs/betconsulting/storage/app/public"
result_dir = os.path.join(storage_public, "resultats_bon_commande")
os.makedirs(result_dir, exist_ok=True)  # Crée le dossier s'il n'existe pas

driver = webdriver.Chrome()

try:
    # ---------------------
    # Connexion
    # ---------------------
    driver.get(BASE_URL)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "connection")))
    driver.find_element(By.ID, "LOGIN_INPUT").send_keys("STEBTPCONSULTING")
    driver.find_element(By.ID, "PASSWORD_INPUT").send_keys("BTP CONSULTING 2023")
    driver.find_element(By.NAME, "CONNECT").click()

    # ---------------------
    # Cliquer sur "Résultats des bons de commande"
    # ---------------------
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.LINK_TEXT, "Résultats des bons de commande"))
    ).click()
    time.sleep(3)  # attendre que la page soit stable

    # ---------------------
    # Cliquer sur le bouton "Rechercher"
    # ---------------------
    rechercher_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "SAVE"))
    )
    rechercher_btn.click()

    # ---------------------
    # Récupérer toutes les tables
    # ---------------------
    tables = WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "table#resultTable"))
    )

    all_projects = []

    for table in tables:
        project_data = {}

        # ✅ Récupérer la Référence dans le thead
        try:
            ref_element = table.find_element(By.CSS_SELECTOR, "thead th:nth-child(3)")
            project_data["Référence"] = ref_element.text.strip()
        except:
            project_data["Référence"] = None

        # ✅ Récupérer les informations du tbody
        rows = table.find_elements(By.TAG_NAME, "tr")
        for row in rows:
            ths = row.find_elements(By.TAG_NAME, "th")
            tds = row.find_elements(By.TAG_NAME, "td")
            if len(ths) >= 1 and len(tds) >= 1:
                key = ths[0].text.strip().replace(" :", "")
                value = tds[0].text.strip()
                project_data[key] = value

        # ✅ Lien DAO
        dao_link = table.find_elements(By.CSS_SELECTOR, "a.downoaldcpsicone")
        if dao_link:
            href = dao_link[0].get_attribute("href")
            if href.startswith("/"):
                href = BASE_URL + href
            project_data["Lien_DAO"] = href
        else:
            project_data["Lien_DAO"] = None

        all_projects.append(project_data)

    # ✅ Déterminer toutes les clés pour le CSV
    all_keys = set()
    for proj in all_projects:
        all_keys.update(proj.keys())
    all_keys = list(all_keys)

    # ✅ Sauvegarder en CSV dans resultats_bon_commande
    csv_path = os.path.join(result_dir, "resultats_bon_commande.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        dict_writer = csv.DictWriter(f, fieldnames=all_keys, extrasaction='ignore')
        dict_writer.writeheader()
        dict_writer.writerows(all_projects)

    # ✅ Sauvegarder en JSON dans resultats_bon_commande
    json_path = os.path.join(result_dir, "resultats_bon_commande.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_projects, f, ensure_ascii=False, indent=4)

    print(f"{len(all_projects)} bons récupérés et sauvegardés dans '{result_dir}'.")

finally:
    driver.quit()