#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
echo "Node version:"
node -v
echo "NPM version:"
npm -v
echo "Current directory:"
pwd
echo "List directory:"
ls -la
echo "Attempting install:"
npm install --no-bin-links --verbose
