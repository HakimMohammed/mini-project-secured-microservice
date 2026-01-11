#!/bin/bash

# ===================================================================
# Security Scanning Script - DevSecOps Pipeline
# ===================================================================

set -e

# Get script directory and navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

REPORTS_DIR="devsecops/security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

mkdir -p "$REPORTS_DIR"/{sonarqube,dependency-check,trivy}

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  DevSecOps Security Scanning Pipeline${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# ===================================================================
# 1. SonarQube
# ===================================================================
run_sonarqube_scan() {
    echo -e "${YELLOW}[1/3] Running SonarQube Static Code Analysis...${NC}"
    
    # Check if SonarQube is running
    if ! curl -s http://localhost:9000/api/system/status > /dev/null 2>&1; then
        echo -e "${YELLOW}SonarQube is not running. Starting security services...${NC}"
        docker-compose --profile security up -d sonarqube postgres-sonarqube
        
        echo "Waiting for SonarQube to be ready..."
        until curl -s http://localhost:9000/api/system/status | grep -q '"status":"UP"'; do
            sleep 5
        done
    fi
    echo -e "${GREEN}✓ SonarQube is ready${NC}"
    
    # Automate Setup: Change default password (admin/admin -> admin/admin123)
    echo "Configuring SonarQube credentials..."
    curl -s -u admin:admin -X POST "http://localhost:9000/api/users/change_password?login=admin&previousPassword=admin&password=admin123" > /dev/null 2>&1 || true

    # Scan each microservice
    for service in product-service order-service gateway-service; do
        echo -e "${BLUE}Scanning $service...${NC}"
        pushd "server/$service" > /dev/null || continue
        
        # Run Maven analysis with admin123
        ./mvnw clean verify sonar:sonar \
            -Dsonar.projectKey=$service \
            -Dsonar.projectName="$service" \
            -Dsonar.host.url=http://localhost:9000 \
            -Dsonar.login=admin \
            -Dsonar.password=admin123 \
            || echo -e "${YELLOW}⚠ Analysis for $service completed with warnings or failed${NC}"
        
        popd > /dev/null
    done
    echo -e "${GREEN}✓ SonarQube analysis completed.${NC}"
    echo ""
}

# ===================================================================
# 2. Dependency-Check
# ===================================================================
run_dependency_check() {
    echo -e "${YELLOW}[2/3] Running OWASP Dependency-Check...${NC}"
    echo "Note: It is normal for this container to exit after scanning."

    if [ -z "$NVD_API_KEY" ]; then
        echo -e "${YELLOW}⚠️  WARNING: NVD_API_KEY not set. Scan will be slow.${NC}"
    fi
    
    docker-compose --profile security run --rm dependency-check || echo -e "${YELLOW}⚠ Dependency-Check found issues${NC}"
    
    echo -e "${GREEN}✓ Dependency-Check phase completed.${NC}"
    echo -e "${BLUE}📊 Report: $REPORTS_DIR/dependency-check/dependency-check-report.html${NC}"
    echo ""
}

# ===================================================================
# 3. Trivy
# ===================================================================
run_trivy_scan() {
    echo -e "${YELLOW}[3/3] Running Trivy Docker Image Scanning...${NC}"
    
    # Ensure images exist
    docker-compose --profile app build product-service order-service gateway-service frontend > /dev/null 2>&1

    IMAGES=(
        "product-service:latest"
        "order-service:latest"
        "gateway-service:latest"
        "frontend:latest"
    )
    
    for image in "${IMAGES[@]}"; do
        echo -e "${BLUE}Scanning $image...${NC}"
        
        docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v "$(pwd)/$REPORTS_DIR/trivy:/reports" \
            aquasec/trivy:latest image \
            --severity HIGH,CRITICAL \
            --format table \
            --output "/reports/${image%:*}_report.txt" \
            "$image" || echo -e "${YELLOW}⚠ Issues with $image${NC}"
            
        # JSON
         docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v "$(pwd)/$REPORTS_DIR/trivy:/reports" \
            aquasec/trivy:latest image \
            --severity HIGH,CRITICAL \
            --format json \
            --output "/reports/${image%:*}_report.json" \
            "$image" > /dev/null 2>&1
    done
    echo -e "${GREEN}✓ Trivy scanning completed${NC}"
    echo ""
}

# ===================================================================
# Main
# ===================================================================
SCAN_TYPE=${1:-all}

case $SCAN_TYPE in
    sonar) run_sonarqube_scan ;;
    dependency) run_dependency_check ;;
    trivy) run_trivy_scan ;;
    all)
        run_sonarqube_scan
        run_dependency_check
        run_trivy_scan
        
        echo -e "${BLUE}================================================${NC}"
        echo -e "${BLUE}  Summary${NC}"
        echo -e "${BLUE}================================================${NC}"
        echo "1. SonarQube: http://localhost:9000 (Login: admin / admin123)"
        echo "2. Dependency-Check: $REPORTS_DIR/dependency-check/dependency-check-report.html"
        echo "3. Trivy Reports: $REPORTS_DIR/trivy/"
        ;;
    *)
        echo "Usage: $0 [all|sonar|dependency|trivy]"
        exit 1
        ;;
esac
echo -e "${GREEN}Done!${NC}"