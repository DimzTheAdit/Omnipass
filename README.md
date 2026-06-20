# 🎟️ E-Ticket Ticketing System

Sistem ticketing untuk penjualan tiket wisata di Jakarta dengan integrasi pembayaran Midtrans dan pengiriman QR Code via WhatsApp.

---

## 📋 Project Status

**Current Phase:** Early Development / MVP

- ✅ WhatsApp Chatbot Integration (Fonnte API)
- ✅ Midtrans Payment Gateway
- ✅ QR Code Generation
- 🔄 Order Management (Services stubbed)
- 🔄 Attraction Management (Services stubbed)
- ⏳ Database Layer (Not yet implemented)
- ⏳ Admin Dashboard
- ⏳ Gate Scanner App
- ⏳ Full REST API

---

## 🏗️ Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│           WhatsApp User                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ (Fonnte API)
┌─────────────────────────────────────────────────────────┐
│  EXPRESS.JS SERVER (app.js)                             │
│  ├── POST /webhook                                      │
│  │   └── routes/webhook.js (Chatbot Flow)              │
│  ├── POST /midtrans-callback                           │
│  │   └── Payment Status Handler                        │
│  └── GET / (Health Check)                              │
└────────────┬──────────────────────────┬────────────────┘
             │                          │
             ↓                          ↓
      ┌─────────────────────┐   ┌─────────────────────┐
      │ services/payment.js │   │ services/qr.js      │
      │ (Midtrans)          │   │ (QR Generation)     │
      │ (Payment Creation)  │   │                     │
      └─────────────────────┘   └─────────────────────┘
             │                          │
             ↓                          ↓
      ┌──────────────────────┐  ┌──────────────────┐
      │ Midtrans Snap        │  │ /tmp (PNG Files) │
      │ (Payment Gateway)    │  │                  │
      └──────────────────────┘  └──────────────────┘
             │
             ↓ (After Payment)
      ┌──────────────────────┐
      │ services/whatsapp.js │
      │ (Send QR via WA)     │
      └──────────────────────┘
```

---

## 📁 Project Structure

```
chatbot-ticketing/
├── app.js                          # Main Express server
├── package.json                    # Dependencies
├── .env                            # Environment variables (not tracked)
├── .env.example                    # Example env file
│
├── routes/
│   └── webhook.js                  # WhatsApp chatbot message handler
│
├── services/
│   ├── payment.js                  # Midtrans payment integration
│   ├── qr.js                       # QR code generation
│   ├── whatsapp.js                 # Fonnte WhatsApp API
│   ├── attractionService.js        # [STUBBED] Attraction operations
│   └── orderService.js             # [STUBBED] Order operations
│
├── config/
│   └── database.js                 # [PLACEHOLDER] Database config
│
├── tmp/                            # Generated QR code images
│
└── utils/                          # Utility functions (placeholder)
```

---

## 🔧 Tech Stack

| Component | Package | Version |
|-----------|---------|---------|
| Web Server | express | ^5.2.1 |
| HTTP Client | axios | ^1.15.2 |
| Body Parser | body-parser | ^2.2.2 |
| CORS | cors | ^2.8.6 |
| Environment | dotenv | ^17.4.2 |
| QR Code | qrcode | ^1.5.4 |
| Midtrans | midtrans-client | ^1.4.3 |

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js v14+
- npm or yarn
- Midtrans Account (sandbox for testing)
- Fonnte API Key (WhatsApp)
- Ngrok (for testing webhooks)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create `.env` file in root directory:

```env
PORT=3000

# Midtrans (Payment Gateway)
MIDTRANS_SERVER_KEY=your_midtrans_server_key_here

# Fonnte (WhatsApp API)
FONNTE_API_KEY=your_fonnte_api_key_here
```

### Step 3: Start Server

```bash
npm start
# or with auto-reload
npm install -g nodemon
nodemon app.js
```

Server will run on: `http://localhost:3000`

---

## 💻 Current Implementation

### 1. WhatsApp Chatbot (`routes/webhook.js`)

**Flow:**
```
User → "halo"
         ↓
Bot → "Halo! 👋\n1. Beli Tiket\n2. Info"
         ↓
User → "1" (Choose menu)
         ↓
Bot → "Pilih destinasi:\n1. Ragunan - 20.000\nKetik 'beli'"
         ↓
User → "beli"
         ↓
Bot → "Masukkan jumlah tiket:"
         ↓
User → "2" (Quantity)
         ↓
Bot → "Anda membeli 2 tiket.\nKetik 'bayar' untuk lanjut"
         ↓
User → "bayar"
         ↓
Bot → "Silakan bayar: [PAYMENT_URL]"
```

**State Management:**
- Uses in-memory object: `userState[userId]`
- Tracks current flow step: MENU → PILIH_DESTINASI → JUMLAH_TIKET → KONFIRMASI

