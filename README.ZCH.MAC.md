npm install --registry=https://registry.npmmirror.com
npm install
npm run dev

npm install && npm run dev

npm run format
npm run pre-commit
npm run pre-deploy

npm run format && npm run pre-deploy

npm run format && npm run pre-commit && npm run pre-deploy

npm install && npm run format && npm run pre-commit && npm run pre-deploy

rm -r -f dist
rm -r -f node_modules
rm -r -f package-lock.json

rm -r -f node_modules && npm install
rm -r -f node_modules && npm install && npm run dev

