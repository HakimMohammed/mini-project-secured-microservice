@echo off
REM ===================================================================
REM Security Scanning Script - DevSecOps Pipeline (Windows)
REM ===================================================================
REM Usage: run-security-scans.bat [all|sonar|dependency|trivy]
REM ===================================================================

setlocal enabledelayedexpansion

REM Get the script directory and project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\"
cd /d "%PROJECT_ROOT%"

set REPORTS_DIR=devsecops\security-reports
set SCAN_TYPE=%1

if "%SCAN_TYPE%"=="" set SCAN_TYPE=all

echo ================================================
echo   DevSecOps Security Scanning Pipeline
echo ================================================
echo.

REM Create reports directories
if not exist "%REPORTS_DIR%\sonarqube" mkdir "%REPORTS_DIR%\sonarqube"
if not exist "%REPORTS_DIR%\dependency-check" mkdir "%REPORTS_DIR%\dependency-check"
if not exist "%REPORTS_DIR%\trivy" mkdir "%REPORTS_DIR%\trivy"

REM ===================================================================
REM SonarQube Scanning
REM ===================================================================
:sonar_scan
if "%SCAN_TYPE%"=="dependency" goto dependency_scan
if "%SCAN_TYPE%"=="trivy" goto trivy_scan

echo [1/3] Running SonarQube Static Code Analysis...

REM Check if SonarQube is running
curl -s http://localhost:9000/api/system/status >nul 2>&1
if errorlevel 1 (
    echo ERROR: SonarQube is not running!
    echo Start it with: docker-compose -f docker-compose.devsecops.yml up -d sonarqube
    if "%SCAN_TYPE%"=="sonar" exit /b 1
    goto dependency_scan
)

echo Waiting for SonarQube to be ready...
timeout /t 10 /nobreak >nul

REM Scan each service
for %%s in (product-service order-service gateway-service) do (
    echo Scanning %%s...
    pushd server\%%s
    if exist mvnw.cmd (
        call mvnw.cmd clean verify sonar:sonar ^
            -Dsonar.projectKey=%%s ^
            -Dsonar.projectName="%%s" ^
            -Dsonar.host.url=http://localhost:9000 ^
            -Dsonar.token=%SONAR_TOKEN%
    ) else (
        echo ERROR: mvnw.cmd not found in %%s
    )
    popd
)

echo SonarQube analysis completed
echo View results at: http://localhost:9000
echo.

if "%SCAN_TYPE%"=="sonar" goto end

REM ===================================================================
REM Dependency-Check Scanning
REM ===================================================================

REM Check if NVD_API_KEY is set
if "%NVD_API_KEY%"=="" (
    echo WARNING: NVD_API_KEY environment variable is not set!
    echo Dependency-Check will run without NVD API access (very slow).
    echo.
    echo To get an API key:
    echo 1. Visit: https://nvd.nist.gov/developers/request-an-api-key
    echo 2. Set it: setx NVD_API_KEY "your-key-here"
    echo.
    set /p "continue=Continue anyway? (y/N): "
    if /i not "!continue!"=="y" goto end
)

REM Run dependency check with API key
:dependency_scan
echo [2/3] Running OWASP Dependency-Check...

docker run --rm ^
    -v "%PROJECT_ROOT%server:/src" ^
    -v "%PROJECT_ROOT%%REPORTS_DIR%\dependency-check:/report" ^
    -v dependency_check_data:/usr/share/dependency-check/data ^
    owasp/dependency-check:latest ^
    --scan /src ^
    --format ALL ^
    --project "EShop-Microservices" ^
    --out /report ^
    --nvdApiKey %NVD_API_KEY% ^
    --enableExperimental

echo Dependency-Check completed
echo View HTML report: %REPORTS_DIR%\dependency-check\dependency-check-report.html
echo.

if "%SCAN_TYPE%"=="dependency" goto end

REM ===================================================================
REM Trivy Image Scanning
REM ===================================================================
:trivy_scan
echo [3/3] Running Trivy Docker Image Scanning...

for %%i in (product-service order-service gateway-service frontend) do (
    echo Scanning %%i:latest...
    
    docker run --rm ^
        -v //var/run/docker.sock:/var/run/docker.sock ^
        -v "%PROJECT_ROOT%%REPORTS_DIR%\trivy:/reports" ^
        aquasec/trivy:latest image ^
        --severity HIGH,CRITICAL ^
        --format table ^
        --output /reports/%%i_report.txt ^
        %%i:latest 2>nul
    
    if errorlevel 1 (
        echo WARNING: Image %%i:latest not found. Build it first with docker-compose build
    )
)

echo Trivy scanning completed
echo View reports in: %REPORTS_DIR%\trivy\
echo.

REM ===================================================================
REM Summary
REM ===================================================================
:end
if "%SCAN_TYPE%"=="all" (
    echo ================================================
    echo   Security Scan Summary
    echo ================================================
    echo.
    echo All security scans completed successfully!
    echo.
    echo Reports generated in: %REPORTS_DIR%\
    echo.
    echo Next steps:
    echo 1. Review SonarQube dashboard: http://localhost:9000
    echo 2. Check dependency vulnerabilities: %REPORTS_DIR%\dependency-check\dependency-check-report.html
    echo 3. Review Trivy image scans: %REPORTS_DIR%\trivy\
    echo.
    echo WARNING: Fix any CRITICAL or HIGH severity issues before deployment
    echo.
)

echo Done!
endlocal