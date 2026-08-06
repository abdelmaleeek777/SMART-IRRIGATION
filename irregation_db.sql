
-- TABLE AGRICULTEUR

create table Agriculteur(
id_agriculteur serial primary key,
nom varchar(50) not null,
prenom varchar(50) not null,
email varchar(100) not null unique,
mot_de_passe varchar(50) not null,
numero_telephone varchar(20) not null,
date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE EXPLOITATION

CREATE TABLE exploitation (
    id_exploitation SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    localisation VARCHAR(255) NOT NULL,

    id_agriculteur INT NOT NULL,

    CONSTRAINT fk_exploitation_agriculteur
        FOREIGN KEY (id_agriculteur)
        REFERENCES agriculteur(id_agriculteur)
        ON DELETE CASCADE
);

-- TABLE PARCELLE

CREATE TABLE parcelle (
    id_parcelle SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    superficie FLOAT NOT NULL,
    id_exploitation INT NOT NULL,
    CONSTRAINT fk_parcelle_exploitation
        FOREIGN KEY (id_exploitation)
        REFERENCES exploitation(id_exploitation)
        ON DELETE CASCADE
);

-- TABLE PARCELLE_PROFILE

CREATE TABLE parcelle_profile (
    id SERIAL PRIMARY KEY,
    parcel_id INT NOT NULL UNIQUE,
    soil_type VARCHAR(100) NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    organic_carbon DOUBLE PRECISION,
    soil_ph DOUBLE PRECISION,
    irrigation_type VARCHAR(30),
    crop_growth_stage VARCHAR(30),
    mulching_used VARCHAR(10) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parcelle_profile_parcelle
        FOREIGN KEY (parcel_id)
        REFERENCES parcelle(id_parcelle)
        ON DELETE CASCADE
);

-- TABLE RECOMMANDATION

CREATE TABLE recommandation (
    id_recommandation SERIAL PRIMARY KEY,
    date_recommandation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    besoin_irrigation BOOLEAN NOT NULL,
    quantite_eau DOUBLE PRECISION,
    explication TEXT,
    id_parcelle INT NOT NULL,
    CONSTRAINT fk_recommandation_parcelle
        FOREIGN KEY (id_parcelle)
        REFERENCES parcelle(id_parcelle)
        ON DELETE CASCADE
);

-- TABLE DONNEES_METEO

CREATE TABLE donnees_meteo (
    id_meteo SERIAL PRIMARY KEY,
    date_mesure TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    temperature FLOAT,
    humidite FLOAT,
    precipitations FLOAT,
    vent FLOAT,

    id_parcelle INT NOT NULL,
    CONSTRAINT fk_meteo_parcelle
        FOREIGN KEY (id_parcelle)
        REFERENCES parcelle(id_parcelle)
        ON DELETE CASCADE
);