# MediFind – Digital Healthcare & Medicine Availability Platform

MediFind is a full-stack healthcare platform designed to help users find medicines, compare prices, locate pharmacies, and check medicine availability. It also supports pharmacy inventory management and administrative operations.

## Live Links

* **Frontend Website:** https://medifind-frontend-khaki.vercel.app
* **Backend Repository:** https://github.com/harshithakothareddy/MediFind-Backend
* **Swagger API Documentation:** https://medifind-backend-6f8q.onrender.com/api/swagger-ui/index.html

## Features

* Search medicines by brand or generic name.
* Compare medicine prices and availability.
* Find nearby pharmacies.
* Upload prescriptions.
* Reserve medicines for pharmacy pickup.
* Manage pharmacy inventory and stock.
* Track low-stock items and medicine expiry.
* Support pharmacy verification and administration.

## Technologies Used

* React.js
* JavaScript
* Vite
* HTML and CSS
* REST API integration

## Getting Started

### Prerequisites

* Node.js
* npm
* Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/harshithakothareddy/MediFind-Frontend.git
   ```

2. Navigate to the project folder:

   ```bash
   cd MediFind-Frontend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root and configure the backend URL:

   ```env
   VITE_API_BASE_URL=https://medifind-backend-6f8q.onrender.com/api
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL displayed in the terminal.

## Deployment

The frontend is deployed on Vercel and communicates with the backend services through REST APIs.

## Project Objective

MediFind aims to improve access to medicine information and pharmacy services through a centralized digital platform.

## Related Repository

**Backend:** https://github.com/harshithakothareddy/MediFind-Backend

---

**Security:** Never commit `.env` files, passwords, or secret credentials to GitHub.
