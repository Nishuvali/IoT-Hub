#!/bin/bash

# IoT Hub - macOS Setup Script
# Optimized for MacBook Air and other macOS devices

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================"
echo -e "   IoT Hub - macOS Setup Script"
echo -e "========================================${NC}"
echo

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is designed for macOS only${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Running on macOS${NC}"
echo

# Check for required tools
echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js from: https://nodejs.org/${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18 or higher is required${NC}"
    echo -e "${YELLOW}Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"
echo

# Install dependencies
echo -e "${YELLOW}[2/6] Installing Node.js dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Node.js dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install Node.js dependencies${NC}"
    exit 1
fi

echo

# Install global tools
echo -e "${YELLOW}[3/6] Installing global development tools...${NC}"

# Install TypeScript globally
if npm install -g typescript; then
    echo -e "${GREEN}✅ TypeScript installed globally${NC}"
else
    echo -e "${YELLOW}⚠️  Failed to install TypeScript globally (optional)${NC}"
fi

# Install Vite globally
if npm install -g vite; then
    echo -e "${GREEN}✅ Vite installed globally${NC}"
else
    echo -e "${YELLOW}⚠️  Failed to install Vite globally (optional)${NC}"
fi

echo

# Verify installation
echo -e "${YELLOW}[4/6] Verifying installation...${NC}"
npm list --depth=0 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Installation verification complete${NC}"
else
    echo -e "${YELLOW}⚠️  Some dependencies might not be installed correctly${NC}"
fi

echo

# Create environment file
echo -e "${YELLOW}[5/6] Setting up environment configuration...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file from template${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env file with your configuration${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found, creating basic .env${NC}"
        cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
VITE_ADMIN_EMAIL=iothub1324@gmail.com
VITE_ADMIN_PASSWORD=Sidnish@1101
EOF
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

echo

# Final setup instructions
echo -e "${YELLOW}[6/6] Setup complete!${NC}"
echo
echo -e "${BLUE}========================================"
echo -e "   Setup Complete! 🎉"
echo -e "========================================${NC}"
echo
echo -e "${GREEN}Next steps:${NC}"
echo -e "1. ${YELLOW}Edit .env file${NC} with your Supabase credentials"
echo -e "2. ${YELLOW}Set up Supabase database${NC} using the SQL scripts"
echo -e "3. ${YELLOW}Start development server:${NC} npm run dev"
echo
echo -e "${BLUE}macOS-specific tips:${NC}"
echo -e "• Use ${YELLOW}Cmd+C${NC} to stop the development server"
echo -e "• Use ${YELLOW}Cmd+R${NC} to refresh the browser"
echo -e "• Use ${YELLOW}Cmd+Shift+R${NC} for hard refresh"
echo
echo -e "${GREEN}Admin Login:${NC}"
echo -e "Email: ${YELLOW}iothub1324@gmail.com${NC}"
echo -e "Password: ${YELLOW}Sidnish@1101${NC}"
echo
echo -e "${BLUE}For detailed instructions, see README.md${NC}"
echo
