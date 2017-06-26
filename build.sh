#!/bin/bash
set -e

if [ ! -f web/src/main/webapp/keystore/encryptAuthResponse_Rijndael_256_PBEWithSHAAnd128BitRC4_100.key ]; then
            echo "keystore file not found! Please add it to the web/src/main/webapp/keystore/ folder and try again."
                exit 1
        fi
set -e

npm install
npm run compile
npm run lint
npm test
mvn clean install
