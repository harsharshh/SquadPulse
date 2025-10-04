# Google Authentication Setup Guide

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Copy the Client ID and Client Secret

## 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### Generating NEXTAUTH_SECRET

You can generate a secure secret using:
```bash
openssl rand -base64 32
```

## 3. Features Implemented

✅ Google OAuth integration with NextAuth.js
✅ Login button in header with Google branding
✅ User profile display with avatar and name
✅ Sign out functionality
✅ Loading states and responsive design
✅ Dark mode support
✅ Session management

## 4. Usage

1. Start your development server: `npm run dev`
2. Click "Sign in with Google" in the header
3. Complete Google OAuth flow
4. User profile will be displayed in the header
5. Click "Sign out" to end the session

## 5. Production Deployment

For production deployment:
1. Update `NEXTAUTH_URL` to your production domain
2. Add your production domain to Google OAuth authorized redirect URIs
3. Ensure all environment variables are set in your hosting platform
