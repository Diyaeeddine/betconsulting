  import React, { useEffect, useState } from 'react';
  import { FileText, Upload, Download, FolderOpen, AlertCircle, Bot } from 'lucide-react';
  import AppLayout from '@/layouts/app-layout';
  import { Head } from '@inertiajs/react';
  import axios from 'axios';

  const breadcrumbs = [
    {
      title: 'Dashboard Ressources Humaines & Marchés Publics',
      href: '/ressources-humaines/marche-public-page',
    },
  ];

  type MarchePublic = {
    id: number;
    type_procedure?: string | null;
    detail_procedure?: string | null;
    categorie?: string | null;
    date_publication?: string | null;
    reference?: string | null;
    objet?: string | null;
    objet_complet?: string | null;
    acheteur_public?: string | null;
    lieu_execution?: string | null;
    lieu_execution_complet?: string | null;
    lien_detail_lots?: string | null;
    date_limite?: string | null;
    type_reponse_electronique?: string | null;
    lien_consultation?: string | null;
    ref_consultation_id?: string | null;
    extracted_at?: string | null;
    row_index?: number | null;
    storage_link_csv?: string | null;
    storage_link_json?: string | null;
    EXTRACTED_FILES?: string[] | null;
    chemin_zip?: string | null;
  };

  type ImportLabel = {
    id: string;
    name: string;
    files: FileList | null;
  };

  type ImportedDocument = {
    id: number;
    label: string;
    files: Array<{
      original_name: string;
      stored_name: string;
      path: string;
      size: number;
      mime_type: string;
      uploaded_at: string;
    }>;
    files_count: number;
    total_size: number;
    created_at: string;
    updated_at: string;
  };

  export default function MarchePublic() {
    const [marchesPublics, setMarchesPublics] = useState<MarchePublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [extractedFiles, setExtractedFiles] = useState<string[]>([]);
    const [showExtractedFiles, setShowExtractedFiles] = useState(false);
    const [currentMarche, setCurrentMarche] = useState<string | null>(null);

    const [filterReference, setFilterReference] = useState('');
    const [filterAcheteurPublic, setFilterAcheteurPublic] = useState('');
    const [filterCategorie, setFilterCategorie] = useState('');
    const [filterDatePublication, setFilterDatePublication] = useState('');
    const [filterTypeProcedure, setFilterTypeProcedure] = useState('');

    // État pour le bouton d'actualisation
    const [refreshing, setRefreshing] = useState(false);

    // États pour la popup d'import avec labels
    const [showImportModal, setShowImportModal] = useState(false);
    const [currentMarcheForImport, setCurrentMarcheForImport] = useState<MarchePublic | null>(null);
    const [importLabels, setImportLabels] = useState<ImportLabel[]>([]);
    const [importing, setImporting] = useState(false);

    // États pour afficher les documents importés
    const [showImportedDocs, setShowImportedDocs] = useState(false);
    const [importedDocuments, setImportedDocuments] = useState<ImportedDocument[]>([]);
    const [loadingImportedDocs, setLoadingImportedDocs] = useState(false);

    // États pour l'automatisation Selenium
    const [automationStatus, setAutomationStatus] = useState<{[key: number]: 'idle' | 'running' | 'success' | 'error'}>({});
    const [automationMessages, setAutomationMessages] = useState<{[key: number]: string}>({});

    const fetchMarchesPublics = () => {
      axios
        .get('/ressources-humaines/marches-publics-data')
        .then((res) => setMarchesPublics(res.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
      fetchMarchesPublics();
    }, []);

    const formatDate = (dateString?: string | null): string => {
      if (!dateString) return '---';
      try {
        return new Date(dateString).toLocaleDateString('fr-FR');
      } catch {
        return dateString;
      }
    };

    const formatDateTime = (dateString?: string | null): string => {
      if (!dateString) return '---';
      try {
        return new Date(dateString).toLocaleString('fr-FR');
      } catch {
        return dateString;
      }
    };

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Listes pour les filtres
    const acheteursPublics = Array.from(new Set(marchesPublics.map((mp) => mp.acheteur_public).filter(Boolean)));
    const categories = Array.from(new Set(marchesPublics.map((mp) => mp.categorie).filter(Boolean)));
    const typesProcedure = Array.from(new Set(marchesPublics.map((mp) => mp.type_procedure).filter(Boolean)));

    const filteredMarchesPublics = marchesPublics.filter((mp) => {
      const matchReference = filterReference
        ? (mp.reference || '').toLowerCase().includes(filterReference.toLowerCase())
        : true;

      const matchAcheteurPublic = filterAcheteurPublic
        ? (mp.acheteur_public || '').toLowerCase().includes(filterAcheteurPublic.toLowerCase())
        : true;

      const matchCategorie = filterCategorie
        ? (mp.categorie || '').toLowerCase().includes(filterCategorie.toLowerCase())
        : true;

      const matchDatePublication = filterDatePublication
        ? mp.date_publication === filterDatePublication
        : true;

      const matchTypeProcedure = filterTypeProcedure
        ? (mp.type_procedure || '').toLowerCase().includes(filterTypeProcedure.toLowerCase())
        : true;

      return matchReference && matchAcheteurPublic && matchCategorie && matchDatePublication && matchTypeProcedure;
    });

    const handleShowExtractedFiles = (files: string[], marcheReference: string) => {
      let parsedFiles = files;
      if (typeof files === 'string') {
        try {
          parsedFiles = JSON.parse(files);
        } catch (error) {
          console.error('Erreur lors du parsing JSON:', error);
          parsedFiles = [];
        }
      }
      setExtractedFiles(parsedFiles);
      setCurrentMarche(marcheReference);
      setShowExtractedFiles(true);
    };

    const handleOpenFile = (filePath: string) => {
      const cleanPath = filePath.replace(/^\/+/, '');
      const downloadUrl = `/ressources-humaines/download-file?path=${encodeURIComponent(filePath)}`;
      console.log('Tentative d\'ouverture du fichier:', filePath);
      console.log('URL de téléchargement:', downloadUrl);
      window.open(downloadUrl, '_blank');
    };

    const handleRefresh = () => {
      setRefreshing(true);
      axios
        .get('/ressources-humaines/fetch-marche-public')
        .then(() => {
          fetchMarchesPublics();
        })
        .catch((err) => {
          console.error(err);
          setError("Erreur lors de l'actualisation");
        })
        .finally(() => setRefreshing(false));
    };

    const getStatusBadgeColor = (typeProcedure?: string | null) => {
      switch (typeProcedure?.toLowerCase()) {
        case 'appel d\'offres ouvert':
          return 'bg-green-100 text-green-800';
        case 'appel d\'offres restreint':
          return 'bg-orange-100 text-orange-800';
        case 'concours':
          return 'bg-blue-100 text-blue-800';
        case 'consultation':
          return 'bg-purple-100 text-purple-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const handleImportClick = (marche: MarchePublic) => {
      setCurrentMarcheForImport(marche);
      setImportLabels([{ id: Date.now().toString(), name: '', files: null }]);
      setShowImportModal(true);
    };

    const addLabel = () => {
      setImportLabels(prev => [
        ...prev,
        { id: Date.now().toString(), name: '', files: null }
      ]);
    };

    const removeLabel = (labelId: string) => {
      setImportLabels(prev => prev.filter(label => label.id !== labelId));
    };

    const updateLabelName = (labelId: string, name: string) => {
      setImportLabels(prev => prev.map(label =>
        label.id === labelId ? { ...label, name } : label
      ));
    };

    const updateLabelFiles = (labelId: string, files: FileList | null) => {
      setImportLabels(prev => prev.map(label =>
        label.id === labelId ? { ...label, files } : label
      ));
    };

    const handleImportSubmit = async () => {
      if (!currentMarcheForImport) return;

      setImporting(true);
      
      try {
        const formData = new FormData();
        
        // Ajouter les informations du marché
        formData.append('marche_id', currentMarcheForImport.id.toString());
        formData.append('reference', currentMarcheForImport.reference || '');

        // Ajouter les labels et leurs fichiers
        importLabels.forEach((label, labelIndex) => {
          if (label.name.trim() && label.files && label.files.length > 0) {
            formData.append(`labels[${labelIndex}][name]`, label.name.trim());

            Array.from(label.files).forEach((file, fileIndex) => {
              formData.append(`labels[${labelIndex}][files][${fileIndex}]`, file);
            });
          }
        });

        // Appel à l'API pour sauvegarder dans la BD et uploader les fichiers
        const response = await axios.post('/ressources-humaines/imported-documents', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('✅ Import réussi:', response.data);
        
        // Afficher le résumé de l'import
        const { data } = response.data;
        alert(`Documents importés avec succès !\n\n` +
              `- ${data.labels_processed} labels traités\n` +
              `- ${data.total_files} fichiers uploadés\n` +
              `- Stockés dans: storage/app/public/${data.base_path}`);
        
        // Recharger les données si besoin
        fetchMarchesPublics();
        
        // Fermer le modal
        setShowImportModal(false);
        setImportLabels([]);
        setCurrentMarcheForImport(null);
        
      } catch (error) {
        console.error('❌ Erreur import:', error);
        
        let errorMessage = "Erreur lors de l'import des documents.";
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 422) {
            // Erreur de validation
            const validationErrors = error.response.data.errors;
            errorMessage = "Erreurs de validation:\n" + Object.values(validationErrors).flat().join('\n');
          } else {
            errorMessage = error.response.data.message || errorMessage;
          }
        }
        
        alert(errorMessage);
      } finally {
        setImporting(false);
      }
    };

    const handleShowImportedDocuments = async (marche: MarchePublic) => {
      setCurrentMarcheForImport(marche);
      setLoadingImportedDocs(true);
      setShowImportedDocs(true);
      
      try {
        const response = await axios.get(`/ressources-humaines/imported-documents/${marche.id}`);
        setImportedDocuments(response.data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des documents:', error);
        setImportedDocuments([]);
      } finally {
        setLoadingImportedDocs(false);
      }
    };

    const handleDownloadImportedFile = (filePath: string, fileName: string) => {
      const downloadUrl = `/ressources-humaines/download-imported-file?path=${encodeURIComponent(filePath)}`;
      
      // Créer un lien temporaire pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // 🤖 NOUVELLE FONCTION : Gestion du clic sur Consulter avec automatisation Selenium
    const handleConsulterClick = async (marche: MarchePublic) => {
      if (!marche.lien_consultation) {
        alert('Aucun lien de consultation disponible pour ce marché.');
        return;
      }

      try {
        console.log('🚀 Clic sur Consulter pour:', marche.reference);
        console.log('🌐 URL de consultation:', marche.lien_consultation);

        // 1. Ouvrir le lien dans un nouvel onglet (comportement normal)
        window.open(marche.lien_consultation, '_blank', 'noopener,noreferrer');

        // 2. Lancer l'automatisation Selenium
        setAutomationStatus(prev => ({
          ...prev,
          [marche.id]: 'running'
        }));

        setAutomationMessages(prev => ({
          ...prev,
          [marche.id]: 'Lancement de l\'automatisation Selenium...'
        }));

        const response = await axios.post('/ressources-humaines/automate-consultation', {
          consultation_url: marche.lien_consultation,
          marche_reference: marche.reference || `marche_${marche.id}`,
          marche_id: marche.id,
        });

        console.log('✅ Réponse automatisation:', response.data);

        if (response.data.success) {
          setAutomationStatus(prev => ({
            ...prev,
            [marche.id]: 'success'
          }));

          setAutomationMessages(prev => ({
            ...prev,
            [marche.id]: response.data.message || 'Automatisation terminée avec succès !'
          }));

          // Afficher les détails du succès
          const details = response.data.details;
          let successMessage = '🎉 Automatisation Selenium terminée avec succès !\n\n';

          if (details?.steps_completed && details.steps_completed.length > 0) {
            successMessage += 'Étapes complétées :\n';
            details.steps_completed.forEach((step: string) => {
              successMessage += `✓ ${step}\n`;
            });
          }

          alert(successMessage);

        } else {
          throw new Error(response.data.message || 'Erreur inconnue lors de l\'automatisation');
        }

      } catch (error) {
        console.error('❌ Erreur automatisation:', error);

        setAutomationStatus(prev => ({
          ...prev,
          [marche.id]: 'error'
        }));

        let errorMessage = 'Erreur lors de l\'automatisation Selenium';

        if (axios.isAxiosError(error) && error.response) {
          const responseData = error.response.data;
          errorMessage = responseData.message || errorMessage;

          // Afficher les détails de l'erreur si disponibles
          if (responseData.details?.errors && responseData.details.errors.length > 0) {
            errorMessage += '\n\nDétails :\n' + responseData.details.errors.join('\n');
          }
        }

        setAutomationMessages(prev => ({
          ...prev,
          [marche.id]: errorMessage
        }));

        alert(`❌ ${errorMessage}`);
      }
    };

    // Fonction pour obtenir l'icône du statut d'automatisation
    const getAutomationStatusIcon = (marcheId: number) => {
      const status = automationStatus[marcheId] || 'idle';

      switch (status) {
        case 'running':
          return (
            <div className="inline-flex items-center">
              <svg className="animate-spin h-3 w-3 text-blue-600 mr-1" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span className="text-xs text-blue-600">Selenium en cours...</span>
            </div>
          );
        case 'success':
          return <span className="text-xs text-green-600 flex items-center"><Bot className="w-3 h-3 mr-1"/>✅ Automatisé</span>;
        case 'error':
          return <span className="text-xs text-red-600 flex items-center"><Bot className="w-3 h-3 mr-1"/>❌ Erreur</span>;
        default:
          return null;
      }
    };

    const canSubmit = importLabels.some(label =>
      label.name.trim() && label.files && label.files.length > 0
    );

    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Dashboard Ressources Humaines - Marchés Publics" />
        
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Marchés Publics</h1>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded shadow flex items-center gap-2 transition-colors"
              disabled={refreshing}
            >
              {refreshing && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              )}
              {refreshing ? 'Actualisation...' : 'Actualiser les marchés'}
            </button>
          </div>

          {/* Filtres */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4 grid grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Référence</label>
              <input
                type="text"
                value={filterReference}
                onChange={(e) => setFilterReference(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filtrer par référence"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Acheteur Public</label>
              <input
                type="text"
                value={filterAcheteurPublic}
                onChange={(e) => setFilterAcheteurPublic(e.target.value)}
                list="acheteurs-publics"
                className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filtrer par acheteur"
              />
              <datalist id="acheteurs-publics">
                {acheteursPublics.map((ap, i) => (
                  <option key={i} value={ap || ''} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
              <input
                type="text"
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
                list="categories"
                className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filtrer par catégorie"
              />
              <datalist id="categories">
                {categories.map((cat, i) => (
                  <option key={i} value={cat || ''} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date Publication</label>
              <input
                type="date"
                value={filterDatePublication}
                onChange={(e) => setFilterDatePublication(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type Procédure</label>
              <input
                type="text"
                value={filterTypeProcedure}
                onChange={(e) => setFilterTypeProcedure(e.target.value)}
                list="types-procedure"
                className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filtrer par type"
              />
              <datalist id="types-procedure">
                {typesProcedure.map((tp, i) => (
                  <option key={i} value={tp || ''} />
                ))}
              </datalist>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <span className="text-gray-600">Chargement des marchés publics...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {!loading && !error && filteredMarchesPublics.length > 0 && (
            <div className="space-y-6">
              {filteredMarchesPublics.map((marche, index) => (
                <div key={index} className="border border-gray-200 rounded-lg shadow-md bg-white overflow-hidden">
                  <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="font-bold">Référence :</span> 
                      <span className="font-mono">{marche.reference || '---'}</span>
                      {marche.type_procedure && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(marche.type_procedure)}`}>
                          {marche.type_procedure}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Date Publication :</span> 
                      <span>{formatDate(marche.date_publication)}</span>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                    <p>
                      <span className="font-bold text-gray-700">Acheteur Public :</span> 
                      <span className="text-gray-600 ml-1">{marche.acheteur_public || '---'}</span>
                    </p>
                    <p>
                      <span className="font-bold text-gray-700">Catégorie :</span> 
                      <span className="text-gray-600 ml-1">{marche.categorie || '---'}</span>
                    </p>
                    <p>
                      <span className="font-bold text-gray-700">Objet :</span> 
                      <span className="text-gray-600 ml-1">{marche.objet || '---'}</span>
                    </p>
                    <p>
                      <span className="font-bold text-gray-700">Lieu Exécution :</span> 
                      <span className="text-gray-600 ml-1">{marche.lieu_execution || '---'}</span>
                    </p>
                    <p>
                      <span className="font-bold text-gray-700">Date Limite :</span> 
                      <span className="text-gray-600 ml-1">{formatDateTime(marche.date_limite)}</span>
                    </p>
                    <p>
                      <span className="font-bold text-gray-700">Type Réponse :</span> 
                      <span className="text-gray-600 ml-1">{marche.type_reponse_electronique || '---'}</span>
                    </p>
                  </div>

                  {marche.objet_complet && marche.objet_complet !== marche.objet && (
                    <div className="p-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-700 mb-2">Objet Complet</h3>
                      <p className="text-sm text-gray-600">{marche.objet_complet}</p>
                    </div>
                  )}

                  {marche.lieu_execution_complet && marche.lieu_execution_complet !== marche.lieu_execution && (
                    <div className="p-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-700 mb-2">Lieu d'Exécution Complet</h3>
                      <p className="text-sm text-gray-600">{marche.lieu_execution_complet}</p>
                    </div>
                  )}

                  {/* 🤖 Affichage du statut d'automatisation */}
                  {automationStatus[marche.id] && (
                    <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Automatisation Selenium :</span>
                        {getAutomationStatusIcon(marche.id)}
                      </div>
                      {automationMessages[marche.id] && (
                        <p className="text-xs text-gray-600 mt-1">{automationMessages[marche.id]}</p>
                      )}
                    </div>
                  )}

                  <div className="p-4 border-t border-gray-200 flex gap-2 justify-end flex-wrap">
                    {/* 🤖 BOUTON CONSULTER MODIFIÉ AVEC AUTOMATISATION SELENIUM */}
                    {marche.lien_consultation && (
                      <button
                        onClick={() => handleConsulterClick(marche)}
                        disabled={automationStatus[marche.id] === 'running'}
                        className={`${
                          automationStatus[marche.id] === 'running' 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white px-3 py-1 rounded text-sm flex items-center gap-2 transition-colors`}
                      >
                        {automationStatus[marche.id] === 'running' ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            Automation...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            Consulter
                            {automationStatus[marche.id] === 'success' && <Bot className="w-4 h-4 text-green-400" />}
                            {automationStatus[marche.id] === 'error' && <Bot className="w-4 h-4 text-red-400" />}
                          </>
                        )}
                      </button>
                    )}

                    {marche.EXTRACTED_FILES && marche.EXTRACTED_FILES.length > 0 && (
                      <button
                        onClick={() => handleShowExtractedFiles(marche.EXTRACTED_FILES!, marche.reference || 'N/A')}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2 transition-colors"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Ouvrir dossier
                      </button>
                    )}

                    {marche.categorie?.toLowerCase() === 'services' && (
                      <>
                        <button
                          onClick={() => handleImportClick(marche)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          Importer
                        </button>
                        
                        <button
                          onClick={() => handleShowImportedDocuments(marche)}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Docs importés
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredMarchesPublics.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun marché public trouvé avec les filtres actuels.</p>
              <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos critères de recherche.</p>
            </div>
          )}

          {/* Modal pour afficher les fichiers extraits */}
          {showExtractedFiles && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full m-4 max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Fichiers Extraits - {currentMarche}
                  </h3>
                  <button
                    onClick={() => setShowExtractedFiles(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2">
                  {Array.isArray(extractedFiles) && extractedFiles.map((file, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm truncate flex-1 text-gray-700">{file}</span>
                      <button
                        onClick={() => handleOpenFile(file)}
                        className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Ouvrir
                      </button>
                    </div>
                  ))}
                  {(!Array.isArray(extractedFiles) || extractedFiles.length === 0) && (
                    <p className="text-gray-500 text-center py-8">Aucun fichier extrait disponible</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal pour l'import de documents avec labels */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full m-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Importer des documents - {currentMarcheForImport?.reference}
                  </h3>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-6">
                  {importLabels.map((label, index) => (
                    <div key={label.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom du label {index + 1}
                          </label>
                          <input
                            type="text"
                            value={label.name}
                            onChange={(e) => updateLabelName(label.id, e.target.value)}
                            placeholder="Entrez le nom du label (ex: Pièces techniques, Documents administratifs...)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        {importLabels.length > 1 && (
                          <button
                            onClick={() => removeLabel(label.id)}
                            className="mt-6 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm transition-colors"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Documents pour "{label.name || `Label ${index + 1}`}"
                        </label>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => updateLabelFiles(label.id, e.target.files)}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Sélectionnez un ou plusieurs fichiers de tous types
                        </p>
                      </div>

                      {label.files && label.files.length > 0 && (
                        <div className="bg-white rounded border border-gray-200 p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Fichiers sélectionnés ({label.files.length}) :
                          </h4>
                          <div className="max-h-24 overflow-y-auto">
                            {Array.from(label.files).map((file, fileIndex) => (
                              <div key={fileIndex} className="flex justify-between items-center text-sm text-gray-600 py-1">
                                <span className="font-medium truncate flex-1">{file.name}</span>
                                <span className="text-gray-400 ml-2">
                                  ({formatFileSize(file.size)})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={addLabel}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2 transition-colors"
                  >
                    <span>+</span>
                    Ajouter un nouveau label
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowImportModal(false)}
                      className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleImportSubmit}
                      disabled={!canSubmit || importing}
                      className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {importing && (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      )}
                      {importing ? 'Import en cours...' : 'Importer tous les documents'}
                    </button>
                  </div>
                </div>

                {!canSubmit && !importing && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Veuillez ajouter au moins un label avec un nom et des fichiers pour pouvoir importer
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Modal pour afficher les documents importés */}
          {showImportedDocs && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full m-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Documents Importés - {currentMarcheForImport?.reference}
                  </h3>
                  <button
                    onClick={() => setShowImportedDocs(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                {loadingImportedDocs ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      <span className="text-gray-600">Chargement des documents...</span>
                    </div>
                  </div>
                ) : importedDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {importedDocuments.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-semibold text-gray-800">{doc.label}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{doc.files_count} fichier(s)</span>
                            <span>•</span>
                            <span>{formatFileSize(doc.total_size)}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {doc.files.map((file, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-700">{file.original_name}</span>
                                <div className="text-xs text-gray-500 mt-1">
                                  Taille: {formatFileSize(file.size)} • Type: {file.mime_type}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownloadImportedFile(file.path, file.original_name)}
                                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                              >
                                <Download className="w-3 h-3" />
                                Télécharger
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-3">
                          Importé le {formatDateTime(doc.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Aucun document importé pour ce marché</p>
                    <p className="text-gray-400 text-sm mt-2">Utilisez le bouton "Importer" pour ajouter des documents</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }