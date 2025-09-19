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

# --- Forcer stdout en UTF-8 ---
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='ignore')

# --- Chemin absolu vers storage/app/public/marche_public ---
storage_public = r"C:\xampp\htdocs\betconsulting\storage\app\public"
result_dir = os.path.join(storage_public, "marche_public")
os.makedirs(result_dir, exist_ok=True)
print(f"[INFO] Dossier de stockage : {result_dir}")

# --- Variables globales pour les fichiers JSON ---
json_file_path = os.path.join(result_dir, "marches_publics_data.json")
csv_file_path = os.path.join(result_dir, "marches_publics_data.csv")

# --- Config Chrome optimisée ---
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
options.add_argument("--guest")
options.add_argument("--disable-extensions")
options.add_argument("--disable-plugins")
options.add_argument("--disable-popup-blocking")
options.add_argument("--no-sandbox")
options.add_experimental_option("detach", True)  # Chrome reste ouvert

service = Service()
driver = webdriver.Chrome(service=service, options=options)

# Autoriser téléchargements
driver.execute_cdp_cmd('Page.setDownloadBehavior', {
    'behavior': 'allow',
    'downloadPath': result_dir
})

# --- Authentification ---
try:
    driver.get("https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseHome")

    bouton_login = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.LINK_TEXT, "S'identifier"))
    )
    bouton_login.click()
    print("[INFO] Cliqué sur 'S'identifier'")

    login_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ctl0_CONTENU_PAGE_login"))
    )
    login_input.send_keys("BTPCONSULTING")

    password_input = driver.find_element(By.ID, "ctl0_CONTENU_PAGE_password")
    password_input.send_keys("Imane2804")

    ok_button = driver.find_element(By.ID, "ctl0_CONTENU_PAGE_authentificationButton")
    ok_button.click()
    print("[INFO] Authentification réussie")

    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ctl0_CONTENU_PAGE_AdvancedSearch_lancerRecherche"))
    )

except Exception as e:
    print(f"[ERROR] Erreur lors de l'authentification : {str(e)}")

# --- Fonctions utilitaires ---
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

# --- FONCTION D'EXTRACTION AMÉLIORÉE ---
def extract_zip_file(zip_path, reference):
    """
    Fonction d'extraction améliorée avec gestion d'erreurs robuste
    Retourne les informations d'extraction sans mettre à jour les fichiers
    """
    extract_dir = os.path.join(result_dir, f"{reference}_extrait")
    extracted_files = []
    
    try:
        # Vérifier si le fichier ZIP existe et n'est pas vide
        if not os.path.exists(zip_path):
            print(f"[ERROR] Fichier ZIP introuvable : {zip_path}")
            return False, []
            
        if os.path.getsize(zip_path) == 0:
            print(f"[ERROR] Fichier ZIP vide : {zip_path}")
            return False, []
        
        # Nettoyer le dossier d'extraction s'il existe déjà
        if os.path.exists(extract_dir):
            try:
                shutil.rmtree(extract_dir)
                print(f"[INFO] Ancien dossier d'extraction supprimé : {extract_dir}")
            except Exception as e:
                print(f"[WARN] Impossible de supprimer l'ancien dossier : {e}")
        
        # Créer le nouveau dossier d'extraction
        os.makedirs(extract_dir, exist_ok=True)
        
        # Tester si le ZIP est valide avant extraction
        try:
            with zipfile.ZipFile(zip_path, 'r') as test_zip:
                # Tester l'intégrité du ZIP
                bad_file = test_zip.testzip()
                if bad_file:
                    print(f"[ERROR] ZIP corrompu, fichier défaillant : {bad_file}")
                    return False, []
        except zipfile.BadZipFile:
            print(f"[ERROR] Fichier ZIP invalide ou corrompu : {zip_path}")
            return False, []
        except Exception as e:
            print(f"[ERROR] Erreur lors du test du ZIP : {e}")
            return False, []
        
        # Procéder à l'extraction
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # Extraire tous les fichiers
            zip_ref.extractall(extract_dir)
            
            # Construire la liste des fichiers extraits avec chemins relatifs pour Laravel
            for root, dirs, files in os.walk(extract_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Convertir en chemin relatif pour Laravel storage
                    relative_path = file_path.replace(storage_public, "").replace("\\", "/")
                    if relative_path.startswith("/"):
                        relative_path = relative_path[1:]
                    laravel_path = f"/storage/{relative_path}"
                    extracted_files.append(laravel_path)
            
            if not extracted_files:
                print(f"[ERROR] Aucun fichier extrait du ZIP : {reference}")
                return False, []
            
            print(f"[INFO] ✅ ZIP extrait avec succès : {reference}")
            print(f"[INFO] → Dossier : {extract_dir}")
            print(f"[INFO] → {len(extracted_files)} fichiers extraits")
            
            # Afficher la liste des fichiers extraits (optionnel, limité à 10 premiers)
            if len(extracted_files) <= 10:
                for filename in extracted_files:
                    print(f"[INFO]   • {filename}")
            else:
                for filename in extracted_files[:10]:
                    print(f"[INFO]   • {filename}")
                print(f"[INFO]   ... et {len(extracted_files)-10} autres fichiers")
            
            return True, extracted_files
            
    except Exception as e:
        print(f"[ERROR] Erreur lors de l'extraction de {reference} : {str(e)}")
        # Nettoyer en cas d'erreur
        if os.path.exists(extract_dir):
            try:
                shutil.rmtree(extract_dir)
            except:
                pass
        return False, []

# --- Extraction du tableau ---
def extract_table_data():
    data = []
    try:
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "table.table-results tbody tr"))
        )
        table = driver.find_element(By.CSS_SELECTOR, "table.table-results tbody")
        rows = table.find_elements(By.TAG_NAME, "tr")
        print(f"[INFO] Tableau chargé avec {len(rows)} lignes")

        for i, row in enumerate(rows):
            try:
                row_data = {}
                cells = row.find_elements(By.TAG_NAME, "td")

                if len(cells) >= 5:
                    # --- Cellule 1 ---
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

                    # --- Cellule 2 ---
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

                    # --- Cellule 3 ---
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

                    # --- Cellule 4 ---
                    cell_date = cells[4]
                    try:
                        date_div = cell_date.find_element(By.CSS_SELECTOR, "div.cloture-line")
                        row_data['date_limite'] = clean_text(extract_text_safe(date_div))
                    except: row_data['date_limite'] = ""
                    try:
                        img_elec = cell_date.find_element(By.CSS_SELECTOR, "img.certificat")
                        row_data['type_reponse_electronique'] = img_elec.get_attribute('alt')
                    except: row_data['type_reponse_electronique'] = ""

                    # --- Cellule 5 ---
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
                    
                    # Initialiser les champs de fichiers comme vides (seront remplis plus tard)
                    row_data['chemin_zip'] = ""
                    row_data['EXTRACTED_FILES'] = []
                    row_data['files_updated_at'] = ""

                    data.append(row_data)
                    print(f"[INFO] Ligne {i+1} extraite : {row_data['reference']}")

            except Exception as e:
                print(f"[ERROR] Erreur extraction ligne {i+1} : {str(e)}")
                continue

    except Exception as e:
        print(f"[ERROR] Erreur extraction tableau : {str(e)}")

    return data

