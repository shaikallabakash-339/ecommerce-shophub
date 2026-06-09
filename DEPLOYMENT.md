# Deployment Guide

Complete step-by-step guide for deploying the Enterprise E-Commerce Platform to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Azure storage account created
- [ ] Razorpay account setup with API keys
- [ ] Domain SSL certificate obtained
- [ ] Database backups configured
- [ ] Monitoring alerts setup
- [ ] Load balancer configured
- [ ] CDN enabled for static assets

## 1. Azure App Service Deployment

### 1.1 Setup Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name ecommerce-rg --location eastus

# Create PostgreSQL server
az postgres server create \
  --resource-group ecommerce-rg \
  --name ecommerce-db \
  --location eastus \
  --admin-user postgres \
  --admin-password YourSecurePassword123! \
  --sku-name B_Gen5_2 \
  --storage-size 51200

# Create Redis cache
az redis create \
  --resource-group ecommerce-rg \
  --name ecommerce-cache \
  --location eastus \
  --sku basic \
  --vm-size c0

# Create Storage account
az storage account create \
  --resource-group ecommerce-rg \
  --name ecommercestorage \
  --location eastus \
  --kind StorageV2 \
  --sku Standard_LRS
```

### 1.2 Create Container Registry

```bash
# Create registry
az acr create \
  --resource-group ecommerce-rg \
  --name ecommerceregistry \
  --sku Standard

# Login to registry
az acr login --name ecommerceregistry

# Get login server
az acr show --name ecommerceregistry --query loginServer
```

### 1.3 Build and Push Docker Images

```bash
# Build backend image
docker build -t ecommerceregistry.azurecr.io/ecommerce-api:1.0 ./backend
docker push ecommerceregistry.azurecr.io/ecommerce-api:1.0

# Build frontend image
docker build -t ecommerceregistry.azurecr.io/ecommerce-web:1.0 ./frontend
docker push ecommerceregistry.azurecr.io/ecommerce-web:1.0
```

### 1.4 Deploy Backend to App Service

```bash
# Create App Service plan
az appservice plan create \
  --name ecommerce-plan \
  --resource-group ecommerce-rg \
  --sku P1V2 \
  --is-linux

# Create web app for backend
az webapp create \
  --resource-group ecommerce-rg \
  --plan ecommerce-plan \
  --name ecommerce-api \
  --deployment-container-image-name ecommerceregistry.azurecr.io/ecommerce-api:1.0

# Configure container settings
az webapp config container set \
  --resource-group ecommerce-rg \
  --name ecommerce-api \
  --docker-custom-image-name ecommerceregistry.azurecr.io/ecommerce-api:1.0 \
  --docker-registry-server-url https://ecommerceregistry.azurecr.io \
  --docker-registry-server-user <username> \
  --docker-registry-server-password <password>

# Configure application settings
az webapp config appsettings set \
  --resource-group ecommerce-rg \
  --name ecommerce-api \
  --settings \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
    DB_HOST=ecommerce-db.postgres.database.azure.com \
    DB_USER=postgres@ecommerce-db \
    DB_PASSWORD=YourSecurePassword123! \
    REDIS_HOST=ecommerce-cache.redis.cache.azure.com \
    JWT_SECRET=$(openssl rand -base64 32)
```

### 1.5 Deploy Frontend to App Service

```bash
# Create web app for frontend
az webapp create \
  --resource-group ecommerce-rg \
  --plan ecommerce-plan \
  --name ecommerce-web \
  --deployment-container-image-name ecommerceregistry.azurecr.io/ecommerce-web:1.0

# Configure container settings
az webapp config container set \
  --resource-group ecommerce-rg \
  --name ecommerce-web \
  --docker-custom-image-name ecommerceregistry.azurecr.io/ecommerce-web:1.0 \
  --docker-registry-server-url https://ecommerceregistry.azurecr.io \
  --docker-registry-server-user <username> \
  --docker-registry-server-password <password>
```

## 2. Kubernetes Deployment

### 2.1 Create AKS Cluster

```bash
# Create AKS cluster
az aks create \
  --resource-group ecommerce-rg \
  --name ecommerce-aks \
  --node-count 3 \
  --vm-set-type VirtualMachineScaleSets \
  --load-balancer-sku standard \
  --enable-managed-identity \
  --network-plugin azure \
  --network-policy azure \
  --docker-bridge-address 172.17.0.1/16 \
  --service-cidr 10.0.0.0/16 \
  --dns-service-ip 10.0.0.10

# Get cluster credentials
az aks get-credentials \
  --resource-group ecommerce-rg \
  --name ecommerce-aks
```

### 2.2 Deploy Applications

```bash
# Create namespace
kubectl create namespace ecommerce

# Create image pull secret
kubectl create secret docker-registry acr-secret \
  --docker-server=ecommerceregistry.azurecr.io \
  --docker-username=<username> \
  --docker-password=<password> \
  --docker-email=<email> \
  --namespace=ecommerce

# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=DB_PASSWORD=YourPassword123! \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  --from-literal=RAZORPAY_KEY_ID=your_key \
  --from-literal=RAZORPAY_KEY_SECRET=your_secret \
  --namespace=ecommerce

# Deploy resources
kubectl apply -f k8s/deployment.yaml -n ecommerce

