#!/bin/bash

#=============================================================================
# Wujha Admin Panel - Configuration Script
# Configures Nginx, PHP-FPM, Supervisor, and Laravel environment
#=============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PATH="${SCRIPT_DIR}"
APP_NAME="wujha-admin"
DOMAIN="${DOMAIN:-localhost}"
WEB_USER="${WEB_USER:-www-data}"
PHP_VERSION="8.4"

#=============================================================================
# Environment Setup
#=============================================================================

setup_env() {
    log_info "Setting up environment file..."
    
    if [ ! -f "${APP_PATH}/.env" ]; then
        if [ -f "${APP_PATH}/.env.example" ]; then
            cp "${APP_PATH}/.env.example" "${APP_PATH}/.env"
            log_info "Created .env from .env.example"
        else
            log_error ".env.example not found!"
            exit 1
        fi
    fi
    
    # Generate application key if not set
    cd "${APP_PATH}"
    if ! grep -q "^APP_KEY=base64:" .env; then
        log_info "Generating application key..."
        php artisan key:generate --force
    fi
    
    log_success "Environment file configured!"
}

setup_laravel() {
    log_info "Running Laravel setup commands..."
    
    cd "${APP_PATH}"
    
    # Storage link
    if [ ! -L "${APP_PATH}/public/storage" ]; then
        php artisan storage:link
        log_info "Storage linked"
    fi
    
    # Migrations
    log_info "Running migrations..."
    php artisan migrate --force
    
    # Optimization
    log_info "Optimizing caches..."
    php artisan optimize:clear
    php artisan optimize
    php artisan view:cache
    php artisan config:cache
    php artisan route:cache
    
    log_success "Laravel configured!"
}

#=============================================================================
# Directory Permissions
#=============================================================================

setup_permissions() {
    log_info "Setting directory permissions..."
    
    cd "${APP_PATH}"
    
    # Set ownership
    chown -R ${WEB_USER}:${WEB_USER} "${APP_PATH}"
    
    # Set directory permissions
    find "${APP_PATH}" -type d -exec chmod 755 {} \;
    
    # Set file permissions
    find "${APP_PATH}" -type f -exec chmod 644 {} \;
    
    # Make storage and cache writable
    chmod -R 775 "${APP_PATH}/storage"
    chmod -R 775 "${APP_PATH}/bootstrap/cache"
    
    # Ensure artisan is executable
    chmod +x "${APP_PATH}/artisan"
    
    log_success "Permissions configured!"
}

#=============================================================================
# Nginx Configuration
#=============================================================================

setup_nginx() {
    log_info "Configuring Nginx..."
    
    NGINX_CONF="/etc/nginx/sites-available/${APP_NAME}"
    
    # Detect PHP-FPM socket
    if [ -f "/run/php/php${PHP_VERSION}-fpm.sock" ]; then
        PHP_SOCKET="unix:/run/php/php${PHP_VERSION}-fpm.sock"
    elif [ -f "/var/run/php/php${PHP_VERSION}-fpm.sock" ]; then
         PHP_SOCKET="unix:/var/run/php/php${PHP_VERSION}-fpm.sock"
    elif [ -f "/run/php-fpm/www.sock" ]; then
        PHP_SOCKET="unix:/run/php-fpm/www.sock" # RHEL/CentOS
    else
        PHP_SOCKET="unix:/var/run/php/php${PHP_VERSION}-fpm.sock" # Default fallback
    fi

    cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    root ${APP_PATH}/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;

    charset utf-8;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml application/json;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass ${PHP_SOCKET};
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Enable site
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/ 2>/dev/null || true
    
    # Remove default site if exists
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    
    # Test and reload Nginx
    nginx -t
    systemctl reload nginx
    
    log_success "Nginx configured!"
}

#=============================================================================
# PHP-FPM Configuration
#=============================================================================

setup_php_fpm() {
    log_info "Configuring PHP-FPM..."
    
    PHP_FPM_CONF="/etc/php/${PHP_VERSION}/fpm/pool.d/www.conf"
    
    # Optimize PHP-FPM settings
    sed -i "s/^pm.max_children = .*/pm.max_children = 50/" "$PHP_FPM_CONF" 2>/dev/null || true
    sed -i "s/^pm.start_servers = .*/pm.start_servers = 5/" "$PHP_FPM_CONF" 2>/dev/null || true
    sed -i "s/^pm.min_spare_servers = .*/pm.min_spare_servers = 5/" "$PHP_FPM_CONF" 2>/dev/null || true
    sed -i "s/^pm.max_spare_servers = .*/pm.max_spare_servers = 35/" "$PHP_FPM_CONF" 2>/dev/null || true
    
    # Restart PHP-FPM
    systemctl restart php${PHP_VERSION}-fpm 2>/dev/null || systemctl restart php-fpm 2>/dev/null || true
    
    log_success "PHP-FPM configured!"
}

#=============================================================================
# Supervisor Configuration (Queue Workers)
#=============================================================================

