import { Injectable } from '@angular/core';

export interface HelpSection {
  id: string;
  title: string;
  category: string;
  body: string[];
  keywords: string[];
}

@Injectable({ providedIn: 'root' })
export class HelpService {
  readonly sections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started & Account Roles',
      category: 'Account',
      keywords: ['register', 'sign up', 'role', 'contractor', 'supplier', 'admin', 'login'],
      body: [
        'EquaMeridian Hub connects Suppliers, who list machinery for rent, with Contractors, who book it for their projects. Admins oversee the whole marketplace.',
        'Register with an email and choose your role (Contractor or Supplier). Suppliers may need to provide required documents before their listings go live — see Account > Documents.',
        'Sign in with your email and password. If you can\'t remember your password, use "Forgot Password" on the login page.'
      ]
    },
    {
      id: 'password',
      title: 'Logging Out, Forgotten & Updated Passwords',
      category: 'Account',
      keywords: ['logout', 'sign out', 'forgot password', 'reset password', 'update password', 'change password'],
      body: [
        'Sign out at any time from the "Sign out" button at the bottom of the sidebar.',
        'Forgot your password? Select "Forgot Password" on the login screen, enter your email, and follow the reset link that\'s emailed to you. The link expires after a period for security, so request a new one if it\'s stopped working.',
        'To change your password while logged in, go to Account > My Profile and use the update-password option there.'
      ]
    },
    {
      id: 'browse-book',
      title: 'Browsing & Booking Machinery (Contractors)',
      category: 'Contractor',
      keywords: ['browse', 'search listings', 'book', 'booking', 'compare', 'category', 'delivery'],
      body: [
        'Use Browse to search machinery by category, location and rate. Open a listing to see full specs, photos and supplier details.',
        'You can compare multiple listings side-by-side before deciding, or request an inspection if you want to see the equipment\'s condition confirmed first.',
        'Once you\'re ready, request a quotation or book directly, supplying your rental dates and delivery address. Track the booking\'s progress under Transactions > Bookings & Deliveries.'
      ]
    },
    {
      id: 'listings',
      title: 'Managing Listings (Suppliers)',
      category: 'Supplier',
      keywords: ['create listing', 'my listings', 'availability', 'rate', 'listing status'],
      body: [
        'Create a listing with machinery details, daily/weekly rates, photos and service area. New listings may be reviewed before appearing publicly.',
        'Use My Listings to update pricing, availability, or deactivate a listing that\'s no longer for rent.',
        'Admins can flag a listing for inspection before it\'s approved — you\'ll be notified and can confirm the outcome under Supplier > Inspections.'
      ]
    },
    {
      id: 'quotations',
      title: 'Quotations',
      category: 'Marketplace',
      keywords: ['quote', 'quotation', 'accept quote', 'expire', 'negotiate'],
      body: [
        'A contractor requests a quotation from a listing; the supplier reviews it and responds with pricing and terms.',
        'Quotations expire automatically if not accepted within the configured window, so respond and act promptly.',
        'Once accepted, a quotation converts into a booking and, shortly after, an invoice.'
      ]
    },
    {
      id: 'inspections',
      title: 'Inspections',
      category: 'Marketplace',
      keywords: ['inspection', 'inspect', 'pass', 'fail', 'outcome', 'schedule'],
      body: [
        'Inspections can be requested by an admin, a supplier, or a contractor ahead of a booking, to confirm a piece of machinery\'s condition.',
        'The supplier confirms the outcome (Pass/Fail) once the scheduled inspection has taken place.',
        'You can check the current status of an inspection under your role\'s Inspections page, or just ask the chatbot "what is the status of my inspection?".'
      ]
    },
    {
      id: 'invoices-vat',
      title: 'Invoices & VAT',
      category: 'Payments',
      keywords: ['invoice', 'vat', 'tax', 'platform fee', 'generate invoice', 'total'],
      body: [
        'An invoice is generated once a quotation is accepted. It shows the rental subtotal, VAT, the platform fee, and the total the contractor owes.',
        'VAT is calculated at the rate set by an admin under Admin > Platform Fees (VAT configuration), and is broken out as its own line so it\'s always clear what portion is tax.',
        'View your invoices under Transactions > Invoices; each one shows its payment status (Pending / Paid / Overdue).'
      ]
    },
    {
      id: 'payments-payouts',
      title: 'Payments & Payouts',
      category: 'Payments',
      keywords: ['pay', 'payment', 'payfast', 'payout', 'refund', 'deposit'],
      body: [
        'Payments are processed securely through PayFast. Once you have an invoice, you\'ll get a payment link, and its status updates automatically once the payment clears.',
        'Suppliers receive payouts (invoice total minus the platform fee) on the schedule shown under Supplier > Payouts.',
        'Deposit deductions and refunds are assessed case-by-case — see Disputes & Refunds below.'
      ]
    },
    {
      id: 'disputes-refunds',
      title: 'Disputes & Refunds',
      category: 'Marketplace',
      keywords: ['dispute', 'refund', 'problem', 'damage', 'complaint'],
      body: [
        'If something goes wrong with a booking (damage, a no-show, a billing disagreement), open the booking and select "Raise a Dispute", describing the issue and attaching evidence if you have it.',
        'An admin reviews disputes under Admin > Disputes and can approve a refund where appropriate.',
        'Refund status and any deposit deductions are visible on the related booking once resolved.'
      ]
    },
    {
      id: 'reviews',
      title: 'Reviews',
      category: 'Marketplace',
      keywords: ['review', 'rating', 'edit review', 'delete review', 'feedback'],
      body: [
        'Contractors can leave one review per completed booking, rating machinery condition, reliability, communication and value for money.',
        'You can edit or delete your own review within the edit window shown on it — after that window closes it becomes permanent, since it\'s now part of the supplier\'s track record.',
        'Admins can moderate reviews that breach content rules under Admin > Reviews.'
      ]
    },
    {
      id: 'messages-notifications',
      title: 'Messages & Notifications',
      category: 'Account',
      keywords: ['message', 'chat', 'notification', 'unread'],
      body: [
        'Message a supplier or contractor directly from a booking or listing — conversations are grouped into threads under Account > Messages.',
        'Notifications (booking updates, quotation responses, disputes, announcements) appear under the bell icon; the badge shows your unread count.'
      ]
    },
    {
      id: 'admin-users-roles',
      title: 'Admin: Users, Roles & Permissions',
      category: 'Admin',
      keywords: ['admin', 'users', 'role', 'permission', 'rbac'],
      body: [
        'Admin > Users lets you search, view and manage every account on the platform.',
        'Admin > Roles controls the permission set for each role — permissions are database-driven, so changes apply immediately without a redeploy.'
      ]
    },
    {
      id: 'admin-fees-vat',
      title: 'Admin: Platform Fees & VAT Configuration',
      category: 'Admin',
      keywords: ['platform fee', 'vat configuration', 'vat rate', 'fee percentage'],
      body: [
        'Admin > Platform Fees is where the platform fee percentage and the VAT rate applied to every future invoice are configured.',
        'Changing these values only affects invoices generated afterwards — past invoices keep the rate that applied when they were created.'
      ]
    },
    {
      id: 'admin-moderation-campaigns',
      title: 'Admin: Content Moderation & Marketing Campaigns',
      category: 'Admin',
      keywords: ['content rules', 'blocked term', 'campaign', 'marketing', 'announcement'],
      body: [
        'Admin > Content Rules manages the list of blocked terms used to automatically screen review text.',
        'Admin > Campaigns lets you create, edit and delete marketing campaigns and send platform-wide announcements to users.'
      ]
    },
    {
      id: 'admin-reports-audit',
      title: 'Admin: Reports, Data Export & Audit Log',
      category: 'Admin',
      keywords: ['report', 'export', 'audit log', 'backup'],
      body: [
        'Admin > Reports gives platform-wide analytics; Admin > Data Export lets you export underlying data for further analysis.',
        'Every sensitive action (fee changes, dispute resolutions, role changes, etc.) is recorded in Admin > Audit Log for accountability.'
      ]
    },
    {
      id: 'assistant',
      title: 'Using the Chat Assistant',
      category: 'Account',
      keywords: ['chatbot', 'assistant', 'help bot', 'ask'],
      body: [
        'The chat bubble in the bottom-right corner is a self-trained assistant that can answer common questions about bookings, invoices, VAT, disputes, reviews and your account.',
        'When you\'re logged in, it can also look up your own data — e.g. asking "where is my invoice?" returns your actual latest invoice, not just a generic explanation.'
      ]
    }
  ];

  /** Short, per-screen tips shown by <app-context-help>. Keep these to 1-2 sentences — the full
   *  explanation belongs in the matching `sections` entry, which the popover links out to. */
  readonly contextTips: Record<string, { text: string; sectionId?: string }> = {
    'browse': { text: 'Filter by category, location or rate to narrow down machinery. Open a listing for full specs before booking.', sectionId: 'browse-book' },
    'compare': { text: 'Comparing shows specs and rates side-by-side so you can weigh up listings before requesting a quote.', sectionId: 'browse-book' },
    'request-quote': { text: 'Set out your rental dates and any special requirements — the supplier will respond with pricing.', sectionId: 'quotations' },
    'contractor-quotations': { text: 'Accepted quotations turn into a booking automatically. Expired ones need a new request.', sectionId: 'quotations' },
    'create-listing': { text: 'Add clear photos and an accurate daily rate — listings with complete details get booked faster.', sectionId: 'listings' },
    'my-listings': { text: 'Toggle availability here when equipment is out on rent or under maintenance.', sectionId: 'listings' },
    'supplier-quotations': { text: 'Respond before the quote\'s expiry window closes, or the contractor will need to request again.', sectionId: 'quotations' },
    'inspections': { text: 'Suppliers confirm Pass/Fail once the scheduled inspection has taken place.', sectionId: 'inspections' },
    'bookings': { text: 'Track delivery and rental status here, and raise a dispute directly from a booking if something\'s wrong.', sectionId: 'disputes-refunds' },
    'booking-detail': { text: 'This is also where you raise a dispute or confirm the condition of returned equipment.', sectionId: 'disputes-refunds' },
    'invoices': { text: 'Each invoice breaks out the rental subtotal, VAT and platform fee separately.', sectionId: 'invoices-vat' },
    'invoice-detail': { text: 'Payment status updates automatically once PayFast confirms the transaction.', sectionId: 'payments-payouts' },
    'payment-history': { text: 'A running record of every payment tied to your account, successful or not.', sectionId: 'payments-payouts' },
    'payouts': { text: 'Payouts equal the invoice total minus the platform fee, released on the schedule shown here.', sectionId: 'payments-payouts' },
    'lease-agreements': { text: 'Generated automatically as soon as you book — sign it to move your booking toward payment and confirmation.', sectionId: 'browse-book' },
    'reviews': { text: 'You can rate machinery condition, reliability, communication and value for money.', sectionId: 'reviews' },
    'admin-dashboard': { text: 'A live snapshot of platform activity — drill into any panel for the full list.', sectionId: 'admin-reports-audit' },
    'admin-listings': { text: 'Approve, flag for inspection, or deactivate listings from here.', sectionId: 'listings' },
    'admin-disputes': { text: 'Review evidence from both parties before approving a refund or dismissing a dispute.', sectionId: 'disputes-refunds' },
    'admin-refunds': { text: 'Refunds tied to an approved dispute or a booking cancellation are processed here.', sectionId: 'disputes-refunds' },
    'admin-invoices': { text: 'A platform-wide view of every invoice, including manual generation where needed.', sectionId: 'invoices-vat' },
    'platform-fees': { text: 'Changes here (including VAT rate) only apply to invoices generated after saving.', sectionId: 'admin-fees-vat' },
    'admin-users': { text: 'Search by name, email or role, and manage account status from here.', sectionId: 'admin-users-roles' },
    'admin-roles': { text: 'Permission changes take effect immediately — no redeploy needed.', sectionId: 'admin-users-roles' },
    'content-rules': { text: 'Blocked terms are checked automatically whenever a review is submitted.', sectionId: 'admin-moderation-campaigns' },
    'campaigns': { text: 'Create, edit or delete marketing campaigns and broadcast announcements from here.', sectionId: 'admin-moderation-campaigns' },
    'reports': { text: 'Export the underlying data from Admin > Data Export if you need it outside the app.', sectionId: 'admin-reports-audit' },
    'audit-log': { text: 'Every sensitive admin/system action is recorded here for accountability.', sectionId: 'admin-reports-audit' },
    'my-profile': { text: 'Update your details or change your password without needing to log out first.', sectionId: 'password' },
    'documents': { text: 'Suppliers may need to upload required documents before listings can go live.', sectionId: 'getting-started' },
    'register': { text: 'Choose Contractor if you\'re renting equipment, or Supplier if you\'re listing it.', sectionId: 'getting-started' },
    'login': { text: 'Forgotten your password? Use the link below the sign-in form.', sectionId: 'password' },
  };

  search(query: string): HelpSection[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.sections;
    return this.sections.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.keywords.some(k => k.includes(q)) ||
      s.body.some(p => p.toLowerCase().includes(q))
    );
  }
}
