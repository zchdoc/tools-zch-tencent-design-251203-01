npm install
npm run dev

npm install && npm run dev

npm run format
npm run type-check
npm run pre-commit
npm run pre-deploy

npm run format && npm run pre-deploy

npm run format && npm run pre-commit && npm run pre-deploy
npm run format && npm run type-check && npm run pre-commit && npm run pre-deploy

npm install && npm run format && npm run pre-commit && npm run pre-deploy

rm -r -fo package-lock.json

rm -r -fo dist
rm -r -fo node_modules
rm -r -fo package-lock.json
rm -r -fo node_modules && npm install
rm -r -fo node_modules && npm install && npm run dev

rm -r -fo dist, node_modules package-lock.json
rm -r -fo dist, node_modules package-lock.json && npm install
rm -r -fo dist, node_modules package-lock.json && npm install && npm run dev

cmd:
rmdir /s /q dist && rmdir /s /q node_modules && npm install && npm run dev

