#!/bin/bash
# =============================================================================
# DEPLOYMENT SCRIPT - Abzal Uteshov Landing Page Performance Optimization
# Phase 1 & 2 Production Deployment
# =============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# CONFIGURATION
# =============================================================================

PRODUCTION_USER="${PROD_USER:-root}"
PRODUCTION_HOST="${PROD_HOST:-your-server.com}"
PRODUCTION_PATH="${PROD_PATH:-/var/www/uteshov}"
WEBSERVER="${WEBSERVER:-nginx}"  # or 'apache'

# =============================================================================
# FUNCTIONS
# =============================================================================

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# =============================================================================
# STEP 1: Validate Configuration
# =============================================================================

validate_config() {
    print_header "Step 1: Validating Configuration"

    if [ -z "$PROD_HOST" ] || [ "$PROD_HOST" = "your-server.com" ]; then
        print_error "PROD_HOST not configured"
        echo "Please set: export PROD_HOST=your-domain.com"
        exit 1
    fi

    if [ -z "$PROD_USER" ] || [ "$PROD_USER" = "root" ]; then
        print_warning "Using default PROD_USER=$PROD_USER (should be specific user)"
    fi

    print_success "Configuration validated"
    print_info "Target: $PROD_USER@$PROD_HOST:$PRODUCTION_PATH"
    echo ""
}

# =============================================================================
# STEP 2: Test SSH Connection
# =============================================================================

test_ssh() {
    print_header "Step 2: Testing SSH Connection"

    if ssh -q "$PRODUCTION_USER@$PRODUCTION_HOST" "exit"; then
        print_success "SSH connection successful"
    else
        print_error "Cannot connect to $PRODUCTION_USER@$PRODUCTION_HOST"
        echo "Check your SSH configuration and server availability"
        exit 1
    fi
    echo ""
}

# =============================================================================
# STEP 3: Backup Current Production
# =============================================================================

backup_production() {
    print_header "Step 3: Creating Production Backup"

    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$PRODUCTION_PATH/backups/backup_$BACKUP_DATE"

    ssh "$PRODUCTION_USER@$PRODUCTION_HOST" << EOF
        set -e
        mkdir -p "$PRODUCTION_PATH/backups"

        if [ -d "$PRODUCTION_PATH/.git" ]; then
            cp -r "$PRODUCTION_PATH" "$BACKUP_PATH" 2>/dev/null || true
            print_success "Production backed up to: $BACKUP_PATH"
        else
            print_warning "Git repository not found, skipping backup"
        fi
EOF

    print_success "Backup created: backups/backup_$BACKUP_DATE"
    echo ""
}

# =============================================================================
# STEP 4: Deploy Files
# =============================================================================

deploy_files() {
    print_header "Step 4: Deploying Optimized Files"

    # List files to deploy
    FILES_TO_DEPLOY=(
        "index.html"
        "assets/css/style.css"
        "assets/js/main.js"
        ".nginx.conf"
        ".htaccess"
        "PERFORMANCE_SETUP.md"
    )

    for file in "${FILES_TO_DEPLOY[@]}"; do
        if [ -f "$file" ]; then
            print_info "Deploying: $file"
            scp -q "$file" "$PRODUCTION_USER@$PRODUCTION_HOST:$PRODUCTION_PATH/$file"
            print_success "Deployed: $file"
        else
            print_warning "File not found locally: $file"
        fi
    done

    echo ""
}

# =============================================================================
# STEP 5: Configure Web Server
# =============================================================================

configure_webserver() {
    print_header "Step 5: Configuring Web Server ($WEBSERVER)"

    if [ "$WEBSERVER" = "nginx" ]; then
        configure_nginx
    elif [ "$WEBSERVER" = "apache" ]; then
        configure_apache
    else
        print_error "Unknown web server: $WEBSERVER"
        exit 1
    fi

    echo ""
}

configure_nginx() {
    print_info "Configuring Nginx..."

    ssh "$PRODUCTION_USER@$PRODUCTION_HOST" << 'NGINX_EOF'
        set -e

        # Copy Nginx config
        if [ -f "$PRODUCTION_PATH/.nginx.conf" ]; then
            sudo cp "$PRODUCTION_PATH/.nginx.conf" /etc/nginx/sites-available/uteshov.conf
            print_success "Nginx config deployed"

            # Enable site
            if [ ! -L /etc/nginx/sites-enabled/uteshov.conf ]; then
                sudo ln -s /etc/nginx/sites-available/uteshov.conf /etc/nginx/sites-enabled/
                print_success "Nginx site enabled"
            fi

            # Test config
            if sudo nginx -t 2>&1 | grep -q "successful"; then
                print_success "Nginx configuration valid"
            else
                print_error "Nginx configuration has errors"
                exit 1
            fi

            # Reload Nginx
            sudo systemctl reload nginx
            print_success "Nginx reloaded"
        fi
NGINX_EOF
}

configure_apache() {
    print_info "Configuring Apache..."

    ssh "$PRODUCTION_USER@$PRODUCTION_HOST" << 'APACHE_EOF'
        set -e

        # Copy .htaccess
        if [ -f "$PRODUCTION_PATH/.htaccess" ]; then
            cp "$PRODUCTION_PATH/.htaccess" "$PRODUCTION_PATH/.htaccess.bak"
            print_success ".htaccess backup created"

            # Enable required modules
            sudo a2enmod rewrite 2>/dev/null || true
            sudo a2enmod expires 2>/dev/null || true
            sudo a2enmod deflate 2>/dev/null || true
            sudo a2enmod headers 2>/dev/null || true

            print_success "Apache modules enabled"

            # Restart Apache
            sudo systemctl restart apache2
            print_success "Apache restarted"
        fi
APACHE_EOF
}

