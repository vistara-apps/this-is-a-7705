# KnowYourRights Chat - API Documentation

This document outlines the API integrations and backend services used in the KnowYourRights Chat application.

## 🔧 Service Integrations

### 1. Supabase (Backend as a Service)

**Purpose**: Authentication, database, and file storage
**Documentation**: https://supabase.com/docs

#### Authentication
```javascript
// Sign up new user
const { data, error } = await supabaseService.signUp(email, password, userData)

// Sign in existing user
const { data, error } = await supabaseService.signIn(email, password)

// Sign out current user
const { error } = await supabaseService.signOut()

// Get current user
const user = await supabaseService.getCurrentUser()
```

#### Database Operations
```javascript
// Save incident
const { data, error } = await supabaseService.saveIncident(incident)

// Get user incidents
const { data, error } = await supabaseService.getUserIncidents(userId)

// Update incident
const { data, error } = await supabaseService.updateIncident(incidentId, updates)

// Delete incident
const { error } = await supabaseService.deleteIncident(incidentId)
```

#### File Storage
```javascript
// Upload recording
const { data, error } = await supabaseService.uploadRecording(file, fileName)

// Get recording URL
const url = await supabaseService.getRecordingUrl(fileName)

// Delete recording
const { error } = await supabaseService.deleteRecording(fileName)
```

### 2. OpenAI (AI Services)

**Purpose**: Generate incident summaries and contextual scripts
**Documentation**: https://platform.openai.com/docs

#### Incident Card Generation
```javascript
// Generate AI-powered incident summary
const result = await openaiService.generateIncidentCard({
  location: { latitude: 40.7128, longitude: -74.0060 },
  notes: "Traffic stop on Main Street",
  timestamp: "2024-01-15T10:30:00Z",
  stateRights: [/* array of applicable rights */],
  duration: 300
})

// Response format
{
  success: true,
  summary: "AI-generated incident summary with legal context..."
}
```

#### Contextual Script Generation
```javascript
// Generate custom de-escalation script
const result = await openaiService.generateContextualScript(
  "Traffic stop - requesting reason",
  "Pulled over for speeding"
)

// Response includes English and Spanish versions
{
  success: true,
  script: "English: Officer, may I respectfully ask...\nSpanish: Oficial, ¿puedo preguntar..."
}
```

#### Incident Analysis
```javascript
// Analyze incident for legal insights
const result = await openaiService.analyzeIncident({
  notes: "Officer requested to search vehicle",
  location: { recorded: true },
  duration: 600,
  stateRights: [/* applicable rights */]
})

// Returns legal observations and recommendations
{
  success: true,
  analysis: "Key legal observations: 1. Fourth Amendment rights..."
}
```

### 3. Stripe (Payment Processing)

**Purpose**: Handle subscription payments and billing
**Documentation**: https://stripe.com/docs

#### Subscription Management
```javascript
// Create subscription checkout
const result = await stripeService.createSubscriptionCheckout(
  'price_premium_monthly',
  userId,
  userEmail
)

// Get subscription status
const result = await stripeService.getSubscriptionStatus(customerId)

// Cancel subscription
const result = await stripeService.cancelSubscription(subscriptionId)
```

#### Pricing Structure
```javascript
const pricing = {
  premium: {
    monthly: {
      priceId: 'price_premium_monthly',
      amount: 500, // $5.00 in cents
      interval: 'month'
    },
    yearly: {
      priceId: 'price_premium_yearly', 
      amount: 5000, // $50.00 in cents
      interval: 'year'
    }
  },
  lifetime: {
    priceId: 'price_lifetime',
    amount: 9900 // $99.00 in cents
  }
}
```

### 4. Pinata (IPFS Storage)

**Purpose**: Decentralized storage for incident cards
**Documentation**: https://docs.pinata.cloud/

#### File Upload
```javascript
// Upload file to IPFS
const result = await pinataService.uploadFile(file, {
  name: 'incident-recording.webm',
  type: 'incident-recording',
  userId: 'user123',
  timestamp: '2024-01-15T10:30:00Z'
})

// Response includes IPFS hash and gateway URL
{
  success: true,
  ipfsHash: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
  gatewayUrl: 'https://gateway.pinata.cloud/ipfs/QmXxX...'
}
```

