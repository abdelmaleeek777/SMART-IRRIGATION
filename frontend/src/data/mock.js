export const stats = [
  { label: 'Parcelles suivies', value: '18', detail: '+3 ce mois-ci' },
  { label: 'Recommandations', value: '124', detail: '94 % acceptées' },
  { label: 'Eau économisée', value: '31 %', detail: 'vs arrosage manuel' },
  { label: 'Alertes météo', value: '7', detail: '3 à surveiller' },
];

export const parcels = [
  {
    name: 'Parcelle Nord',
    crop: 'Maïs',
    soil: 'Limon',
    area: '3.2 ha',
    location: 'Meknès, Maroc',
    status: 'Besoin faible',
  },
  {
    name: 'Parcelle Ouest',
    crop: 'Tomate',
    soil: 'Sableux',
    area: '1.4 ha',
    location: 'Fès, Maroc',
    status: 'À irriguer',
  },
  {
    name: 'Parcelle Centrale',
    crop: 'Olivier',
    soil: 'Argileux',
    area: '5.1 ha',
    location: 'Rabat, Maroc',
    status: 'Surveillance',
  },
];

export const recommendations = [
  {
    parcel: 'Parcelle Ouest',
    status: 'Irrigation recommandée',
    water: '18 mm',
    reason: 'Température élevée et absence de pluie prévue',
    time: 'Il y a 2 h',
  },
  {
    parcel: 'Parcelle Nord',
    status: 'Irrigation non nécessaire',
    water: '0 mm',
    reason: 'Humidité du sol suffisante',
    time: 'Il y a 6 h',
  },
  {
    parcel: 'Parcelle Centrale',
    status: 'Surveillance requise',
    water: '8 mm',
    reason: 'Vent soutenu et baisse d’humidité',
    time: 'Hier',
  },
];

export const weatherHighlights = [
  { label: 'Température', value: '31°C' },
  { label: 'Humidité', value: '42 %' },
  { label: 'Pluie', value: '0.0 mm' },
  { label: 'Vent', value: '18 km/h' },
];
