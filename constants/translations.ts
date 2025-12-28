
import { Language } from '../contexts/LanguageContext';

type Translations = Record<Language, Record<string, any>>;

export const TRANSLATIONS: Translations = {
    en: {
        nav: {
            home: 'Home',
            properties: 'Our Properties',
            admin: 'Admin',
            login: 'Login',
            logout: 'Logout'
        },
        hero: {
            title: 'Experience Premium',
            highlight: 'Albanian Hospitality',
            subtitle: 'Curated luxury properties in Tirana and the Albanian Riviera.',
            cta: 'Explore Properties'
        },
        search: {
            location: 'Location',
            checkIn: 'Check In',
            checkOut: 'Check Out',
            guests: 'Guests',
            searchBtn: 'Search'
        },
        filters: {
            price: 'Price Range',
            type: 'Property Type',
            amenities: 'Amenities',
            clear: 'Clear All'
        },
        property: {
            from: 'from',
            night: 'night',
            details: 'View Details',
            reserve: 'Reserve Now',
            features: 'Features',
            description: 'Description',
            location: 'Location',
            reviews: 'Reviews'
        },
        booking: {
            title: 'Book this property',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            guests: 'Guests',
            total: 'Total',
            book: 'Confirm Booking'
        }
    },
    sq: {
        nav: {
            home: 'Kreu',
            properties: 'Pronat Tona',
            admin: 'Admin',
            login: 'Hyr',
            logout: 'Dil'
        },
        hero: {
            title: 'Përjetoni Mikpritjen',
            highlight: 'Premium Shqiptare',
            subtitle: 'Prona luksoze të zgjedhura në Tiranë dhe Rivierën Shqiptare.',
            cta: 'Eksploroni Pronat'
        },
        search: {
            location: 'Vendodhja',
            checkIn: 'Mbërritja',
            checkOut: 'Largimi',
            guests: 'Mysafirë',
            searchBtn: 'Kërko'
        },
        filters: {
            price: 'Çmimi',
            type: 'Lloji i Pronës',
            amenities: 'Komoditetet',
            clear: 'Pastro'
        },
        property: {
            from: 'nga',
            night: 'nata',
            details: 'Shiko Detajet',
            reserve: 'Rezervo Tani',
            features: 'Karakteristikat',
            description: 'Përshkrimi',
            location: 'Vendodhja',
            reviews: 'Vlerësimet'
        },
        booking: {
            title: 'Rezervo këtë pronë',
            checkIn: 'Mbërritja',
            checkOut: 'Largimi',
            guests: 'Mysafirë',
            total: 'Totali',
            book: 'Konfirmo Rezervimin'
        }
    },
    de: {
        nav: {
            home: 'Startseite',
            properties: 'Unsere Immobilien',
            admin: 'Admin',
            login: 'Anmelden',
            logout: 'Abmelden'
        },
        hero: {
            title: 'Erleben Sie Premium',
            highlight: 'Albanische Gastfreundschaft',
            subtitle: 'Ausgewählte Luxusimmobilien in Tirana und an der albanischen Riviera.',
            cta: 'Immobilien entdecken'
        },
        search: {
            location: 'Standort',
            checkIn: 'Anreise',
            checkOut: 'Abreise',
            guests: 'Gäste',
            searchBtn: 'Suchen'
        },
        filters: {
            price: 'Preisspanne',
            type: 'Immobilientyp',
            amenities: 'Ausstattung',
            clear: 'Löschen'
        },
        property: {
            from: 'ab',
            night: 'Nacht',
            details: 'Details ansehen',
            reserve: 'Jetzt reservieren',
            features: 'Merkmale',
            description: 'Beschreibung',
            location: 'Standort',
            reviews: 'Bewertungen'
        },
        booking: {
            title: 'Diese Immobilie buchen',
            checkIn: 'Anreise',
            checkOut: 'Abreise',
            guests: 'Gäste',
            total: 'Gesamt',
            book: 'Buchung bestätigen'
        }
    },
    it: {
        nav: {
            home: 'Home',
            properties: 'Le Nostre Proprietà',
            admin: 'Admin',
            login: 'Accedi',
            logout: 'Esci'
        },
        hero: {
            title: 'Vivi l\'Ospitalità',
            highlight: 'Premium Albanese',
            subtitle: 'Proprietà di lusso selezionate a Tirana e sulla Riviera Albanese.',
            cta: 'Esplora Proprietà'
        },
        search: {
            location: 'Posizione',
            checkIn: 'Arrivo',
            checkOut: 'Partenza',
            guests: 'Ospiti',
            searchBtn: 'Cerca'
        },
        filters: {
            price: 'Fascia di Prezzo',
            type: 'Tipo di Proprietà',
            amenities: 'Servizi',
            clear: 'Cancella'
        },
        property: {
            from: 'da',
            night: 'notte',
            details: 'Vedi Dettagli',
            reserve: 'Prenota Ora',
            features: 'Caratteristiche',
            description: 'Descrizione',
            location: 'Posizione',
            reviews: 'Recensioni'
        },
        booking: {
            title: 'Prenota questa proprietà',
            checkIn: 'Arrivo',
            checkOut: 'Partenza',
            guests: 'Ospiti',
            total: 'Totale',
            book: 'Conferma Prenotazione'
        }
    }
};
