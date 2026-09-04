
# 🔧 Mzansi Auto Repairs

> A complete auto repair shop management system with Firebase backend, user authentication, and admin dashboard.

![Mzansi Auto Repairs](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-9.22.0-orange.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Pages](#-pages)
- [Admin Credentials](#-admin-credentials)
- [Firebase Setup](#-firebase-setup)
- [Installation](#-installation)
- [Database Structure](#-database-structure)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Overview

**Mzansi Auto Repairs** is a fully functional web application for an auto repair shop based in Sandton, South Africa. It allows customers to:

- Browse services and book appointments
- Register vehicles to their profile
- View and manage their bookings
- Write reviews and rate services
- Track their service history

**For administrators**, it provides a powerful dashboard to:

- Manage customers (view, delete, make/remove admin)
- View all vehicles registered in the system
- Manage all bookings (confirm, complete, cancel, delete)
- Add/delete services
- View and delete reviews
- Track revenue and business analytics

---

## ✨ Features

### 🔐 Authentication
- User registration with email/password
- User login with email/password
- Google and Facebook social login
- Password reset functionality
- Admin role-based access control
- Session persistence

### 👤 User Dashboard
- View personal statistics (vehicles, bookings, completed services, reviews)
- Manage vehicles (add, view, delete)
- Book services (select date/time)
- View booking history with status
- Write reviews
- Edit profile information

### 🛠️ Admin Dashboard
- **Overview Dashboard**: Recent activity, top services, vehicle makes, booking status distribution
- **User Management**: View all users, make/remove admins, delete users (with all associated data)
- **Vehicle Management**: View all vehicles with owner details, delete vehicles
- **Booking Management**: View all bookings, update status (Confirm/Complete/Cancel), delete bookings
- **Service Management**: Add new services, delete existing services
- **Review Management**: View all reviews, delete inappropriate reviews
- **Profile Viewer**: Search any user by email to view their profile, vehicles, and bookings
- **Revenue Tracking**: Total revenue, pending revenue, average booking value, completed/cancelled counts

### 📱 Responsive Design
- Fully responsive for desktop, tablet, and mobile devices
- Hamburger menu for mobile navigation
- Clean, modern UI with smooth animations

---

## 🛠️ Tech Stack

| Technology | Description |
|------------|-------------|
| **HTML5** | Page structure |
| **CSS3** | Styling and animations |
| **JavaScript** | Frontend logic and Firebase integration |
| **Firebase Authentication** | User authentication and management |
| **Firebase Firestore** | NoSQL database for all data storage |
| **Font Awesome** | Icons and visual elements |
| **Unsplash** | Stock images for hero sections |

---

## 📄 Pages

| Page | Filename | Description |
|------|----------|-------------|
| Home | `index.html` | Landing page with services preview, reviews, and splash screen |
| Services | `services.html` | Full list of available services with booking functionality |
| About | `about.html` | Company information, mission, vision, and team |
| Contact | `contact.html` | Contact form with Firebase integration |
| Reviews | `reviews.html` | Customer reviews with rating system (login required to write) |
| Login | `login.html` | Login/Registration page with social login |
| Dashboard | `dashboard.html` | User dashboard with vehicle and booking management |
| Admin | `admin.html` | Full admin panel with analytics and management |
| Add Vehicle | `add-vehicle.html` | Form to add a new vehicle |
| Vehicles | `vehicles.html` | List of user's vehicles |
| Bookings | `bookings.html` | List of user's bookings |
| Messages | `messages.html` | User messages/enquiries |

---

## 🔑 Admin Credentials

| Field | Value |
|-------|-------|
| **Email** | `admin@mzansiauto.co.za` |
| **Password** | `Admin@12345` |

> **Note**: The admin account must have `isAdmin: true` in the Firestore `users` collection. Use the console script below to grant admin privileges.

### Grant Admin Privileges (One Time Setup)

After logging in with the admin account, open the browser console (F12) and run:

```javascript
const user = firebase.auth().currentUser;
if(user) {
  firebase.firestore().collection('users').doc(user.uid).set({
    fullName: "Admin User",
    email: user.email,
    isAdmin: true,
    role: "admin",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).then(() => {
    console.log("✅ Admin privileges granted!");
    alert("✅ You are now an admin! Refresh the page.");
    location.reload();
  }).catch(err => console.error("❌ Error:", err));
} else {
  console.log("❌ Please login first");
}
```

---

## 🔥 Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** and name it `mzansiautorepairs`
3. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in methods**
2. Enable:
   - **Email/Password**
   - **Google**
   - **Facebook** (optional)

### 3. Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Start in **test mode** (for development)
3. Choose your location

### 4. Firebase Configuration

Replace the `firebaseConfig` object in all HTML files with your own:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 5. Firestore Security Rules (Optional but Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && (
        request.auth.uid == userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
    }
    
    // Vehicles collection
    match /vehicles/{vehicleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
      allow delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Services collection
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      allow delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Enquiries collection
    match /enquiries/{enquiryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

---

## 📂 Database Structure

### Collections and Documents

#### `users` Collection
```javascript
{
  uid: "string",                    // Firebase Auth UID
  fullName: "string",               // User's full name
  email: "string",                  // User's email
  isAdmin: boolean,                 // Admin privileges
  role: "user" | "admin",           // User role
  createdAt: timestamp              // Account creation date
}
```

#### `vehicles` Collection
```javascript
{
  userId: "string",                 // Owner's UID
  make: "string",                   // Vehicle make (e.g., Toyota)
  model: "string",                  // Vehicle model (e.g., Corolla)
  year: number,                     // Year of manufacture
  licensePlate: "string",           // License plate number
  color: "string",                  // Vehicle color
  mileage: number,                  // Current mileage in km
  createdAt: timestamp              // Date registered
}
```

#### `services` Collection
```javascript
{
  title: "string",                  // Service name
  description: "string",            // Service description
  price: number,                    // Service price in Rands
  duration: "string",               // Duration (e.g., "120 min")
  icon: "string"                    // Font Awesome icon class
}
```

#### `bookings` Collection
```javascript
{
  userId: "string",                 // User's UID
  serviceId: "string",              // Service document ID
  date: "string",                   // Booking date (YYYY-MM-DD)
  time: "string",                   // Booking time (HH:MM)
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled",
  createdAt: timestamp,             // Booking creation date
  updatedAt: timestamp              // Last update date
}
```

#### `reviews` Collection
```javascript
{
  userId: "string",                 // User's UID
  userName: "string",               // User's name
  rating: number,                   // Rating (1-5)
  comment: "string",                // Review comment
  timestamp: timestamp              // Review date
}
```

#### `enquiries` Collection
```javascript
{
  name: "string",                   // User's name
  email: "string",                  // User's email
  phone: "string",                  // Phone number
  subject: "string",                // Enquiry subject
  message: "string",                // Enquiry message
  userId: "string",                 // User's UID (if logged in)
  isRead: boolean,                  // Read status
  createdAt: timestamp              // Enquiry date
}
```

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mzansi-auto-repairs.git
cd mzansi-auto-repairs
```

### 2. Open in Browser

Simply open any `.html` file in your browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using VS Code Live Server
# Install the Live Server extension and click "Go Live"
```

### 3. Configure Firebase

1. Update the `firebaseConfig` in all HTML files with your Firebase project details
2. Enable Authentication and Firestore in Firebase Console
3. Set up Firestore security rules

### 4. Seed Initial Data (Auto)

The application will automatically seed:
- 4 default services (Engine Diagnostics, Brake Service, Oil Change, Electrical Diagnostics)
- 4 sample reviews

---

## 📸 Screenshots

### Firebase
<img width="1297" height="592" alt="Screenshot 2026-09-04 085702" src="https://github.com/user-attachments/assets/bd3e19eb-c4e4-4c14-a38a-df413f59f5f2" />

<img width="1297" height="637" alt="Screenshot 2026-09-04 085908" src="https://github.com/user-attachments/assets/13a20139-e5fe-4c1a-9ae8-178e65c8f34c" />

<img width="1288" height="619" alt="Screenshot 2026-09-04 085941" src="https://github.com/user-attachments/assets/74e22c96-5dda-4109-9756-fa3000d98572" />

<img width="1275" height="592" alt="Screenshot 2026-09-04 085958" src="https://github.com/user-attachments/assets/f6fb7960-85db-4e94-b8d1-846bbaf08c9f" />

<img width="1280" height="598" alt="Screenshot 2026-09-04 090015" src="https://github.com/user-attachments/assets/f8d382f2-579b-4a68-ad98-564887b06cbe" />



### Home Page
<img width="1365" height="639" alt="Screenshot 2026-09-04 085123" src="https://github.com/user-attachments/assets/13045835-9c63-4fac-8449-230f62b50f45" />

<img width="1365" height="670" alt="Screenshot 2026-09-04 085140" src="https://github.com/user-attachments/assets/cdffa594-9ad8-41f4-a465-11cf7937b96a" />

### reviews
<img width="1364" height="671" alt="Screenshot 2026-09-04 085303" src="https://github.com/user-attachments/assets/ea0ac058-e28a-418b-8e40-42840549d181" />

### about us page
<img width="1336" height="676" alt="Screenshot 2026-09-04 085500" src="https://github.com/user-attachments/assets/063f120d-631d-4d6a-bb9d-673f8e6368b9" />


### Services Page
<img width="1365" height="706" alt="Screenshot 2026-09-04 084946" src="https://github.com/user-attachments/assets/03e50e34-d911-43c5-a2bb-64b2f8028002" />

<img width="1356" height="647" alt="Screenshot 2026-09-04 085031" src="https://github.com/user-attachments/assets/e646314a-29a6-4b8a-94d0-e8f6ba9f94ba" />

### Contact page
<img width="1365" height="680" alt="Screenshot 2026-09-04 085358" src="https://github.com/user-attachments/assets/526d6f23-6c50-44e1-a55f-9fc188e285c6" />


### Dashboard
<img width="1363" height="670" alt="Screenshot 2026-09-04 084859" src="https://github.com/user-attachments/assets/d510b67b-00d5-4fc2-85e2-f26eeb32ebdd" />


### Admin Panel

<img width="1314" height="617" alt="Screenshot 2026-09-04 084428" src="https://github.com/user-attachments/assets/eafa16ca-638c-40d4-943c-8a2ecfb4a3c6" />

<img width="1310" height="462" alt="Screenshot 2026-09-04 084444" src="https://github.com/user-attachments/assets/53972705-d1f5-4168-9f42-42c23727c4b8" />

### LOGIN
<img width="1350" height="661" alt="Screenshot 2026-09-04 084654" src="https://github.com/user-attachments/assets/97f935ea-662e-40fb-9cce-85083a49c448" />

### REGISTER
<img width="1326" height="665" alt="Screenshot 2026-09-04 084802" src="https://github.com/user-attachments/assets/d82996dd-688e-4652-8fe6-d2dbe1c4bcec" />

---

## 🔮 Future Enhancements

- [ ] Email notifications for booking confirmations
- [ ] SMS notifications for appointment reminders
- [ ] Payment integration (PayFast, Yoco, or Stripe)
- [ ] Service history with PDF invoices
- [ ] Customer loyalty program
- [ ] Multi-branch support
- [ ] Staff management and scheduling
- [ ] Real-time chat support
- [ ] Mobile app (React Native or Flutter)
- [ ] Google Calendar integration for bookings
- [ ] WhatsApp Business API integration
- [ ] Advanced analytics and reporting
- [ ] Multi-language support (English, Afrikaans, isiZulu)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Contact

| Contact Method | Details |
|----------------|---------|
| **Address** | 123 Main Street, Sandton, South Africa |
| **Phone** | (011) 234-5678 |
| **Email** | info@mzansiauto.co.za |
| **Website** | https://mzansiauto.co.za |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) - Backend services
- [Font Awesome](https://fontawesome.com/) - Icons
- [Unsplash](https://unsplash.com/) - Stock images
- [Google Fonts](https://fonts.google.com/) - Typography

---

## ⭐ Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Made with ❤️ in South Africa 🇿🇦**
```
