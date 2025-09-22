#!/bin/bash

echo "========================================"
echo "   IoT Hub - Dependencies Installation"
echo "========================================"
echo

echo "[1/4] Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Node.js dependencies"
    exit 1
fi

echo
echo "[2/4] Installing TypeScript globally..."
npm install -g typescript
if [ $? -ne 0 ]; then
    echo "WARNING: Failed to install TypeScript globally"
    echo "You can still run the project with local TypeScript"
fi

echo
echo "[3/4] Installing Vite globally..."
npm install -g vite
if [ $? -ne 0 ]; then
    echo "WARNING: Failed to install Vite globally"
    echo "You can still run the project with local Vite"
fi

echo
echo "[4/4] Verifying installation..."
npm list --depth=0
if [ $? -ne 0 ]; then
    echo "WARNING: Some dependencies might not be installed correctly"
fi

echo
echo "========================================"
echo "   Installation Complete!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your environment variables"
echo "2. Run the database setup scripts in Supabase"
echo "3. Run: npm run dev"
echo
echo "For detailed setup instructions, see README.md"
echo
