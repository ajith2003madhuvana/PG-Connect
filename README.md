# PG-Connect | Smart Hostel Management System

PG-Connect is a comprehensive, full-stack capable dashboard designed to modernize the management of Paying Guest (PG) accommodations and hostels. It bridges the communication gap between administrators and residents while providing robust tools for financial tracking, occupancy management, and issue resolution.

![PG-Connect Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview) 
*(Note: Replace this image link with a real screenshot of your dashboard after you run it!)*

## 🚀 Features

### For Administrators
*   **Real-time Dashboard:** Visual analytics for occupancy rates, total revenue, and pending dues using interactive charts.
*   **Smart Room Grid:** A 25-room visual grid that alerts admins to vacancies or pending fees at a glance.
*   **Financial Tracking:** Automatically categorize residents into "All Clear" and "Pending Dues" lists with one-click payment reconciliation.
*   **Resident Directory:** Complete profile management including native state tracking for better roommate matching.
*   **AI-Powered Insights:** Integrated Google Gemini API to provide actionable daily summaries (e.g., "3 residents have pending fees this week").

### For Residents
*   **Direct Login:** Password-less, secure authentication using registered phone numbers.
*   **Digital Home:** View rent due dates and payment history instantly.
*   **Support Tickets:** Raise issues (Plumbing, Wifi, etc.) and track their status in real-time.
*   **Direct Chat:** Built-in messaging system to communicate directly with the hostel warden/admin.

## 🛠️ Tech Stack

*   **Frontend:** React.js (TypeScript)
*   **Styling:** Tailwind CSS (Custom "Soft Slate" design system)
*   **Data Visualization:** Recharts
*   **Icons:** Lucide-React
*   **State Management:** Custom React Hooks with LocalStorage persistence
*   **AI Integration:** Google GenAI SDK (Gemini 2.5)

## 🏗️ Architecture Highlights

### Custom Hook: `useStickyState`
To ensure a seamless user experience without a dedicated backend database for the demo, I engineered a custom hook that persists specific application states (Residents, Tickets, Messages) to `localStorage`. This allows the application to retain data even after a page refresh, simulating a persistent database connection.

### Role-Based Access Control (RBAC)
The application implements a secure view-switching logic based on the authenticated user role (`ADMIN` vs `RESIDENT`). 
*   **Admin View:** Full access to financial data and resident management.
*   **Resident View:** Scoped access to personal data and communication channels only.

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/pg-connect.git
    cd pg-connect
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory and add your Google Gemini API key for the insights feature:
    ```env
    VITE_API_KEY=your_google_api_key_here
    ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```

## 🔮 Future Roadmap

*   **Backend Integration:** Connect with Spring Boot (Java 17) for robust database management.
*   **Payment Gateway:** Integrate Razorpay/Stripe for direct in-app rent payments.
*   **Biometric Entry:** Link with IoT hardware for gate access logs.

---
