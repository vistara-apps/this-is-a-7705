# KnowYourRights Chat - Deployment Guide

This guide covers deploying the KnowYourRights Chat application to production environments.

## 🚀 Deployment Options

### 1. Vercel (Recommended)

Vercel provides seamless deployment for React applications with automatic builds and deployments.

#### Setup Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Environment Variables**
   Add these in Vercel Dashboard → Project → Settings → Environment Variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_OPENAI_API_KEY=your-openai-api-key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
   VITE_PINATA_JWT=your-pinata-jwt-token
   VITE_APP_ENVIRONMENT=production
   ```

3. **Build Configuration**
   Create `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### 2. Netlify

Alternative deployment platform with similar features.

#### Setup Steps

1. **Connect Repository**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**
   Add in Netlify Dashboard → Site Settings → Environment Variables

### 3. Docker Deployment

For containerized deployments on any platform.

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    }
}
```

#### Build and Deploy
```bash
# Build image
docker build -t knowyourrights-chat .

# Run container
docker run -p 80:80 knowyourrights-chat

# Or use docker-compose
docker-compose up -d
```

## 🔧 Backend Services Setup

### Supabase Production Configuration

1. **Create Production Project**
   - Go to Supabase Dashboard
   - Create new project for production
   - Note the URL and anon key

2. **Database Setup**
   ```sql
   -- Run the database schema from README.md
   -- Enable RLS policies
   -- Set up storage buckets
   ```

3. **Authentication Configuration**
   - Configure allowed redirect URLs
   - Set up email templates
   - Configure OAuth providers if needed

4. **Storage Configuration**
   ```sql
   -- Create recordings bucket
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('recordings', 'recordings', false);
   
   -- Set up storage policies
   CREATE POLICY "Users can upload own recordings" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### OpenAI Production Setup

1. **API Key Management**
   - Use production API key
   - Set up billing alerts
   - Monitor usage and costs

2. **Rate Limiting**
   ```javascript
   // Implement request queuing
   const requestQueue = new Queue('openai-requests', {
     redis: process.env.REDIS_URL,
     defaultJobOptions: {
       removeOnComplete: 10,
       removeOnFail: 5,
     }
   });
   ```

### Stripe Production Setup

1. **Account Configuration**
   - Complete Stripe account verification
   - Set up business information
   - Configure tax settings

2. **Products and Pricing**
   ```bash
   # Create products via Stripe CLI or Dashboard
   stripe products create --name "Premium Subscription"
   stripe prices create --product prod_xxx --unit-amount 500 --currency usd --recurring interval=month
   ```

3. **Webhooks Configuration**
   ```javascript
   // Webhook endpoint for subscription events
   app.post('/webhook/stripe', express.raw({type: 'application/json'}), (req, res) => {
     const sig = req.headers['stripe-signature'];
     const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
     
     switch (event.type) {
       case 'customer.subscription.created':
         // Handle new subscription
         break;
       case 'customer.subscription.deleted':
         // Handle cancelled subscription
         break;
     }
     
     res.json({received: true});
   });
   ```

### Pinata Production Setup

1. **Account Upgrade**
   - Upgrade to paid plan for production usage
   - Configure billing and usage alerts

2. **API Configuration**
   ```javascript
   // Production Pinata configuration
   const pinataConfig = {
     pinataApiKey: process.env.PINATA_API_KEY,
     pinataSecretApiKey: process.env.PINATA_SECRET_KEY,
     pinataJWTKey: process.env.PINATA_JWT
   };
   ```

## 🔒 Security Configuration

### Environment Variables Security

1. **Never commit secrets to version control**
2. **Use different keys for different environments**
3. **Rotate keys regularly**
4. **Use secret management services in production**

### HTTPS Configuration

1. **SSL Certificate**
   - Use Let's Encrypt for free certificates
   - Configure automatic renewal
   - Ensure all API endpoints use HTTPS

