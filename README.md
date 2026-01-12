# 🍛 GharSe – Local Tiffin Marketplace

GharSe is a hyperlocal food marketplace that connects busy individuals with trusted homemade tiffin providers in their neighbourhood. The platform enables users to discover, order, and subscribe to fresh home-cooked meals online — one meal at a time.

---

## ✨ Problem Statement

In urban India, students and working professionals struggle to find affordable, hygienic, and consistent home-style food. At the same time, many home chefs and small kitchens lack a digital platform to reach nearby customers.

**GharSe bridges this gap** by creating a trusted, location-based marketplace for homemade tiffin services.

---

## 🚀 Key Features

### 👤 Customers

* Discover nearby tiffin providers
* Browse daily menus
* Place one-time or subscription-based orders
* Track order status

### 👨‍🍳 Tiffin Providers

* Register and manage their kitchen profile
* Add and update menu items
* View and manage incoming orders

### 🛠 Admin (Planned)

* Verify providers
* Manage listings and platform activity

---

## 🧱 Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB (Mongoose)

### Tooling

* tsx (TypeScript execution)
* JWT Authentication
* Git & GitHub

---

## 📂 Project Structure

```
GharSe/
├── client/        # Next.js frontend
├── server/        # Express backend
├── shared/        # Shared TypeScript types
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js (>= 18)
* npm
* MongoDB (local or Atlas)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/GharSe.git
cd GharSe
```

---

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm run dev
```

Server will run at:

```
http://localhost:8000
```

---

### 3️⃣ Setup Frontend

```bash
cd ../client
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:3000
```

---

## 🛣 Roadmap

* [ ] User authentication (JWT)
* [ ] Provider onboarding & verification
* [ ] Location-based provider discovery
* [ ] Subscription plans (weekly/monthly)
* [ ] Payment integration
* [ ] Ratings & reviews

---

## 🎯 Use Case

* College students looking for affordable daily meals
* Working professionals seeking home-style food
* Home chefs wanting to monetize their cooking skills

---

## 🤝 Contributing

Contributions are welcome. Feel free to fork the repository and submit pull requests.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🌱 Vision

To make home-cooked food easily accessible while empowering local home chefs through technology.

---

**Built with ❤️ for local food and local communities.**