#### JSON Data Upload
```javascript
// Upload incident card as JSON
const result = await pinataService.uploadJSON(incidentCardData, {
  name: 'incident-card-123',
  type: 'incident-card',
  userId: 'user123'
})
```

#### File Management
```javascript
// List user's pinned files
const result = await pinataService.listFiles({
  metadata: { userId: 'user123' },
  pageLimit: 10
})

// Unpin file from IPFS
const result = await pinataService.unpinFile(ipfsHash)

// Generate shareable link
const link = pinataService.generateShareableLink(ipfsHash, 'incident-card')
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  state TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Incidents Table
```sql
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location JSONB,
  notes TEXT,
  duration INTEGER,
  recording_url TEXT,
  recording_hash TEXT,
  incident_card_hash TEXT,
  incident_card_url TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 Security & Authentication

### Row Level Security (RLS)
All database tables use RLS policies to ensure users can only access their own data:

```sql
-- Users can only view/update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only access their own incidents
CREATE POLICY "Users can view own incidents" ON incidents
  FOR SELECT USING (auth.uid() = user_id);
```

### API Key Management
- All API keys are stored as environment variables
- Client-side keys are prefixed with `VITE_`
- Sensitive operations should be moved to backend in production

### File Access Control
- Recordings are stored with user-specific paths
- IPFS uploads include user metadata for organization
- Storage policies prevent cross-user access

## 📊 Data Flow

### Incident Recording Flow
1. User starts recording → MediaRecorder API
2. Recording stops → Blob created
3. Upload to Supabase Storage → Get URL
4. Save incident to database → Include recording URL
5. Generate incident card (Premium) → OpenAI API
6. Upload card to IPFS (Premium) → Pinata API
7. Update incident with IPFS hash → Database

### Incident Sharing Flow
1. User requests share → Get incident from database
2. If has IPFS hash → Fetch card from Pinata
3. Format for sharing → Text/HTML/JSON
4. Use Web Share API or clipboard → Share with contacts

## 🚨 Error Handling

### Service Error Patterns
All services return consistent error objects:
```javascript
{
  success: false,
  error: "Error message",
  code: "ERROR_CODE" // Optional
}
```

### Common Error Scenarios
- **Authentication**: Invalid credentials, expired sessions
- **API Limits**: Rate limiting, quota exceeded
- **Network**: Connection timeouts, service unavailable
- **Permissions**: Insufficient privileges, premium required

## 🔄 Rate Limiting

### OpenAI API
- Monitor token usage to avoid overage charges
- Implement request queuing for high-volume usage
- Cache common responses when possible

### Pinata API
- Free tier: 1GB storage, 100 requests/month
- Paid tiers available for higher usage

### Supabase
- Free tier: 50,000 monthly active users
- Database: 500MB storage
- Storage: 1GB included

## 🧪 Testing

### API Testing
```javascript
// Test Supabase connection
const user = await supabaseService.getCurrentUser()

// Test OpenAI integration
const result = await openaiService.generateIncidentCard(testData)

// Test Pinata connection
const result = await pinataService.testConnection()
```

### Environment Setup for Testing
```bash
# Copy test environment
cp .env.example .env.test

# Use test API keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_OPENAI_API_KEY=sk-test-...
```

## 📈 Monitoring & Analytics

### Key Metrics to Track
- User registration and retention
- Premium subscription conversion
- Incident recording usage
- API response times and errors
- IPFS upload success rates

### Recommended Tools
- Supabase Dashboard for database metrics
- Stripe Dashboard for payment analytics
- OpenAI Usage Dashboard for API costs
- Pinata Dashboard for IPFS statistics

## 🚀 Production Considerations

### Security Hardening
- Move sensitive API calls to backend
- Implement proper CORS policies
- Use environment-specific API keys
- Enable audit logging

### Performance Optimization
- Implement caching for static data
- Optimize image and video compression
- Use CDN for static assets
- Monitor and optimize API response times

### Scalability Planning
- Database indexing for large datasets
- File storage cleanup policies
- API rate limiting and queuing
- Load balancing for high traffic
