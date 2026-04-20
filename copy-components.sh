#!/bin/bash
# Script to copy components from Vite app to Next.js app

SOURCE="../Frontend UX Specification/src"
TARGET="./src"

echo "📦 Copying components and files..."

# Copy components
echo "Copying components..."
cp -r "$SOURCE/components" "$TARGET/" 2>/dev/null || echo "⚠️  Components folder exists or not found"

# Copy lib files
echo "Copying lib files..."
mkdir -p "$TARGET/lib"
cp "$SOURCE/lib/utils.ts" "$TARGET/lib/" 2>/dev/null || echo "⚠️  utils.ts not found"
cp "$SOURCE/lib/types.ts" "$TARGET/lib/" 2>/dev/null || echo "⚠️  types.ts not found"

# Copy assets
echo "Copying assets..."
cp -r "$SOURCE/assets" "$TARGET/" 2>/dev/null || echo "⚠️  Assets folder exists or not found"

# Copy styles
echo "Copying styles..."
mkdir -p "$TARGET/styles"
cp "$SOURCE/styles/globals.css" "$TARGET/styles/" 2>/dev/null || echo "⚠️  globals.css not found"

echo ""
echo "✅ Copy complete!"
echo ""
echo "⚠️  Note: You'll need to update components to use Next.js Link instead of onNavigate"
echo "   See SSR_MIGRATION.md for details"
