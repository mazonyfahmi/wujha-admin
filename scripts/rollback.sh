#!/bin/bash

#=============================================================================
# Wujha Admin Panel - Rollback Script
# Restores application to a previous backup
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

#=============================================================================
# Rollback Functions
#=============================================================================

list_backups() {
    log_info "Available backups:"
    echo ""
    
    if [ -d "${BACKUP_DIR}" ]; then
        local i=1
        for backup in $(ls -dt "${BACKUP_DIR}"/backup_* 2>/dev/null); do
            local name=$(basename "$backup")
            local manifest="${backup}/manifest.json"
            
            if [ -f "$manifest" ]; then
                local created_at=$(cat "$manifest" | grep -o '"created_at": "[^"]*"' | cut -d'"' -f4)
                echo "  [$i] $name (Created: $created_at)"
            else
                echo "  [$i] $name"
            fi
            ((i++))
        done
        
        if [ $i -eq 1 ]; then
            log_warning "No backups found"
            exit 1
        fi
    else
        log_warning "Backup directory not found"
        exit 1
    fi
    
    echo ""
}

select_backup() {
    list_backups
    
    read -p "Enter backup number to restore (or 'q' to quit): " selection
    
    if [ "$selection" = "q" ]; then
        log_info "Rollback cancelled"
        exit 0
    fi
    
    # Get the selected backup
    local backups=($(ls -dt "${BACKUP_DIR}"/backup_* 2>/dev/null))
    local index=$((selection - 1))
    
    if [ $index -lt 0 ] || [ $index -ge ${#backups[@]} ]; then
        log_error "Invalid selection"
        exit 1
    fi
    
    SELECTED_BACKUP="${backups[$index]}"
    log_info "Selected: $(basename $SELECTED_BACKUP)"
}

restore_database() {
    local backup_path="$1"
    local db_file="${backup_path}/database.sql"
    
    if [ ! -f "$db_file" ]; then
        log_warning "No database backup found, skipping database restore"
        return
    fi
    
    log_info "Restoring database..."
    
    cd "${APP_PATH}"
    
    # Read database config from .env
    if [ -f .env ]; then
        export $(grep -E '^DB_(CONNECTION|HOST|PORT|DATABASE|USERNAME|PASSWORD)=' .env | xargs)
    fi
    
    case "${DB_CONNECTION:-mysql}" in
        mysql)
            mysql -h "${DB_HOST:-localhost}" \
                  -P "${DB_PORT:-3306}" \
                  -u "${DB_USERNAME}" \
                  -p"${DB_PASSWORD}" \
                  "${DB_DATABASE}" < "$db_file"
            log_success "MySQL database restored"
            ;;
        pgsql)
            PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST:-localhost}" \
                                             -p "${DB_PORT:-5432}" \
                                             -U "${DB_USERNAME}" \
                                             "${DB_DATABASE}" < "$db_file"
            log_success "PostgreSQL database restored"
            ;;
        sqlite)
            local sqlite_backup="${backup_path}/database.sqlite"
            if [ -f "$sqlite_backup" ]; then
                cp "$sqlite_backup" "${DB_DATABASE}"
                log_success "SQLite database restored"
            fi
            ;;
    esac
}

restore_storage() {
    local backup_path="$1"
    local storage_file="${backup_path}/storage.tar.gz"
    
    if [ ! -f "$storage_file" ]; then
        log_warning "No storage backup found, skipping storage restore"
        return
    fi
    
    log_info "Restoring storage files..."
    
    # Backup current storage first
    if [ -d "${APP_PATH}/storage/app/public" ]; then
        mv "${APP_PATH}/storage/app/public" "${APP_PATH}/storage/app/public_old_$(date +%s)"
    fi
    
    # Extract storage backup
    tar -xzf "$storage_file" -C "${APP_PATH}/storage/app"
    
    log_success "Storage files restored"
}

restore_git() {
    local backup_path="$1"
    local commit_file="${backup_path}/git_commit.txt"
    
    if [ ! -f "$commit_file" ]; then
        log_warning "No Git commit info found, skipping Git restore"
        return
    fi
    
    log_info "Restoring Git state..."
    
    cd "${APP_PATH}"
    
    local commit=$(cat "$commit_file")
    
    if [ -d .git ]; then
        read -p "Restore to commit ${commit}? [y/N] " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            git fetch origin
            git checkout "$commit"
            log_success "Git state restored to ${commit}"
        else
            log_warning "Git restore skipped"
        fi
    fi
}

rebuild_application() {
    log_info "Rebuilding application..."
    
    cd "${APP_PATH}"
    
    # Install dependencies
    composer install --no-dev --optimize-autoloader --no-interaction
    npm ci --production=false
    npm run build
    
    # Clear caches
    php artisan optimize:clear
    php artisan optimize
    
    # Set permissions
    chown -R www-data:www-data "${APP_PATH}" 2>/dev/null || true
    chmod -R 775 "${APP_PATH}/storage"
    chmod -R 775 "${APP_PATH}/bootstrap/cache"
    
    log_success "Application rebuilt"
}

#=============================================================================
# Main
#=============================================================================

main() {
    log_info "Wujha Admin Panel - Rollback Script"
    echo ""
    
    # Check for specific backup argument
    if [ -n "$1" ] && [ -d "${BACKUP_DIR}/$1" ]; then
        SELECTED_BACKUP="${BACKUP_DIR}/$1"
        log_info "Using specified backup: $1"
    else
        select_backup
    fi
    
    echo ""
    log_warning "This will restore the application to a previous state!"
    read -p "Are you sure you want to continue? [y/N] " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "Rollback cancelled"
        exit 0
    fi
    
    # Create a backup before rollback
    log_info "Creating pre-rollback backup..."
    bash "$(dirname $0)/backup.sh"
    
    # Perform rollback
    restore_database "$SELECTED_BACKUP"
    restore_storage "$SELECTED_BACKUP"
    restore_git "$SELECTED_BACKUP"
    rebuild_application
    
    log_success "Rollback completed successfully!"
}

main "$@"
