@echo off
cd /d "%~dp0"
echo Starting Carrow Admin...
node scripts/start-admin.cjs
pause