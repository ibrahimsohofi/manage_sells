# MySQL Setup Instructions for Quincaillerie Jamal

## Option 1: Local MySQL Installation

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### macOS:
```bash
brew install mysql
brew services start mysql
```

### Windows:
Download and install MySQL from https://dev.mysql.com/downloads/mysql/

## Option 2: Docker MySQL (Recommended for Development)

```bash
# Pull and run MySQL container
docker run --name quincaillerie-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=quincaillerie_jamal \
  -p 3306:3306 \
  -d mysql:8.0

# Connect to verify
docker exec -it quincaillerie-mysql mysql -u root -p
```

## Option 3: Cloud MySQL Services

### PlanetScale (Recommended)
1. Sign up at https://planetscale.com
2. Create a new database
3. Get connection string
4. Update .env file

### Railway
1. Sign up at https://railway.app
2. Add MySQL service
3. Get connection details
4. Update .env file

### AWS RDS / Google Cloud SQL
Follow respective documentation for MySQL setup

## Configuration

Update your `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quincaillerie_jamal
DB_PORT=3306
```

## Setup Database

After MySQL is running:
```bash
cd backend
npm run db:setup
npm run db:seed
```

## Verification

Test the connection:
```bash
npm start
```

The server should show:
```
✅ MySQL database connected successfully
🏠 Host: localhost
🗄️ Database: quincaillerie_jamal
👤 User: root
```