**Hardcoded Data (TODO):**
- Single destination: Ragunan - 20,000 (needs database)
- Fixed price and quantity
- Dummy user ID

**Endpoint:**
```
POST /webhook
Content-Type: application/json

{
  "message": "user_input"
}

Response:
{
  "reply": "bot_response"
}
```

### 2. Payment Integration (`services/payment.js`)

**Technology:** Midtrans Snap

**Function:** `createPayment(orderId, amount)`

**Features:**
- Creates payment transaction via Midtrans API
- Returns redirect URL for payment page
- Uses Sandbox environment (can switch to production)

**Usage:**
```javascript
const { createPayment } = require("./services/payment");
const paymentUrl = await createPayment("ORDER-123", 20000);
// Returns: https://app.sandbox.midtrans.com/snap/v2/...
```

### 3. QR Code Generation (`services/qr.js`)

**Technology:** qrcode npm package

**Function:** `generateQRFile(text)`

**Features:**
- Generates QR code PNG file
- Stores in `/tmp` folder
- Auto-creates `/tmp` directory if missing
- Returns file path

**Usage:**
```javascript
const { generateQRFile } = require("./services/qr");
const filePath = await generateQRFile("ORDER-123");
// Returns: C:\Users\asus\chatbot-ticketing\tmp\ORDER-123.png
```

### 4. WhatsApp Messaging (`services/whatsapp.js`)

**Technology:** Fonnte API

**Function:** `sendWhatsApp(number, message)`

**Features:**
- Sends WhatsApp message via Fonnte API
- Supports long text messages
- No return value (fire and forget)

**Usage:**
```javascript
const { sendWhatsApp } = require("./services/whatsapp");
await sendWhatsApp("628123456789", "Hello from Bot!");
```

### 5. Payment Callback Handler (`app.js`)

**Endpoint:** `POST /midtrans-callback`

**Flow:**
1. Receives payment status from Midtrans
2. Checks if status is "settlement" or "capture" (successful payment)
3. If successful:
   - Generates QR code using orderId
   - Looks up user from `orderMap[orderId]`
   - Sends QR image URL via WhatsApp

**Hardcoded Values (TODO):**
- Recipient phone: "6285216956975" (should be user phone)
- Ngrok URL: "https://cruncher-viewpoint-condition.ngrok-free.dev" (should be environment variable)

---

## 📡 API Endpoints

### Currently Implemented

```
GET  /                      # Health check
POST /webhook               # WhatsApp chatbot message
POST /midtrans-callback     # Midtrans payment callback
GET  /tmp/:filename         # QR code image file
```

### Stubbed (Not Yet Implemented)

```
POST   /api/attractions              # Create attraction
GET    /api/attractions              # List attractions
GET    /api/attractions/:id          # Get single attraction
PUT    /api/attractions/:id          # Update attraction
DELETE /api/attractions/:id          # Delete attraction

POST   /api/orders                   # Create order
GET    /api/orders/:id               # Get order
GET    /api/orders/user/:phone       # Get user's orders

POST   /api/tickets/use              # Mark ticket as used
GET    /api/tickets/verify           # Verify ticket

POST   /api/auth/login               # Login gate/admin user
```

---

## 🔑 Environment Variables

```env
PORT                    # Server port (default: 3000)
MIDTRANS_SERVER_KEY     # Midtrans server key for payment API
FONNTE_API_KEY          # Fonnte API key for WhatsApp
```

### Optional (TODO)

```env
DB_URI                  # Database connection URI
DB_HOST                 # Database host
DB_USER                 # Database user
DB_PASSWORD             # Database password
JWT_SECRET              # JWT signing secret
NGROK_URL              # Public Ngrok URL for webhook callbacks
NODE_ENV               # development | production
```

---

## 🛠️ Development Notes

### Stubbed Services

**`services/attractionService.js`** - Empty file
- Needs: getAttractions(), getAttractionById(), createAttraction(), etc.
- Dependency: Database model (Attraction)

**`services/orderService.js`** - Empty file
- Needs: createOrder(), getOrder(), getUserOrders(), etc.
- Dependency: Database models (Order, Ticket)

**`config/database.js`** - Empty file
- Needs: Database connection setup (MongoDB/MySQL/PostgreSQL)
- Will be used by models and services

### Hardcoded Values (Should Be Dynamic)

In `routes/webhook.js`:
```javascript
// Line 14: Dummy user ID
const userId = "user1";

// Line 36-37: Hardcoded destination
reply = "Pilih destinasi:\n1. Ragunan - 20.000\nKetik 'beli'";

// Line 40: Fixed amount
const amount = 20000;
```

