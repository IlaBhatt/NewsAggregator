# 🚀 CI/CD Quick Setup - Jenkins + GitHub (Poll SCM)

**Get automated builds in 20 minutes** | Docker-optimized | No webhooks needed

---

## ⚡ Why Poll SCM?

**Problem**: Docker Jenkins + webhooks = certificate issues ❌

**Solution**: Poll SCM (Jenkins checks GitHub every 5 min) ✅

```
Webhook: Instant but broken with Docker
Poll SCM: 2-5 min delay but 100% reliable
```

---

## 📋 Prerequisites (5 min)

```bash
# 1. Get tokens:
GitHub Token: github.com/settings/tokens (scope: repo)
Docker Hub Token: hub.docker.com/settings/security
NewsAPI Key: newsapi.org/register

# 2. Ensure Docker running:
docker --version
```

---

## 🔧 Setup (20 Minutes)

### Step 1: Start Jenkins (2 min)

```bash
# Start Jenkins with Docker access
docker run -d --name jenkins -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Install Docker in Jenkins
docker exec -u root jenkins sh -c "apt-get update && apt-get install -y docker.io"
docker exec -u root jenkins usermod -aG docker jenkins
docker restart jenkins

# Get password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Open: http://localhost:8080
```

### Step 2: Initial Setup (5 min)

```
1. Enter password → Install suggested plugins
2. Create admin user
3. Jenkins URL: http://localhost:8080
```

### Step 3: Install Plugins (3 min)

```
Manage Jenkins → Manage Plugins → Available:
☑ GitHub Integration Plugin
☑ Docker Pipeline
☑ NodeJS Plugin
☑ HTML Publisher

Install without restart
```

### Step 4: Configure Tools (2 min)

```
Manage Jenkins → Global Tool Configuration:

NodeJS:
  Add NodeJS → Name: NodeJS-18 → Version: 18.20.0
  ☑ Install automatically → Save
```

### Step 5: Add Credentials (3 min)

```
Manage Jenkins → Manage Credentials → (global) → Add Credentials:

A. GitHub:
   Username: YOUR_GITHUB_USERNAME
   Password: YOUR_GITHUB_TOKEN
   ID: github-credentials

B. Docker Hub:
   Username: YOUR_DOCKERHUB_USERNAME  
   Password: YOUR_DOCKERHUB_TOKEN
   ID: docker-hub-credentials

C. NewsAPI (Manage Jenkins → Configure System → Global properties):
   ☑ Environment variables
   Name: NEWS_API_KEY
   Value: YOUR_NEWSAPI_KEY
   Save
```

### Step 6: Create Pipeline (5 min)

```
New Item → Name: News-Aggregator-Pipeline → Pipeline → OK

Configuration:
  General:
    ☑ Discard old builds (keep 10)
  
  Build Triggers:
    ☐ GitHub hook trigger (UNCHECK)
    ☑ Poll SCM (CHECK)
       Schedule: H/5 * * * *
  
  Pipeline:
    Definition: Pipeline script from SCM
    SCM: Git
      Repository URL: https://github.com/YOUR_USERNAME/news-aggregator.git
      Credentials: github-credentials
      Branch: */main
    Script Path: Jenkinsfile
    ☑ Lightweight checkout

Save
```

---

## ✅ Test (5 Minutes)

### Test 1: Manual Build

```bash
Job → Build Now
Watch Console Output
All stages should pass ✅
```

### Test 2: Automatic Trigger

```bash
# In your project:
echo "# CI/CD Test" >> README.md
git add README.md
git commit -m "test: Poll SCM trigger"
git push origin main

# Wait 5 minutes max
# Jenkins should automatically start build
# Check: Job page → new build appears
```

### Test 3: Verify Deployment

```bash
# After build succeeds:
docker ps | grep news-pulse
curl http://localhost:8080/api/v1/health
# Should return: {"status":"healthy"}
```

---

## 🐛 Quick Fixes

**Poll SCM not triggering?**
```bash
# Check: Job → Configure → Build Triggers
# ☑ Poll SCM must be CHECKED
# Schedule: H/5 * * * *
# Verify: Job → Poll SCM Log (shows polling)
```

**Docker permission denied?**
```bash
docker exec -u root jenkins usermod -aG docker jenkins
docker restart jenkins
```

**Tests failing?**
```bash
# Verify: Manage Jenkins → Configure System
# NEWS_API_KEY is set
# Clean: Job → Workspace → Delete Workspace → Build Now
```

---

## 📊 What Happens Now

```
You push code → Jenkins polls (every 5 min) → Detects change →
Builds → Tests → Dockerizes → Deploys → Done! ✅

Total time: 6-11 minutes (5 min poll + 6 min build)
```

---

## 🎯 Next: Code Cleanup & Testing

### Before Final Push:

```bash
# 1. Clean up code
npm run lint --fix         # Fix linting
npm test                   # Ensure tests pass
npm run build              # Verify builds

# 2. Test locally
docker-compose up -d       # Test container
curl http://localhost:8080/api/v1/health

# 3. Final push
git add .
git commit -m "feat: Production ready"
git push origin main

# Jenkins will auto-deploy in 2-10 minutes! 🚀
```

---

## ✅ Success Checklist

- [ ] Jenkins running (http://localhost:8080)
- [ ] Poll SCM enabled (H/5 * * * *)
- [ ] Manual build passes
- [ ] Git push triggers build (within 5 min)
- [ ] Docker image built
- [ ] Container deployed
- [ ] Health check returns 200 OK
- [ ] App accessible: http://localhost:8080

**When all checked → You have full CI/CD! 🎉**

---

## 📚 Reference

**Key Commands:**
```bash
# Jenkins
docker logs -f jenkins              # View logs
docker restart jenkins              # Restart

# Build
Job → Build Now                     # Manual build
Job → Poll SCM Log                  # Check polling

# Deployment  
docker ps                           # Running containers
curl localhost:8080/api/v1/health   # Health check
```

**Poll Schedule Examples:**
```bash
H/2 * * * *     # Every 2 min (faster)
H/5 * * * *     # Every 5 min (recommended)
H/10 * * * *    # Every 10 min (slower)
```

---

**Setup Time**: 20 minutes | **Build Time**: 6-8 minutes | **Maintenance**: Zero
