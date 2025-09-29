import sys
import time
import json
import os
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException
from webdriver_manager.chrome import ChromeDriverManager
import pyautogui

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('consultation_automation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ConsultationAutomation:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.results = {
            'success': False,
            'message': '',
            'steps_completed': [],
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }
    
    def setup_driver(self):
        """Configure et initialise le driver Chrome"""
        try:
            logger.info("🚀 Initialisation du driver Chrome...")
            
            chrome_options = Options()
            chrome_options.add_argument("--start-maximized")
            chrome_options.add_argument("--guest")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            chrome_options.add_argument("--disable-web-security")
            chrome_options.add_argument("--allow-running-insecure-content")
            chrome_options.add_argument("--disable-extensions")
            
            # Installation automatique du ChromeDriver
            service = Service(ChromeDriverManager().install())
            
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            # Configuration du timeout
            self.wait = WebDriverWait(self.driver, 20)
            
            logger.info("✅ Driver Chrome initialisé avec succès")
            self.results['steps_completed'].append("Driver Chrome configuré")
            
        except Exception as e:
            error_msg = f"❌ Erreur lors de l'initialisation du driver: {str(e)}"
            logger.error(error_msg)
            self.results['errors'].append(error_msg)
            raise
    
    def navigate_to_consultation(self, consultation_url):
        """Navigue vers la page de consultation"""
        try:
            logger.info(f"🌐 Navigation vers: {consultation_url}")
            
            self.driver.get(consultation_url)
            
            # Attendre que la page soit chargée
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # Attendre un peu plus pour s'assurer du chargement complet
            time.sleep(3)
            
            current_url = self.driver.current_url
            logger.info(f"✅ Page chargée avec succès: {current_url}")
            self.results['steps_completed'].append(f"Navigation vers {consultation_url}")
            
            return True
            
        except Exception as e:
            error_msg = f"❌ Erreur lors de la navigation: {str(e)}"
            logger.error(error_msg)
            self.results['errors'].append(error_msg)
            return False
    
    def handle_system_popup(self):
        """Gère les popups système avec PyAutoGUI"""
        try:
            logger.info("🔧 Gestion du popup système avec PyAutoGUI...")
            
            # attendre un peu que le popup système apparaisse
            time.sleep(3)
            
            # simuler la flèche gauche (choisir l'option "Toujours ouvrir ce type de lien")
            pyautogui.press('left')
            logger.info("✅ Flèche gauche pressée")
            
            # valider avec Entrée
            pyautogui.press('enter')
            logger.info("✅ Entrée pressée pour valider")
            
            # Attendre un peu après la validation
            time.sleep(2)
            
            logger.info("✅ Popup système géré avec succès")
            self.results['steps_completed'].append("Gestion du popup système avec PyAutoGUI")
            
            return True
            
        except Exception as e:
            error_msg = f"❌ Erreur lors de la gestion du popup système: {str(e)}"
            logger.error(error_msg)
            self.results['errors'].append(error_msg)
            return False
    
    def login_user(self, login="BTPCONSULTING", password="Imane2804"):
        """Effectue le login avec les identifiants fournis"""
        try:
            logger.info("🔐 Début du processus de login...")
            
            # Vérifier si le bloc de login est présent
            login_bloc_selectors = [
                "#ctl0_CONTENU_PAGE_blocLogin",
                "div.form-bloc",
                "div[id*='blocLogin']"
            ]
            
            login_bloc = None
            for selector in login_bloc_selectors:
                try:
                    login_bloc = self.wait.until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                    )
                    logger.info(f"✅ Bloc de login trouvé avec: {selector}")
                    break
                except TimeoutException:
                    continue
            
            if not login_bloc:
                logger.info("ℹ️ Aucun bloc de login trouvé - peut-être déjà connecté")
                return True
            
            # Localiser le champ login
            login_field_selectors = [
                "#ctl0_CONTENU_PAGE_login",
                "input[name*='login']",
                "input.login",
                "input[type='text'][title*='Login']"
            ]
            
            login_field = None
            for selector in login_field_selectors:
                try:
                    login_field = self.wait.until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    logger.info(f"✅ Champ login trouvé avec: {selector}")
                    break
                except TimeoutException:
                    continue
            
            if not login_field:
                raise Exception("Impossible de trouver le champ login")
            
            # Localiser le champ mot de passe
            password_field_selectors = [
                "#ctl0_CONTENU_PAGE_password",
                "input[name*='password']",
                "input.password",
                "input[type='password']"
            ]
            
            password_field = None
            for selector in password_field_selectors:
                try:
                    password_field = self.wait.until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    logger.info(f"✅ Champ mot de passe trouvé avec: {selector}")
                    break
                except TimeoutException:
                    continue
            
            if not password_field:
                raise Exception("Impossible de trouver le champ mot de passe")
            
            # Localiser le bouton OK
            ok_button_selectors = [
                "#ctl0_CONTENU_PAGE_authentificationButton",
                "input[name*='authentificationButton']",
                "input[type='image'][alt='OK']",
                "input[title*='Authentification']",
                "input.ok"
            ]
            
            ok_button = None
            for selector in ok_button_selectors:
                try:
                    ok_button = self.wait.until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    logger.info(f"✅ Bouton OK trouvé avec: {selector}")
                    break
                except TimeoutException:
                    continue
            
            if not ok_button:
                raise Exception("Impossible de trouver le bouton OK")
            
            # Effacer les champs et saisir les données
            logger.info("📝 Saisie des identifiants...")
            
            # Saisir le login
            login_field.clear()
            login_field.send_keys(login)
            logger.info(f"✅ Login saisi: {login}")
            
            time.sleep(0.5)
            
            # Saisir le mot de passe
            password_field.clear()
            password_field.send_keys(password)
            logger.info("✅ Mot de passe saisi")
            
            time.sleep(0.5)
            
            # Cliquer sur le bouton OK
            logger.info("🖱️ Clic sur le bouton OK...")
            
            try:
                ok_button.click()
                logger.info("✅ Clic normal sur OK réussi")
            except ElementClickInterceptedException:
                logger.warning("⚠️ Clic normal intercepté, tentative avec JavaScript...")
                self.driver.execute_script("arguments[0].click();", ok_button)
                logger.info("✅ Clic JavaScript sur OK réussi")
            
            # Attendre la redirection/chargement après login
            logger.info("⏳ Attente de la redirection après login...")
            time.sleep(5)
            
            # GESTION DU POPUP SYSTÈME AVEC PYAUTOGUI
            self.handle_system_popup()
            
            # Vérifier si le login a réussi en cherchant si le formulaire de login est toujours présent
            try:
                # Si on trouve encore le formulaire de login, c'est que ça a échoué
                still_login_form = self.driver.find_element(By.CSS_SELECTOR, "#ctl0_CONTENU_PAGE_blocLogin")
                if still_login_form.is_displayed():
                    # Vérifier s'il y a un message d'erreur
                    error_messages = self.driver.find_elements(By.CSS_SELECTOR, ".error, .alert, .message-erreur")
                    if error_messages:
                        error_text = error_messages[0].text
                        raise Exception(f"Échec du login - Message d'erreur: {error_text}")
                    else:
                        raise Exception("Échec du login - Le formulaire de login est toujours présent")
            except NoSuchElementException:
                # Le formulaire n'est plus là, c'est bon signe
                pass
            
            logger.info("✅ Login effectué avec succès!")
            self.results['steps_completed'].append(f"Login réussi avec l'utilisateur: {login}")
            
            return True
            
        except Exception as e:
            error_msg = f"❌ Erreur lors du login: {str(e)}"
            logger.error(error_msg)
            self.results['errors'].append(error_msg)
            return False
    
    def click_depot_tab(self):
        """Clique sur l'onglet Dépôt"""
        try:
            logger.info("🎯 Recherche de l'onglet 'Dépôt'...")
            
            # Plusieurs sélecteurs possibles pour l'onglet Dépôt
            selectors = [
                "#onglet3",  # ID direct
                "a[id='onglet3']",  # Sélecteur par attribut ID
                "a.etape-5",  # Par classe CSS
                "a[title=' '][class='etape-5']",  # Par titre et classe
                "#ctl0_CONTENU_PAGE_onglet3 a",  # Par l'ID du conteneur parent
                "div.tab a:contains('Dépôt')",  # Par contenu du texte (si supporté)
                "//a[contains(text(), 'Dépôt')]",  # XPath par texte
            ]
            
            depot_element = None
            used_selector = None
            
            for selector in selectors:
                try:
                    if selector.startswith("//"):
                        # XPath
                        depot_element = self.wait.until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                    else:
                        # CSS Selector
                        depot_element = self.wait.until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                        )
                    
                    used_selector = selector
                    break
                    
                except TimeoutException:
                    continue
            
            if not depot_element:
                raise Exception("Impossible de trouver l'onglet Dépôt avec tous les sélecteurs")
            
            logger.info(f"✅ Onglet Dépôt trouvé avec le sélecteur: {used_selector}")
            
            # Scroll vers l'élément si nécessaire
            self.driver.execute_script("arguments[0].scrollIntoView(true);", depot_element)
            time.sleep(1)
            
            # Tentatives de clic avec différentes méthodes
            click_success = False
            
            # Méthode 1: Clic normal
            try:
                depot_element.click()
                click_success = True
                logger.info("✅ Clic normal sur l'onglet Dépôt réussi")
            except ElementClickInterceptedException:
                logger.warning("⚠️ Clic normal intercepté, tentative avec JavaScript...")
                
                # Méthode 2: Clic JavaScript
                try:
                    self.driver.execute_script("arguments[0].click();", depot_element)
                    click_success = True
                    logger.info("✅ Clic JavaScript sur l'onglet Dépôt réussi")
                except Exception as e:
                    logger.warning(f"⚠️ Clic JavaScript échoué: {str(e)}")
            
            if not click_success:
                # Méthode 3: Déclencher l'événement onclick directement
                try:
                    onclick_value = depot_element.get_attribute("onclick")
                    if onclick_value:
                        # Exécuter le code onclick
                        js_code = onclick_value.replace("return false", "").replace("return true", "")
                        self.driver.execute_script(js_code)
                        click_success = True
                        logger.info("✅ Exécution du onclick directe réussie")
                except Exception as e:
                    logger.warning(f"⚠️ Exécution onclick échouée: {str(e)}")
            
            if not click_success:
                raise Exception("Toutes les méthodes de clic ont échoué")
            
            # Attendre que l'onglet soit activé/affiché
            time.sleep(3)
            
            logger.info("✅ Onglet Dépôt cliqué avec succès")
            self.results['steps_completed'].append("Clic sur l'onglet Dépôt")
            
            return True
            
        except Exception as e:
            error_msg = f"❌ Erreur lors du clic sur l'onglet Dépôt: {str(e)}"
            logger.error(error_msg)
            self.results['errors'].append(error_msg)
            return False
    
    def wait_for_page_complete_load(self):
        """Attend le chargement complet de la page après le clic sur Dépôt"""
        try:
            logger.info("⏳ Attente du chargement complet de la page...")
            
            # Attendre que le document soit prêt
            self.wait.until(
                lambda driver: driver.execute_script("return document.readyState") == "complete"
            )
            
            # Attendre que jQuery termine si présent
            try:
                self.wait.until(
                    lambda driver: driver.execute_script("return jQuery.active") == 0
                )
            except:
                # jQuery pourrait ne pas être présent
                pass
            
            # Attente supplémentaire pour les éléments dynamiques
            time.sleep(5)
            
            logger.info("✅ Chargement complet de la page terminé")
            self.results['steps_completed'].append("Attente du chargement complet")
            
            return True
            
        except Exception as e:
            error_msg = f"❌ Erreur lors de l'attente du chargement: {str(e)}"
            logger.error(error_msg)
            self.results['errors'].append(error_msg)
            return False
    
    def click_repondre_consultation(self):
        """Clique sur le bouton 'Répondre à la consultation'"""
        try:
            logger.info("🎯 Recherche du bouton 'Répondre à la consultation'...")
            
            # Plusieurs sélecteurs possibles pour le bouton
            selectors = [
                "a.bouton-validation-190[title='Répondre à la consultation']",
                "a[onclick*='openModal'][title='Répondre à la consultation']",
                "a[onclick*='modal-select-lots']",
                ".float-right a.bouton-validation-190",
                "a:contains('Répondre à la consultation')",
                "//a[contains(text(), 'Répondre à la consultation')]",
                "//a[@title='Répondre à la consultation']",
                "//a[contains(@onclick, 'openModal')]",
            ]
            
            repondre_element = None
            used_selector = None
            
            for selector in selectors:
                try:
                    if selector.startswith("//"):
                        # XPath
                        repondre_element = self.wait.until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                    else:
                        # CSS Selector
                        repondre_element = self.wait.until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                        )
                    
                    used_selector = selector
                    break
                    
                except TimeoutException:
                    continue
            
            if not repondre_element:
                raise Exception("Impossible de trouver le bouton 'Répondre à la consultation'")
            
            logger.info(f"✅ Bouton 'Répondre à la consultation' trouvé avec: {used_selector}")
            
            # Scroll vers l'élément
            self.driver.execute_script("arguments[0].scrollIntoView(true);", repondre_element)
            time.sleep(1)
            
            # Tentatives de clic
            click_success = False
            
            # Méthode 1: Clic normal
            try:
                repondre_element.click()
                click_success = True
                logger.info("✅ Clic normal sur 'Répondre à la consultation' réussi")
            except ElementClickInterceptedException:
                logger.warning("⚠️ Clic normal intercepté, tentative avec JavaScript...")
                
                # Méthode 2: Clic JavaScript
                try:
                    self.driver.execute_script("arguments[0].click();", repondre_element)
                    click_success = True
                    logger.info("✅ Clic JavaScript sur 'Répondre à la consultation' réussi")
                except Exception as e:
                    logger.warning(f"⚠️ Clic JavaScript échoué: {str(e)}")
            
            if not click_success:
                # Méthode 3: Déclencher l'événement onclick directement
                try:
                    onclick_value = repondre_element.get_attribute("onclick")
                    if onclick_value:
                        # Exécuter le code onclick
                        self.driver.execute_script(onclick_value)
                        click_success = True
                        logger.info("✅ Exécution du onclick directe réussie")
                except Exception as e:
                    logger.warning(f"⚠️ Exécution onclick échouée: {str(e)}")
            
            if not click_success:
                raise Exception("Toutes les méthodes de clic ont échoué")
            
            # Attendre l'ouverture de la modal
            time.sleep(3)
            
            logger.info("✅ Bouton 'Répondre à la consultation' cliqué avec succès")
            self.results['steps_completed'].append("Clic sur 'Répondre à la consultation'")
            
            return True
            
        except Exception as e:
            error_msg = f"❌ Erreur lors du clic sur 'Répondre à la consultation': {str(e)}"
            logger.error(error_msg)
            self.results['errors'].append(error_msg)
            return False
    
    def click_pieces_libres_buttons(self):
        """Détecte et clique sur tous les boutons 'Ajouter une ou plusieurs pièces libres'"""
        try:
            logger.info("🎯 Recherche des boutons 'Ajouter une ou plusieurs pièces libres'...")
            
            # Attendre un peu pour s'assurer que la page est bien chargée
            time.sleep(3)
            
            # Sélecteurs pour détecter les boutons "Ajouter une ou plusieurs pièces libres"
            selectors = [
                "a.ajout-el[href='#']:contains('Ajouter une ou plusieurs pièces libres')",
                "a.ajout-el[onclick*='ajouterPieceLibreApplet']",
                "a[id*='ajouterPieceLibreApplet']",
                "//a[contains(text(), 'Ajouter une ou plusieurs pièces libres')]",
                "//a[@class='ajout-el' and contains(@onclick, 'ajouterPieceLibreApplet')]"
            ]
            
            pieces_libres_buttons = []
            
            # Essayer chaque sélecteur pour trouver tous les boutons
            for selector in selectors:
                try:
                    if selector.startswith("//"):
                        # XPath
                        buttons = self.driver.find_elements(By.XPATH, selector)
                    else:
                        # CSS Selector
                        buttons = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    
                    if buttons:
                        logger.info(f"✅ Trouvé {len(buttons)} bouton(s) avec le sélecteur: {selector}")
                        pieces_libres_buttons.extend(buttons)
                        break
                        
                except Exception as e:
                    logger.warning(f"⚠️ Erreur avec le sélecteur {selector}: {str(e)}")
                    continue
            
            # Supprimer les doublons en utilisant les IDs
            unique_buttons = []
            seen_ids = set()
            
            for button in pieces_libres_buttons:
                button_id = button.get_attribute("id")
                if button_id and button_id not in seen_ids:
                    unique_buttons.append(button)
                    seen_ids.add(button_id)
                elif not button_id:
                    # Si pas d'ID, vérifier l'onclick pour éviter les doublons
                    onclick = button.get_attribute("onclick")
                    if onclick and onclick not in [b.get_attribute("onclick") for b in unique_buttons]:
                        unique_buttons.append(button)
            
            if not unique_buttons:
                logger.warning("⚠️ Aucun bouton 'Ajouter une ou plusieurs pièces libres' trouvé")
                return True  # On continue même si pas de boutons trouvés
            
            logger.info(f"📋 Total de {len(unique_buttons)} bouton(s) unique(s) 'Ajouter une ou plusieurs pièces libres' détecté(s)")
            
            # Cliquer sur chaque bouton une seule fois avec 15 secondes d'attente entre chaque
            clicked_count = 0
            
            for i, button in enumerate(unique_buttons, 1):
                try:
                    button_id = button.get_attribute("id") or f"button_{i}"
                    logger.info(f"🖱️ Clic sur le bouton {i}/{len(unique_buttons)} (ID: {button_id})...")
                    
                    # Scroll vers l'élément pour s'assurer qu'il est visible
                    self.driver.execute_script("arguments[0].scrollIntoView(true);", button)
                    time.sleep(1)
                    
                    # Vérifier si le bouton est cliquable
                    if not button.is_displayed() or not button.is_enabled():
                        logger.warning(f"⚠️ Le bouton {i} n'est pas cliquable, passage au suivant")
                        continue
                    
                    # Tentatives de clic
                    click_success = False
                    
                    # Méthode 1: Clic normal
                    try:
                        button.click()
                        click_success = True
                        logger.info(f"✅ Clic normal sur le bouton {i} réussi")
                    except ElementClickInterceptedException:
                        logger.warning(f"⚠️ Clic normal intercepté pour le bouton {i}, tentative avec JavaScript...")
                        
                        # Méthode 2: Clic JavaScript
                        try:
                            self.driver.execute_script("arguments[0].click();", button)
                            click_success = True
                            logger.info(f"✅ Clic JavaScript sur le bouton {i} réussi")
                        except Exception as e:
                            logger.warning(f"⚠️ Clic JavaScript échoué pour le bouton {i}: {str(e)}")
                    
                    if not click_success:
                        # Méthode 3: Exécuter l'onclick directement
                        try:
                            onclick_value = button.get_attribute("onclick")
                            if onclick_value:
                                # Nettoyer le code onclick
                                js_code = onclick_value.replace("return false", "").replace("return true", "")
                                self.driver.execute_script(js_code)
                                click_success = True
                                logger.info(f"✅ Exécution onclick directe pour le bouton {i} réussie")
                        except Exception as e:
                            logger.warning(f"⚠️ Exécution onclick échouée pour le bouton {i}: {str(e)}")
                    
                    if click_success:
                        clicked_count += 1
                        logger.info(f"🎉 Bouton {i} cliqué avec succès!")
                        
                        # GESTION DU POPUP SYSTÈME AVEC PYAUTOGUI après chaque clic réussi
                        self.handle_system_popup()
                        
                        # GESTION DU POPUP SYSTÈME AVEC PYAUTOGUI après chaque clic réussi
                        self.handle_system_popup()
                        
                        # Attendre 15 secondes pour choisir un fichier avant de passer au bouton suivant
                        if i < len(unique_buttons):  # Ne pas attendre après le dernier bouton
                            logger.info("⏳ Attente de 15 secondes pour choisir un fichier avant le prochain bouton...")
                            time.sleep(15)
                    else:
                        logger.error(f"❌ Impossible de cliquer sur le bouton {i}")
                        
                except Exception as e:
                    logger.error(f"❌ Erreur lors du clic sur le bouton {i}: {str(e)}")
                    continue
            
            # Résumé
            logger.info(f"📊 Résumé: {clicked_count}/{len(unique_buttons)} bouton(s) cliqué(s) avec succès")
            
            if clicked_count > 0:
                self.results['steps_completed'].append(f"Clic réussi sur {clicked_count} bouton(s) 'Ajouter une ou plusieurs pièces libres'")
                logger.info("✅ Traitement des boutons 'Ajouter une ou plusieurs pièces libres' terminé avec succès")
            else:
                logger.warning("⚠️ Aucun bouton n'a pu être cliqué")
            
            return True
            
        except Exception as e:
            error_msg = f"❌ Erreur lors du traitement des boutons 'Ajouter une ou plusieurs pièces libres': {str(e)}"
            logger.error(error_msg)
            self.results['errors'].append(error_msg)
            return False
    
    def run_automation(self, consultation_url, marche_reference):
        """Exécute le processus d'automatisation complet"""
        try:
            logger.info(f"🚀 DÉBUT DE L'AUTOMATISATION CONSULTATION")
            logger.info(f"URL: {consultation_url}")
            logger.info(f"Référence marché: {marche_reference}")
            
            self.results['marche_reference'] = marche_reference
            self.results['consultation_url'] = consultation_url
            
            # Étape 1: Configuration du driver
            self.setup_driver()
            
            # Étape 2: Navigation vers la consultation
            if not self.navigate_to_consultation(consultation_url):
                raise Exception("Échec de la navigation")
            
            # Étape 3: Clic sur l'onglet Dépôt
            if not self.click_depot_tab():
                raise Exception("Échec du clic sur l'onglet Dépôt")
            
            # Étape 4: Attente du chargement complet
            if not self.wait_for_page_complete_load():
                raise Exception("Échec de l'attente du chargement")
            
            # Étape 5: Clic sur 'Répondre à la consultation'
            if not self.click_repondre_consultation():
                raise Exception("Échec du clic sur 'Répondre à la consultation'")
            
            # Étape 6: Login
            if not self.login_user():
                raise Exception("Échec du login")
            
            # Étape 7: Clic sur les boutons "Ajouter une ou plusieurs pièces libres"
            if not self.click_pieces_libres_buttons():
                logger.warning("⚠️ Problème avec les boutons 'Ajouter une ou plusieurs pièces libres', mais on continue...")
            
            # Succès !
            self.results['success'] = True
            self.results['message'] = "Automatisation terminée avec succès ! Tous les boutons 'Ajouter une ou plusieurs pièces libres' ont été cliqués."
            
            logger.info("🎉 AUTOMATISATION TERMINÉE AVEC SUCCÈS !")
            
            # Attendre 10 secondes pour bien voir la page avant de fermer
            logger.info("⏳ Attente de 10 secondes pour visualiser la page finale...")
            time.sleep(40)
            
        except Exception as e:
            error_msg = f"❌ ERREUR GÉNÉRALE: {str(e)}"
            logger.error(error_msg)
            self.results['success'] = False
            self.results['message'] = error_msg
            self.results['errors'].append(error_msg)
        
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Nettoie les ressources"""
        try:
            if self.driver:
                logger.info("🧹 Fermeture du navigateur...")
                self.driver.quit()
        except Exception as e:
            logger.warning(f"⚠️ Erreur lors de la fermeture: {str(e)}")
    
    def save_results(self):
        """Sauvegarde les résultats en JSON"""
        try:
            results_file = "consultation_automation_results.json"
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, ensure_ascii=False, indent=2)
            
            logger.info(f"📄 Résultats sauvegardés dans: {results_file}")
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de la sauvegarde: {str(e)}")

def main():
    if len(sys.argv) != 3:
        print("❌ Usage: python consultation_automation.py <consultation_url> <marche_reference>")
        sys.exit(1)
    
    consultation_url = sys.argv[1]
    marche_reference = sys.argv[2]
    
    automation = ConsultationAutomation()
    
    try:
        automation.run_automation(consultation_url, marche_reference)
    finally:
        automation.save_results()
        
        # Afficher le résumé
        print("\n" + "="*50)
        print("📊 RÉSUMÉ DE L'AUTOMATISATION")
        print("="*50)
        print(f"✅ Succès: {automation.results['success']}")
        print(f"📝 Message: {automation.results['message']}")
        print(f"📋 Étapes complétées: {len(automation.results['steps_completed'])}")
        
        if automation.results['steps_completed']:
            for step in automation.results['steps_completed']:
                print(f"   ✓ {step}")
        
        if automation.results['errors']:
            print(f"❌ Erreurs ({len(automation.results['errors'])}):")
            for error in automation.results['errors']:
                print(f"   ✗ {error}")
        
        print("="*50)
        
        # Code de sortie
        sys.exit(0 if automation.results['success'] else 1)

if __name__ == "__main__":
    main()