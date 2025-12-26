# Settlo Backend v2

Simple Vercel serverless backend for lead capture and email notifications.

## Setup

1. **Create .env file:**
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=recipient@example.com
```

2. **Deploy to Vercel:**
   - Connect your GitHub repo to Vercel
   - Add the above environment variables in Vercel Settings
   - Deploy!

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/leads` - Submit a lead
- `GET /api/leads` - Get all leads (admin)

## Usage

### Submit a Lead
```bash
POST https://your-backend.vercel.app/api/leads

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "company": "Acme Corp",
  "demo": "Manufacturing CRM",
  "source": "hero"
}
```

### Response
```json
{
  "success": true,
  "message": "Lead submitted successfully!",
  "lead": {
    "id": 1234567890,
    "name": "John Doe",
    "createdAt": "2025-12-26T15:30:00Z"
  }
}
```
