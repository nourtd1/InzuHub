export const GISENYI_POI = [
    // Lacs et nature
    {
        id: 'lac_kivu', nom: 'Lac Kivu',
        lat: -1.7050, lng: 29.2380,
        type: 'nature', emoji: '🌊'
    },

    // Centre-ville et commerce
    {
        id: 'marche_central', nom: 'Marché Central',
        lat: -1.6978, lng: 29.2571,
        type: 'commerce', emoji: '🛒'
    },

    // Santé
    {
        id: 'hopital_rubavu', nom: 'Hôpital de Rubavu',
        lat: -1.6920, lng: 29.2610,
        type: 'sante', emoji: '🏥'
    },

    // Éducation
    {
        id: 'universite_lac_kivu', nom: 'Université du Lac Kivu',
        lat: -1.7100, lng: 29.2450,
        type: 'education', emoji: '🎓'
    },

    // Transport
    {
        id: 'gare_routiere', nom: 'Gare Routière',
        lat: -1.6995, lng: 29.2590,
        type: 'transport', emoji: '🚌'
    },

    // Frontière
    {
        id: 'frontiere_goma', nom: 'Frontière Petite Barrière (Goma)',
        lat: -1.6880, lng: 29.2210,
        type: 'frontiere', emoji: '🛂'
    },

    // Hôtellerie référence
    {
        id: 'hotel_serena', nom: 'Serena Hotel',
        lat: -1.7080, lng: 29.2340,
        type: 'hotel', emoji: '🏨'
    },
];

export type POIType = 'nature' | 'commerce' | 'sante' |
    'education' | 'transport' | 'frontiere' | 'hotel';
