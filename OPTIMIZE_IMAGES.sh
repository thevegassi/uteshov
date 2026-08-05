#!/bin/bash
# =============================================================================
# IMAGE OPTIMIZATION SCRIPT - Phase 3
# Reduce image sizes by 20-30% while maintaining quality
# =============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

IMG_DIR="./assets/img"

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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if ImageMagick is installed
check_dependencies() {
    print_header "Checking Dependencies"

    if ! command -v convert &> /dev/null; then
        print_error "ImageMagick is not installed"
        echo ""
        echo "Install it:"
        echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
        echo "  macOS: brew install imagemagick"
        echo "  Windows: Download from https://imagemagick.org/script/download.php"
        exit 1
    fi

    if ! command -v cwebp &> /dev/null; then
        print_error "libwebp is not installed"
        echo ""
        echo "Install it:"
        echo "  Ubuntu/Debian: sudo apt-get install webp"
        echo "  macOS: brew install webp"
        exit 1
    fi

    print_success "All dependencies installed"
    echo ""
}

# Function to get file size
get_size() {
    du -h "$1" | cut -f1
}

# Function to calculate savings
calc_savings() {
    local before=$1
    local after=$2
    local percent=$((100 - (after * 100 / before)))
    echo "$percent%"
}

# =============================================================================
# OPTIMIZATION STRATEGIES
# =============================================================================

optimize_hero_artist() {
    print_info "Optimizing hero-artist.webp (70 KB → 50 KB)"

    if [ ! -f "$IMG_DIR/hero-artist.webp" ]; then
        print_error "File not found: hero-artist.webp"
        return 1
    fi

    BEFORE=$(stat -c%s "$IMG_DIR/hero-artist.webp" 2>/dev/null || stat -f%z "$IMG_DIR/hero-artist.webp")

    # Create backup
    cp "$IMG_DIR/hero-artist.webp" "$IMG_DIR/hero-artist.webp.bak"

    # Optimize with ImageMagick
    convert "$IMG_DIR/hero-artist.webp.bak" \
        -quality 75 \
        -strip \
        "$IMG_DIR/hero-artist.webp"

    AFTER=$(stat -c%s "$IMG_DIR/hero-artist.webp" 2>/dev/null || stat -f%z "$IMG_DIR/hero-artist.webp")
    SAVINGS=$(calc_savings $BEFORE $AFTER)

    print_success "Optimized: $(get_size $IMG_DIR/hero-artist.webp.bak) → $(get_size $IMG_DIR/hero-artist.webp) (-$SAVINGS)"
}

optimize_hero_title() {
    print_info "Optimizing hero-title.webp (30 KB → 20 KB)"

    if [ ! -f "$IMG_DIR/hero-title.webp" ]; then
        print_error "File not found: hero-title.webp"
        return 1
    fi

    BEFORE=$(stat -c%s "$IMG_DIR/hero-title.webp" 2>/dev/null || stat -f%z "$IMG_DIR/hero-title.webp")

    cp "$IMG_DIR/hero-title.webp" "$IMG_DIR/hero-title.webp.bak"

    convert "$IMG_DIR/hero-title.webp.bak" \
        -quality 75 \
        -strip \
        "$IMG_DIR/hero-title.webp"

    AFTER=$(stat -c%s "$IMG_DIR/hero-title.webp" 2>/dev/null || stat -f%z "$IMG_DIR/hero-title.webp")
    SAVINGS=$(calc_savings $BEFORE $AFTER)

    print_success "Optimized: $(get_size $IMG_DIR/hero-title.webp.bak) → $(get_size $IMG_DIR/hero-title.webp) (-$SAVINGS)"
}

optimize_bg_mirror() {
    print_info "Optimizing bg-mirror-tile.webp (36 KB → 25 KB)"

    if [ ! -f "$IMG_DIR/bg-mirror-tile.webp" ]; then
        print_error "File not found: bg-mirror-tile.webp"
        return 1
    fi

    BEFORE=$(stat -c%s "$IMG_DIR/bg-mirror-tile.webp" 2>/dev/null || stat -f%z "$IMG_DIR/bg-mirror-tile.webp")

    cp "$IMG_DIR/bg-mirror-tile.webp" "$IMG_DIR/bg-mirror-tile.webp.bak"

    convert "$IMG_DIR/bg-mirror-tile.webp.bak" \
        -quality 70 \
        -strip \
        "$IMG_DIR/bg-mirror-tile.webp"

    AFTER=$(stat -c%s "$IMG_DIR/bg-mirror-tile.webp" 2>/dev/null || stat -f%z "$IMG_DIR/bg-mirror-tile.webp")
    SAVINGS=$(calc_savings $BEFORE $AFTER)

    print_success "Optimized: $(get_size $IMG_DIR/bg-mirror-tile.webp.bak) → $(get_size $IMG_DIR/bg-mirror-tile.webp) (-$SAVINGS)"
}

