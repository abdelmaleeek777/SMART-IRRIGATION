import { CloudRain, Droplets, ThermometerSun, Wind } from 'lucide-react';

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
  { label: 'Température', value: '31°C', icon: ThermometerSun, accent: 'from-iceBlue to-arcticWhite', iconColor: 'text-oceanBlue' },
  { label: 'Humidité', value: '42 %', icon: Droplets, accent: 'from-crystalCyan/40 to-iceBlue', iconColor: 'text-deepOcean' },
  { label: 'Pluie', value: '0.0 mm', icon: CloudRain, accent: 'from-aquaBlue/35 to-iceBlue', iconColor: 'text-oceanBlue' },
  { label: 'Vent', value: '18 km/h', icon: Wind, accent: 'from-deepOcean/20 to-aquaBlue/20', iconColor: 'text-midnight' },
];

export const weatherHistory = [
  { date: 'Lun', fullDate: 'Lundi', temperature: 27, humidity: 58 },
  { date: 'Mar', fullDate: 'Mardi', temperature: 29, humidity: 54 },
  { date: 'Mer', fullDate: 'Mercredi', temperature: 31, humidity: 48 },
  { date: 'Jeu', fullDate: 'Jeudi', temperature: 30, humidity: 51 },
  { date: 'Ven', fullDate: 'Vendredi', temperature: 33, humidity: 44 },
  { date: 'Sam', fullDate: 'Samedi', temperature: 32, humidity: 46 },
  { date: 'Dim', fullDate: 'Dimanche', temperature: 31, humidity: 42 },
];

export const irrigationHistory = [
  {
    date: "Lun",
    parcel1: 18,
    parcel2: 12,
    parcel3: 8,
  },
  {
    date: "Mar",
    parcel1: 20,
    parcel2: 15,
    parcel3: 10,
  },
  {
    date: "Mer",
    parcel1: 14,
    parcel2: 18,
    parcel3: 7,
  },
  {
    date: "Jeu",
    parcel1: 25,
    parcel2: 10,
    parcel3: 12,
  },
  {
    date: "Ven",
    parcel1: 16,
    parcel2: 14,
    parcel3: 9,
  },
  {
    date: "Sam",
    parcel1: 22,
    parcel2: 17,
    parcel3: 11,
  },
  {
    date: "Dim",
    parcel1: 19,
    parcel2: 13,
    parcel3: 8,
  },
];
