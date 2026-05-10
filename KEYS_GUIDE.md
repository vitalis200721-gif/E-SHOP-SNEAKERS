# 🗝️ API Raktų Gidas

Kad projektas veiktų pilnu pajėgumu, užpildyk šiuos failus:

### 1. Serverio Raktai (`server/.env`)
Atidaryk šį failą ir įrašyk:
- `MONGO_URI`: Tavo MongoDB adresas (pvz., `mongodb+srv://...`).
- `STRIPE_SECRET_KEY`: Raktai iš Stripe Dashboard (prasideda `sk_test_`).
- `JWT_SECRET`: Bet koks ilgas atsitiktinis tekstas (pvz., `mano_super_raktas_123`).

### 2. Kliento Raktai (`client/.env`)
Atidaryk šį failą ir įrašyk:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Viešas Stripe raktas (prasideda `pk_test_`).
- `NEXT_PUBLIC_GOOGLE_API_KEY`: Tavo Google API raktas.

---
**SVARBU:** Po kiekvieno pakeitimo .env faile, privalai perkrauti terminalą (`Ctrl+C` ir tada `npm run dev`).
