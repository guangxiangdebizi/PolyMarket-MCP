#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      cwd: projectRoot, 
      stdio: 'inherit',
      ...options 
    });
  } catch (error) {
    log(`❌ Command failed: ${command}`, 'red');
    process.exit(1);
  }
}

function checkFile(filePath, description) {
  const fullPath = join(projectRoot, filePath);
  if (!existsSync(fullPath)) {
    log(`❌ Missing ${description}: ${filePath}`, 'red');
    return false;
  }
  log(`✅ Found ${description}`, 'green');
  return true;
}

function checkPackageJson() {
  const packagePath = join(projectRoot, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  
  const requiredFields = ['name', 'version', 'description', 'author', 'license', 'repository'];
  let allFieldsPresent = true;
  
  for (const field of requiredFields) {
    if (!packageJson[field]) {
      log(`❌ Missing required field in package.json: ${field}`, 'red');
      allFieldsPresent = false;
    }
  }
  
  if (allFieldsPresent) {
    log(`✅ Package.json has all required fields`, 'green');
    log(`📦 Package: ${packageJson.name}@${packageJson.version}`, 'blue');
  }
  
  return allFieldsPresent;
}

function runPrePublishChecks() {
  log('🔍 Running pre-publish checks...', 'yellow');
  
  let allChecksPassed = true;
  
  // Check required files
  allChecksPassed &= checkFile('README.md', 'README file');
  allChecksPassed &= checkFile('LICENSE', 'LICENSE file');
  allChecksPassed &= checkFile('package.json', 'package.json');
  allChecksPassed &= checkPackageJson();
  
  // Check if build directory exists
  if (!existsSync(join(projectRoot, 'build'))) {
    log('❌ Build directory not found. Running build...', 'yellow');
    exec('npm run build');
  } else {
    log('✅ Build directory exists', 'green');
  }
  
  // Check if we're logged into npm
  try {
    exec('npm whoami', { stdio: 'pipe' });
    log('✅ Logged into NPM', 'green');
  } catch {
    log('❌ Not logged into NPM. Please run: npm login', 'red');
    allChecksPassed = false;
  }
  
  return allChecksPassed;
}

function main() {
  const args = process.argv.slice(2);
  const versionType = args[0] || 'patch';
  const isDryRun = args.includes('--dry-run');
  const isPublic = args.includes('--public');
  
  log('🚀 Polymarket MCP Publishing Script', 'blue');
  log('=====================================', 'blue');
  
  if (!runPrePublishChecks()) {
    log('❌ Pre-publish checks failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
  
  log('✅ All pre-publish checks passed!', 'green');
  
  if (isDryRun) {
    log('🧪 Dry run mode - no actual publishing', 'yellow');
    exec('npm pack');
    log('📦 Package created successfully (dry run)', 'green');
    return;
  }
  
  // Update version
  log(`📈 Updating version (${versionType})...`, 'yellow');
  exec(`npm version ${versionType}`);
  
  // Build the project
  log('🔨 Building project...', 'yellow');
  exec('npm run build');
  
  // Publish
  const publishCommand = isPublic ? 'npm publish --access public' : 'npm publish';
  log(`📤 Publishing to NPM...`, 'yellow');
  exec(publishCommand);
  
  log('🎉 Package published successfully!', 'green');
  
  // Show package info
  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
  log(`\n📊 Package Information:`, 'blue');
  log(`   Name: ${packageJson.name}`, 'blue');
  log(`   Version: ${packageJson.version}`, 'blue');
  log(`   Install: npm install ${packageJson.name}`, 'blue');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}