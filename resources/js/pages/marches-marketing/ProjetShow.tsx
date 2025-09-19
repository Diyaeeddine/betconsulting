'use client';

import type React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle, FileText, Send, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Les Marchés',
        href: '/marches-marketing/marches',
    },
    {
        title: 'Détails du projet',
        href: '#',
    },
];

interface Projet {
    id: number;
    nom: string;
    description?: string;
    budget_total: string;
    statut: string;
}

interface ProjetShowProps {
    projet: Projet;
}

export default function ProjetShow({ projet }: ProjetShowProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        setIsUploading(true);

        const files = Array.from(e.dataTransfer.files);

        // Simulate upload delay
        setTimeout(() => {
            setUploadedFiles((prev) => [...prev, ...files]);
            setIsUploading(false);
        }, 1000);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setIsUploading(true);

            setTimeout(() => {
                setUploadedFiles((prev) => [...prev, ...files]);
                setIsUploading(false);
            }, 1000);
        }
    }, []);

    const removeFile = useCallback((index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleSubmitFiles = useCallback(() => {
        setIsSubmitting(true);
        // Simulate submission delay
        setTimeout(() => {
            setIsSubmitting(false);
            // Here you would typically make an API call to submit the files
            console.log('Files submitted:', uploadedFiles);
        }, 2000);
    }, [uploadedFiles]);

    const getStatusColor = (statut: string) => {
        switch (statut.toLowerCase()) {
            case 'en cours':
                return 'bg-blue-100 text-blue-800';
            case 'terminé':
                return 'bg-green-100 text-green-800';
            case 'en attente':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl font-bold text-gray-900">{projet.nom}</CardTitle>
                                <Badge className={getStatusColor(projet.statut)}>{projet.statut}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {projet.description && <p className="leading-relaxed text-gray-600">{projet.description}</p>}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">Budget:</span>
                                    <span className="text-lg font-bold text-green-600">{projet.budget_total} MAD</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900">Documents du projet</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
                                    isDragOver
                                        ? 'border-blue-500 bg-blue-50'
                                        : uploadedFiles.length > 0
                                          ? 'border-green-500 bg-green-50'
                                          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileInput}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                />

                                <div className="space-y-4">
                                    {isUploading ? (
                                        <div className="flex flex-col items-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                            <p className="mt-2 text-sm text-gray-600">Téléchargement en cours...</p>
                                        </div>
                                    ) : uploadedFiles.length > 0 ? (
                                        <div className="flex flex-col items-center">
                                            <CheckCircle className="h-12 w-12 text-green-500" />
                                            <p className="text-lg font-semibold text-green-700">
                                                {uploadedFiles.length} fichier{uploadedFiles.length > 1 ? 's' : ''} téléchargé
                                                {uploadedFiles.length > 1 ? 's' : ''}
                                            </p>
                                            <p className="text-sm text-gray-600">Glissez d'autres fichiers ou cliquez pour en ajouter</p>
                                        </div>
                                    ) : isDragOver ? (
                                        <div className="flex flex-col items-center">
                                            <Upload className="h-12 w-12 text-blue-500" />
                                            <p className="text-lg font-semibold text-blue-700">Déposez vos fichiers ici</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Upload className="h-12 w-12 text-gray-400" />
                                            <p className="text-lg font-semibold text-gray-700">Glissez et déposez vos fichiers</p>
                                            <p className="text-sm text-gray-500">ou cliquez pour sélectionner</p>
                                            <p className="mt-2 text-xs text-gray-400">PDF, DOC, DOCX, TXT, JPG, PNG acceptés</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className="mt-6 space-y-4">
                                    <h4 className="font-semibold text-gray-900">Fichiers téléchargés:</h4>
                                    <div className="space-y-2">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between rounded-lg border bg-white p-3">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-gray-500" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{file.name}</p>
                                                        <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(index)}
                                                    className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={handleSubmitFiles}
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Soumettre les documents
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
