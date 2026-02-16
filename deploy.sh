#!/bin/bash

#=============================================================================
# Wujha Admin Panel - Main Deployment Script
# Supports: Ubuntu, Debian, CentOS, Rocky Linux, AlmaLinux
#=============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="${SCRIPT_DIR}/scripts"

# Configuration
APP_NAME="wujha-admin"
PHP_VERSION="8.2"
NODE_VERSION="20"

#=============================================================================
# Helper Functions
#=============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        log_error "Cannot detect OS. /etc/os-release not found."
        exit 1
    fi
    
    case $OS in
        ubuntu|debian)
            PKG_MANAGER="apt"
            ;;
        centos|rocky|almalinux|rhel)
            PKG_MANAGER="dnf"
            ;;
        *)
            log_error "Unsupported OS: $OS"
            exit 1
            ;;
    esac
    
    log_info "Detected OS: $OS $VERSION (Package Manager: $PKG_MANAGER)"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run as root or with sudo"
        exit 1
    fi
}

#=============================================================================
# Main Deployment Steps
#=============================================================================

run_backup() {
    if [ -f "${SCRIPTS_DIR}/backup.sh" ]; then
        log_info "Creating backup before deployment..."
        bash "${SCRIPTS_DIR}/backup.sh"
    fi
}

run_install() {
    log_info "Running installation script..."
    if [ -f "${SCRIPTS_DIR}/install.sh" ]; then
        bash "${SCRIPTS_DIR}/install.sh" "$OS" "$VERSION" "$PKG_MANAGER"
    else
        log_error "install.sh not found in ${SCRIPTS_DIR}"
        exit 1
    fi
}

run_configure() {
    log_info "Running configuration script..."
    if [ -f "${SCRIPTS_DIR}/configure.sh" ]; then
        bash "${SCRIPTS_DIR}/configure.sh"
    else
        log_error "configure.sh not found in ${SCRIPTS_DIR}"
        exit 1
    fi
}

deploy_application() {
    log_info "Deploying application..."
    
    cd "$SCRIPT_DIR"
    
    # Pull latest code (if git repo)
    if [ -d .git ]; then
        log_info "Pulling latest code from Git..."
        git fetch origin
        git reset --hard origin/main 2>/dev/null || git reset --hard origin/master
    fi
    
    # Install PHP dependencies
    log_info "Installing Composer dependencies..."
    composer install --no-dev --optimize-autoloader --no-interaction
    
    # Install Node dependencies and build
    log_info "Installing Node.js dependencies..."
    npm ci --production=false
    
    log_info "Building frontend assets..."
    npm run build
    
    # Laravel optimizations
    log_info "Running Laravel optimizations..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache
    
    # Run migrations
    log_info "Running database migrations..."
    php artisan migrate --force
    
    # Clear and rebuild caches
    php artisan optimize:clear
    php artisan optimize
    
    # Restart services
    log_info "Restarting services..."
    if command -v systemctl &> /dev/null; then
        systemctl restart php${PHP_VERSION}-fpm 2>/dev/null || systemctl restart php-fpm 2>/dev/null || true
        systemctl restart nginx 2>/dev/null || systemctl restart httpd 2>/dev/null || true
        systemctl restart supervisor 2>/dev/null || supervisorctl reread && supervisorctl update 2>/dev/null || true
    fi
    
    log_success "Deployment completed successfully!"
}

show_help() {
    echo "Usage: ./deploy.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --install     Run full installation (first-time setup)"
    echo "  --configure   Run configuration only"
    echo "  --backup      Create backup only"
    echo "  --rollback    Rollback to previous version"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh              # Standard deployment"
    echo "  ./deploy.sh --install    # First-time installation"
    echo "  ./deploy.sh --rollback   # Rollback to previous version"
}

#=============================================================================
# Main Entry Point
#=============================================================================

main() {
    echo ""
    echo "=================================================="
    echo "   ${APP_NAME} Deployment Script"
    echo "=================================================="
    echo ""
    
    detect_os
    
    case "${1:-deploy}" in
        --install)
            check_root
            run_install
            run_configure
            deploy_application
            ;;
        --configure)
            check_root
            run_configure
            ;;
        --backup)
            run_backup
            ;;
        --rollback)
            if [ -f "${SCRIPTS_DIR}/rollback.sh" ]; then
                bash "${SCRIPTS_DIR}/rollback.sh"
            else
                log_error "rollback.sh not found"
                exit 1
            fi
            ;;
        --help|-h)
            show_help
            ;;
        deploy|*)
            run_backup
            deploy_application
            ;;
    esac
}

main "$@"
