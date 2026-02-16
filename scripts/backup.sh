#!/bin/bash

#=============================================================================
# Wujha Admin Panel - Backup Script
# Creates backups of database, storage, and configuration
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
BACKUP_DIR="${APP_PATH}/storage/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_${TIMESTAMP}"
KEEP_BACKUPS=5  # Number of backups to keep

#=============================================================================
# Backup Functions
#=============================================================================

create_backup_dir() {
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"
    log_info "Backup directory: ${BACKUP_DIR}/${BACKUP_NAME}"
}

backup_database() {
    log_info "Backing up database..."
    
    cd "${APP_PATH}"
    
    # Read database config from .env
    if [ -f .env ]; then
        export $(grep -E '^DB_(CONNECTION|HOST|PORT|DATABASE|USERNAME|PASSWORD)=' .env | xargs)
    fi
    
    if [ -z "$DB_DATABASE" ]; then
        log_warning "Database not configured, skipping database backup"
        return
    fi
    
    case "${DB_CONNECTION:-mysql}" in
        mysql)
            if command -v mysqldump &> /dev/null; then
                mysqldump -h "${DB_HOST:-localhost}" \
                          -P "${DB_PORT:-3306}" \
                          -u "${DB_USERNAME}" \
                          -p"${DB_PASSWORD}" \
                          "${DB_DATABASE}" > "${BACKUP_DIR}/${BACKUP_NAME}/database.sql"
                log_success "MySQL database backed up"
            else
                log_warning "mysqldump not found, skipping database backup"
            fi
            ;;
        pgsql)
            if command -v pg_dump &> /dev/null; then
                PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${DB_HOST:-localhost}" \
                                                    -p "${DB_PORT:-5432}" \
                                                    -U "${DB_USERNAME}" \
                                                    "${DB_DATABASE}" > "${BACKUP_DIR}/${BACKUP_NAME}/database.sql"
                log_success "PostgreSQL database backed up"
            else
                log_warning "pg_dump not found, skipping database backup"
            fi
            ;;
        sqlite)
            if [ -f "${DB_DATABASE}" ]; then
                cp "${DB_DATABASE}" "${BACKUP_DIR}/${BACKUP_NAME}/database.sqlite"
                log_success "SQLite database backed up"
            fi
            ;;
        *)
            log_warning "Unknown database connection: ${DB_CONNECTION}"
            ;;
    esac
}

backup_storage() {
    log_info "Backing up storage files..."
    
    if [ -d "${APP_PATH}/storage/app" ]; then
        tar -czf "${BACKUP_DIR}/${BACKUP_NAME}/storage.tar.gz" \
            -C "${APP_PATH}/storage" app 2>/dev/null || true
        log_success "Storage files backed up"
    else
        log_warning "No storage files to backup"
    fi
}

backup_env() {
    log_info "Backing up .env file..."
    
    if [ -f "${APP_PATH}/.env" ]; then
        cp "${APP_PATH}/.env" "${BACKUP_DIR}/${BACKUP_NAME}/.env.backup"
        log_success ".env file backed up"
    fi
}

backup_git_info() {
    log_info "Saving Git information..."
    
    cd "${APP_PATH}"
    
    if [ -d .git ]; then
        git rev-parse HEAD > "${BACKUP_DIR}/${BACKUP_NAME}/git_commit.txt"
        git branch --show-current > "${BACKUP_DIR}/${BACKUP_NAME}/git_branch.txt" 2>/dev/null || true
        log_success "Git information saved"
    fi
}

cleanup_old_backups() {
    log_info "Cleaning up old backups (keeping last ${KEEP_BACKUPS})..."
    
    # List backup directories, sort by date, and remove oldest ones
    cd "${BACKUP_DIR}"
    ls -dt backup_* 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs rm -rf 2>/dev/null || true
    
    log_success "Old backups cleaned up"
}

create_manifest() {
    log_info "Creating backup manifest..."
    
    cat > "${BACKUP_DIR}/${BACKUP_NAME}/manifest.json" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "app_path": "${APP_PATH}",
    "hostname": "$(hostname)",
    "php_version": "$(php -v 2>/dev/null | head -1 || echo 'unknown')",
    "created_at": "$(date -Iseconds)"
}
EOF
    
    log_success "Manifest created"
}

#=============================================================================
# Main
#=============================================================================

main() {
    log_info "Starting backup process..."
    
    create_backup_dir
    backup_database
    backup_storage
    backup_env
    backup_git_info
    create_manifest
    cleanup_old_backups
    
    log_success "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}"
    echo "${BACKUP_DIR}/${BACKUP_NAME}"
}

main
