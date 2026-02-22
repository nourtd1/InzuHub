import { create } from 'zustand';

export interface LocalPhoto {
    id: string; // uuid local temporaire
    uri: string; // uri local avant upload
    isMain: boolean;
    uploadProgress?: number; // 0-100 pendant l'upload
    uploadedUrl?: string; // url Supabase après upload
    isUploading?: boolean;
    uploadError?: string;
}

export interface PostPropertyState {
    // Étape 1 — Médias & Prix
    photos: LocalPhoto[];
    titre: string;
    prix_mensuel: string;
    garantie_exigee: string;

    // Étape 2 — Localisation & Détails (sera rempli au Prompt #14)
    id_quartier: string;
    description: string;
    nombre_chambres: string;
    nombre_salons: string;
    has_eau: boolean;
    has_electricite: boolean;
    has_cloture: boolean;
    has_parking: boolean;
    latitude: number | null;
    longitude: number | null;

    // Actions
    setPhotos: (photos: LocalPhoto[]) => void;
    addPhoto: (photo: LocalPhoto) => void;
    updatePhoto: (id: string, updates: Partial<LocalPhoto>) => void;
    removePhoto: (id: string) => void;
    reorderPhotos: (from: number, to: number) => void;
    setMainPhoto: (id: string) => void;
    setTitre: (titre: string) => void;
    setPrixMensuel: (prix: string) => void;
    setGarantieExigee: (garantie: string) => void;
    setField: (key: keyof PostPropertyState, value: any) => void;
    reset: () => void;
}

const initialState = {
    photos: [],
    titre: '',
    prix_mensuel: '',
    garantie_exigee: '0',

    id_quartier: '',
    description: '',
    nombre_chambres: '1',
    nombre_salons: '1',
    has_eau: false,
    has_electricite: false,
    has_cloture: false,
    has_parking: false,
    latitude: null,
    longitude: null,
};

export const usePostPropertyStore = create<PostPropertyState>((set, get) => ({
    ...initialState,

    setPhotos: (photos) => set({ photos }),
    addPhoto: (photo) => set({ photos: [...get().photos, photo] }),
    updatePhoto: (id, updates) => set({
        photos: get().photos.map(p => p.id === id ? { ...p, ...updates } : p)
    }),
    removePhoto: (id) => set({
        photos: get().photos.filter(p => p.id !== id)
    }),
    reorderPhotos: (from, to) => {
        const newPhotos = [...get().photos];
        const [removed] = newPhotos.splice(from, 1);
        newPhotos.splice(to, 0, removed);
        set({ photos: newPhotos });
    },
    setMainPhoto: (id) => set({
        photos: get().photos.map(p => ({
            ...p,
            isMain: p.id === id
        }))
    }),
    setTitre: (titre) => set({ titre }),
    setPrixMensuel: (prix_mensuel) => set({ prix_mensuel }),
    setGarantieExigee: (garantie_exigee) => set({ garantie_exigee }),
    setField: (key, value) => set({ [key]: value }),
    reset: () => set(initialState),
}));
