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
REM 1. SonarQube Scannning
REM ===================================================================
:sonar_scan
if "%SCAN_TYPE%"=="dependency" goto dependency_scan
if "%SCAN_TYPE%"=="trivy" goto trivy_scan

echo [1/3] Running SonarQube Static Code Analysis...

REM Check if SonarQube is running
curl -s http://localhost:9000/api/system/status >nul 2>&1
if errorlevel 1 (
    echo SonarQube is not running. Starting security services...
    docker-compose --profile security up -d sonarqube postgres-sonarqube
    
    echo Waiting for SonarQube to be ready...
    timeout /t 30 /nobreak >nul
    
    :wait_loop
    curl -s http://localhost:9000/api/system/status | find "UP" >nul
    if errorlevel 1 (
        echo Still waiting...
        timeout /t 5 /nobreak >nul
        goto wait_loop
    )
)

echo SonarQube is ready.

REM Automate Setup: Change default password (admin/admin -> admin/admin123)
REM This allows us to run analysis without manual configuration
echo Configuring SonarQube credentials...
curl -s -u admin:admin -X POST "http://localhost:9000/api/users/change_password?login=admin&previousPassword=admin&password=admin123" >nul 2>&1

REM Scan each service
for %%s in (product-service order-service gateway-service) do (
    echo Scanning %%s...
    pushd server\%%s
    if exist mvnw.cmd (
        REM Run analysis using the automated credentials (admin/admin123)
        call mvnw.cmd clean verify sonar:sonar ^
            -Dsonar.projectKey=%%s ^
            -Dsonar.projectName="%%s" ^
            -Dsonar.host.url=http://localhost:9000 ^
            -Dsonar.login=admin ^
            -Dsonar.password=admin123
            
        if errorlevel 1 (
            echo WARNING: SonarQube analysis failed for %%s. Check logs.
        ) else (
            echo SUCCESS: %%s scanned.
        )
    ) else (
        echo ERROR: mvnw.cmd not found in %%s
    )
    popd
)

echo SonarQube analysis completed.
echo.

if "%SCAN_TYPE%"=="sonar" goto end

REM ===================================================================
REM 2. Dependency-Check Scanning
REM ===================================================================
:dependency_scan

echo [2/3] Running OWASP Dependency-Check...
echo Note: It is normal for the dependency-check container to exit after scanning.

if "%NVD_API_KEY%"=="" (
    echo WARNING: NVD_API_KEY environment variable is not set!
    echo Dependency-Check will run without NVD API access (slower).
)

REM Use docker-compose run for a one-off task
REM We ignore errors here so the pipeline continues
docker-compose --profile security run --rm dependency-check
if errorlevel 1 echo WARNING: Dependency-Check found issues or failed.

echo Dependency-Check phase completed.
echo View HTML report: %REPORTS_DIR%\dependency-check\dependency-check-report.html
echo.

if "%SCAN_TYPE%"=="dependency" goto end

REM ===================================================================
REM 3. Trivy Image Scanning
REM ===================================================================
:trivy_scan
echo [3/3] Running Trivy Docker Image Scanning...
echo Note: It is normal for the trivy container to exit after scanning.

REM Ensure images are built first
echo Ensuring images are built...
docker-compose --profile app build product-service order-service gateway-service frontend >nul 2>&1

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
    
    REM Generate JSON for records
    docker run --rm ^
        -v //var/run/docker.sock:/var/run/docker.sock ^
        -v "%PROJECT_ROOT%%REPORTS_DIR%\trivy:/reports" ^
        aquasec/trivy:latest image ^
        --severity HIGH,CRITICAL ^
        --format json ^
        --output /reports/%%i_report.json ^
        %%i:latest 2>nul
        
    echo Report generated: %REPORTS_DIR%\trivy\%%i_report.txt
)

echo Trivy scanning completed.
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
    echo 1. SonarQube: http://localhost:9000 (Login: admin / admin123)
    echo 2. Dependency-Check: %REPORTS_DIR%\dependency-check\dependency-check-report.html
    echo 3. Trivy Reports: %REPORTS_DIR%\trivy\
    echo.
)

echo Done!
endlocal