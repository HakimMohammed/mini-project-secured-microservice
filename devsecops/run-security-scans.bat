@echo off
REM ===================================================================
REM Security Scanning Script - DevSecOps Pipeline (Windows)
REM ===================================================================
REM Usage: run-security-scans.bat [all|sonar|dependency|trivy]
REM ===================================================================

setlocal enabledelayedexpansion

REM Get the script directory and switch to project root
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%..\"

REM Load .env file if it exists
if exist ".env" (
    echo Loading .env file...
    for /f "usebackq tokens=1* eol=# delims==" %%a in (".env") do (
        set "%%a=%%b"
    )
)

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

if "%SCAN_TYPE%"=="all" goto scan_all
if "%SCAN_TYPE%"=="dependency" goto dependency_scan
if "%SCAN_TYPE%"=="trivy" goto trivy_scan
if "%SCAN_TYPE%"=="sonar" goto sonar_scan

:scan_all
call :run_dependency_check
call :run_trivy_scan
call :run_sonar_scan
goto end

:dependency_scan
call :run_dependency_check
goto end

:trivy_scan
call :run_trivy_scan
goto end

:sonar_scan
call :run_sonar_scan
goto end

REM ===================================================================
REM Functions
REM ===================================================================

:run_dependency_check
echo.
echo [1/3] Running OWASP Dependency-Check...
echo Note: This container might exit after scanning.

docker-compose --profile security run --rm dependency-check
if errorlevel 1 echo WARNING: Dependency-Check found issues or failed.

echo Dependency-Check phase completed.
exit /b 0

:run_trivy_scan
echo.
echo [2/3] Running Trivy Security Scanning...

echo Ensuring images are built...
docker-compose --profile all build product-service order-service gateway-service frontend >nul 2>&1

for %%i in (product-service order-service gateway-service frontend) do (
    echo Scanning %%i...
    
    REM 1. Image Scan (Container Vulnerabilities)
    docker-compose --profile security run --rm trivy image ^
        --severity HIGH,CRITICAL ^
        --format table ^
        --output /reports/trivy/%%i_report.txt ^
        --scanners vuln ^
        %%i:latest
        
    docker-compose --profile security run --rm trivy image ^
        --severity HIGH,CRITICAL ^
        --format json ^
        --output /reports/trivy/%%i_report.json ^
        --scanners vuln ^
        %%i:latest

    REM 2. Filesystem Scan (Source Code -> SARIF)
    set "SRC_PATH="
    if exist "server\%%i" set "SRC_PATH=server\%%i"
    if "%%i"=="frontend" set "SRC_PATH=frontend"
    
    if defined SRC_PATH (
        echo   - Filesystem Scan ^(SARIF^)...
        
        docker run --rm ^
            -v "%cd%\!SRC_PATH!:/src" ^
            -v "%cd%\devsecops\security-reports:/reports" ^
            aquasec/trivy:latest fs ^
            --format sarif ^
            --output /reports/trivy/%%i.sarif ^
            /src
    )
)

echo Trivy scanning completed.
exit /b 0

:run_sonar_scan
echo.
echo [3/3] Running SonarQube Static Code Analysis...

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

if not "%SONAR_TOKEN%"=="" (
    set "SONAR_AUTH=-Dsonar.token=%SONAR_TOKEN%"
) else (
    echo Configuring SonarQube credentials...
    curl -s -u admin:admin -X POST "http://localhost:9000/api/users/change_password?login=admin&previousPassword=admin&password=admin123" >nul 2>&1
    set "SONAR_AUTH=-Dsonar.login=admin -Dsonar.password=admin123"
)

REM Reports Path (Relative to execution dir of mvnw)
set "REL_REPORTS=..\..\devsecops\security-reports"

REM 1. Backend Services (Java)
for %%s in (product-service order-service gateway-service) do (
    echo Scanning %%s...
    pushd server\%%s
    if exist mvnw.cmd (
        call mvnw.cmd clean verify sonar:sonar -DskipTests ^
            -Dsonar.projectKey=%%s ^
            -Dsonar.projectName="%%s" ^
            -Dsonar.host.url=http://localhost:9000 ^
            -Dsonar.sarif.reportPaths="%REL_REPORTS%\trivy\%%s.sarif,%REL_REPORTS%\dependency-check\dependency-check-report.sarif" ^
            %SONAR_AUTH%
            
        if errorlevel 1 (
            echo WARNING: SonarQube analysis failed for %%s.
        ) else (
            echo SUCCESS: %%s scanned.
        )
    )
    popd
)

REM 2. Frontend Service (React/JS)
echo Scanning frontend...
REM Use host.docker.internal to access SonarQube on localhost:9000 from container
docker run --rm ^
    -e SONAR_HOST_URL="http://host.docker.internal:9000" ^
    -v "%cd%\frontend:/usr/src" ^
    -v "%cd%\devsecops\security-reports:/reports" ^
    sonarsource/sonar-scanner-cli ^
    "-Dsonar.projectKey=frontend" ^
    "-Dsonar.projectName=frontend" ^
    "-Dsonar.sources=." ^
    "-Dsonar.tests=." ^
    "-Dsonar.test.inclusions=**/*.test.tsx,**/*.test.ts,**/*.spec.tsx" ^
    "-Dsonar.exclusions=**/node_modules/**,**/build/**,**/coverage/**" ^
    "-Dsonar.sarif.reportPaths=/reports/trivy/frontend.sarif" ^
    "-Dsonar.login=admin" ^
    "-Dsonar.password=admin123"

exit /b 0

:end
echo Done!
endlocal