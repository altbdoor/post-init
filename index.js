#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { exit } from 'process';

const getPackage = () => {
    const packageFile = readFileSync('package.json', { encoding: 'utf8' });
    return JSON.parse(packageFile);
};

const setPackage = (packageContent) => {
    writeFileSync('package.json', JSON.stringify(packageContent, null, 4), {
        encoding: 'utf8',
    });
}

if (!existsSync('package.json')) {
    console.error('`package.json` not found!');
    throw new Error('Execution stopped.');
}

const setupPrettier = () => {
    console.log('>> Setting up prettier...');
    const packageContent = getPackage();

    if (!('scripts' in packageContent)) {
        packageContent.scripts = {};
    }

    packageContent.scripts.pretty = 'prettier --ignore-path .gitignore --write ./**/*.{json,js,html,css,ts}';
    packageContent.prettier = {
        tabWidth: 4,
        semi: true,
        singleQuote: true,
        printWidth: 120,
    };

    if (!('devDependencies' in packageContent)) {
        packageContent.devDependencies = {};
    }

    packageContent.devDependencies.prettier = '^2.0.0';
    setPackage(packageContent);
}

const setupPrivate = () => {
    console.log('>> Cleaning up `package.json`...');
    const packageContent = getPackage();

    ['name', 'version'].filter((key) => key in packageContent).forEach((key) => delete packageContent[key]);
    packageContent.private = true;
    setPackage(packageContent);
}

const setupVite = () => {
    console.log('>> Setting up vite project...');

    const packageContent = getPackage();
    if (!packageContent.scripts.build.includes('vite build --base=./')) {
        packageContent.scripts.build = packageContent.scripts.build.replace('vite build', 'vite build --base=./');
    }

    setPackage(packageContent);
}

// ========================================

setupPrettier();
setupPrivate();

const packageContent = getPackage();
if (JSON.stringify(packageContent).includes('vite')) {
    setupVite();
    exit();
}