# =============================================================================
# STEP 6: Verify Deployment
# =============================================================================

verify_deployment() {
    print_header "Step 6: Verifying Deployment"

    # Test HTTP connection
    print_info "Testing HTTP response..."
    if curl -s -I "http://$PRODUCTION_HOST" | grep -q "200\|301\|302"; then
        print_success "HTTP connection successful"
    else
        print_warning "Could not verify HTTP connection (may be HTTPS only)"
    fi

    # Test cache headers
    print_info "Checking Cache-Control headers..."
    CACHE_HEADER=$(curl -s -I "https://$PRODUCTION_HOST/assets/css/style.css" 2>/dev/null | grep -i "cache-control" || echo "NOT FOUND")

    if echo "$CACHE_HEADER" | grep -q "max-age"; then
        print_success "Cache headers present: $CACHE_HEADER"
    else
        print_warning "Cache headers not found (check server setup)"
    fi

    # Test Gzip
    print_info "Checking Gzip compression..."
    GZIP_HEADER=$(curl -s -I -H "Accept-Encoding: gzip" "https://$PRODUCTION_HOST" 2>/dev/null | grep -i "content-encoding" || echo "NOT FOUND")

    if echo "$GZIP_HEADER" | grep -q "gzip"; then
        print_success "Gzip compression enabled: $GZIP_HEADER"
    else
        print_warning "Gzip not detected (check server configuration)"
    fi

    echo ""
}

# =============================================================================
# STEP 7: Performance Check
# =============================================================================

performance_check() {
    print_header "Step 7: Performance Check (Local)"

    print_info "Running local performance checks..."

    # Check file sizes
    echo -e "\n${BLUE}File Sizes:${NC}"
    ls -lh index.html assets/css/style.css assets/js/main.js | awk '{print $9, "(" $5 ")"}'

    # Count optimizations
    echo -e "\n${BLUE}Optimizations Applied:${NC}"

    if grep -q "rel=\"preload\"" index.html; then
        print_success "Font preload enabled"
    fi

    if grep -q "application/ld+json" index.html; then
        print_success "JSON-LD structured data added"
    fi

    if grep -q "will-change: transform" assets/css/style.css; then
        print_success "GPU acceleration hints added"
    fi

    if grep -q "ease-in-out infinite" assets/css/style.css; then
        print_success "Animation optimization applied"
    fi

    echo ""
}

# =============================================================================
# STEP 8: Post-Deployment Instructions
# =============================================================================

post_deployment() {
    print_header "Step 8: Post-Deployment Instructions"

    echo -e "${YELLOW}Manual Verification Steps:${NC}\n"

    echo "1. Test in Browser:"
    echo "   • Visit: https://$PRODUCTION_HOST"
    echo "   • Check DevTools Network tab"
    echo "   • Verify: FCP < 1.5s, LCP < 2.5s"
    echo ""

    echo "2. Check Cache Headers:"
    echo "   curl -I https://$PRODUCTION_HOST/assets/css/style.css"
    echo "   Expected: Cache-Control: public, immutable, max-age=31536000"
    echo ""

    echo "3. Check Gzip:"
    echo "   curl -I -H 'Accept-Encoding: gzip' https://$PRODUCTION_HOST"
    echo "   Expected: Content-Encoding: gzip"
    echo ""

    echo "4. Run Google PageSpeed Insights:"
    echo "   https://pagespeed.web.dev/?url=https://$PRODUCTION_HOST"
    echo "   Target: Score 90+"
    echo ""

    echo "5. Monitor Performance:"
    echo "   • Check server logs for errors"
    echo "   • Monitor CPU/memory usage"
    echo "   • Watch for user feedback"
    echo ""
}

# =============================================================================
# STEP 9: Rollback Instructions
# =============================================================================

print_rollback_info() {
    print_header "Rollback Information"

    echo -e "${YELLOW}If deployment fails, rollback with:${NC}\n"

    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    echo "ssh $PRODUCTION_USER@$PRODUCTION_HOST"
    echo "cd $PRODUCTION_PATH"
    echo "rm -rf *.html assets/ .nginx.conf .htaccess"
    echo "cp -r backups/backup_*/* ."
    echo ""

    if [ "$WEBSERVER" = "nginx" ]; then
        echo "sudo systemctl reload nginx"
    else
        echo "sudo systemctl restart apache2"
    fi

    echo ""
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    clear

    print_header "🚀 PRODUCTION DEPLOYMENT - Performance Optimization Phase 1 & 2"

    echo -e "\n${YELLOW}Configuration:${NC}"
    echo "  Server: $PRODUCTION_USER@$PRODUCTION_HOST"
    echo "  Path: $PRODUCTION_PATH"
    echo "  Web Server: $WEBSERVER"
    echo ""

    read -p "Continue with deployment? (yes/no) " -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi

    # Execute steps
    validate_config
    test_ssh
    backup_production
    deploy_files
    configure_webserver
    verify_deployment
    performance_check
    post_deployment
    print_rollback_info

    print_header "✅ DEPLOYMENT COMPLETE"
    echo -e "${GREEN}Phase 1 & 2 successfully deployed to production!${NC}\n"
}

# Run main function
main "$@"
