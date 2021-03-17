echo "Creating build folder"
rm -rf build/
mkdir build/

npm install --only=dev

echo "Inicia build"
NODE_ENV=production gulp build

echo "Copia /app"
cp -rp app.js build/app.js
cp -rp api/. build/api
cp -rp core/. build/core
cp -rp rest/. build/rest
cp -rp ui/. build/ui
cp -rp install/. build/install
cp -rp robots.txt build/robots.txt
cp -rp swagger.js build/swagger.js
cp -rp README.md build/README.md
# mkdir build/public
cp -rp public/favicon.ico build/public/favicon.ico
cp -rp public/logo.png build/public/logo.png
cp -rp public/webfonts build/public/webfonts
touch build/.install

echo "Copia .env prod"
cp -rp prod.env build/.env

echo "Finaliza build"
