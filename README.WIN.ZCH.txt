npm install
npm run dev

npm install && npm run dev

npm run format
npm run pre-commit
npm run pre-deploy

npm run format && npm run pre-deploy

npm run format && npm run pre-commit && npm run pre-deploy

npm install && npm run format && npm run pre-commit && npm run pre-deploy

rm -r -fo dist, node_modules
rm -r -fo dist, node_modules && npm install
rm -r -fo dist, node_modules && npm install && npm run dev

cmd:
rmdir /s /q dist && rmdir /s /q node_modules && npm install && npm run dev

请不要执行 run,build 等命令,可以执行 install 等命令,如果一定要执行请告诉我,执行哪个命令我来一步一步执行
本项目使用 npm
http://localhost:3000/dashboard/bookmark/zch
