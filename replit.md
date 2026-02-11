# Nomad Internet Customer Portal

## Overview
The Nomad Internet Customer Portal is a web application providing Nomad Internet customers with a modern platform to manage their services. It offers comprehensive features including authentication, subscription management, order tracking, invoicing, and device management. The portal aims to enhance the customer experience through self-service options and detailed insights into their internet services, solidifying Nomad Internet's position in the market with a robust and user-friendly digital interface.

## User Preferences
I prefer detailed explanations, especially for complex features or architectural decisions. I want to be informed before major changes are made to the codebase. I expect iterative development with clear communication at each step.

## System Architecture
The portal is built with a React frontend, an Express.js backend, and a PostgreSQL database utilizing Drizzle ORM. Tailwind CSS is used for styling, and Framer Motion for animations. Authentication is JWT-based, incorporating bcrypt for password hashing and OTP verification for sign-up and sign-in processes.

### UI/UX Decisions
The design adheres to Nomad Internet's official branding with a modern SaaS aesthetic. Key visual elements include glassmorphism card designs, gradient panels, the Inter font, and a distinct color palette featuring `#10a37f` as the primary brand green. User interactions are optimized with large input fields, gradient buttons, and clear visual feedback. The dashboard is organized with a tabbed interface for easy navigation through sections like Overview, Subscriptions, Orders, Invoices, and Internet.

### Technical Implementations
- **Authentication**: Supports both email/password and OTP-based passwordless sign-in, with a multi-step OTP verification process for sign-up and password reset.
- **Customer Data Aggregation**: A unified service layer integrates data from multiple external APIs (Chargebee, Shopify, Shipstation, ThingSpace) to provide a holistic view of customer information, subscriptions, orders, and device statuses.
- **Subscription & Billing**: Displays detailed subscription information, including ICCID/IMEI/MDN, and integrates with Chargebee for invoice viewing, payment collection, and payment method management, supporting subscription-grouped invoices and bulk payments.
- **Device Management**: The "Internet" tab offers real-time line status from ThingSpace, supports changing device plans, and includes a troubleshooting page for line restoration with automated recovery attempts and escalation options. Features also include device help options and comprehensive slow speed troubleshooting.
- **AI Chatbot**: An integrated JADA AI chatbot, powered by OpenAI GPT-4o, provides contextual customer support.
- **Activity Tracking**: Logs user login history and other account activities for enhanced security and user transparency.
- **Cancellation & Retention Flow**: Implements a multi-step cancellation modal with intelligent flows based on user reasons, offering retention discounts or troubleshooting, and integrating with Zendesk and Slack for support.
- **Customer Feedback System**: Allows customers to submit and view feedback, with an admin interface for management and response.
- **Credit Notes & Refunds Visibility**: Fetches and displays credit notes from Chargebee, providing detailed views and PDF downloads.
- **Add-on Management**: Customers can add and remove subscription add-ons (e.g., Travel Add-on) via a dedicated modal. Features de-duplication logic for Travel add-on variants, upsell-biased UI encouraging add-on purchases, and retention messaging discouraging removal. Backend verifies subscription ownership before any changes.

### Feature Specifications
- **Sign-Up & Sign-In Flows**: Comprehensive flows including email and phone OTP verification, secure password handling, and passwordless options.
- **Account Management**: Functionality for users to update personal information (name, password, phone number).
- **Dashboard**: A centralized view with dedicated tabs for managing subscriptions, viewing orders, accessing invoices, and monitoring internet device status.
- **Troubleshooting**: Automated line status checks, suspended line auto-restoration, escalation to support, and specific guidance for active lines, including detailed slow speed diagnostics.
- **Admin Dashboard**: Secure admin login and dashboard for managing customer feedback, cancellation requests, and viewing subscription pause logs.

## External Dependencies
- **Chargebee**: Billing, subscriptions, invoices, transactions, customer management.
- **Shopify Admin API**: Order retrieval and fulfillment information.
- **Shipstation**: Shipping and tracking details.
- **ThingSpace (Verizon)**: Device management, line status, plan information, device activation/deactivation.
- **Twilio**: Sending OTP codes for phone and email verification.
- **OpenAI GPT-4o**: Powering the JADA AI chatbot.
- **`app.lrlos.com`**: External webhook for sending OTPs and activation requests.