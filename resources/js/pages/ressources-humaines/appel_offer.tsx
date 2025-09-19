"use client"

import { useEffect, useState } from "react"
import AppLayout from "@/layouts/app-layout"

const breadcrumbs = [
  {
    title: "Dashboard Ressources Humaines & Appels d'Offres",
    href: "/ressources-humaines/appel-offer",
  },
]

type AppelOffer = {
  id: number
  reference?: string | null
  maitre_ouvrage?: string | null
  pv?: string | null
  date_ouverture?: string | null
  budget?: string | null
  lien_dao?: string | null
  lien_pv?: string | null
  dao?: string | null
  date_adjudications?: string | null
  ville?: string | null
  montant?: string | null
  objet?: string | null
  adjudicataire?: string | null
  date_affichage?: string | null
  chemin_fichiers?: string[] | null
}

export default function AppelOffer() {
  const [appelOffres, setAppelOffres] = useState<AppelOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [daoFiles, setDaoFiles] = useState<{ name: string; path: string }[]>([])
  const [showDaoFiles, setShowDaoFiles] = useState(false)
  const [currentZip, setCurrentZip] = useState<string | null>(null)
  const [loadingDao, setLoadingDao] = useState(false)

  const [filterMaitreOuvrage, setFilterMaitreOuvrage] = useState("")
  const [filterDateOuverture, setFilterDateOuverture] = useState("")
  const [filterBudget, setFilterBudget] = useState("")
  const [filterReference, setFilterReference] = useState("")

  // État pour le bouton d'actualisation
  const [refreshing, setRefreshing] = useState(false)

  const fetchAppelOffres = () => {
    // Simulate API call with mock data
    setTimeout(() => {
      const mockData: AppelOffer[] = [
        {
          id: 1,
          reference: "AO-2024-001",
          maitre_ouvrage: "Ministère de l'Équipement",
          date_ouverture: "2024-01-15",
          budget: "5000000 DH",
          ville: "Casablanca",
          objet: "Construction d'un pont autoroutier",
          adjudicataire: "BTP Consulting",
          date_adjudications: "2024-02-01",
          date_affichage: "2024-01-01",
          montant: "4800000 DH",
          lien_dao: "/mock/dao1.zip",
          lien_pv: "/mock/pv1.pdf",
          pv: "Procès-verbal d'ouverture des plis - 3 soumissionnaires",
        },
        {
          id: 2,
          reference: "AO-2024-002",
          maitre_ouvrage: "Commune de Rabat",
          date_ouverture: "2024-01-20",
          budget: "2000000 DH",
          ville: "Rabat",
          objet: "Aménagement urbain centre-ville",
          adjudicataire: null,
          date_adjudications: null,
          date_affichage: "2024-01-05",
          montant: null,
          lien_dao: "/mock/dao2.zip",
          lien_pv: null,
          pv: null,
        },
      ]

      setAppelOffres(mockData)
      setLoading(false)
    }, 1000)
  }

  useEffect(() => {
    fetchAppelOffres()
  }, [])

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "---"
    try {
      return new Date(dateString).toLocaleDateString("fr-FR")
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount?: string | null): string => {
    if (!amount) return "---"
    return amount.includes("DH") ? amount : `${amount} DH`
  }

  const maitresOuvrageList = Array.from(new Set(appelOffres.map((ao) => ao.maitre_ouvrage).filter(Boolean)))

  const filteredAppelOffres = appelOffres.filter((ao) => {
    const matchMaitreOuvrage = filterMaitreOuvrage
      ? (ao.maitre_ouvrage || "").toLowerCase().includes(filterMaitreOuvrage.toLowerCase())
      : true

    const matchDate = filterDateOuverture ? ao.date_ouverture === filterDateOuverture : true

    const matchBudget = filterBudget ? (ao.budget || "").includes(filterBudget) : true

    const matchReference = filterReference
      ? (ao.reference || "").toLowerCase().includes(filterReference.toLowerCase())
      : true

    return matchMaitreOuvrage && matchDate && matchBudget && matchReference
  })

  const handleOpenDao = (zipUrl: string) => {
    setLoadingDao(true)
    setTimeout(() => {
      const mockFiles = [
        { name: "Cahier_des_charges.pdf", path: "/mock/cahier.pdf" },
        { name: "Plans_techniques.dwg", path: "/mock/plans.dwg" },
        { name: "Devis_quantitatif.xlsx", path: "/mock/devis.xlsx" },
      ]
      setDaoFiles(mockFiles)
      setCurrentZip(zipUrl)
      setShowDaoFiles(true)
      setLoadingDao(false)
    }, 500)
  }

  const handleDownloadFile = (filePath: string) => {
    console.log(`Downloading file: ${filePath}`)
    alert(`Téléchargement simulé: ${filePath}`)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    console.log("[v0] Starting refresh process...")

    setTimeout(() => {
      console.log("[v0] Mock refresh completed")
      fetchAppelOffres()
      setRefreshing(false)
    }, 2000)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Résultats des Appels d'Offres</h1>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded shadow flex items-center gap-2"
            disabled={refreshing}
          >
            {refreshing && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            )}
            {refreshing ? "Actualisation..." : "Actualiser les résultats"}
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-gray-100 p-4 rounded-lg shadow mb-4 grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Maître d'Ouvrage</label>
            <input
              type="text"
              value={filterMaitreOuvrage}
              onChange={(e) => setFilterMaitreOuvrage(e.target.value)}
              list="maitres-ouvrage"
              className="border rounded px-2 py-1 w-full"
              placeholder="Filtrer par maître d'ouvrage"
            />
            <datalist id="maitres-ouvrage">
              {maitresOuvrageList.map((mo, i) => (
                <option key={i} value={mo || ""} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Date d'Ouverture</label>
            <input
              type="date"
              value={filterDateOuverture}
              onChange={(e) => setFilterDateOuverture(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Budget</label>
            <input
              type="text"
              value={filterBudget}
              onChange={(e) => setFilterBudget(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              placeholder="Filtrer par budget"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Référence</label>
            <input
              type="text"
              value={filterReference}
              onChange={(e) => setFilterReference(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              placeholder="Filtrer par référence"
            />
          </div>
        </div>

        {loading && <p>Chargement des appels d'offres...</p>}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <div>
              <strong className="font-bold">Erreur: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 font-bold text-xl">
              ×
            </button>
          </div>
        )}

        {!loading && !error && filteredAppelOffres.length > 0 && (
          <div className="space-y-6">
            {filteredAppelOffres.map((appelOffre, index) => (
              <div key={index} className="border rounded-lg shadow-md bg-white">
                <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold">Référence :</span> {appelOffre.reference || "---"}
                  </div>
                  <div>
                    <span className="font-bold">Date d'Ouverture :</span> {formatDate(appelOffre.date_ouverture)}
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <p>
                    <span className="font-bold">Maître d'Ouvrage :</span> {appelOffre.maitre_ouvrage || "---"}
                  </p>
                  <p>
                    <span className="font-bold">Objet :</span> {appelOffre.objet || "---"}
                  </p>
                  <p>
                    <span className="font-bold">Ville :</span> {appelOffre.ville || "---"}
                  </p>
                  <p>
                    <span className="font-bold">Budget :</span> {formatCurrency(appelOffre.budget)}
                  </p>
                  <p>
                    <span className="font-bold">Montant :</span> {formatCurrency(appelOffre.montant)}
                  </p>
                  <p>
                    <span className="font-bold">Adjudicataire :</span> {appelOffre.adjudicataire || "---"}
                  </p>
                  <p>
                    <span className="font-bold">Date d'Adjudication :</span> {formatDate(appelOffre.date_adjudications)}
                  </p>
                  <p>
                    <span className="font-bold">Date d'Affichage :</span> {formatDate(appelOffre.date_affichage)}
                  </p>
                </div>

                {appelOffre.pv && (
                  <div className="p-4 border-t">
                    <h3 className="font-semibold mb-2">Procès-Verbal</h3>
                    <p className="text-sm">{appelOffre.pv}</p>
                  </div>
                )}

                <div className="p-4 border-t flex gap-2 justify-end">
                  {appelOffre.lien_pv && (
                    <button
                      onClick={() => handleDownloadFile(appelOffre.lien_pv!)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                    >
                      Télécharger PV
                    </button>
                  )}

                  {appelOffre.lien_dao && (
                    <>
                      <button
                        onClick={() => handleDownloadFile(appelOffre.lien_dao!)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Télécharger D.A.O
                      </button>

                      <button
                        onClick={() => handleOpenDao(appelOffre.lien_dao!)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      >
                        Ouvrir D.A.O
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredAppelOffres.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">Aucun appel d'offres trouvé</p>
            <p className="text-gray-400 text-sm mt-2">Essayez d'actualiser ou de modifier vos filtres</p>
          </div>
        )}

        {showDaoFiles && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-4 rounded max-h-full overflow-y-auto w-full max-w-md">
              <h3 className="font-bold mb-2">Fichiers D.A.O</h3>
              <ul className="space-y-1">
                {daoFiles.map((file, i) => (
                  <li key={i}>
                    <button onClick={() => handleDownloadFile(file.path)} className="text-blue-600 hover:underline">
                      {file.name}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowDaoFiles(false)}
                className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {loadingDao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="animate-spin h-12 w-12 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-white font-bold text-lg">Chargement D.A.O...</span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