# Check deployment status
kubectl rollout status deployment/backend -n ecommerce
kubectl rollout status deployment/frontend -n ecommerce
```

### 2.3 Setup Ingress

```bash
# Install NGINX ingress controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-basic \
  --create-namespace

# Create Ingress resource
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ecommerce-ingress
  namespace: ecommerce
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    - yourdomain.com
    secretName: tls-secret
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 5000
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
EOF
```

## 3. Database Setup

### 3.1 Initialize Schema

```bash
# Connect to PostgreSQL
az postgres server firewall-rule create \
  --resource-group ecommerce-rg \
  --server-name ecommerce-db \
  --name AllowMyIP \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255

# Run migrations
psql -h ecommerce-db.postgres.database.azure.com \
  -U postgres@ecommerce-db \
  -d ecommerce \
  -f backend/src/migrations/001-initial-schema.sql
```

### 3.2 Configure Backups

```bash
# Enable automated backups (via Azure Portal or CLI)
az postgres server update \
  --resource-group ecommerce-rg \
  --name ecommerce-db \
  --backup-retention 35
```

## 4. Setup Monitoring

### 4.1 Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app ecommerce-insights \
  --location eastus \
  --resource-group ecommerce-rg \
  --application-type web

# Get instrumentation key
az monitor app-insights component show \
  --app ecommerce-insights \
  --resource-group ecommerce-rg \
  --query instrumentationKey
```

### 4.2 Setup Alerts

```bash
# Create metric alert for high CPU
az monitor metrics alert create \
  --name HighCPUAlert \
  --resource-group ecommerce-rg \
  --scopes /subscriptions/{subscriptionId}/resourceGroups/ecommerce-rg/providers/Microsoft.Web/sites/ecommerce-api \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m
```

## 5. Domain and SSL

### 5.1 Configure Custom Domain

```bash
# Add custom domain
az webapp config hostname add \
  --resource-group ecommerce-rg \
  --webapp-name ecommerce-api \
  --hostname api.yourdomain.com

# Create SSL certificate
az webapp config ssl upload \
  --resource-group ecommerce-rg \
  --name ecommerce-api \
  --certificate-file certificate.pfx \
  --certificate-password password
```

### 5.2 Setup CDN

```bash
# Create CDN profile
az cdn profile create \
  --resource-group ecommerce-rg \
  --name ecommerce-cdn \
  --sku Standard_Microsoft

# Create CDN endpoint
az cdn endpoint create \
  --resource-group ecommerce-rg \
  --profile-name ecommerce-cdn \
  --name ecommerce \
  --origin yourdomain.com \
  --origin-host-header yourdomain.com
```

## 6. Post-Deployment

### 6.1 Verify Deployment

```bash
# Check application health
curl https://api.yourdomain.com/health
curl https://yourdomain.com/health

# Check logs
az webapp log tail --resource-group ecommerce-rg --name ecommerce-api

# Monitor performance
kubectl top nodes -n ecommerce
kubectl top pods -n ecommerce
```

### 6.2 Load Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Run load test
ab -n 10000 -c 100 https://yourdomain.com/

# Use k6 for advanced testing
k6 run loadtest.js
```

### 6.3 Backup Strategy

```bash
# Database backup
az postgres server backup create \
  --resource-group ecommerce-rg \
  --server-name ecommerce-db

# Storage backup
azcopy sync "https://yourstorageaccount.blob.core.windows.net/products" \
  "./backup/products" \
  --recursive
```

## 7. Scaling Configuration

### 7.1 Auto-scaling for App Service

```bash
# Create autoscale settings
az monitor autoscale create \
  --resource-group ecommerce-rg \
  --resource-type "Microsoft.Web/serverfarms" \
  --resource-name ecommerce-plan \
  --min-count 2 \
  --max-count 10 \
  --count 3
```

### 7.2 Auto-scaling for Kubernetes

```bash
# Apply HPA configuration (already in deployment.yaml)
kubectl apply -f k8s/deployment.yaml

# Monitor HPA status
kubectl get hpa -n ecommerce -w
```

## 8. Troubleshooting

### Application Won't Start

```bash
# Check pod status
kubectl describe pod <pod-name> -n ecommerce

# Check logs
kubectl logs <pod-name> -n ecommerce

# Check events
kubectl get events -n ecommerce
```

### Database Connection Issues

```bash
# Test connection
psql -h ecommerce-db.postgres.database.azure.com \
  -U postgres@ecommerce-db \
  -c "SELECT version();"

# Check firewall rules
az postgres server firewall-rule list \
  --resource-group ecommerce-rg \
  --server-name ecommerce-db
```

### Performance Issues

```bash
# Check slow queries
kubectl exec -it <postgres-pod> -n ecommerce -- \
  psql -U postgres -d ecommerce -c \
  "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check Redis
kubectl exec -it <redis-pod> -n ecommerce -- redis-cli INFO
```

## 9. Rollback Procedure

```bash
# Rollback deployment
kubectl rollout undo deployment/backend -n ecommerce
kubectl rollout undo deployment/frontend -n ecommerce

# Check rollout history
kubectl rollout history deployment/backend -n ecommerce
```

## Support

For deployment assistance:
- Check logs: `kubectl logs -f pod-name -n ecommerce`
- Monitor dashboard: `kubectl port-forward svc/prometheus 9090:9090 -n ecommerce`
- Contact: devops@yourecompany.com
