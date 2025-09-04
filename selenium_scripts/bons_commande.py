import csv
import json
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "https://global-marches.com"

# Chemin absolu vers storage/app/public de ton projet Laravel
storage_public = "/Applications/XAMPP/xamppfiles/htdocs/betconsulting/storage/app/public"
bons_dir = os.path.join(storage_public, "bons_commande")
os.makedirs(bons_dir, exist_ok=True)  # Créer le dossier si non existant

driver = webdriver.Chrome()

try:
    # Connexion
    driver.get(BASE_URL)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "connection")))
    driver.find_element(By.ID, "LOGIN_INPUT").send_keys("STEBTPCONSULTING")
    driver.find_element(By.ID, "PASSWORD_INPUT").send_keys("BTP CONSULTING 2023")
    driver.find_element(By.NAME, "CONNECT").click()

    # ---------------------
    # Cliquer sur "Bons de commande"
    # ---------------------
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.LINK_TEXT, "Bons de commande"))).click()
    time.sleep(3)

    # Cliquer sur le bouton "Rechercher"
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "SAVE"))).click()
    time.sleep(3)

    # Cocher "Cocher tous"
    checkbox = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input.SelectAll"))
    )
    driver.execute_script("arguments[0].click();", checkbox)
    time.sleep(1)

    # Cliquer sur "Afficher détail"
    afficher_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button.Afficher"))
    )
    afficher_btn.click()
    time.sleep(3)

    # ---------------------
    # Récupérer les bons de commande
    # ---------------------
    result_items = driver.find_elements(By.CSS_SELECTOR, "tbody")
    all_bons = []

    for item in result_items:
        bon_data = {}
        rows = item.find_elements(By.TAG_NAME, "tr")

        for row in rows:
            ths = row.find_elements(By.TAG_NAME, "th")
            tds = row.find_elements(By.TAG_NAME, "td")

            # Pour les lignes avec seulement des th (ex: N° d'ordre, Référence, Date/Heure limite)
            if ths and not tds:
                for th in ths:
                    key = th.text.split(":")[0].strip()
                    span = th.find_elements(By.TAG_NAME, "span")
                    value = " | ".join([s.text.strip() for s in span if s.text.strip()]) if span else ""
                    bon_data[key] = value

            # Pour les lignes classiques avec th et td
            elif ths and tds:
                key = ths[0].text.strip().replace(":", "")
                value = " | ".join(td.text.strip() for td in tds)
                # Inclure texte des spans dans le th
                span_texts = [span.text.strip() for span in ths[0].find_elements(By.TAG_NAME, "span") if span.text.strip()]
                if span_texts:
                    value = " | ".join(span_texts + [value]) if value else " | ".join(span_texts)
                bon_data[key] = value

        # Lien "Télécharger D.A.O"
        download_link = item.find_elements(By.CSS_SELECTOR, "a.downoaldcps")
        bon_data["Téléchargement_DAO"] = download_link[0].get_attribute("href") if download_link else None

        # Lien "Cliquer ici"
        cliquer_link = item.find_elements(By.CSS_SELECTOR, "a.btn.mini.btn-info")
        bon_data["Lien_Cliquer_Ici"] = cliquer_link[0].get_attribute("href") if cliquer_link else None

        all_bons.append(bon_data)

    # ---------------------
    # Déterminer toutes les clés
    # ---------------------
    all_keys = set()
    for bon in all_bons:
        all_keys.update(bon.keys())
    all_keys = list(all_keys)

    # ---------------------
    # Sauvegarder en CSV dans Laravel storage
    # ---------------------
    csv_path = os.path.join(bons_dir, "bons_commande.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        dict_writer = csv.DictWriter(f, fieldnames=all_keys, extrasaction='ignore')
        dict_writer.writeheader()
        dict_writer.writerows(all_bons)

    # ---------------------
    # Sauvegarder en JSON dans Laravel storage
    # ---------------------
    json_path = os.path.join(bons_dir, "bons_commande.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_bons, f, ensure_ascii=False, indent=4)

    print(f"{len(all_bons)} bons récupérés et sauvegardés dans '{bons_dir}'.")

finally:
    driver.quit()