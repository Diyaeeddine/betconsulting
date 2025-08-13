// Types pour les innovations
export interface Innovation {
  id: number;
  titre: string;
  description: string;
  type: 'produit' | 'service' | 'processus' | 'technologie';
  statut: 'idee' | 'en_cours' | 'teste' | 'implemente' | 'abandonne';
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  budget_estime?: number;
  budget_reel?: number;
  date_debut?: string;
  date_fin_prevue?: string;
  date_fin_reelle?: string;
  responsable_id?: number;
  equipe_ids?: number[];
  created_at: string;
  updated_at: string;
  responsable?: User;
  equipe?: User[];
  taches?: TacheInnovation[];
  kpis?: KpiInnovation[];
}

// Types pour les tâches d'innovation
export interface TacheInnovation {
  id: number;
  innovation_id: number;
  titre: string;
  description?: string;
  statut: 'a_faire' | 'en_cours' | 'termine' | 'bloque';
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  assignee_id?: number;
  date_debut?: string;
  date_fin_prevue?: string;
  date_fin_reelle?: string;
  temps_estime?: number;
  temps_reel?: number;
  created_at: string;
  updated_at: string;
  innovation?: Innovation;
  assignee?: User;
}

// Types pour les KPIs d'innovation
export interface KpiInnovation {
  id: number;
  innovation_id: number;
  nom: string;
  description?: string;
  type: 'nombre' | 'pourcentage' | 'montant' | 'duree';
  valeur_cible?: number;
  valeur_actuelle?: number;
  unite?: string;
  frequence_mesure: 'quotidien' | 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel';
  date_derniere_mesure?: string;
  created_at: string;
  updated_at: string;
  innovation?: Innovation;
}

// Types pour les tickets de support
export interface TicketSupport {
  id: number;
  titre: string;
  description: string;
  type: string;
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  demandeur_id: number;
  assignee_id?: number;
  created_at: string;
  updated_at: string;
  demandeur?: User;
  assignee?: User;
}

// Types pour les utilisateurs
export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

// Types pour les filtres
export interface InnovationFilters {
  search?: string;
  type?: string;
  statut?: string;
  priorite?: string;
  responsable_id?: number;
}

export interface TacheFilters {
  search?: string;
  statut?: string;
  priorite?: string;
  assignee_id?: number;
  innovation_id?: number;
}

export interface TicketFilters {
  search?: string;
  type?: string;
  priorite?: string;
  statut?: string;
  demandeur_id?: number;
  assignee_id?: number;
}

// Types pour les réponses paginées
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Types pour les statistiques du dashboard
export interface DashboardStats {
  innovations: {
    total: number;
    en_cours: number;
    terminees: number;
    abandonnees: number;
  };
  taches: {
    total: number;
    a_faire: number;
    en_cours: number;
    terminees: number;
    bloquees: number;
  };
  tickets: {
    total: number;
    ouverts: number;
    en_cours: number;
    resolus: number;
    fermes: number;
  };
  kpis: {
    total: number;
    atteints: number;
    en_cours: number;
    non_atteints: number;
  };
}