setup_supervisor() {
    log_info "Configuring Supervisor for queue workers..."
    
    SUPERVISOR_CONF="/etc/supervisor/conf.d/${APP_NAME}-worker.conf"
    
    cat > "$SUPERVISOR_CONF" << EOF
[program:${APP_NAME}-worker]
process_name=%(program_name)s_%(process_num)02d
command=php ${APP_PATH}/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=${WEB_USER}
numprocs=2
redirect_stderr=true
stdout_logfile=${APP_PATH}/storage/logs/worker.log
stopwaitsecs=3600
EOF

    # Reload Supervisor
    supervisorctl reread
    supervisorctl update
    supervisorctl start ${APP_NAME}-worker:* 2>/dev/null || true
    
    log_success "Supervisor configured!"
}

#=============================================================================
# Laravel Scheduler (Cron)
#=============================================================================

setup_cron() {
    log_info "Setting up Laravel scheduler cron job..."
    
    CRON_CMD="* * * * * cd ${APP_PATH} && php artisan schedule:run >> /dev/null 2>&1"
    
    # Add to crontab if not exists
    (crontab -u ${WEB_USER} -l 2>/dev/null | grep -v "schedule:run"; echo "$CRON_CMD") | crontab -u ${WEB_USER} -
    
    log_success "Cron job configured!"
}

#=============================================================================
# Main
#=============================================================================

main() {
    log_info "Starting configuration..."
    
    setup_env
    setup_permissions
    
    # Database Setup
    generate_credentials
    setup_database
    update_env_credentials
    
    # Admin User Setup
    generate_admin_credentials
    seed_admin_user
    
    
    setup_laravel
    setup_nginx
    setup_php_fpm
    setup_supervisor
    setup_cron
    
    log_success "Configuration completed successfully!"
    display_credentials
}

#=============================================================================
# Database Configuration
#=============================================================================

DB_NAME="wujha_admin"
DB_USER="wujha_user"
DB_PASS=""

generate_credentials() {
    log_info "Generating database credentials..."
    # Generate a random 32-character password
    DB_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    log_success "Credentials generated"
}

setup_database() {
    log_info "Setting up MySQL database..."
    
    # Check if mysql is available
    if ! command -v mysql &> /dev/null; then
        log_warning "MySQL client not found, skipping database creation"
        return
    fi
    
    # Create DB and User (Idempotent)
    mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
    mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';";
    # If user exists, update password
    mysql -e "ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
    mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
    mysql -e "FLUSH PRIVILEGES;"
    
    log_success "Database ${DB_NAME} and user ${DB_USER} configured"
}

update_env_credentials() {
    log_info "Updating .env with new credentials..."
    
    cd "${APP_PATH}"
    
    # Update DB_DATABASE
    if grep -q "^DB_DATABASE=" .env; then
        sed -i "s/^DB_DATABASE=.*/DB_DATABASE=${DB_NAME}/" .env
    else
        echo "DB_DATABASE=${DB_NAME}" >> .env
    fi
    
    # Update DB_USERNAME
    if grep -q "^DB_USERNAME=" .env; then
        sed -i "s/^DB_USERNAME=.*/DB_USERNAME=${DB_USER}/" .env
    else
        echo "DB_USERNAME=${DB_USER}" >> .env
    fi
    
    # Update DB_PASSWORD
    if grep -q "^DB_PASSWORD=" .env; then
        # Escape special characters in password for sed
        ESCAPED_PASS=$(echo "${DB_PASS}" | sed 's/[\/&]/\\&/g')
        sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${ESCAPED_PASS}/" .env
    else
        echo "DB_PASSWORD=${DB_PASS}" >> .env
    fi
    
    log_success ".env updated with database credentials"
}

#=============================================================================
# Admin User Configuration
#=============================================================================

ADMIN_EMAIL="admin@wujha.com"
ADMIN_PASS=""

generate_admin_credentials() {
    log_info "Generating admin user credentials..."
    # Generate a random 12-character password
    ADMIN_PASS=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | head -c 12)
    log_success "Admin credentials generated"
}

seed_admin_user() {
    log_info "Seeding admin user..."
    
    cd "${APP_PATH}"
    
    # Run the AdminUserSeeder with environment variables
    ADMIN_EMAIL="${ADMIN_EMAIL}" ADMIN_PASSWORD="${ADMIN_PASS}" php artisan db:seed --class=AdminUserSeeder --force
    
    log_success "Admin user seeded"
}

display_credentials() {
    echo ""
    echo -e "${GREEN}================================================================${NC}"
    echo -e "${GREEN}   INSTALLATION COMPLETE - SAVE THESE CREDENTIALS   ${NC}"
    echo -e "${GREEN}================================================================${NC}"
    echo ""
    echo -e "Database Name:  ${BLUE}${DB_NAME}${NC}"
    echo -e "Database User:  ${BLUE}${DB_USER}${NC}"
    echo -e "Database Pass:  ${BLUE}${DB_PASS}${NC}"
    echo ""
    echo -e "Admin Email:    ${BLUE}${ADMIN_EMAIL}${NC}"
    echo -e "Admin Pass:     ${BLUE}${ADMIN_PASS}${NC}"
    echo ""
    echo -e "App URL:        ${BLUE}http://${DOMAIN}${NC}"
    echo ""
    echo -e "${YELLOW}NOTE: These credentials have been saved to ${APP_PATH}/.env${NC}"
    echo -e "${GREEN}================================================================${NC}"
    echo ""
}

main
