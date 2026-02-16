#!/bin/bash

#=============================================================================
# Wujha Admin Panel - Installation Script
# Installs all required dependencies for Laravel + React application
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

# Arguments from main script
OS=${1:-ubuntu}
VERSION=${2:-22.04}
PKG_MANAGER=${3:-apt}

PHP_VERSION="8.2"
NODE_VERSION="20"

#=============================================================================
# APT-based Installation (Ubuntu/Debian)
#=============================================================================

install_apt() {
    log_info "Updating package lists..."
    apt update -y
    
    log_info "Installing basic utilities..."
    apt install -y curl wget git unzip software-properties-common gnupg2 ca-certificates lsb-release

    # Add PHP repository (ondrej/php for Ubuntu, sury for Debian)
    if [ "$OS" = "ubuntu" ]; then
        log_info "Adding PHP repository (ondrej/php)..."
        add-apt-repository -y ppa:ondrej/php
    elif [ "$OS" = "debian" ]; then
        log_info "Adding PHP repository (sury.org)..."
        wget -qO - https://packages.sury.org/php/apt.gpg | gpg --dearmor -o /usr/share/keyrings/sury-php.gpg
        echo "deb [signed-by=/usr/share/keyrings/sury-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/sury-php.list
    fi
    
    apt update -y
    
    # Install PHP and extensions
    log_info "Installing PHP ${PHP_VERSION} and extensions..."
    apt install -y \
        php${PHP_VERSION} \
        php${PHP_VERSION}-fpm \
        php${PHP_VERSION}-cli \
        php${PHP_VERSION}-common \
        php${PHP_VERSION}-mysql \
        php${PHP_VERSION}-pgsql \
        php${PHP_VERSION}-sqlite3 \
        php${PHP_VERSION}-xml \
        php${PHP_VERSION}-curl \
        php${PHP_VERSION}-mbstring \
        php${PHP_VERSION}-zip \
        php${PHP_VERSION}-bcmath \
        php${PHP_VERSION}-intl \
        php${PHP_VERSION}-gd \
        php${PHP_VERSION}-imagick \
        php${PHP_VERSION}-redis
    
    # Install Nginx
    log_info "Installing Nginx..."
    apt install -y nginx
    
    # Install Node.js via NodeSource
    log_info "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
    
    # Install Composer
    log_info "Installing Composer..."
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    
    # Install Supervisor
    log_info "Installing Supervisor..."
    apt install -y supervisor
    
    # Install Certbot for SSL
    log_info "Installing Certbot..."
    apt install -y certbot python3-certbot-nginx
    
    log_success "APT packages installed successfully!"
}

#=============================================================================
# DNF-based Installation (CentOS/Rocky/AlmaLinux)
#=============================================================================

install_dnf() {
    log_info "Updating packages..."
    dnf update -y
    
    log_info "Installing basic utilities..."
    dnf install -y epel-release
    dnf install -y curl wget git unzip
    
    # Install Remi repository for PHP
    log_info "Adding Remi repository..."
    dnf install -y https://rpms.remirepo.net/enterprise/remi-release-$(rpm -E %rhel).rpm
    
    # Enable PHP module
    dnf module reset php -y
    dnf module enable php:remi-${PHP_VERSION} -y
    
    # Install PHP and extensions
    log_info "Installing PHP ${PHP_VERSION} and extensions..."
    dnf install -y \
        php \
        php-fpm \
        php-cli \
        php-common \
        php-mysqlnd \
        php-pgsql \
        php-pdo \
        php-xml \
        php-curl \
        php-mbstring \
        php-zip \
        php-bcmath \
        php-intl \
        php-gd \
        php-imagick \
        php-redis
    
    # Install Nginx
    log_info "Installing Nginx..."
    dnf install -y nginx
    
    # Install Node.js via NodeSource
    log_info "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
    dnf install -y nodejs
    
    # Install Composer
    log_info "Installing Composer..."
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    
    # Install Supervisor
    log_info "Installing Supervisor..."
    dnf install -y supervisor
    
    # Install Certbot
    log_info "Installing Certbot..."
    dnf install -y certbot python3-certbot-nginx
    
    # Enable and start services
    systemctl enable nginx php-fpm supervisord
    systemctl start nginx php-fpm supervisord
    
    log_success "DNF packages installed successfully!"
}

#=============================================================================
# Main
#=============================================================================

main() {
    log_info "Starting installation for $OS $VERSION..."
    
    case $PKG_MANAGER in
        apt)
            install_apt
            ;;
        dnf)
            install_dnf
            ;;
        *)
            log_error "Unsupported package manager: $PKG_MANAGER"
            exit 1
            ;;
    esac
    
    # Verify installations
    log_info "Verifying installations..."
    php -v
    composer --version
    node -v
    npm -v
    nginx -v
    
    log_success "All dependencies installed successfully!"
}

main
