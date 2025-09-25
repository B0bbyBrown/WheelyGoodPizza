# Setup Instructions

## Environment Configuration

This application requires Supabase environment variables to function properly. Without these, you'll see a loading screen on Apple devices and potentially other platforms.

### 1. Create Environment File

Create a `.env` file in the project root directory with the following content:

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# API Configuration (Optional)
VITE_API_BASE_URL=http://localhost:5000
```

### 2. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key
5. Paste them into your `.env` file

### 3. Example .env File

```bash
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.example-key-here
```

### 4. Restart Development Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## Troubleshooting

### Loading Screen on Apple Devices

If you see a loading screen on Apple devices (iPhone/iPad) but the login works on Windows:

1. **Check Environment Variables**: Ensure your `.env` file exists and contains the correct Supabase credentials
2. **Clear Browser Cache**: Clear Chrome's cache and cookies on your Apple device
3. **Check Console**: Open browser developer tools and check for error messages
4. **Verify Supabase Project**: Ensure your Supabase project is active and accessible

### Common Issues

- **Missing .env file**: Create the file in the project root directory
- **Wrong credentials**: Double-check your Supabase URL and anon key
- **Cached errors**: Clear browser cache and restart the development server
- **Network issues**: Ensure your device can access the Supabase API

## Platform-Specific Notes

- **Windows**: May work due to cached environment variables or different error handling
- **Apple Devices**: More strict about environment variable loading, will show loading screen if missing
- **Chrome on iOS**: May have different behavior than desktop Chrome

## Need Help?

If you continue to experience issues:

1. Check the browser console for error messages
2. Verify your Supabase project is set up correctly
3. Ensure your `.env` file is in the correct location (project root)
4. Try accessing the app in an incognito/private browser window