2. **Security Headers**
   ```nginx
   # Add to nginx configuration
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   add_header X-Frame-Options DENY always;
   add_header X-Content-Type-Options nosniff always;
   add_header X-XSS-Protection "1; mode=block" always;
   add_header Referrer-Policy "strict-origin-when-cross-origin" always;
   ```

### CORS Configuration

```javascript
// Supabase CORS settings
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true
};
```

## 📊 Monitoring and Analytics

### Application Monitoring

1. **Error Tracking**
   ```javascript
   // Sentry integration
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: process.env.VITE_SENTRY_DSN,
     environment: process.env.VITE_APP_ENVIRONMENT
   });
   ```

2. **Performance Monitoring**
   ```javascript
   // Web Vitals tracking
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
   
   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

### Analytics Setup

1. **Google Analytics 4**
   ```javascript
   // GA4 integration
   import { gtag } from 'ga-gtag';
   
   gtag('config', 'GA_MEASUREMENT_ID', {
     page_title: document.title,
     page_location: window.location.href
   });
   ```

2. **Custom Events**
   ```javascript
   // Track key user actions
   gtag('event', 'incident_recorded', {
     event_category: 'engagement',
     event_label: 'premium_feature'
   });
   ```

## 🚨 Backup and Recovery

### Database Backups

1. **Supabase Automatic Backups**
   - Enable daily backups in Supabase dashboard
   - Configure backup retention period
   - Test restore procedures

2. **Manual Backup Script**
   ```bash
   #!/bin/bash
   # Backup script
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   aws s3 cp backup_*.sql s3://your-backup-bucket/
   ```

### File Storage Backups

1. **IPFS Redundancy**
   - Pinata provides automatic replication
   - Consider additional IPFS nodes for redundancy

2. **Supabase Storage Backup**
   ```javascript
   // Backup recordings to additional storage
   const backupRecordings = async () => {
     const { data: files } = await supabase.storage
       .from('recordings')
       .list();
     
     for (const file of files) {
       // Copy to backup location
     }
   };
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
        VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}
        VITE_PINATA_JWT: ${{ secrets.VITE_PINATA_JWT }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📈 Performance Optimization

### Build Optimization

1. **Bundle Analysis**
   ```bash
   # Analyze bundle size
   npm run build -- --analyze
   ```

2. **Code Splitting**
   ```javascript
   // Lazy load components
   const IncidentRecorder = lazy(() => import('./components/IncidentRecorder'));
   ```

### Caching Strategy

1. **Static Asset Caching**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

2. **API Response Caching**
   ```javascript
   // Cache state rights data
   const cacheKey = `state-rights-${state}`;
   const cached = localStorage.getItem(cacheKey);
   if (cached && Date.now() - cached.timestamp < 86400000) {
     return cached.data;
   }
   ```

## 🧪 Testing in Production

### Smoke Tests

```javascript
// Basic functionality tests
describe('Production Smoke Tests', () => {
  test('App loads successfully', async () => {
    const response = await fetch('https://yourdomain.com');
    expect(response.status).toBe(200);
  });
  
  test('API endpoints are accessible', async () => {
    const response = await fetch('https://your-api.supabase.co/rest/v1/');
    expect(response.status).toBe(200);
  });
});
```

### Health Checks

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

## 📞 Support and Maintenance

### Monitoring Alerts

1. **Set up alerts for:**
   - Application errors
   - API rate limits
   - Database connection issues
   - Storage quota warnings

2. **Response Procedures**
   - Document incident response procedures
   - Set up on-call rotation
   - Create runbooks for common issues

### Regular Maintenance

1. **Weekly Tasks**
   - Review error logs
   - Check API usage and costs
   - Monitor performance metrics

2. **Monthly Tasks**
   - Update dependencies
   - Review security patches
   - Analyze user feedback

3. **Quarterly Tasks**
   - Security audit
   - Performance optimization review
   - Backup and recovery testing
