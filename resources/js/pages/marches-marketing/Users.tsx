import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Briefcase, Eye, FileText, Mail, Phone, Search, User, Users as UsersIcon, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Salarie {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    poste?: string;
    nom_profil: string;
    salaire_mensuel: number;
    date_embauche?: string;
    statut: 'actif' | 'inactif';
    projet_ids: string;
    created_at: string;
    competences?: string[];
    charge_travail?: number;
}

interface MarchePublic {
    id: number;
    reference: string;
    objet: string;
    maitre_ouvrage: string;
    statut: 'detecte' | 'evalue' | 'en_preparation' | 'soumis' | 'gagne' | 'perdu' | 'annule';
    type_marche: 'etudes' | 'assistance_technique' | 'batiment' | 'voirie' | 'hydraulique';
    urgence: 'faible' | 'moyenne' | 'elevee';
    date_limite_soumission: string;
    montant: string;
    ville: string;
}

interface Props {
    salaries: Salarie[];
    marches: MarchePublic[];
}

export default function Users({ salaries = [], marches = [] }: Props) {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [selectedUser, setSelectedUser] = useState<Salarie | null>(null);

    // États pour les filtres
    const [filters, setFilters] = useState({
        nom: '',
        prenom: '',
        email: '',
        poste: '',
        telephone: '',
        statut: 'all',
        nom_profil: 'all',
    });

    const breadcrumbs = [
        {
            title: 'Marché Marketing',
            href: '/marches-marketing',
        },
        {
            title: 'Équipe BTP',
            href: '/marches-marketing/users',
        },
    ];

    // Filtrage des salariés selon le profil
    const filteredSalaries = useMemo(() => {
        return salaries.filter((salarie) => {
            const matchNom = !filters.nom || salarie.nom.toLowerCase().includes(filters.nom.toLowerCase());
            const matchPrenom = !filters.prenom || salarie.prenom.toLowerCase().includes(filters.prenom.toLowerCase());
            const matchEmail = !filters.email || salarie.email.toLowerCase().includes(filters.email.toLowerCase());
            const matchPoste = !filters.poste || (salarie.poste && salarie.poste.toLowerCase().includes(filters.poste.toLowerCase()));
            const matchTelephone = !filters.telephone || salarie.telephone.includes(filters.telephone);
            const matchStatut = filters.statut === 'all' || salarie.statut === filters.statut;
            const matchProfil = filters.nom_profil === 'all' || salarie.nom_profil === filters.nom_profil;

            return matchNom && matchPrenom && matchEmail && matchPoste && matchTelephone && matchStatut && matchProfil;
        });
    }, [salaries, filters]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Non définie';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatSalary = (salary: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MAD',
            minimumFractionDigits: 0,
        }).format(salary);
    };

    const getProjectCount = (projectIds: string) => {
        try {
            const projects = JSON.parse(projectIds);
            return Array.isArray(projects) ? projects.length : 0;
        } catch {
            return 0;
        }
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    };

    const toggleAllUsers = () => {
        setSelectedUsers((prev) => (prev.length === filteredSalaries.length ? [] : filteredSalaries.map((s) => s.id)));
    };

    const clearFilters = () => {
        setFilters({
            nom: '',
            prenom: '',
            email: '',
            poste: '',
            telephone: '',
            statut: 'all',
            nom_profil: 'all',
        });
    };

    const getChargeColor = (charge?: number) => {
        if (!charge) return 'bg-green-100 text-green-700';
        if (charge < 50) return 'bg-green-100 text-green-700';
        if (charge < 80) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    const getFilterCount = () => {
        return Object.entries(filters).filter(([key, value]) => (key !== 'statut' && key !== 'nom_profil' ? value !== '' : value !== 'all')).length;
    };

    const uniqueProfils = [...new Set(salaries.map((s) => s.nom_profil))];

    const viewUserDetails = (user: Salarie) => {
        setSelectedUser(user);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* En-tête */}
                    <div className="mb-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <UsersIcon className="h-5 w-5 text-gray-600" />
                                    <span className="text-lg font-medium text-gray-900">
                                        {filteredSalaries.length} / {salaries.length} membres BTP
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Briefcase className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm text-blue-600">
                                        {marches.filter((m) => m.statut === 'en_preparation').length} marchés en préparation
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Filtres */}
                        <Card className="mb-4 border-gray-200 bg-white shadow-sm">
                            <CardContent className="p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                        <Search className="h-4 w-4" />
                                        <span>Filtres de recherche</span>
                                        {getFilterCount() > 0 && (
                                            <Badge variant="outline" className="ml-2">
                                                {getFilterCount()}
                                            </Badge>
                                        )}
                                    </h3>
                                    {getFilterCount() > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Effacer tout</span>
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-600">Nom</label>
                                        <Input
                                            placeholder="Nom"
                                            value={filters.nom}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, nom: e.target.value }))}
                                            className="h-9"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-600">Prénom</label>
                                        <Input
                                            placeholder="Prénom"
                                            value={filters.prenom}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, prenom: e.target.value }))}
                                            className="h-9"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
                                        <Input
                                            placeholder="Email"
                                            value={filters.email}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, email: e.target.value }))}
                                            className="h-9"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-600">Poste</label>
                                        <Input
                                            placeholder="Poste"
                                            value={filters.poste}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, poste: e.target.value }))}
                                            className="h-9"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-600">Service</label>
                                        <Select
                                            value={filters.nom_profil}
                                            onValueChange={(value) => setFilters((prev) => ({ ...prev, nom_profil: value }))}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous les services</SelectItem>
                                                {uniqueProfils.map((profil) => (
                                                    <SelectItem key={profil} value={profil}>
                                                        {profil.replace('_', ' ').toUpperCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-600">Téléphone</label>
                                        <Input
                                            placeholder="Téléphone"
                                            value={filters.telephone}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, telephone: e.target.value }))}
                                            className="h-9"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-gray-600">Statut</label>
                                        <Select value={filters.statut} onValueChange={(value) => setFilters((prev) => ({ ...prev, statut: value }))}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous</SelectItem>
                                                <SelectItem value="actif">Actif</SelectItem>
                                                <SelectItem value="inactif">Inactif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tableau des utilisateurs */}
                    <Card className="border-0 bg-white shadow-sm">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-700 text-white">
                                        <tr>
                                            <th className="p-4 text-left font-medium">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300"
                                                    checked={selectedUsers.length === filteredSalaries.length && filteredSalaries.length > 0}
                                                    onChange={toggleAllUsers}
                                                />
                                            </th>
                                            <th className="p-2 text-left text-sm font-medium tracking-wide uppercase">MEMBRE</th>
                                            <th className="p-2 text-left text-sm font-medium tracking-wide uppercase">CONTACT</th>
                                            <th className="p-2 text-left text-sm font-medium tracking-wide uppercase">SERVICE</th>
                                            <th className="p-2 text-left text-sm font-medium tracking-wide uppercase">PROJETS</th>
                                            <th className="p-2 text-left text-sm font-medium tracking-wide uppercase">CHARGE</th>
                                            {/* <th className="p-2 text-left text-sm font-medium tracking-wide uppercase">SALAIRE</th> */}
                                            <th className="p-2 text-left text-sm font-medium tracking-wide uppercase">ACTIONS</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {filteredSalaries.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="py-12 text-center">
                                                    <UsersIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                                    <p className="text-gray-500">
                                                        {salaries.length === 0 ? 'Aucun membre trouvé' : 'Aucun résultat pour ces filtres'}
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredSalaries.map((salarie, index) => (
                                                <tr
                                                    key={salarie.id}
                                                    className={`transition-colors hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                                >
                                                    <td className="p-4">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300"
                                                            checked={selectedUsers.includes(salarie.id)}
                                                            onChange={() => toggleUserSelection(salarie.id)}
                                                        />
                                                    </td>

                                                    {/* Membre avec statut et compétences */}
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {salarie.prenom} {salarie.nom}
                                                                </p>
                                                                <div className="mt-1 flex items-center space-x-2">
                                                                    <Badge
                                                                        variant={salarie.statut === 'actif' ? 'default' : 'secondary'}
                                                                        className={`text-xs ${
                                                                            salarie.statut === 'actif'
                                                                                ? 'border-green-200 bg-green-100 text-green-700'
                                                                                : 'border-red-200 bg-red-100 text-red-700'
                                                                        }`}
                                                                    >
                                                                        {salarie.statut}
                                                                    </Badge>
                                                                    {salarie.poste && <span className="text-xs text-gray-500">{salarie.poste}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Contact */}
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="text-sm text-gray-900">{salarie.email}</p>
                                                            <p className="text-xs text-gray-500">{salarie.telephone}</p>
                                                        </div>
                                                    </td>

                                                    {/* Service */}
                                                    <td className="p-4">
                                                        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                                                            {salarie.nom_profil.replace('_', ' ').toUpperCase()}
                                                        </Badge>
                                                    </td>

                                                    {/* Projets */}
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                                                {getProjectCount(salarie.projet_ids)}
                                                            </Badge>
                                                            <FileText className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    </td>

                                                    {/* Charge de travail */}
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Badge variant="outline" className={getChargeColor(salarie.charge_travail)}>
                                                                {salarie.charge_travail || 0}%
                                                            </Badge>
                                                            <div className="h-2 w-16 rounded-full bg-gray-200">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                                        (salarie.charge_travail || 0) < 50
                                                                            ? 'bg-green-500'
                                                                            : (salarie.charge_travail || 0) < 80
                                                                              ? 'bg-yellow-500'
                                                                              : 'bg-red-500'
                                                                    }`}
                                                                    style={{ width: `${Math.min(salarie.charge_travail || 0, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="p-4">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => viewUserDetails(salarie)}
                                                            className="flex items-center space-x-1"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span>Voir</span>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Détails de l'utilisateur sélectionné */}
                    {selectedUser && (
                        <Card className="mt-6 border-blue-200 bg-blue-50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center space-x-2 text-blue-800">
                                        <User className="h-5 w-5" />
                                        <span>Détails du membre</span>
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedUser(null)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="mb-2 font-semibold text-blue-800">Informations personnelles</h4>
                                            <div className="space-y-2">
                                                <p>
                                                    <strong>Nom complet:</strong> {selectedUser.prenom} {selectedUser.nom}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <span>{selectedUser.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <span>{selectedUser.telephone}</span>
                                                </div>
                                                {selectedUser.date_embauche && (
                                                    <p>
                                                        <strong>Date d'embauche:</strong> {formatDate(selectedUser.date_embauche)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {selectedUser.competences && selectedUser.competences.length > 0 && (
                                            <div>
                                                <h4 className="mb-2 font-semibold text-blue-800">Compétences</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedUser.competences.map((competence, index) => (
                                                        <Badge key={index} variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                                            {competence}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="mb-2 font-semibold text-blue-800">Informations professionnelles</h4>
                                            <div className="space-y-2">
                                                {selectedUser.poste && (
                                                    <p>
                                                        <strong>Poste:</strong> {selectedUser.poste}
                                                    </p>
                                                )}
                                                <p>
                                                    <strong>Service:</strong> {selectedUser.nom_profil.replace('_', ' ').toUpperCase()}
                                                </p>
                                                <p>
                                                    <strong>Statut:</strong>
                                                    <Badge
                                                        className={`ml-2 ${
                                                            selectedUser.statut === 'actif'
                                                                ? 'border-green-200 bg-green-100 text-green-700'
                                                                : 'border-red-200 bg-red-100 text-red-700'
                                                        }`}
                                                    >
                                                        {selectedUser.statut}
                                                    </Badge>
                                                </p>
                                                <p>
                                                    <strong>Projets actifs:</strong> {getProjectCount(selectedUser.projet_ids)}
                                                </p>
                                                {/* <p>
                                                    <strong>Charge de travail:</strong>
                                                    <Badge className={`ml-2 ${getChargeColor(selectedUser.charge_travail)}`}>
                                                        {selectedUser.charge_travail || 0}%
                                                    </Badge>
                                                </p> */}
                                                {/* <p>
                                                    <strong>Salaire mensuel:</strong> {formatSalary(selectedUser.salaire_mensuel)}
                                                </p> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}