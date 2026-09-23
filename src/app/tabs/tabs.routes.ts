import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';
import { roleMatch, homeGuard } from '../core/guards/role-match.guard';

const contractor = { canActivate: [authGuard, roleGuard], data: { roles: ['contractor'] } };
const supplier = { canActivate: [authGuard, roleGuard], data: { roles: ['supplier'] } };

/**
 * Mobile app routes for contractors + suppliers (admin stays on the Angular web app).
 *
 * The first URL segment of each tab root (home, browse, cart, bookings, account / supplier, listings,
 * quotations, bookings, account) must match the `tab` name on the tab bar so the right tab stays
 * highlighted. That's why supplier screens live at /tabs/listings, /tabs/quotations, /tabs/payouts
 * instead of nested under /tabs/supplier/…; the old paths are kept as redirects.
 */
export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      // —— Public / shopping ——
      { path: 'home', canActivate: [homeGuard], loadComponent: () => import('../pages/landing/landing.page').then(m => m.LandingPage) },
      { path: 'browse', loadComponent: () => import('../pages/browse/browse.page').then(m => m.BrowsePage) },
      { path: 'browse/:id', loadComponent: () => import('../pages/listing-detail/listing-detail.page').then(m => m.ListingDetailPage) },
      { path: 'storefront/:supplierId', loadComponent: () => import('../pages/storefront/storefront.page').then(m => m.StorefrontPage) },
      { path: 'compare', loadComponent: () => import('../pages/compare/compare.page').then(m => m.ComparePage) },
      { path: 'policies', redirectTo: 'policies/terms', pathMatch: 'full' },
      { path: 'policies/:key', loadComponent: () => import('../pages/policies/policies.page').then(m => m.PoliciesPage) },
      { path: 'help', loadComponent: () => import('../pages/help/help.page').then(m => m.HelpPage) },
      { path: 'account', loadComponent: () => import('../pages/account/account.page').then(m => m.AccountPage) },
      { path: 'unauthorized', loadComponent: () => import('../pages/unauthorized/unauthorized.page').then(m => m.UnauthorizedPage) },

      // —— Shared authenticated ——
      { path: 'profile', canActivate: [authGuard], loadComponent: () => import('../pages/profile/profile.page').then(m => m.ProfilePage) },
      { path: 'notifications', canActivate: [authGuard], loadComponent: () => import('../pages/notifications/notifications.page').then(m => m.NotificationsPage) },
      { path: 'messages', canActivate: [authGuard], loadComponent: () => import('../pages/messages/messages.page').then(m => m.MessagesPage) },
      { path: 'messages/:id', canActivate: [authGuard], loadComponent: () => import('../pages/message-thread/message-thread.page').then(m => m.MessageThreadPage) },
      { path: 'documents', canActivate: [authGuard], loadComponent: () => import('../pages/documents/documents.page').then(m => m.DocumentsPage) },

      { path: 'bookings', canActivate: [authGuard], loadComponent: () => import('../pages/bookings/bookings.page').then(m => m.BookingsPage) },
      { path: 'bookings/:id', canActivate: [authGuard], loadComponent: () => import('../pages/booking-detail/booking-detail.page').then(m => m.BookingDetailPage) },

      // Quotations: same URL, different screen per role
      { path: 'quotations', canActivate: [authGuard], loadComponent: () => import('../pages/quotations/quotations.page').then(m => m.QuotationsPage) },
      { path: 'quotations/:id', canMatch: [roleMatch('supplier')], canActivate: [authGuard],
        loadComponent: () => import('../pages/supplier/quotation-review/quotation-review.page').then(m => m.SupplierQuotationReviewPage) },
      { path: 'quotations/:id', canActivate: [authGuard], loadComponent: () => import('../pages/quotation-detail/quotation-detail.page').then(m => m.QuotationDetailPage) },
      { path: 'quotation-compare', ...contractor, loadComponent: () => import('../pages/quotation-compare/quotation-compare.page').then(m => m.QuotationComparePage) },

      { path: 'invoices', canActivate: [authGuard], loadComponent: () => import('../pages/invoices/invoices.page').then(m => m.InvoicesPage) },
      { path: 'invoices/:id', canActivate: [authGuard], loadComponent: () => import('../pages/invoice-detail/invoice-detail.page').then(m => m.InvoiceDetailPage) },
      { path: 'payment-history', canActivate: [authGuard], loadComponent: () => import('../pages/payment-history/payment-history.page').then(m => m.PaymentHistoryPage) },
      { path: 'payment-success', loadComponent: () => import('../pages/payment-success/payment-success.page').then(m => m.PaymentSuccessPage) },
      { path: 'payment-cancelled', loadComponent: () => import('../pages/payment-cancelled/payment-cancelled.page').then(m => m.PaymentCancelledPage) },

      { path: 'lease-agreements', canActivate: [authGuard], loadComponent: () => import('../pages/lease-agreements/lease-agreements.page').then(m => m.LeaseAgreementsPage) },
      { path: 'lease-agreements/:id', canActivate: [authGuard], loadComponent: () => import('../pages/lease-detail/lease-detail.page').then(m => m.LeaseDetailPage) },

      { path: 'disputes', canActivate: [authGuard], loadComponent: () => import('../pages/disputes/disputes.page').then(m => m.DisputesPage) },
      { path: 'disputes/:id', canActivate: [authGuard], loadComponent: () => import('../pages/dispute-detail/dispute-detail.page').then(m => m.DisputeDetailPage) },
      { path: 'raise-dispute/:bookingId', canActivate: [authGuard], loadComponent: () => import('../pages/raise-dispute/raise-dispute.page').then(m => m.RaiseDisputePage) },

      // Inspections: contractors request/confirm, suppliers view
      { path: 'inspections', canMatch: [roleMatch('supplier')], canActivate: [authGuard],
        loadComponent: () => import('../pages/supplier/inspections/inspections.page').then(m => m.SupplierInspectionsPage) },
      { path: 'inspections', ...contractor, loadComponent: () => import('../pages/inspections/inspections.page').then(m => m.InspectionsPage) },

      // —— Contractor ——
      { path: 'book-now/:listingId', ...contractor, loadComponent: () => import('../pages/book-now/book-now.page').then(m => m.BookNowPage) },
      { path: 'request-quote/:listingId', ...contractor, loadComponent: () => import('../pages/request-quote/request-quote.page').then(m => m.RequestQuotePage) },
      { path: 'cart', ...contractor, loadComponent: () => import('../pages/cart/cart.page').then(m => m.CartPage) },
      { path: 'wishlist', ...contractor, loadComponent: () => import('../pages/wishlist/wishlist.page').then(m => m.WishlistPage) },
      { path: 'my-reviews', ...contractor, loadComponent: () => import('../pages/my-reviews/my-reviews.page').then(m => m.MyReviewsPage) },

      // —— Supplier ——
      { path: 'supplier', ...supplier, loadComponent: () => import('../pages/supplier/dashboard/dashboard.page').then(m => m.SupplierDashboardPage) },
      { path: 'listings', ...supplier, loadComponent: () => import('../pages/supplier/listings/listings.page').then(m => m.SupplierListingsPage) },
      { path: 'listings/create', ...supplier, loadComponent: () => import('../pages/supplier/listing-form/listing-form.page').then(m => m.ListingFormPage) },
      { path: 'listings/:id/edit', ...supplier, loadComponent: () => import('../pages/supplier/listing-form/listing-form.page').then(m => m.ListingFormPage) },
      { path: 'payouts', ...supplier, loadComponent: () => import('../pages/supplier/payouts/payouts.page').then(m => m.SupplierPayoutsPage) },

      // Legacy supplier paths → new flat routes (keeps old links, notifications and bookmarks working)
      { path: 'supplier/listings', redirectTo: 'listings', pathMatch: 'full' },
      { path: 'supplier/listings/create', redirectTo: 'listings/create', pathMatch: 'full' },
      { path: 'supplier/listings/:id/edit', redirectTo: 'listings/:id/edit', pathMatch: 'full' },
      { path: 'supplier/quotations', redirectTo: 'quotations', pathMatch: 'full' },
      { path: 'supplier/quotations/:id', redirectTo: 'quotations/:id', pathMatch: 'full' },
      { path: 'supplier/payouts', redirectTo: 'payouts', pathMatch: 'full' },
      { path: 'supplier/inspections', redirectTo: 'inspections', pathMatch: 'full' },

      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];
