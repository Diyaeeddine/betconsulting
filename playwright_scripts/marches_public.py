#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Playwright Production - REAL DATA EXTRACTION
Windows asyncio fix for actual marchés publics data
"""

import sys
import io
import os
import re
import time
import csv
import json
import shutil
import zipfile
from datetime import datetime
from pathlib import Path

# Fix encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

print("[INFO] ====== REAL DATA EXTRACTION SCRIPT ======")
print(f"[INFO] Python: {sys.version}")
print(f"[INFO] Platform: {sys.platform}")

# Windows asyncio fix
def fix_windows_asyncio():
    """Windows-specific asyncio configuration"""
    if sys.platform.startswith('win'):
        try:
            import asyncio
            import subprocess
            
            # Set the event loop policy to ProactorEventLoop for Windows
            if hasattr(asyncio, 'WindowsProactorEventLoopPolicy'):
                asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
                print("[INFO] Windows ProactorEventLoop policy set")
            
            # Disable subprocess for Playwright (use direct browser)
            os.environ['PLAYWRIGHT_BROWSERS_PATH'] = '0'
            
            return True
        except Exception as e:
            print(f"[ERROR] Windows asyncio fix failed: {e}")
            return False
    return True

# Setup paths
def setup_paths():
    base_path = Path(__file__).parent.parent
    storage_path = base_path / "storage" / "app" / "public" / "marche_public"
    storage_path.mkdir(parents=True, exist_ok=True)
    
    return {
        'storage_dir': str(storage_path),
        'json_file': str(storage_path / "marches_publics_data.json"),
        'csv_file': str(storage_path / "marches_publics_data.csv"),
        'progress_file': str(storage_path / "scraping_progress.json"),
        'stats_file': str(storage_path / "extraction_stats.json")
    }

PATHS = setup_paths()
print(f"[INFO] Storage directory: {PATHS['storage_dir']}")

# Global stats
STATS = {
    'marches_extraits': 0,
    'telechargements_reussis': 0,
    'telechargements_echous': 0,
    'extractions_reussies': 0,
    'extractions_echouees': 0,
    'duree': 0,
    'start_time': time.time()
}

def save_progress(status, current=0, total=0, message=""):
    try:
        progress_data = {
            "status": status,
            "current": current,
            "total": total,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "percentage": round((current / total * 100) if total > 0 else 0, 2),
            "downloads_success": STATS['telechargements_reussis'],
            "downloads_failed": STATS['telechargements_echous'],
            "extractions_success": STATS['extractions_reussies'],
            "extractions_failed": STATS['extractions_echouees']
        }
        
        with open(PATHS['progress_file'], 'w', encoding='utf-8') as f:
            json.dump(progress_data, f, ensure_ascii=False, indent=2)
            
        print(f"[PROGRESS] {status}: {current}/{total} ({progress_data['percentage']:.1f}%) - {message}")
    except Exception as e:
        print(f"[ERROR] Progress save: {e}")

def save_data_files(data):
    try:
        if not data:
            return False
            
        with open(PATHS['json_file'], 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        with open(PATHS['csv_file'], 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        
        print(f"[INFO] Data saved: {len(data)} marchés")
        return True
    except Exception as e:
        print(f"[ERROR] Data save: {e}")
        return False

def save_final_stats():
    try:
        STATS['duree'] = round(time.time() - STATS['start_time'], 2)
        with open(PATHS['stats_file'], 'w', encoding='utf-8') as f:
            json.dump(STATS, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"[ERROR] Stats save: {e}")
        return False

class RealDataExtractor:
    def __init__(self):
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None
        self.data = []

    async def setup_browser(self):
        """Browser setup with Windows fixes"""
        try:
            save_progress("initializing", message="Setting up browser...")
            
            from playwright.async_api import async_playwright
            
            # Start playwright
            self.playwright = await async_playwright().start()
            print("[INFO] Playwright started")
            
            # Browser launch with Windows-specific options
            launch_options = {
                'headless': False,  # Visible for debugging
                'args': [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-blink-features=AutomationControlled'
                ]
            }
            
            # Add Windows-specific options
            if sys.platform.startswith('win'):
                launch_options['args'].extend([
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding'
                ])
            
            self.browser = await self.playwright.chromium.launch(**launch_options)
            print("[INFO] Browser launched")
            
            # Context creation
            self.context = await self.browser.new_context(
                viewport={'width': 1366, 'height': 768},
                accept_downloads=True,
                ignore_https_errors=True,
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            
            self.page = await self.context.new_page()
            await self.page.set_default_timeout(30000)
            
            print("[INFO] Browser setup complete")
            return True
            
        except Exception as e:
            save_progress("error", message=f"Browser setup error: {str(e)[:100]}")
            print(f"[ERROR] Browser setup: {e}")
            return False

    async def authenticate(self):
        """Authenticate on marchespublics.gov.ma"""
        try:
            save_progress("authenticating", message="Logging in...")
            
            # Go to homepage
            await self.page.goto("https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseHome", 
                                wait_until='networkidle')
            print("[INFO] Homepage loaded")
            
            # Click login
            await self.page.wait_for_selector("text=S'identifier", timeout=15000)
            await self.page.click("text=S'identifier")
            await self.page.wait_for_timeout(2000)
            print("[INFO] Clicked login button")
            
            # Fill credentials
            await self.page.wait_for_selector("#ctl0_CONTENU_PAGE_login")
            await self.page.fill("#ctl0_CONTENU_PAGE_login", "BTPCONSULTING")
            await self.page.fill("#ctl0_CONTENU_PAGE_password", "Imane2804")
            print("[INFO] Credentials filled")
            
            # Submit login
            await self.page.click("#ctl0_CONTENU_PAGE_authentificationButton")
            await self.page.wait_for_timeout(5000)
            print("[INFO] Login submitted")
            
            # Check if we're logged in (look for search page elements)
            try:
                await self.page.wait_for_selector("#ctl0_CONTENU_PAGE_AdvancedSearch_lancerRecherche", timeout=10000)
                print("[INFO] Authentication successful")
                return True
            except:
                print("[WARN] Redirecting to search page...")
                await self.page.goto("https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch&searchAnnCons")
                await self.page.wait_for_timeout(3000)
                return True
                
        except Exception as e:
            save_progress("error", message=f"Authentication error: {str(e)[:100]}")
            print(f"[ERROR] Authentication: {e}")
            return False

    async def launch_search(self):
        """Launch search for marchés publics"""
        try:
            save_progress("searching", message="Launching search...")
            
            # Ensure we're on search page
            if "EntrepriseAdvancedSearch" not in self.page.url:
                await self.page.goto("https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch&searchAnnCons")
                await self.page.wait_for_load_state('networkidle')
            
            # Launch search
            await self.page.wait_for_selector("#ctl0_CONTENU_PAGE_AdvancedSearch_lancerRecherche")
            await self.page.click("#ctl0_CONTENU_PAGE_AdvancedSearch_lancerRecherche")
            print("[INFO] Search launched")
            
            # Wait for results
            await self.page.wait_for_selector("table.table-results tbody tr", timeout=30000)
            print("[INFO] Results loaded")
            
            # Set pagination to 10 results
            try:
                await self.page.wait_for_selector("#ctl0_CONTENU_PAGE_resultSearch_listePageSizeTop")
                await self.page.select_option("#ctl0_CONTENU_PAGE_resultSearch_listePageSizeTop", "10")
                await self.page.wait_for_timeout(2000)
                print("[INFO] Pagination set to 10")
            except:
                print("[WARN] Could not set pagination")
            
            return True
            
        except Exception as e:
            save_progress("error", message=f"Search error: {str(e)[:100]}")
            print(f"[ERROR] Search launch: {e}")
            return False

    async def extract_real_data(self):
        """Extract REAL data from the table"""
        try:
            save_progress("extracting", message="Extracting real data...")
            
            # Get all rows
            rows = await self.page.query_selector_all("table.table-results tbody tr")
            total_rows = len(rows)
            print(f"[INFO] Found {total_rows} rows to extract")
            
            if total_rows == 0:
                print("[ERROR] No data rows found")
                return False
            
            for i, row in enumerate(rows):
                try:
                    row_data = {
                        'type_procedure': '',
                        'detail_procedure': '',
                        'categorie': '',
                        'date_publication': '',
                        'reference': f'REAL_{i+1}_{int(time.time())}',
                        'objet': '',
                        'objet_complet': '',
                        'acheteur_public': '',
                        'lieu_execution': '',
                        'lieu_execution_complet': '',
                        'lien_detail_lots': '',
                        'date_limite': '',
                        'type_reponse_electronique': '',
                        'lien_consultation': '',
                        'ref_consultation_id': '',
                        'extracted_at': datetime.now().isoformat(),
                        'row_index': i + 1,
                        'storage_link_csv': "storage/marche_public/marches_publics_data.csv",
                        'storage_link_json': "storage/marche_public/marches_publics_data.json",
                        'EXTRACTED_FILES': [],
                        'chemin_zip': ''
                    }
                    
                    # Get all cells
                    cells = await row.query_selector_all("td")
                    
                    if len(cells) >= 5:
                        # Extract procedure info (cell 1)
                        try:
                            proc_cell = cells[1]
                            proc_text = await proc_cell.text_content()
                            lines = [line.strip() for line in proc_text.split('\n') if line.strip()]
                            
                            for line in lines:
                                if re.match(r'\d{2}/\d{2}/\d{4}', line):
                                    row_data['date_publication'] = line
                                elif any(cat in line for cat in ['Fournitures', 'Travaux', 'Services']):
                                    row_data['categorie'] = line
                                elif 'Appel' in line or 'Concours' in line:
                                    row_data['type_procedure'] = line
                        except Exception as e:
                            print(f"[WARN] Procedure cell error row {i+1}: {e}")
                        
                        # Extract details (cell 2)
                        try:
                            detail_cell = cells[2]
                            
                            # Reference
                            ref_elem = await detail_cell.query_selector("span.ref")
                            if ref_elem:
                                ref_text = await ref_elem.text_content()
                                row_data['reference'] = ref_text.strip()
                            
                            # Object
                            objet_elem = await detail_cell.query_selector("div[id*='panelBlocObjet']")
                            if objet_elem:
                                objet_text = await objet_elem.text_content()
                                row_data['objet'] = objet_text.replace('Objet :', '').strip()[:200]  # Limit length
                                row_data['objet_complet'] = objet_text.replace('Objet :', '').strip()
                            
                            # Buyer
                            acheteur_elem = await detail_cell.query_selector("div[id*='panelBlocDenomination']")
                            if acheteur_elem:
                                acheteur_text = await acheteur_elem.text_content()
                                row_data['acheteur_public'] = acheteur_text.replace('Acheteur public :', '').strip()
                                
                        except Exception as e:
                            print(f"[WARN] Detail cell error row {i+1}: {e}")
                        
                        # Extract location (cell 3)
                        try:
                            lieu_cell = cells[3]
                            lieu_text = await lieu_cell.text_content()
                            row_data['lieu_execution'] = lieu_text.strip()
                            row_data['lieu_execution_complet'] = lieu_text.strip()
                        except Exception as e:
                            print(f"[WARN] Location cell error row {i+1}: {e}")
                        
                        # Extract deadline (cell 4)
                        try:
                            date_cell = cells[4]
                            date_elem = await date_cell.query_selector("div.cloture-line")
                            if date_elem:
                                date_text = await date_elem.text_content()
                                row_data['date_limite'] = date_text.strip()
                        except Exception as e:
                            print(f"[WARN] Date cell error row {i+1}: {e}")
                        
                        # Extract consultation link (cell 5 if exists)
                        if len(cells) > 5:
                            try:
                                action_cell = cells[5]
                                link_elem = await action_cell.query_selector("a[href*='EntrepriseDetailConsultation']")
                                if link_elem:
                                    href = await link_elem.get_attribute('href')
                                    if href:
                                        row_data['lien_consultation'] = href
                            except Exception as e:
                                print(f"[WARN] Action cell error row {i+1}: {e}")
                    
                    # Add to data
                    self.data.append(row_data)
                    STATS['marches_extraits'] += 1
                    
                    # Save progress
                    save_data_files(self.data)  # Save after each row
                    save_progress("extracting", i+1, total_rows, f"Extracted: {row_data['reference']}")
                    
                    print(f"[INFO] Row {i+1}/{total_rows}: {row_data['reference']} - {row_data['objet'][:50]}...")
                    
                    # Small delay between rows
                    await self.page.wait_for_timeout(300)
                    
                except Exception as e:
                    print(f"[ERROR] Row {i+1} extraction error: {e}")
                    continue
            
            print(f"[INFO] Real data extraction complete: {len(self.data)} marchés")
            return len(self.data) > 0
            
        except Exception as e:
            save_progress("error", message=f"Extraction error: {str(e)[:100]}")
            print(f"[ERROR] Data extraction: {e}")
            return False

    async def run_complete_extraction(self):
        """Complete extraction process"""
        try:
            print("[INFO] ====== STARTING REAL DATA EXTRACTION ======")
            
            if not await self.setup_browser():
                return False
                
            if not await self.authenticate():
                return False
                
            if not await self.launch_search():
                return False
                
            if not await self.extract_real_data():
                return False
            
            # Final save
            save_data_files(self.data)
            save_final_stats()
            
            duration = time.time() - STATS['start_time']
            save_progress("completed", len(self.data), len(self.data), 
                         f"Real extraction complete: {len(self.data)} marchés in {duration:.1f}s")
            
            print(f"\n[INFO] ====== EXTRACTION COMPLETE ======")
            print(f"[INFO] Duration: {duration:.2f} seconds")
            print(f"[INFO] Real marchés extracted: {len(self.data)}")
            print(f"[INFO] Files created:")
            print(f"[INFO]   JSON: {PATHS['json_file']}")
            print(f"[INFO]   CSV: {PATHS['csv_file']}")
            
            return True
            
        except Exception as e:
            save_progress("error", message=f"Complete extraction error: {str(e)[:100]}")
            print(f"[ERROR] Complete extraction: {e}")
            return False
        
        finally:
            # Cleanup
            try:
                if self.context:
                    await self.context.close()
                if self.browser:
                    await self.browser.close()
                if self.playwright:
                    await self.playwright.stop()
                print("[INFO] Browser cleanup complete")
            except Exception as e:
                print(f"[WARN] Cleanup error: {e}")

async def main():
    """Main extraction function"""
    extractor = RealDataExtractor()
    return await extractor.run_complete_extraction()

def run_with_fixed_asyncio():
    """Run extraction with Windows asyncio fixes"""
    if not fix_windows_asyncio():
        print("[ERROR] Could not fix Windows asyncio")
        return False
    
    try:
        import asyncio
        return asyncio.run(main())
    except Exception as e:
        print(f"[ERROR] Asyncio run failed: {e}")
        return False

if __name__ == "__main__":
    print("[INFO] Starting real data extraction script...")
    
    try:
        success = run_with_fixed_asyncio()
        
        if success:
            print("[INFO] ✅ REAL DATA EXTRACTION SUCCESSFUL")
            sys.exit(0)
        else:
            print("[ERROR] ❌ REAL DATA EXTRACTION FAILED")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("[INFO] Extraction interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Fatal error: {e}")
        sys.exit(1)