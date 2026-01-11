#!/bin/bash

# ===================================================================
# Security Scanning Script - DevSecOps Pipeline
# ===================================================================
# This script runs all security scans for the microservices project
# Usage: ./run-security-scans.sh [all|sonar|dependency|trivy]
# ===================================================================

set -e

# Get script directory and navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

REPORTS_DIR="devsecops/security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create reports directory
mkdir -p "$REPORTS_DIR"/{sonarqube,dependency-check,trivy}

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  DevSecOps Security Scanning Pipeline${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# ===================================================================
# Function: Run SonarQube Analysis
# ===================================================================
run_sonarqube_scan() {
    echo -e "${YELLOW}[1/3] Running SonarQube Static Code Analysis...${NC}"
    
    # Check if SonarQube is running
    if ! curl -s http://localhost:9000/api/system/status > /dev/null 2>&1; then
        echo -e "${RED}❌ SonarQube is not running. Start it with: docker-compose -f docker-compose.devsecops.yml up -d sonarqube${NC}"
        return 1
    fi
    
    # Wait for SonarQube to be ready
    echo "Waiting for SonarQube to be ready..."
    until curl -s http://localhost:9000/api/system/status | grep -q '"status":"UP"'; do
        sleep 5
    done
    
    echo -e "${GREEN}✓ SonarQube is ready${NC}"
    
    # Scan each microservice
    for service in product-service order-service gateway-service; do
        echo -e "${BLUE}Scanning $service...${NC}"
        
        pushd "server/$service" > /dev/null || continue
        
        # Run Maven analysis
        ./mvnw clean verify sonar:sonar \
            -Dsonar.projectKey=$service \
            -Dsonar.projectName="$service" \
            -Dsonar.host.url=http://localhost:9000 \
            -Dsonar.token="${SONAR_TOKEN}" \
            || echo -e "${YELLOW}⚠ Analysis for $service completed with warnings${NC}"
        
        popd > /dev/null
    done
    
    echo -e "${GREEN}✓ SonarQube analysis completed${NC}"
    echo -e "${BLUE}📊 View results at: http://localhost:9000${NC}"
    echo ""
}

# ===================================================================
# Function: Run OWASP Dependency-Check
# ===================================================================
# Check if NVD_API_KEY is set
if [ -z "$NVD_API_KEY" ]; then
    echo "⚠️  WARNING: NVD_API_KEY environment variable is not set!"
    echo "Dependency-Check will run without NVD API access (very slow)."
    echo ""
    echo "To get an API key:"
    echo "1. Visit: https://nvd.nist.gov/developers/request-an-api-key"
    echo "2. Set it: export NVD_API_KEY='your-key-here'"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run dependency check with API key
run_dependency_check() {
    echo -e "${YELLOW}[2/3] Running OWASP Dependency-Check...${NC}"
    
    docker run --rm \
        -e NVD_API_KEY="${NVD_API_KEY}" \
        -v "$(pwd)/server:/src" \
        -v "$(pwd)/$REPORTS_DIR/dependency-check:/report" \
        -v dependency_check_data:/usr/share/dependency-check/data \
        owasp/dependency-check:latest \
        --scan /src \
        --format ALL \
        --project "EShop-Microservices" \
        --out /report \
        ${NVD_API_KEY:+--nvdApiKey "$NVD_API_KEY"} \
        --nvdApiDelay 4000 \
        --enableExperimental \
        --suppression /src/config/dependency-check-suppressions.xml 2>/dev/null || true
    
    echo -e "${GREEN}✓ Dependency-Check completed${NC}"
    echo -e "${BLUE}📊 View HTML report: $REPORTS_DIR/dependency-check/dependency-check-report.html${NC}"
    echo ""
}

# ===================================================================
# Function: Run Trivy Image Scanning
# ===================================================================
run_trivy_scan() {
    echo -e "${YELLOW}[3/3] Running Trivy Docker Image Scanning...${NC}"
    
    # Images to scan
    IMAGES=(
        "product-service:latest"
        "order-service:latest"
        "gateway-service:latest"
        "frontend:latest"
    )
    
    for image in "${IMAGES[@]}"; do
        echo -e "${BLUE}Scanning $image...${NC}"
        
        # Scan for vulnerabilities
        docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v "$(pwd)/$REPORTS_DIR/trivy:/reports" \
            aquasec/trivy:latest image \
            --severity HIGH,CRITICAL \
            --format table \
            --output "/reports/${image%:*}_${TIMESTAMP}.txt" \
            "$image" || echo -e "${YELLOW}⚠ Issues found in $image${NC}"
        
        # Generate JSON report
        docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v "$(pwd)/$REPORTS_DIR/trivy:/reports" \
            aquasec/trivy:latest image \
            --severity HIGH,CRITICAL \
            --format json \
            --output "/reports/${image%:*}_${TIMESTAMP}.json" \
            "$image" > /dev/null 2>&1
    done
    
    echo -e "${GREEN}✓ Trivy scanning completed${NC}"
    echo -e "${BLUE}📊 View reports in: $REPORTS_DIR/trivy/${NC}"
    echo ""
}

# ===================================================================
# Function: Generate Security Summary
# ===================================================================
generate_summary() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  Security Scan Summary${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
    echo -e "${GREEN}✓ All security scans completed successfully!${NC}"
    echo ""
    echo "Reports generated in: $REPORTS_DIR/"
    echo ""
    echo "Next steps:"
    echo "1. Review SonarQube dashboard: http://localhost:9000"
    echo "2. Check dependency vulnerabilities: $REPORTS_DIR/dependency-check/dependency-check-report.html"
    echo "3. Review Trivy image scans: $REPORTS_DIR/trivy/"
    echo ""
    echo -e "${YELLOW}⚠ Make sure to fix any CRITICAL or HIGH severity issues before deployment${NC}"
    echo ""
}

# ===================================================================
# Main Execution
# ===================================================================
SCAN_TYPE=${1:-all}

case $SCAN_TYPE in
    sonar)
        run_sonarqube_scan
        ;;
    dependency)
        run_dependency_check
        ;;
    trivy)
        run_trivy_scan
        ;;
    all)
        run_sonarqube_scan
        run_dependency_check
        run_trivy_scan
        generate_summary
        ;;
    *)
        echo "Usage: $0 [all|sonar|dependency|trivy]"
        exit 1
        ;;
esac

echo -e "${GREEN}Done!${NC}"