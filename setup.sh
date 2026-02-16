#!/bin/bash

#=============================================================================
# Wujha Admin Panel - Quick Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/mazonyfahmi/wujha-admin/main/setup.sh | sudo bash
# Or:    wget -qO- https://raw.githubusercontent.com/mazonyfahmi/wujha-admin/main/setup.sh | sudo bash
#=============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${GREEN}=================================================="
echo "   Wujha Admin Panel - Quick Installer"
echo -e "==================================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Please run as root: sudo bash setup.sh"
    exit 1
fi

# Configuration
REPO_URL="https://github.com/mazonyfahmi/wujha-admin.git"
INSTALL_DIR="/home/${SUDO_USER:-ubuntu}/wujha-admin"
BRANCH="main"

echo -e "${BLUE}[INFO]${NC} Repository:  ${REPO_URL}"
echo -e "${BLUE}[INFO]${NC} Install Dir: ${INSTALL_DIR}"
echo -e "${BLUE}[INFO]${NC} Branch:      ${BRANCH}"
echo ""

# Install git if not available
if ! command -v git &> /dev/null; then
    echo -e "${BLUE}[INFO]${NC} Installing git..."
    apt update -y && apt install -y git 2>/dev/null || \
    dnf install -y git 2>/dev/null || \
    yum install -y git 2>/dev/null
fi

# Fix git dubious ownership
git config --global --add safe.directory "${INSTALL_DIR}" 2>/dev/null || true

# Clone or update repository
if [ -d "${INSTALL_DIR}/.git" ]; then
    echo -e "${BLUE}[INFO]${NC} Repository already exists, pulling latest changes..."
    cd "${INSTALL_DIR}"
    
    # Reset any local changes and pull
    git fetch origin
    git reset --hard origin/${BRANCH} 2>/dev/null || git reset --hard origin/master
    
    echo -e "${GREEN}[SUCCESS]${NC} Repository updated!"
else
    echo -e "${BLUE}[INFO]${NC} Cloning repository..."
    git clone -b ${BRANCH} "${REPO_URL}" "${INSTALL_DIR}" 2>/dev/null || \
    git clone "${REPO_URL}" "${INSTALL_DIR}"
    
    echo -e "${GREEN}[SUCCESS]${NC} Repository cloned!"
fi

cd "${INSTALL_DIR}"

# Fix ownership (ensure the actual user owns the files, not root)
ACTUAL_USER="${SUDO_USER:-ubuntu}"
chown -R ${ACTUAL_USER}:${ACTUAL_USER} "${INSTALL_DIR}"

# Make deploy script executable
chmod +x deploy.sh
chmod +x scripts/*.sh 2>/dev/null || true

echo ""
echo -e "${GREEN}[SUCCESS]${NC} Project downloaded successfully!"
echo ""
echo -e "${BLUE}[INFO]${NC} Starting installation..."
echo ""

# Run the main deployment script
bash deploy.sh --install

echo ""
echo -e "${GREEN}=================================================="
echo "   Installation Complete!"
echo -e "==================================================${NC}"
echo ""
