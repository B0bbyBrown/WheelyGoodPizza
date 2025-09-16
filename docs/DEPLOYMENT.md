# Deployment and Maintenance Guide

> Production deployment and ongoing maintenance procedures for the Pizza Truck Operations Management System

## 🚀 Production Deployment

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **System Resources**: Minimum 1GB RAM, 10GB disk space
- **Operating System**: Linux (recommended), Windows, or macOS
- **Database**: SQLite 3.x (included with Node.js)

### Environment Setup

#### 1. Production Environment Variables

Create a `.env.production` file:

```bash
# Required for production
NODE_ENV=production
SESSION_SECRET=your-strong-random-secret-key-min-32-chars
PORT=5000

# Database configuration
DATABASE_URL=./pizza-truck.db

# Optional security settings
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
TRUST_PROXY=1

# Application settings
LOG_LEVEL=info
BACKUP_ENABLED=true
BACKUP_INTERVAL=daily
```

#### 2. Security Configuration

**Generate Strong Session Secret:**
```bash
# Generate a secure random string (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**SSL/TLS Setup (Recommended):**
- Use a reverse proxy (nginx, Apache) for HTTPS termination
- Configure SSL certificates (Let's Encrypt recommended)
- Set `COOKIE_SECURE=true` for HTTPS environments

### Build and Deployment Process

#### 1. Prepare for Production

```bash
# Clone the repository
git clone <repository-url>
cd pizza-truck

# Install dependencies
npm ci --production

# Build the frontend
npm run build

# Verify build
ls -la dist/
```

#### 2. Database Initialization

```bash
# The database will be automatically created on first run
# For existing deployments, backup first:
cp pizza-truck.db pizza-truck-backup-$(date +%Y%m%d).db

