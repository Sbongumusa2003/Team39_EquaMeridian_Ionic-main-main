# EquaMeridian Ionic — Contractor & Supplier mobile

Mobile experience of the EquaMeridian **Angular** web app for **Contractors** and **Suppliers**.
Admin remains on the web SPA.

## API

`src/environments/environment.ts`:

```ts
apiUrl: 'http://localhost:7019/api'
```

CORS on API must include `http://localhost:8100` (Ionic serve).

## Run

```bash
npm install
ionic serve
# API on :7019
```

## Contractor transactional flow

1. **Browse** listings → listing detail  
2. **Request quote** or **Book now** (add to cart)  
3. **Cart** → checkout creates booking/quote path  
4. **Quotations** → accept / reject / compare  
5. **Lease agreements** → sign  
6. **Invoices** → **Pay now**  
   - Card: PayFast redirect  
   - High amount / forced EFT: bank details + **upload proof**  
7. **Bookings** → track delivery/pickup, confirm receipt, request return  
8. **Payment history**, disputes, reviews, messages, notifications  

## Supplier flow

1. **Hub** dashboard  
2. **Listings** create/edit  
3. **Quotations** review/respond  
4. **Bookings** + **Confirm EFT** on invoice when proof uploaded  
5. **Payouts**, messages, notifications  

## PayFast return URLs (sandbox)

The Ionic app asks the API for the **mobile** return pages (`POST .../initiate?client=mobile`), so the web and the
mobile app can be used side by side. In the API's `appsettings.json`:

```json
"ReturnUrl":       "http://localhost:4200/payments/success",        // Angular web app
"CancelUrl":       "http://localhost:4200/payments/cancelled",
"ReturnUrlMobile": "http://localhost:8100/tabs/payment-success",    // Ionic app
"CancelUrlMobile": "http://localhost:8100/tabs/payment-cancelled"
```

The API appends `?invoiceId=<id>` to whichever URL it uses, so the result page can offer "View invoice".
If the `...Mobile` values are missing the mobile app falls back to the web URLs.

NotifyUrl must still be your **public ngrok → API** URL.
