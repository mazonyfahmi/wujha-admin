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
PHP_VERSION="8.4"
NODE_VERSION="20"
export COMPOSER_ALLOW_SUPERUSER=1

# Detect the actual system user (not root when using sudo)
ACTUAL_USER="${SUDO_USER:-$(whoami)}"
ACTUAL_GROUP="${ACTUAL_USER}"

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
        echo "Usage: sudo ./deploy.sh [OPTIONS]"
        exit 1
    fi
}

check_dependencies() {
    local missing=0
    for cmd in php composer npm node git; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd command not found"
            missing=1
        fi
    done
    
    if [ $missing -eq 1 ]; then
        log_error "Missing dependencies. If this is a new server, run with --install first."
        log_info "Usage: sudo ./deploy.sh --install"
        exit 1
    fi
}

#=============================================================================
# Git Operations
#=============================================================================

fix_git_ownership() {
    # Fix dubious ownership for running git as root on user-owned directories
    git config --global --add safe.directory "${SCRIPT_DIR}" 2>/dev/null || true
}

pull_code() {
    log_info "Pulling latest code from Git..."
    
    fix_git_ownership
    
    if [ -d "${SCRIPT_DIR}/.git" ]; then
        git -C "${SCRIPT_DIR}" fetch origin
        git -C "${SCRIPT_DIR}" reset --hard origin/main 2>/dev/null || \
        git -C "${SCRIPT_DIR}" reset --hard origin/master 2>/dev/null || \
        log_warning "Could not reset to remote branch"
    else
        log_warning "Not a git repository, skipping pull"
    fi
}

#=============================================================================
# File Permissions
#=============================================================================

fix_permissions() {
    log_info "Fixing file permissions..."
    
    # The project lives inside a user home directory.
    # Nginx (www-data) needs execute permission on all parent dirs to reach public/
    local home_dir=$(dirname "${SCRIPT_DIR}")
    chmod 755 "${home_dir}" 2>/dev/null || true
    
    # Set ownership: user owns the files, www-data group for web server access
    chown -R ${ACTUAL_USER}:www-data "${SCRIPT_DIR}"
    
    # Set directory permissions (read+exec for group)
    find "${SCRIPT_DIR}" -type d -exec chmod 755 {} \;
    
    # Set file permissions (read for group)
    find "${SCRIPT_DIR}" -type f -exec chmod 644 {} \;
    
    # Storage and cache: writable by both user and www-data
    chmod -R 775 "${SCRIPT_DIR}/storage" "${SCRIPT_DIR}/bootstrap/cache"
    
    # Make scripts executable
    chmod +x "${SCRIPT_DIR}/deploy.sh"
    chmod +x "${SCRIPT_DIR}/artisan" 2>/dev/null || true
    find "${SCRIPT_DIR}/scripts" -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
    
    log_success "Permissions fixed!"
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

install_dependencies() {
    log_info "Installing application dependencies..."
    cd "$SCRIPT_DIR"
    
    # Install PHP dependencies
    log_info "Installing Composer dependencies..."
    composer install --no-dev --optimize-autoloader --no-interaction
    
    # Install Node dependencies using npm install (not npm ci) to handle lock mismatches
    log_info "Installing Node.js dependencies..."
    npm install --production=false
    
    log_info "Building frontend assets..."
    npm run build
}

run_configure() {
    log_info "Running configuration script..."
    if [ -f "${SCRIPTS_DIR}/configure.sh" ]; then
        # Pass the actual user so configure.sh can use it
        ACTUAL_USER="${ACTUAL_USER}" bash "${SCRIPTS_DIR}/configure.sh"
    else
        log_error "configure.sh not found in ${SCRIPTS_DIR}"
        exit 1
    fi
}

deploy_application() {
    check_dependencies
    
    log_info "Deploying application..."
    
    cd "$SCRIPT_DIR"
    
    # Pull latest code (if git repo)
    pull_code
    
    install_dependencies
    
    # Run migrations
    log_info "Running database migrations..."
    php artisan migrate --force
    
    # Clear and rebuild caches
    php artisan optimize:clear
    php artisan optimize
    
    # Storage link
    if [ ! -L "${SCRIPT_DIR}/public/storage" ]; then
        log_info "Linking storage..."
        php artisan storage:link
    fi
    
    # Fix permissions (user:www-data, NOT www-data:www-data)
    fix_permissions
    
    # Restart services
    log_info "Restarting services..."
    if command -v systemctl &> /dev/null; then
        systemctl restart php${PHP_VERSION}-fpm 2>/dev/null || systemctl restart php-fpm 2>/dev/null || true
        systemctl restart nginx 2>/dev/null || systemctl restart httpd 2>/dev/null || true
        supervisorctl reread 2>/dev/null || true
        supervisorctl update 2>/dev/null || true
        supervisorctl restart ${APP_NAME}-worker:* 2>/dev/null || true
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
    echo "  sudo ./deploy.sh              # Standard deployment (update)"
    echo "  sudo ./deploy.sh --install    # First-time installation"
    echo "  sudo ./deploy.sh --rollback   # Rollback to previous version"
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
    
    # Fix git ownership immediately on startup
    fix_git_ownership
    
    case "${1:-deploy}" in
        --install)
            check_root
            run_install
            install_dependencies
            run_configure
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
            check_root
            run_backup
            deploy_application
            ;;
    esac
}

main "$@"
