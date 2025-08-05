# InvestigatAI - AI-Powered Digital Investigation Platform

🔍 **InvestigatAI** is a cutting-edge digital investigation platform that uses artificial intelligence to analyze massive amounts of evidence data, extract insights, and create comprehensive investigation portfolios.

## 🚀 Features

### Core Investigation Capabilities
- **Mass File Processing**: Handle thousands of GBs of evidence data
- **Multi-Format Support**: Images, videos, documents, audio files, and more
- **AI-Powered Analysis**: Automatic content extraction and categorization
- **Timeline Generation**: Create chronological sequences of events
- **Entity Recognition**: Identify people, locations, and objects
- **Content Cross-Referencing**: Link related evidence across different files

### Advanced AI Analysis
- **OCR Text Extraction**: Extract text from images and documents
- **Facial Recognition**: Identify and track individuals across media
- **Object Detection**: Recognize vehicles, weapons, and relevant objects
- **Location Intelligence**: Extract and map geographical information
- **Metadata Analysis**: Parse EXIF data, timestamps, and file properties
- **Content Similarity**: Find related or duplicate content

### Investigation Tools
- **Evidence Timeline**: Visual chronological representation
- **Relationship Mapping**: Network analysis of connections
- **Search & Filter**: Advanced querying across all evidence
- **Export Reports**: Generate comprehensive investigation reports
- **Collaboration**: Multi-user investigation support

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Shadcn/ui components
- **AI Processing**: Vercel AI SDK with multiple providers
- **Database**: Supabase (PostgreSQL + Real-time + Storage)
- **File Storage**: Supabase Storage with CDN
- **Authentication**: Supabase Auth
- **Package Manager**: Bun

## 🏗 Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   File Upload   │───▶│  AI Processing   │───▶│  Investigation  │
│                 │    │                  │    │   Dashboard     │
│ • Drag & Drop   │    │ • Content OCR    │    │ • Timeline View │
│ • Bulk Upload   │    │ • Face Detection │    │ • Entity Graph  │
│ • Progress      │    │ • Object Recog   │    │ • Search Tools  │
│ • Validation    │    │ • Metadata Ext   │    │ • Reports       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Backend                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Storage   │  │ PostgreSQL  │  │     Real-time Subs     │ │
│  │             │  │             │  │                         │ │
│  │ • Files     │  │ • Evidence  │  │ • Processing Status     │ │
│  │ • Thumbnails│  │ • Analysis  │  │ • Collaboration Updates │ │
│  │ • Processed │  │ • Timeline  │  │ • Live Search Results   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📂 Project Structure

```
investigatai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── dashboard/                # Main investigation dashboard
│   ├── investigation/            # Investigation-specific pages
│   ├── api/                      # API routes
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn UI components
│   ├── investigation/            # Investigation-specific components
│   ├── file-upload/              # File handling components
│   └── ai-analysis/              # AI processing components
├── lib/                          # Utility libraries
│   ├── ai/                       # AI processing utilities
│   ├── supabase/                 # Supabase client & schemas
│   ├── file-processing/          # File handling utilities
│   └── utils.ts                  # General utilities
├── types/                        # TypeScript type definitions
├── hooks/                        # Custom React hooks
└── docs/                         # Documentation
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account and project
- AI API keys (OpenAI, Anthropic, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/investigatai.git
cd investigatai

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔧 AI Processing Pipeline

### 1. File Ingestion
- Secure upload to Supabase Storage
- File type validation and virus scanning
- Metadata extraction and indexing

### 2. Content Analysis
- **Text Extraction**: OCR for images/PDFs
- **Visual Analysis**: Object and face detection
- **Audio Processing**: Speech-to-text conversion
- **Video Analysis**: Frame extraction and analysis

### 3. Entity Extraction
- **People**: Facial recognition and tracking
- **Locations**: GPS data and visual landmarks
- **Objects**: Vehicles, weapons, documents
- **Timestamps**: Creation and modification dates

### 4. Relationship Mapping
- Cross-reference entities across files
- Build connection networks
- Identify patterns and anomalies

## 📊 Database Schema

### Core Tables
- `investigations` - Investigation metadata
- `evidence_files` - Uploaded file records
- `ai_analysis` - AI processing results
- `entities` - Extracted people, places, objects
- `timeline_events` - Chronological events
- `relationships` - Entity connections

## 🔐 Security & Privacy

- **End-to-end encryption** for sensitive data
- **Role-based access control** for investigations
- **Audit logging** for all operations
- **Secure file storage** with access controls
- **Data retention policies** and secure deletion

## 🚀 Deployment

### Vercel Deployment
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

### Supabase Setup
1. Create new Supabase project
2. Run SQL migrations in Supabase dashboard
3. Configure storage buckets and policies
4. Set up authentication providers

## 📈 Performance

- **Parallel Processing**: Multiple AI workers for concurrent analysis
- **Streaming Results**: Real-time updates during processing
- **Caching**: Intelligent caching of AI results
- **CDN**: Fast global file delivery via Supabase CDN

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Legal Notice

This tool is designed for legitimate investigative purposes only. Users must comply with all applicable laws and regulations regarding data privacy, surveillance, and digital evidence handling.

## 📞 Support

For support, questions, or feature requests:
- Open an issue on GitHub
- Join our Discord community
- Email: support@investigatai.com

---

**InvestigatAI** - Empowering investigators with AI-driven insights 🔍✨