# --- Sauvegarde CSV/JSON ---
def save_to_csv(data, filename="marches_publics_data.csv"):
    if not data:
        print("[WARN] Aucune donnée à sauvegarder en CSV")
        return
    filepath = os.path.join(result_dir, filename)
    with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f"[INFO] CSV sauvegardé dans {filepath} ({len(data)} lignes)")
    return filepath

def save_to_json(data, filename="marches_publics_data.json"):
    if not data:
        print("[WARN] Aucune donnée à sauvegarder en JSON")
        return
    filepath = os.path.join(result_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as jsonfile:
        json.dump(data, jsonfile, ensure_ascii=False, indent=2)
    print(f"[INFO] JSON sauvegardé dans {filepath} ({len(data)} lignes)")
    return filepath

# --- Annulation téléchargements ---
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
        print("[INFO] Téléchargements en cours annulés.")

    except Exception as e:
        print(f"[WARN] Impossible d'annuler les téléchargements : {e}")

    finally:
        if len(driver.window_handles) > 1:
            driver.close()
            driver.switch_to.window(driver.window_handles[0])

# --- FONCTION POUR METTRE À JOUR LES DONNÉES EN MÉMOIRE ---
def update_data_with_files(data, reference, zip_path=None, extracted_files=None):
    """
    Met à jour les données en mémoire avec les informations des fichiers téléchargés/extraits
    """
    for item in data:
        if item.get('reference') == reference:
            # Mettre à jour le chemin ZIP
            if zip_path and os.path.exists(zip_path):
                # Chemin relatif pour le stockage Laravel
                item['chemin_zip'] = f"storage/marche_public/{os.path.basename(zip_path)}"
                print(f"[INFO] Données mises à jour - chemin_zip pour {reference}")
            
            # Mettre à jour les fichiers extraits
            if extracted_files:
                item['EXTRACTED_FILES'] = extracted_files
                print(f"[INFO] Données mises à jour - {len(extracted_files)} fichiers extraits pour {reference}")
            
            # Mettre à jour le timestamp
            item['files_updated_at'] = datetime.now().isoformat()
            break
    return data

# --- Téléchargement DCE MODIFIÉ ---
success_count = 0
fail_count = 0
extract_success_count = 0
extract_fail_count = 0

def download_dce(row, data):
    global success_count, fail_count, extract_success_count, extract_fail_count
    
    reference = row.get('reference', 'UNKNOWN')
    print(f"\n[INFO] === Traitement de {reference} ===")
    
    try:
        if not row.get('lien_consultation'):
            print(f"[ERROR] Pas de lien de consultation pour {reference}")
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
            print(f"[INFO] Bouton 'Télécharger' cliqué pour {reference}")
        except Exception as e:
            print(f"[WARN] Impossible de cliquer sur Télécharger pour {reference} : {e}")
            fail_count += 1
            driver.close()
            driver.switch_to.window(driver.window_handles[0])
            return

        # --- Attente téléchargement AMÉLIORÉE ---
        timeout = 120
        downloaded_file = None
        last_size = 0
        last_check = time.time()
        stall_count = 0

        print(f"[INFO] Attente du téléchargement pour {reference}...")

        while time.time() - window_start < timeout:
            # Chercher les fichiers ZIP récents
            zip_files = glob.glob(os.path.join(result_dir, "*.zip"))
            cr_files = glob.glob(os.path.join(result_dir, "*.crdownload"))

            # Si on a un ZIP et pas de .crdownload, c'est fini
            if zip_files and not cr_files:
                # Prendre le plus récent
                newest_zip = max(zip_files, key=os.path.getctime)
                # Vérifier qu'il a été créé après le début de ce téléchargement
                if os.path.getctime(newest_zip) > window_start:
                    downloaded_file = newest_zip
                    break

            # Si on a un .crdownload, surveiller sa progression
            if cr_files:
                cr_file = cr_files[0]
                try:
                    current_size = os.path.getsize(cr_file)
                except:
                    current_size = 0

                # Si la taille n'a pas changé depuis trop longtemps
                if current_size == last_size:
                    if (time.time() - last_check) > 30:  # 30s sans changement
                        stall_count += 1
                        print(f"[WARN] Téléchargement bloqué ({stall_count}/3) pour {reference}")
                        if stall_count >= 3:  # 3 fois bloqué = abandon
                            print(f"[ERROR] Téléchargement définitivement bloqué pour {reference}")
                            cancel_active_downloads()
                            if os.path.exists(cr_file):
                                try:
                                    os.remove(cr_file)
                                    print("[INFO] Fichier .crdownload supprimé")
                                except:
                                    pass
                            fail_count += 1
                            return
                        last_check = time.time()
                else:
                    # La taille a changé, tout va bien
                    last_size = current_size
                    last_check = time.time()
                    stall_count = 0
                    if current_size > 0:
                        print(f"[INFO] Téléchargement en cours... ({current_size} octets)")

            time.sleep(3)  # Vérifier toutes les 3 secondes

        # Fermer l'onglet de consultation
        if len(driver.window_handles) > 1:
            driver.close()
            driver.switch_to.window(driver.window_handles[0])

        # Traitement du fichier téléchargé
        if downloaded_file:
            print(f"[INFO] Fichier téléchargé : {os.path.basename(downloaded_file)}")
            
            # Renommer le ZIP avec la référence
            new_name = f"{reference}.zip"
            new_path = os.path.join(result_dir, new_name)
            
            try:
                if os.path.exists(new_path) and new_path != downloaded_file:
                    os.remove(new_path)  # Supprimer l'ancien s'il existe
                shutil.move(downloaded_file, new_path)
                print(f"[INFO] ZIP renommé : {new_name}")
            except Exception as e:
                print(f"[WARN] Erreur lors du renommage : {e}")
                new_path = downloaded_file  # Garder le nom original

            # Attendre un peu pour s'assurer que le fichier est complètement écrit
            time.sleep(2)

            # --- EXTRACTION IMMÉDIATE ---
            print(f"[INFO] Début d'extraction pour {reference}")
            success_extract, extracted_files = extract_zip_file(new_path, reference)
            
            if success_extract:
                extract_success_count += 1
                print(f"[INFO] ✅ Extraction réussie pour {reference}")
                # Mettre à jour les données en mémoire
                update_data_with_files(data, reference, new_path, extracted_files)
            else:
                extract_fail_count += 1
                print(f"[ERROR] ❌ Extraction échouée pour {reference}")
                # Mettre à jour seulement avec le chemin ZIP
                update_data_with_files(data, reference, new_path)

            success_count += 1
            print(f"[INFO] ✅ Téléchargement réussi pour {reference}")
            
        else:
            print(f"[ERROR] ❌ Timeout ({timeout}s) pour {reference}")
            cancel_active_downloads()
            fail_count += 1

    except Exception as e:
        print(f"[ERROR] Erreur générale pour {reference} : {str(e)}")
        cancel_active_downloads()
        fail_count += 1

    finally:
        # S'assurer de fermer l'onglet
        if len(driver.window_handles) > 1:
            try:
                driver.close()
                driver.switch_to.window(driver.window_handles[0])
            except:
                pass

# --- FONCTION POUR TRAITER LES ZIP EXISTANTS ---
def process_existing_zips(data):
    """
    Fonction pour traiter tous les ZIP déjà téléchargés mais pas encore extraits
    """
    print("\n[INFO] === Vérification des ZIP existants à extraire ===")
    
    zip_files = glob.glob(os.path.join(result_dir, "*.zip"))
    if not zip_files:
        print("[INFO] Aucun fichier ZIP trouvé")
        return
    
    print(f"[INFO] {len(zip_files)} fichiers ZIP trouvés")
    
    global extract_success_count, extract_fail_count
    
    for zip_path in zip_files:
        zip_name = os.path.basename(zip_path)
        # Extraire la référence du nom de fichier (enlever .zip)
        reference = os.path.splitext(zip_name)[0]
        
        # Vérifier si déjà extrait
        extract_dir = os.path.join(result_dir, f"{reference}_extrait")
        if os.path.exists(extract_dir) and os.listdir(extract_dir):
            print(f"[INFO] {reference} déjà extrait, mise à jour des données...")
            # Même si déjà extrait, mettre à jour les données avec les infos
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
        
        print(f"[INFO] Extraction de {reference}...")
        success_extract, extracted_files = extract_zip_file(zip_path, reference)
        
        if success_extract:
            extract_success_count += 1
            # Mettre à jour les données en mémoire
            update_data_with_files(data, reference, zip_path, extracted_files)
        else:
            extract_fail_count += 1
            # Mettre à jour seulement avec le chemin ZIP
            update_data_with_files(data, reference, zip_path)

# --- Main MODIFIÉ ---
if __name__ == "__main__":
    try:
        print("[INFO] === Démarrage extraction des marchés publics ===")
        start_time = time.time()

        driver.get("https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch&searchAnnCons")
        bouton = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "ctl0_CONTENU_PAGE_AdvancedSearch_lancerRecherche"))
        )
        bouton.click()

        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "table.table-results tbody tr"))
        )

        select_element = WebDriverWait(driver, 30).until(
            EC.element_to_be_clickable((By.ID, "ctl0_CONTENU_PAGE_resultSearch_listePageSizeTop"))
        )
        select = Select(select_element)
        select.select_by_value("10")
        time.sleep(3)

        # 🔑 EXTRACTION DES DONNÉES DU TABLEAU
        data = extract_table_data()

        if data:
            print(f"[INFO] {len(data)} marchés extraits du tableau")
            
            # 🔑 TRAITEMENT DES ZIP EXISTANTS (mise à jour des données en mémoire)
            process_existing_zips(data)
            
            # 🔑 TÉLÉCHARGEMENT ET EXTRACTION DES NOUVEAUX MARCHÉS
            print(f"\n[INFO] === Début téléchargement de {len(data)} marchés ===")
            for i, row in enumerate(data, 1):
                print(f"\n[INFO] === Marché {i}/{len(data)} ===")
                download_dce(row, data)  # Passer les données pour mise à jour en mémoire
                time.sleep(1)  # Petite pause entre chaque téléchargement

            duration = time.time() - start_time
            print(f"\n[INFO] === RÉSUMÉ TÉLÉCHARGEMENTS/EXTRACTIONS ===")
            print(f"[INFO] Durée totale : {duration:.2f} secondes")
            print(f"[INFO] Marchés traités : {len(data)}")
            print(f"[INFO] ✅ Téléchargements réussis : {success_count}")
            print(f"[INFO] ❌ Téléchargements échoués : {fail_count}")
            print(f"[INFO] ✅ Extractions réussies : {extract_success_count}")
            print(f"[INFO] ❌ Extractions échouées : {extract_fail_count}")
            
            # 🔑🔑🔑 GÉNÉRATION FINALE DES FICHIERS CSV ET JSON 🔑🔑🔑
            print(f"\n[INFO] === GÉNÉRATION FINALE DES FICHIERS CSV/JSON ===")
            save_to_csv(data)
            save_to_json(data)
            
            print(f"\n[INFO] === FICHIERS FINAUX GÉNÉRÉS ===")
            print(f"[INFO] ✅ CSV final généré avec toutes les données")
            print(f"[INFO] ✅ JSON final généré avec toutes les données") 
            print(f"[INFO] Tous les chemins ZIP et fichiers extraits sont inclus")
            
        else:
            print("[WARN] Aucune donnée extraite")

    except Exception as e:
        print(f"[ERROR] Erreur générale : {str(e)}")

    finally:
        print("\n[INFO] === Script terminé (Chrome reste ouvert) ===")