optimize_og_cover() {
    print_info "Optimizing og-cover.jpg (56 KB → 35 KB)"

    if [ ! -f "$IMG_DIR/og-cover.jpg" ]; then
        print_error "File not found: og-cover.jpg"
        return 1
    fi

    BEFORE=$(stat -c%s "$IMG_DIR/og-cover.jpg" 2>/dev/null || stat -f%z "$IMG_DIR/og-cover.jpg")

    cp "$IMG_DIR/og-cover.jpg" "$IMG_DIR/og-cover.jpg.bak"

    convert "$IMG_DIR/og-cover.jpg.bak" \
        -quality 65 \
        -strip \
        -interlace Plane \
        "$IMG_DIR/og-cover.jpg"

    AFTER=$(stat -c%s "$IMG_DIR/og-cover.jpg" 2>/dev/null || stat -f%z "$IMG_DIR/og-cover.jpg")
    SAVINGS=$(calc_savings $BEFORE $AFTER)

    print_success "Optimized: $(get_size $IMG_DIR/og-cover.jpg.bak) → $(get_size $IMG_DIR/og-cover.jpg) (-$SAVINGS)"
}

optimize_logo() {
    print_info "Optimizing logo.webp (12 KB → 8 KB)"

    if [ ! -f "$IMG_DIR/logo.webp" ]; then
        print_error "File not found: logo.webp"
        return 1
    fi

    BEFORE=$(stat -c%s "$IMG_DIR/logo.webp" 2>/dev/null || stat -f%z "$IMG_DIR/logo.webp")

    cp "$IMG_DIR/logo.webp" "$IMG_DIR/logo.webp.bak"

    cwebp -q 75 "$IMG_DIR/logo.webp.bak" -o "$IMG_DIR/logo.webp"

    AFTER=$(stat -c%s "$IMG_DIR/logo.webp" 2>/dev/null || stat -f%z "$IMG_DIR/logo.webp")
    SAVINGS=$(calc_savings $BEFORE $AFTER)

    print_success "Optimized: $(get_size $IMG_DIR/logo.webp.bak) → $(get_size $IMG_DIR/logo.webp) (-$SAVINGS)"
}

# =============================================================================
# SUMMARY & VERIFICATION
# =============================================================================

print_summary() {
    print_header "Optimization Summary"

    echo -e "${BLUE}Image Sizes:${NC}\n"
    ls -lh "$IMG_DIR"/*.{webp,jpg,png,ico} 2>/dev/null | \
        awk '{printf "  %-30s %6s\n", $9, $5}'

    echo ""
    echo -e "${YELLOW}Total Images Size:${NC}"
    du -sh "$IMG_DIR" | awk '{printf "  %s\n", $1}'

    echo ""
    echo -e "${GREEN}✓ Phase 3 Complete!${NC}"
    echo ""
}

cleanup_backups() {
    print_info "Old backups (.bak files) are saved in case you need to rollback"
    echo "  To remove them: rm $IMG_DIR/*.bak"
    echo ""
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    clear

    print_header "🖼️  IMAGE OPTIMIZATION - Phase 3"

    echo ""
    echo -e "${YELLOW}This script will:${NC}"
    echo "  • Reduce WebP quality from 100 to 75"
    echo "  • Reduce JPEG quality from 100 to 65"
    echo "  • Remove metadata with -strip"
    echo "  • Create .bak backups"
    echo ""

    echo -e "${YELLOW}Expected Results:${NC}"
    echo "  • hero-artist.webp:  70 KB → 50 KB (-28%)"
    echo "  • hero-title.webp:   30 KB → 20 KB (-33%)"
    echo "  • bg-mirror.webp:    36 KB → 25 KB (-30%)"
    echo "  • og-cover.jpg:      56 KB → 35 KB (-37%)"
    echo "  • logo.webp:         12 KB → 8 KB (-33%)"
    echo "  • TOTAL SAVINGS:     ~40 KB (-20%)"
    echo ""

    read -p "Continue with image optimization? (yes/no) " -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled"
        exit 0
    fi

    check_dependencies

    echo ""
    print_header "Optimizing Images"
    echo ""

    optimize_hero_artist
    optimize_hero_title
    optimize_bg_mirror
    optimize_og_cover
    optimize_logo

    echo ""
    print_summary
    cleanup_backups
}

main "$@"