In `app.js`:
```javascript
// Line 55: Hardcoded recipient phone
const phone = "6285216956975";

// Line 59: Hardcoded Ngrok URL
const imageUrl = `https://cruncher-viewpoint-condition.ngrok-free.dev/tmp/${orderId}.png`;
```

### Error Handling

**Current:** Try-catch blocks with console logging
- No structured error responses
- No HTTP status codes in error cases
- Logs errors but continues

**Improvements Needed:**
- Proper HTTP error status codes
- Structured error response format
- Error logging to file
- Graceful degradation

### State Management

**Current:** In-memory object
```javascript
let userState = {};      // User conversation state
let orderMap = {};       // orderId → userId mapping
```

**Issues:**
- Lost on server restart
- Not persistent across sessions
- Not scalable to multiple server instances
- No timeout/cleanup

**Should Use:** Redis or Database

### Testing Webhook Locally

1. Install Ngrok:
```bash
# Download from https://ngrok.com/download
```

2. Start Ngrok tunnel:
```bash
ngrok http 3000
```

3. Configure Fonnte webhook URL:
- Go to Fonnte Dashboard
- Set Webhook URL: `https://your-ngrok-url/webhook`

4. Test webhook:
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"message":"halo"}'
```

---

## 📊 Data Models (To Be Implemented)

### Users
```
{
  id: ObjectId,
  phone: String (unique),
  name: String,
  email: String (unique),
  role: String (customer | gate | admin),
  password: String (hashed),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Attractions
```
{
  id: ObjectId,
  name: String,
  description: String,
  location: String,
  address: String,
  price: Number,
  category: String (museum | waterpark | zoo | garden | adventure),
  image_url: String,
  opening_hours: String,
  contact: String,
  daily_limit: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders
```
{
  id: ObjectId,
  order_id: String (unique),
  user_phone: String,
  user_name: String,
  attraction_id: ObjectId,
  quantity: Number,
  total_price: Number,
  status: String (pending | paid | used | expired),
  payment_status: String (unpaid | settlement | capture | failed),
  payment_url: String,
  transaction_id: String,
  visit_date: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Tickets
```
{
  id: ObjectId,
  ticket_number: String (unique),
  order_id: ObjectId,
  attraction_id: ObjectId,
  qr_code: String (encoded data),
  qr_code_path: String (file path),
  user_name: String,
  user_phone: String,
  status: String (active | used | expired | cancelled),
  used_at: Date,
  scanned_by: String (gate user phone),
  valid_from: Date,
  valid_until: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 TODO / Next Steps

### Phase 1: Backend Infrastructure
- [ ] Setup database (MongoDB/MySQL)
- [ ] Implement database models
- [ ] Create database services
- [ ] Add authentication (JWT)
- [ ] Create middleware

### Phase 2: API Development
- [ ] REST API routes for attractions
- [ ] REST API routes for orders
- [ ] REST API routes for tickets
- [ ] REST API routes for authentication
- [ ] Input validation

### Phase 3: Frontend Development
- [ ] Admin Dashboard (HTML/CSS/JS)
- [ ] Gate Scanner App (Mobile/Web)
- [ ] User Management UI
- [ ] Analytics Dashboard

### Phase 4: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Docker containerization
- [ ] Production deployment

### Phase 5: Enhancements
- [ ] Real-time notifications
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Analytics & reporting
- [ ] Multiple language support

---

## 🧪 Testing

### Manual Testing

**Test 1: Health Check**
```bash
curl http://localhost:3000
# Response: "API is running..."
```

**Test 2: Webhook Flow**
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"message":"halo"}'
```

**Test 3: Generate QR**
```bash
# Within Node.js:
const { generateQRFile } = require('./services/qr');
await generateQRFile('TEST-QR');
// File created: tmp/TEST-QR.png
```

**Test 4: Send WhatsApp**
```bash
# Within Node.js:
const { sendWhatsApp } = require('./services/whatsapp');
await sendWhatsApp('6285216956975', 'Test message');
```

---

## 📝 Notes

- **Chatbot State**: Currently stored in memory, lost on restart
- **User Mapping**: Orders mapped to dummy user ID "user1"
- **Hardcoded Data**: Destinations, prices, phone numbers need database
- **Security**: No authentication/authorization implemented yet
- **Validation**: No input validation on webhook messages
- **Logging**: Uses console.log(), should use proper logging library
- **Error Handling**: Basic try-catch, needs improvement
- **Scalability**: Not ready for production (in-memory state, no clustering)

---

## 🔗 External Services

1. **Midtrans** (Payment Gateway)
   - API: https://api.sandbox.midtrans.com
   - Documentation: https://docs.midtrans.com

2. **Fonnte** (WhatsApp API)
   - API: https://api.fonnte.com
   - Documentation: https://fonnte.com/docs

3. **Ngrok** (Webhook Tunneling)
   - Download: https://ngrok.com/download
   - For testing webhooks locally

---

## 📞 Contact & Support

- Check environment configuration in `.env`
- Review error logs in console output
- Test endpoints with Postman/Curl

---

**Last Updated:** June 2026

**Status:** Early Development - MVP Phase
"# Omnipass" 
