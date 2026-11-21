#!/bin/bash

# Bang Buay VA Setup Script
# Jalankan script ini untuk setup VA Bubble dengan cepat

set -e

echo "🎉 Bang Buay Virtual Assistant - Setup Script"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo -e "${BLUE}Step 1: Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js tidak ditemukan. Silakan install Node.js terlebih dahulu."
    echo "   Download dari: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VERSION found${NC}"
echo ""

# Step 2: Check Python/Django
echo -e "${BLUE}Step 2: Checking Python and Django...${NC}"
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 tidak ditemukan."
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✅ $PYTHON_VERSION found${NC}"
echo ""

# Step 3: Install Node dependencies
echo -e "${BLUE}Step 3: Installing Node dependencies...${NC}"
cd fitur-ai
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Create .env file
echo -e "${BLUE}Step 4: Setting up environment variables...${NC}"
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    read -p "Enter your Gemini API Key: " API_KEY
    echo "VITE_GEMINI_API_KEY=$API_KEY" > .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo "⚠️  .env file already exists. Skipping..."
fi
echo ""

# Step 5: Build project
echo -e "${BLUE}Step 5: Building VA Bubble...${NC}"
npm run build
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Step 6: Copy to Django static
echo -e "${BLUE}Step 6: Copying files to Django static folder...${NC}"
mkdir -p ../static/fitur-ai
cp -r dist/* ../static/fitur-ai/
echo -e "${GREEN}✅ Files copied${NC}"
echo ""

# Step 7: Django static collection
echo -e "${BLUE}Step 7: Collecting Django static files...${NC}"
cd ..
python3 manage.py collectstatic --noinput
echo -e "${GREEN}✅ Static files collected${NC}"
echo ""

# Step 8: Summary
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "===================== NEXT STEPS ==================="
echo ""
echo "1. Run Django server:"
echo "   ${YELLOW}python3 manage.py runserver${NC}"
echo ""
echo "2. Open browser and login to:"
echo "   http://localhost:8000/"
echo ""
echo "3. You should see the Bang Buay chat bubble at the"
echo "   bottom right corner of the page!"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
