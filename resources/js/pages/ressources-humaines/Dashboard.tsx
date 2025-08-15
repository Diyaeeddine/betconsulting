import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import axios from "axios";
import { useState } from "react";

const breadcrumbs = [
    {
        title: 'Dashboard RH',
        href: '/ressources-humaines/dashboard',
    },
];


export default function RessourcesHumaines() {
    const [form, setForm] = useState({
        user_id: 7, // ID du destinataire à tester
        titre: '',
        commentaire: ''
    });
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post("/api/notifications", form);
            alert("Notification envoyée !");
            setForm({ ...form, titre: '', commentaire: '' });
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'envoi");
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Ressources Humaines & Gestion des Compétences" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold">
                    Dashboard Ressources Humaines & Gestion des Compétences
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-1/3">
                    <input
                        type="text"
                        placeholder="Titre"
                        value={form.titre}
                        onChange={(e) => setForm({ ...form, titre: e.target.value })}
                        className="border rounded p-2"
                        required
                    />
                    <textarea
                        placeholder="Commentaire"
                        value={form.commentaire}
                        onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                        className="border rounded p-2"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Envoyer Notification
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
