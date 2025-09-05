# KnowYourRights Chat

Your pocket guide to rights and de-escalation with law enforcement.

## 🚀 Overview

KnowYourRights Chat is a mobile-first web application that provides instant access to legal rights, de-escalation scripts, and incident documentation tools for interactions with law enforcement. Built with React, Vite, and modern web technologies.

## ✨ Features

### Core Features
- **State-Specific Rights Guides**: Accessible, mobile-optimized guides detailing constitutional rights and relevant state laws
- **Verbal De-escalation Scripts**: Pre-written scripts in English and Spanish for calm, respectful communication
- **One-Tap Incident Recording**: Immediate audio/video recording with location data (Premium)
- **Automated Incident Cards**: AI-generated shareable summaries with legal context (Premium)

### Technical Features
- **Real-time Authentication**: Secure user accounts with Supabase
- **Cloud Storage**: Recordings stored securely with automatic backup
- **IPFS Integration**: Decentralized storage for incident cards via Pinata
- **AI-Powered Insights**: OpenAI integration for contextual analysis
- **Subscription Management**: Stripe integration for premium features
- **Multi-language Support**: English and Spanish scripts
- **Dark/Light Mode**: Adaptive UI with user preference persistence

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: OpenAI GPT-3.5 Turbo
- **Payments**: Stripe
- **IPFS**: Pinata
- **Deployment**: Docker-ready

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- Stripe account (for payments)
- Pinata account (for IPFS storage)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/vistara-apps/this-is-a-7705.git
cd this-is-a-7705
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your-openai-api-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Pinata Configuration
VITE_PINATA_JWT=your-pinata-jwt-token
```

### 3. Database Setup

Create the following tables in your Supabase project:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  state TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents table
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own incidents" ON incidents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incidents" ON incidents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incidents" ON incidents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own incidents" ON incidents
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Storage Setup

Create a storage bucket in Supabase for recordings:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false);

-- Storage policy
CREATE POLICY "Users can upload own recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running.

## 🏗 Production Deployment

### Docker Deployment

```bash
# Build the image
docker build -t knowyourrights-chat .

# Run the container
docker run -p 3000:3000 knowyourrights-chat
```

### Environment Variables for Production

Ensure all environment variables are properly set in your production environment:

- Set `VITE_APP_ENVIRONMENT=production`
- Use production API keys for all services
- Configure proper CORS settings in Supabase
- Set up proper domain configuration for Stripe webhooks

## 📱 Usage Guide

### For Free Users
- Access state-specific rights guides
- View basic de-escalation scripts
- Create simple incident notes

### For Premium Users ($5/month)
- Full access to all scripts in multiple languages
- One-tap audio/video recording
- AI-generated incident cards
- IPFS storage for permanent documentation
- Advanced sharing capabilities

## 🔧 API Integration Details

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL commands above to set up tables
3. Configure authentication providers as needed
4. Set up storage bucket for recordings

### OpenAI Integration
- Used for generating incident summaries and contextual scripts
- Requires API key with sufficient credits
- Configured for GPT-3.5 Turbo model

### Stripe Integration
- Set up products for Premium subscription ($5/month)
- Configure webhooks for subscription events
- Test with Stripe test keys before going live

### Pinata IPFS
- Create account and get JWT token
- Used for decentralized storage of incident cards
- Provides permanent, censorship-resistant documentation

## 🛡 Security Considerations

- All API keys should be kept secure and never committed to version control
- Row Level Security (RLS) is enabled on all database tables
- Recordings are stored with user-specific access controls
- IPFS uploads include metadata for proper organization
- Client-side API calls should be moved to backend in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@knowyourrightschat.com or create an issue in this repository.

## ⚖️ Legal Disclaimer

This application is for educational and documentation purposes only. It does not constitute legal advice. Always consult with a qualified attorney for legal guidance specific to your situation.

---

**Built with ❤️ for civil rights and community safety**
