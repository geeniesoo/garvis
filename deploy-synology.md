# Deploying Garvis to Synology DS920+

## Prerequisites
- DS920+ with DSM 7.2.2 ✅
- Container Manager (Docker) installed ✅ 
- SSH access enabled
- Slack app configured with tokens

## Deployment Steps

### 1. Upload Project to NAS
1. **Create shared folder** (e.g., `/docker/garvis`) via DSM
2. **Upload the entire project** to this folder using:
   - File Station web interface, OR
   - SMB/NFS mount from your computer

### 2. SSH into Your NAS
```bash
ssh admin@YOUR_NAS_IP
```

### 3. Navigate to Project Directory
```bash
cd /volume1/docker/garvis  # Adjust path based on your setup
```

### 4. Create Environment File
```bash
nano .env
```

Add your Slack configuration:
```env
# Slack Bot Configuration (Required)
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_APP_TOKEN=xapp-your-app-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here

# Application Configuration
NODE_ENV=production
LOG_LEVEL=info
PORT=3000

# Agent Configuration
AGENT_TIMEOUT=30000
MAX_CONCURRENT_AGENTS=10

# Timezone
TZ=Asia/Hong_Kong
```

### 5. Create Required Directories
```bash
mkdir -p logs data
chmod 755 logs data
```

### 6. Build and Deploy
```bash
# Build the Docker image
docker-compose build

# Start the container
docker-compose up -d

# Check if it's running
docker-compose ps
```

### 7. Monitor Logs
```bash
# View logs
docker-compose logs -f garvis

# Or check log files
tail -f logs/combined.log
```

## Container Manager UI Method (Alternative)

### 1. Via DSM Web Interface:
1. Open **Container Manager**
2. Go to **Project** tab
3. Click **Create**
4. Set project name: `garvis`
5. Set path: `/docker/garvis`
6. Upload or paste the `docker-compose.yml` content
7. Click **Next** and **Done**

### 2. Configure Environment:
1. Select the project
2. Click **Action** > **Edit**
3. Add environment variables in the **Environment** tab

## Monitoring & Management

### Check Container Status:
```bash
docker ps | grep garvis
```

### View Resource Usage:
```bash
docker stats garvis-slack-bot
```

### Update Garvis:
```bash
# Pull latest changes
git pull  # if using git

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup Configuration:
The DS920+ will automatically backup:
- Configuration files in `/docker/garvis`
- Logs in `./logs`
- Any persistent data in `./data`

## Troubleshooting

### Container Won't Start:
```bash
# Check logs for errors
docker-compose logs garvis

# Check if ports are in use
netstat -tulpn | grep 3000
```

### Memory Issues:
```bash
# Check memory usage
docker stats --no-stream
```

### Slack Connection Issues:
1. Verify tokens in `.env` file
2. Check firewall settings
3. Ensure internet connectivity
4. Review Slack app permissions

## Performance on DS920+

Expected resource usage:
- **RAM**: ~100-200MB
- **CPU**: <5% under normal load
- **Storage**: <500MB including logs

The DS920+ can easily handle multiple containers, so Garvis will run smoothly alongside your other services.

## Security Notes

- Keep `.env` file secure (contains Slack tokens)
- Consider using Docker secrets for production
- Regular updates via DSM's security updates
- Monitor logs for unusual activity

## Maintenance

### Weekly:
- Check container status
- Review log files for errors
- Monitor resource usage

### Monthly:
- Update Docker images if needed
- Clean up old log files
- Backup configuration

Your DS920+ is perfect for this deployment! 🚀