# Generate and apply migrations (if needed)
npm run db:push
```

#### 3. Start Production Server

**Manual Start:**
```bash
NODE_ENV=production npm start
```

**Using PM2 (Recommended):**
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'pizza-truck',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/pizza-truck',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Nginx Reverse Proxy (Recommended)

```nginx
# /etc/nginx/sites-available/pizza-truck
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static file serving (optional)
    location /static {
        alias /path/to/pizza-truck/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/pizza-truck /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring and Logging

### Application Monitoring

#### 1. Application Status Monitoring

Monitor application health through:

```bash
# Check if application is responding
curl -f http://localhost:5000/ || echo "Application is down"

# Check application logs for errors
pm2 logs pizza-truck --err --lines 10

# Verify database file exists and is accessible
ls -la pizza-truck.db
sqlite3 pizza-truck.db "PRAGMA integrity_check;"
```

#### 2. PM2 Monitoring

```bash
# View application status
pm2 status

# View logs
pm2 logs pizza-truck

# View resource usage
pm2 monit

# Restart application
pm2 restart pizza-truck

# Stop application
pm2 stop pizza-truck
```

#### 3. Log Management

**Log Rotation with PM2:**
```bash
# Install PM2 log rotate
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *' # Daily at midnight
```

### Database Monitoring

#### 1. Database Size Monitoring

```bash
# Check database file size
ls -lh pizza-truck.db

# SQLite database statistics
sqlite3 pizza-truck.db "PRAGMA database_list; PRAGMA page_count; PRAGMA page_size;"
```

#### 2. Performance Monitoring

```bash
# SQLite performance analysis
sqlite3 pizza-truck.db "PRAGMA optimize;"
sqlite3 pizza-truck.db "ANALYZE;"
```

## 🔄 Backup and Recovery

### Automated Backup Strategy

#### 1. Database Backup Script

```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/var/backups/pizza-truck"
DB_FILE="pizza-truck.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="pizza-truck_$DATE.db"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
cp $DB_FILE "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "pizza-truck_*.db.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/$BACKUP_FILE.gz"
```

#### 2. Cron Job Setup

```bash
# Add to crontab
crontab -e

# Backup database daily at 2 AM
0 2 * * * /path/to/backup-database.sh >> /var/log/pizza-truck-backup.log 2>&1

# Backup database every 6 hours (for high-activity periods)
0 */6 * * * /path/to/backup-database.sh >> /var/log/pizza-truck-backup.log 2>&1
```

### Recovery Procedures

#### 1. Database Recovery

```bash
# Stop application
pm2 stop pizza-truck

# Backup current (potentially corrupted) database
mv pizza-truck.db pizza-truck-corrupted-$(date +%Y%m%d).db

# Restore from backup
gunzip -c /var/backups/pizza-truck/pizza-truck_YYYYMMDD_HHMMSS.db.gz > pizza-truck.db

# Verify database integrity
sqlite3 pizza-truck.db "PRAGMA integrity_check;"

# Start application
pm2 start pizza-truck
```

#### 2. Application Recovery

```bash
# Full application restore
git pull origin main
npm ci --production
npm run build
pm2 restart pizza-truck
```

## 🔧 Maintenance Tasks

### Daily Tasks

1. **Monitor Application Health**
   ```bash
   curl -f http://localhost:5000/health || echo "Application health check failed"
   ```

2. **Check Disk Space**
   ```bash
   df -h | grep -E '(/$|/var)'
   ```

3. **Review Error Logs**
   ```bash
   pm2 logs pizza-truck --err --lines 50
   ```

### Weekly Tasks

1. **Database Maintenance**
   ```bash
   # Optimize database
   sqlite3 pizza-truck.db "PRAGMA optimize; VACUUM;"
   ```

2. **Log Cleanup**
   ```bash
   # Clean old logs
   find /var/log -name "*.log" -mtime +7 -delete
   ```

3. **Security Updates**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade

   # Check for npm security vulnerabilities
   npm audit
   ```

### Monthly Tasks

1. **Full System Backup**
   ```bash
   # Backup entire application directory
   tar -czf pizza-truck-full-backup-$(date +%Y%m%d).tar.gz \
     --exclude=node_modules \
     --exclude=dist \
     /path/to/pizza-truck/
   ```

2. **Performance Review**
   ```bash
   # Analyze database size growth
   ls -lh pizza-truck.db

   # Review PM2 metrics
   pm2 show pizza-truck
   ```

3. **Dependency Updates**
   ```bash
   # Check for package updates
   npm outdated

   # Update packages (test in staging first)
   npm update
   ```

## 🔐 Security Maintenance

### SSL Certificate Renewal

```bash
# Using Let's Encrypt (certbot)
sudo certbot renew --dry-run
sudo certbot renew
sudo systemctl reload nginx
```

### Security Scanning

```bash
# npm security audit
npm audit --audit-level moderate

# Check for outdated packages with security issues
npm audit --production
```

### Access Control Review

1. **Review User Accounts Monthly**
   - Remove inactive users
   - Update role assignments
   - Reset default passwords

2. **Monitor Authentication Logs**
   ```bash
   grep "authentication" /var/log/pizza-truck/*.log
   ```

## 📈 Performance Optimization

### Database Optimization

```sql
-- Run these optimizations monthly
PRAGMA optimize;
VACUUM;
ANALYZE;
REINDEX;
```

### Application Tuning

1. **Memory Usage Optimization**
   ```bash
   # Monitor memory usage
   pm2 monit

   # Set memory limits
   pm2 restart pizza-truck --max-memory-restart 512M
   ```

2. **CPU Usage Monitoring**
   ```bash
   # Check CPU usage
   top -p $(pgrep -f "pizza-truck")
   ```

## 🚨 Troubleshooting

### Common Issues

#### Database Locked Error
```bash
# Check for hanging processes
lsof pizza-truck.db

# Kill hanging processes if found
kill -9 <pid>

# Restart application
pm2 restart pizza-truck
```

#### Memory Issues
```bash
# Check memory usage
free -h
pm2 show pizza-truck

# Restart if memory usage is high
pm2 restart pizza-truck
```

#### Application Won't Start
```bash
# Check logs
pm2 logs pizza-truck --err

# Check port availability
netstat -tulpn | grep :5000

# Verify dependencies
npm ls --production
```

### Emergency Procedures

#### 1. Database Corruption
```bash
# Immediate response
pm2 stop pizza-truck
cp pizza-truck.db pizza-truck-corrupted.db

# Attempt repair
sqlite3 pizza-truck.db ".timeout 20000" ".recover pizza-truck-recovered.db"
mv pizza-truck-recovered.db pizza-truck.db

# Test and restart
sqlite3 pizza-truck.db "PRAGMA integrity_check;"
pm2 start pizza-truck
```

#### 2. System Compromise
```bash
# Immediate response
pm2 stop pizza-truck
nginx -s stop

# Investigate and contain
# Review access logs, change passwords, update system
# Restore from clean backup if needed

# Recovery
pm2 start pizza-truck
systemctl start nginx
```

## 📞 Support and Escalation

### Contact Information
- **System Administrator**: [contact information]
- **Database Administrator**: [contact information]
- **Security Team**: [contact information]
- **Business Owner**: [contact information]

### Escalation Matrix
1. **Level 1**: Application restart, log review
2. **Level 2**: Database recovery, system maintenance
3. **Level 3**: Security incident, data recovery
4. **Level 4**: Business continuity, disaster recovery

---

*This deployment guide ensures reliable, secure, and maintainable production operations for the Pizza Truck Operations Management System.*