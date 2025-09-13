# Configuration MySQL pour Quincaillerie Jamal

## 📋 Prérequis

Vous devez avoir MySQL 8.0+ installé et en cours d'exécution.

## 🚀 Installation rapide avec Docker

```bash
# Démarrer MySQL avec Docker
docker run --name quincaillerie-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=quincaillerie_jamal \
  -p 3306:3306 \
  -d mysql:8.0

# Attendre que MySQL soit prêt (environ 30 secondes)
sleep 30
```

## 🛠️ Configuration manuelle

### 1. Créer la base de données

```sql
CREATE DATABASE quincaillerie_jamal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quincaillerie_jamal;
```

### 2. Créer les tables

```sql
-- Table des catégories
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des magasins
CREATE TABLE stores (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits/inventaire
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  barcode VARCHAR(50) UNIQUE,
  cost_price DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  store_id VARCHAR(50) DEFAULT 'main',
  stock INT DEFAULT 0,
  min_stock INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Table des ventes
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_date DATE NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  store_id VARCHAR(50) DEFAULT 'main',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Table des paramètres
CREATE TABLE settings (
  `key` VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. Insérer les données d'exemple

```sql
-- Magasin principal
INSERT INTO stores (id, name, address, phone, is_main) VALUES
('main', 'Quincaillerie Jamal - Principal', 'Casablanca, Maroc', '0522-123456', TRUE);

-- Catégories
INSERT INTO categories (name) VALUES
('Outillage'),
('Quincaillerie'),
('Peinture'),
('Électricité'),
('Plomberie'),
('Construction');

-- Produits d'exemple
INSERT INTO products (name, category, barcode, cost_price, selling_price, stock, min_stock) VALUES
('Marteau', 'Outillage', '1234567890', 25.00, 40.00, 50, 10),
('Tournevis', 'Outillage', '1234567891', 15.00, 25.00, 100, 20),
('Peinture Blanche', 'Peinture', '1234567892', 45.00, 70.00, 30, 5),
('Câble Électrique', 'Électricité', '1234567893', 20.00, 35.00, 200, 50),
('Tuyau PVC', 'Plomberie', '1234567894', 12.00, 20.00, 5, 10),
('Vis 4x50mm', 'Quincaillerie', '1234567895', 0.50, 1.00, 1000, 100);

-- Paramètres par défaut
INSERT INTO settings (`key`, value, description) VALUES
('currentStore', 'main', 'Magasin actuel'),
('defaultStore', 'main', 'Magasin par défaut'),
('enableBarcodeScanning', 'true', 'Activer lecture codes-barres'),
('showProfitMargins', 'true', 'Afficher marges bénéficiaires'),
('storeName', 'Quincaillerie Jamal', 'Nom du magasin'),
('currency', 'MAD', 'Devise'),
('taxRate', '20', 'Taux de TVA (%)'),
('language', 'fr', 'Langue');
```

## ⚙️ Configuration de l'application

Modifiez le fichier `backend/.env` :

```env
# Database Configuration - MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=quincaillerie_jamal

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## 🔧 Scripts de configuration automatique

```bash
# Depuis le dossier backend
npm run db:setup    # Créer les tables
npm run db:seed     # Insérer les données d'exemple
```

## ✅ Vérification

```bash
# Tester la connexion MySQL depuis le backend
cd backend
npm run mysql:check

# Démarrer le serveur backend
npm start

# Dans un autre terminal, démarrer le frontend
cd ..
bun dev
```

## 🚨 Résolution des problèmes

### Erreur de connexion MySQL
- Vérifiez que MySQL est démarré : `systemctl status mysql`
- Vérifiez les paramètres dans `.env`
- Testez la connexion : `mysql -u root -p -h localhost`

### Erreur "database does not exist"
```sql
CREATE DATABASE quincaillerie_jamal;
```

### Erreur de permissions
```sql
GRANT ALL PRIVILEGES ON quincaillerie_jamal.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## 📊 Fonctionnalités disponibles

Une fois MySQL configuré, l'application aura accès à :
- ✅ Gestion des ventes en temps réel
- ✅ Suivi de l'inventaire
- ✅ Gestion multi-magasins
- ✅ Rapports et analyses
- ✅ Export CSV
- ✅ Gestion des catégories
- ✅ Alertes stock faible
