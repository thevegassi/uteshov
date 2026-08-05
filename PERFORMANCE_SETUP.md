# Performance Optimization Setup Guide

## Phase 2: Server Configuration & Caching

This document explains how to set up proper caching and compression on your production server.

### 🔧 Server Setup

#### For Nginx Users

1. **Copy the configuration:**
   ```bash
   cp .nginx.conf /etc/nginx/sites-available/uteshov.conf
   # or add to your existing nginx config file
   ```

2. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/uteshov.conf /etc/nginx/sites-enabled/
   ```

3. **Test configuration:**
   ```bash
   sudo nginx -t
   ```

4. **Reload Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

#### For Apache Users

1. **Copy the configuration:**
   ```bash
   cp .htaccess /var/www/uteshov/.htaccess
   # or append to existing .htaccess
   ```

2. **Enable required modules:**
   ```bash
   sudo a2enmod rewrite
   sudo a2enmod expires
   sudo a2enmod deflate
   sudo a2enmod headers
   ```

3. **Restart Apache:**
   ```bash
   sudo systemctl restart apache2
   ```

### 📊 Cache Strategy

#### HTML Files
- **Strategy:** No cache (always revalidate)
- **Reason:** Content changes frequently, need fresh version
- **Expires:** Immediately
- **Header:** `Cache-Control: no-cache, must-revalidate`

#### CSS & JavaScript
- **Strategy:** Long-term cache (1 year)
- **Reason:** Static assets, hash-based or version-controlled
- **Expires:** 1 year
- **Header:** `Cache-Control: public, immutable, max-age=31536000`

#### Images & Fonts
- **Strategy:** Long-term cache (1 year)
- **Reason:** Static assets, rarely change
- **Expires:** 1 year
- **Header:** `Cache-Control: public, immutable, max-age=31536000`

#### OG Cover Image
- **Strategy:** Medium cache (1 day)
- **Reason:** Used for social sharing, updates occasionally
- **Expires:** 1 day
- **Header:** `Cache-Control: public, max-age=86400`

### 🎯 Verification

#### Test Cache Headers

```bash
# Check HTML (should have no-cache)
curl -I https://uteshov.kz/index.html | grep Cache-Control

# Check CSS (should have 1-year cache)
curl -I https://uteshov.kz/assets/css/style.css | grep Cache-Control

# Check image (should have 1-year cache)
curl -I https://uteshov.kz/assets/img/hero-artist.webp | grep Cache-Control
```

**Expected output:**
```
Cache-Control: no-cache, must-revalidate, max-age=0          (HTML)
Cache-Control: public, immutable, max-age=31536000            (CSS/JS/Images)
Cache-Control: public, max-age=86400                          (OG image)
```

#### Test Gzip Compression

```bash
curl -I -H "Accept-Encoding: gzip" https://uteshov.kz/index.html | grep Content-Encoding
```

**Expected output:**
```
Content-Encoding: gzip
```

#### Test with Lighthouse

1. Visit: https://pagespeed.web.dev
2. Enter your domain
3. Check performance score (target: 90+)
4. Verify recommendations

### 📈 Expected Performance Improvements

After implementing these changes:

| Metric | Before | After | Improvement |
|--------|--------|-------|------------|
| **First Visit** | 2.0–2.5s | 1.2–1.8s | ⬇️ -40% |
| **Repeat Visits** | 2.0–2.5s | 0.2–0.4s | ⚡ 10x faster |
| **Page Size (wire)** | ~140 KB | ~50 KB | ⬇️ -65% |
| **Lighthouse Score** | 70 | 90+ | ⬆️ +20pts |

### 🐛 Troubleshooting

#### Images Not Loading After Caching

- Clear browser cache: `Ctrl+Shift+Delete`
- Or use incognito mode to test

#### Cache Too Aggressive

- Check Cache-Control headers
- Verify file hashing (if using build tools)
- Use `max-age=0` for HTML to force revalidation

#### Gzip Not Working

- Verify modules are enabled: `nginx -V | grep gzip`
- Check file types are configured
- Restart server: `sudo systemctl restart nginx`

### 🔒 Security Headers Explained

These are already included in the config:

- **X-Content-Type-Options:** Prevent MIME type sniffing
- **X-Frame-Options:** Prevent clickjacking
- **X-XSS-Protection:** Enable XSS protection
- **Referrer-Policy:** Control referrer information

### 📚 Additional Resources

- [MDN: HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Web.dev: Optimize Cumulative Layout Shift](https://web.dev/optimize-cls/)
- [Nginx Cache Documentation](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache)
- [Apache mod_expires](https://httpd.apache.org/docs/current/mod/mod_expires.html)

---

**Last Updated:** August 5, 2026
**Performance Target:** 90+ Lighthouse Score
