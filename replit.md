# Nomad Internet Customer Portal

## Overview
A customer portal for Nomad Internet customers with sign-in and sign-up functionality. The portal uses the official Nomad Internet branding and integrates with external APIs for customer verification and OTP authentication.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Branding
- Primary Color: #00A77F
- Accent Color: #008061
- Font: Inter (Google Fonts)
- Logo: Nomad Internet official logo

## Project Structure
```
src/
├── components/
│   ├── AuthLayout.tsx    # Shared auth page layout with branding
│   ├── Button.tsx        # Animated button component
│   └── Input.tsx         # Styled input with tooltips
├── pages/
│   ├── SignIn.tsx        # Sign-in page
│   └── SignUp.tsx        # Multi-step sign-up flow
├── App.tsx               # Router configuration
├── main.tsx              # App entry point
└── index.css             # Global styles + Tailwind
```

## Sign-Up Flow
1. **Email Step**: User enters email, verified against Chargebee API
2. **Confirm Email**: If not found, asks user to confirm or try different email
3. **Phone Step**: Collects US phone number (+1 format with validation)
4. **Phone OTP**: Sends OTP via Twilio, user enters code
5. **Email OTP**: Sends OTP to email, user enters code

## External API Endpoints
- `POST https://app.lrlos.com/webhook/Chargebee/getcustomersusingemail` - Customer lookup
- `POST https://app.lrlos.com/webhook/twilio/sendotp` - Send OTP codes

## Running the App
```bash
npm run dev
```
Runs on port 5000.

## Recent Changes
- Initial setup with React + TypeScript + Tailwind
- Created sign-in and sign-up pages with Nomad branding
- Implemented multi-step sign-up flow with API integrations
- Added animations, hover effects, and tooltips
- Fixed UI spacing: Replaced icon box with "Nomad Internet" text branding on left panel
- Improved spacing and centering across all form elements
- Enhanced visual hierarchy with proper padding and margins
