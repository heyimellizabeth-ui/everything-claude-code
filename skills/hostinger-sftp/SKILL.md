---
name: hostinger-sftp
description: Deploy files to Hostinger shared hosting via SFTP — find credentials in hPanel, upload with the deploy script or MCP server, and troubleshoot common connection issues.
origin: ECC
---

# Hostinger SFTP Deployment

Deploy local build output to Hostinger shared hosting over SFTP.

## When to Activate

- Deploying a static site or PHP app to Hostinger
- Setting up automated SFTP uploads to Hostinger
- Troubleshooting Hostinger FTP/SFTP connection failures
- Configuring SSH key auth on Hostinger

## Finding Your Credentials in hPanel

1. Log in to [hPanel](https://hpanel.hostinger.com)
2. Click **Manage** next to your hosting plan
3. Go to **Files → FTP Accounts** — note the FTP username and hostname (FTP IP)
4. For SSH key support: **Advanced → SSH Access** → enable SSH and upload your public key

| Field    | Where to find it             | Example              |
|----------|------------------------------|----------------------|
| Host     | FTP IP in FTP Accounts       | `185.x.x.x`         |
| Port     | Always 22 for SFTP           | `22`                 |
| Username | FTP username                 | `u123456789`         |
| Password | FTP password (set in hPanel) | —                    |
| Remote   | Document root                | `/home/u123456789/domains/yourdomain.com/public_html` |

> Hostinger shared hosting uses port **22** for SFTP (not port 21, which is plain FTP).

## Deploy with the Script

Set environment variables, then run:

```bash
export SFTP_HOST=185.x.x.x
export SFTP_PORT=22
export SFTP_USER=u123456789
export SFTP_PASSWORD=yourftppassword
export SFTP_REMOTE_DIR=/home/u123456789/domains/yourdomain.com/public_html

node scripts/deploy-sftp.js ./dist
```

Use `--dry-run` to list files that would be uploaded without transferring:

```bash
node scripts/deploy-sftp.js ./dist --dry-run
```

## Deploy with MCP (Interactive)

Add `hostinger-sftp` from `mcp-configs/mcp-servers.json` to your `.mcp.json`, fill in your credentials, then ask Claude to:

- "List files in public_html"
- "Upload dist/ to public_html"
- "Delete public_html/old-file.html"

## SSH Key Auth (Recommended)

Password auth works but SSH keys are more secure and avoid prompts in CI:

```bash
# Generate a key pair (if you don't have one)
ssh-keygen -t ed25519 -C "hostinger-deploy"

# Copy public key — paste the output into hPanel → SSH Access → Add SSH Key
cat ~/.ssh/id_ed25519.pub
```

Then use the key instead of a password:

```bash
export SFTP_KEY=~/.ssh/id_ed25519
unset SFTP_PASSWORD
node scripts/deploy-sftp.js ./dist
```

## Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused` | Wrong port or SSH disabled | Use port 22; enable SSH in hPanel |
| `Auth failed` | Wrong username/password | Username is the FTP username (not email) |
| `No such file` | Wrong remote path | Check exact path in hPanel → File Manager |
| `Permission denied` | Uploading outside `public_html` | Confirm remote dir ends in `public_html` |
| Uploads succeed but site unchanged | CDN cache | Purge cache in hPanel → Performance |
