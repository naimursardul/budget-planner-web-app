You are a senior full-stack SaaS engineer, product designer, and UX expert.

Build a complete production-ready web application called:

"Smart Budget Planner"

This is NOT a PDF, NOT an Excel template, and NOT a static landing page.

It is a real interactive personal budgeting web application that users can purchase/access online and use from their browser.

The design and functionality should be inspired by the budget planner screenshots I provided, but the application must be redesigned as a modern web app rather than copying the spreadsheet layout literally.

==================================================
TECH STACK
==================================================

Frontend:

- Next.js 15+ with App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui where useful
- Lucide React icons
- Recharts for charts
- React Hook Form
- Zod validation

Backend:

- Next.js server-side architecture / Route Handlers / Server Actions
- MongoDB
- Mongoose

Authentication:

- Auth.js / NextAuth
- Email/password authentication
- Google login optional but structure the application so it can be enabled later

Deployment target:

- Vercel-compatible
- MongoDB Atlas

Use a clean architecture so the project can scale into a commercial SaaS product.

==================================================
CORE PRODUCT IDEA
==================================================

Users create an account and receive a personal budgeting workspace.

The application should help users:

- Track income
- Track expenses
- Track savings
- Track bills
- Track debt
- Track transactions
- Set monthly budgets
- Compare planned vs actual spending
- Categorize transactions
- Prioritize expenses
- Track recurring bills
- See financial charts
- Review each month
- Monitor financial progress

Everything should update automatically.

The user should NOT need to manually calculate totals.

==================================================
MAIN APP STRUCTURE
==================================================

Create the following main navigation:

Dashboard
Transactions
Budget
Bills
Calendar
Savings
Debt
Priorities
Reports
Settings

Desktop:
Use a modern left sidebar.

Mobile:
Use a responsive bottom navigation / mobile menu.

Sidebar should show:

Logo
Dashboard
Transactions
Budget
Bills
Calendar
Savings
Debt
Priorities
Reports

Then:

Settings
Help
Logout

==================================================

1. # AUTHENTICATION

Create:

/login
/register
/forgot-password

Registration fields:

- Name
- Email
- Password
- Confirm password

Validate everything with Zod.

After registration:

Show onboarding.

Onboarding should ask:

1. What currency do you use?
2. What is your monthly income?
3. Do you want to start with a sample budget?
4. What are your main financial goals?

Supported currencies should include at least:

USD
EUR
GBP
CAD
AUD
BDT
INR
JPY

Store currency preference in the user's MongoDB profile.

# ================================================== 2. ONBOARDING

Create a beautiful onboarding experience.

Step 1:
"Let's set up your budget"

Step 2:
"Choose your currency"

Step 3:
"Add your income"

Step 4:
"Choose your categories"

Step 5:
"Set your first monthly budget"

Step 6:
"You're ready!"

Allow:

"Start with sample data"

This should populate the application with example transactions so the user immediately understands how the system works.

# ================================================== 3. DASHBOARD

The Dashboard is the most important page.

Design it as a premium financial dashboard.

Top:

"Good morning, [Name]"

Show current month.

Allow month switching:

< September 2026 >

Dashboard cards:

Total Income
Total Expenses
Total Savings
Remaining Budget

Example:

Income
$5,240

Expenses
$2,830

Savings
$1,210

Remaining
$1,200

Each card should show:

- amount
- comparison with previous month
- small trend indicator

IMPORTANT:

These numbers must be calculated from real MongoDB transaction data.

Do NOT hard-code dashboard values.

# ================================================== 4. DASHBOARD CHARTS

Include:

A. Income vs Expense chart

Use:

- Bar chart
- Monthly comparison

B. Spending Breakdown

Use:

- Donut chart

Categories:
Housing
Food
Transportation
Entertainment
Bills
Shopping
Health
Other

C. Budget vs Actual

Show:

Category
Budget
Actual
Remaining

Use progress bars.

Example:

Food
$600 budget
$480 spent

80%

D. Cash Flow

Line chart:

Income
Expenses
Savings

Across multiple months.

E. Savings Progress

Show:
Current savings
Monthly savings goal
Percentage completed

# ================================================== 5. QUICK ACTIONS

On dashboard add:

- Add Income
- Add Expense
- Add Bill
- Add Savings
- Add Debt Payment

These open modal forms.

After submission:

MongoDB updates immediately.

Dashboard should automatically refresh/recalculate.

# ================================================== 6. TRANSACTION SYSTEM

Create a complete transaction management system.

Page:

/transactions

Table columns:

Date
Type
Category
Sub-category
Description
Amount
Account
Actions

Transaction types:

Income
Expense
Savings
Bill
Debt

Allow:

Create
Edit
Delete
Search
Filter
Sort
Pagination

Filters:

Date range
Type
Category
Amount
Account

Add transaction modal:

Date
Type
Category
Sub-category
Amount
Description
Account
Recurring toggle

Use React Hook Form + Zod.

# ================================================== 7. CATEGORIES

Users can customize their categories.

Default categories:

INCOME:
Salary
Freelance
Business
Interest
Dividends
Other

EXPENSES:
Groceries
Dining Out
Shopping
Transportation
Housing
Utilities
Health
Entertainment
Subscriptions
Personal Care
Education
Pets
Gifts
Other

SAVINGS:
Emergency Fund
Vacation
Retirement
House
Car
Other

BILLS:
Electricity
Water
Internet
Phone
Rent
Insurance
Streaming
Gas
Healthcare
Other

DEBT:
Credit Card
Student Loan
Car Loan
Mortgage
Personal Loan
Medical Debt
Other

Users can:

Add category
Rename category
Delete category
Reorder category

Store custom categories per user.

# ================================================== 8. MONTHLY BUDGET

Create:

/budget

Users select:

January
February
March
...
December

Allow monthly budget planning.

For each category show:

Category
Budget
Actual
Difference
Progress

Example:

Groceries
Budget: $500
Actual: $420
Remaining: $80

Use visual progress bars.

Status:

Under budget
Near limit
Over budget

Make the colors intuitive but accessible.

# ================================================== 9. MONTHLY DASHBOARD

Create a monthly overview system inspired by the supplied screenshots.

Each month should have:

Income summary
Savings summary
Expense summary
Bills summary
Debt summary
Budget vs actual
Spending breakdown
Cash flow

Do NOT create 12 completely separate duplicated pages.

Create one reusable monthly dashboard component that dynamically loads:

/dashboard?month=2026-09

Users can switch months.

Include:

Previous month
Current month
Next month

Also allow a year selector.

# ================================================== 10. BILL MANAGEMENT

Create:

/bills

Users can create bills.

Fields:

Name
Category
Amount
Due date
Frequency
Auto-pay
Reminder
Status

Frequency:

One-time
Weekly
Monthly
Yearly

Show:

Upcoming bills
Overdue bills
Paid bills

Each bill should automatically appear in the calendar.

# ================================================== 11. SMART CALENDAR

Create:

/calendar

Monthly calendar view.

Display:

Bills
Recurring payments
Income dates
Debt payments
Savings contributions
Custom events

Users can:

Create event
Edit event
Delete event
Mark complete

Each event should have:

Title
Date
Color
Type
Notes

Bill events should automatically come from the bill system.

# ================================================== 12. SAVINGS TRACKER

Create:

/savings

Allow users to create savings goals.

Example:

Emergency Fund
Target: $10,000
Current: $4,250

Vacation
Target: $3,000
Current: $1,300

Each goal:

Name
Target amount
Current amount
Deadline
Monthly contribution
Color

Display:

Progress percentage
Amount remaining
Projected completion

Use attractive progress visualization.

# ================================================== 13. DEBT TRACKER

Create:

/debt

Users can manage debts.

Fields:

Debt name
Type
Original balance
Current balance
Interest rate
Minimum payment
Due date

Show:

Total debt
Total paid
Remaining debt
Monthly payments

Charts:

Debt reduction over time

Do NOT provide financial advice or claim guaranteed debt payoff.

# ================================================== 14. PRIORITY TRACKER

Inspired by the Priority tab in the screenshot.

Each expense category can have a priority:

Essential
High Priority
Moderate
Low Priority
Avoidable

Create:

/priorities

Show:

Category
Priority
Amount spent
Budget

Create summary:

Essential spending
High priority spending
Moderate spending
Low priority spending
Avoidable spending

Use attractive color indicators.

# ================================================== 15. REPORTS

Create a powerful reports page.

Users can select:

This month
Last month
Last 3 months
Last 6 months
This year
Custom date range

Reports:

Income report
Expense report
Savings report
Debt report
Category spending
Budget performance
Cash flow

Charts:

Bar
Line
Donut
Area

Allow CSV export.

Structure the code so PDF export can be added later.

# ================================================== 16. SETTINGS

Create:

/settings

Sections:

Profile
Currency
Categories
Budget preferences
Notifications
Appearance
Security

Appearance:

Light
Dark
System

Currency:

USD
EUR
GBP
CAD
AUD
BDT
INR
JPY

Date format:

MM/DD/YYYY
DD/MM/YYYY

# ================================================== 17. NOTIFICATIONS

Create a notification system.

Potential notifications:

"Your electricity bill is due tomorrow."

"You're close to your dining budget."

"You've exceeded your shopping budget."

"Your savings goal is 70% complete."

"New month is ready."

Do not spam notifications.

Allow users to disable notification types.

# ================================================== 18. MONGODB DATABASE DESIGN

Use MongoDB with Mongoose.

Create models for at least:

User
Profile
Category
Transaction
Budget
Bill
CalendarEvent
SavingsGoal
Debt
Notification

IMPORTANT:

Every financial record must belong to a specific user.

Example:

userId

Never allow one user to access another user's financial information.

Use proper indexes.

Recommended indexes:

transactions:
userId + date
userId + type
userId + category

bills:
userId + dueDate

budget:
userId + month + year

calendar:
userId + date

# ================================================== 19. SECURITY

This is a commercial financial application.

Implement:

- Authentication
- Authorization
- Server-side validation
- Zod validation
- Secure cookies
- Password hashing
- Rate limiting structure
- CSRF-safe architecture
- Input sanitization
- User ownership checks
- MongoDB query safety
- Environment variables
- No secrets in frontend
- No sensitive data in client logs

IMPORTANT:

Never trust userId sent from the browser.

Always derive authenticated user identity on the server.

Every API/server action must verify ownership.

# ================================================== 20. API / SERVER ARCHITECTURE

Use clean server architecture.

Organize:

/app
/components
/lib
/models
/actions
/services
/types
/hooks

Keep business logic out of UI components.

Use server actions where appropriate.

Use Route Handlers where APIs make more sense.

Create reusable database utilities.

Example:

/lib/mongodb.ts

Handle MongoDB connection correctly for Next.js development and production.

# ================================================== 21. DESIGN SYSTEM

Use a premium financial-product visual identity.

Primary palette:

Cream:
#FAF7F5

Blush:
#F6C1CC

Lavender:
#C9BCE8

Sage:
#B8DDB0

Sky:
#B9E3EA

Peach:
#F6C49C

Dark:
#252329

Do not make every component colorful.

Use accent colors strategically.

Design should feel:

Elegant
Calm
Premium
Friendly
Trustworthy
Modern

Use:

rounded-xl
subtle borders
soft shadows
large whitespace
clear hierarchy

Avoid:

neon colors
excessive gradients
overloaded dashboards
tiny text
generic bootstrap styling

# ================================================== 22. RESPONSIVE DESIGN

Desktop:

Sidebar + main content.

Tablet:

Collapsible sidebar.

Mobile:

Bottom navigation or compact navigation.

All pages must work properly on:

320px
375px
414px
768px
1024px
1440px+

No horizontal overflow.

# ================================================== 23. EMPTY STATES

Every major section needs a beautiful empty state.

Examples:

"No transactions yet"

"Create your first transaction to start tracking your money."

CTA:

"+ Add Transaction"

Do this for:

Transactions
Bills
Savings
Debt
Calendar
Budgets

# ================================================== 24. SAMPLE DATA

Provide optional demo/sample data.

Create a seed function.

Sample user:

Demo User

Include realistic sample:

Income
Expenses
Bills
Savings
Debt
Budgets
Calendar entries

This should make the dashboard look complete during development.

# ================================================== 25. FREE VS PAID PRODUCT ARCHITECTURE

The application will ultimately be sold to customers.

Design the architecture so monetization can be added.

Create a subscription/access model.

User fields should support:

plan:
free
premium

subscriptionStatus:
active
inactive
trialing
cancelled

subscriptionEndsAt

The first version can use a simple premium-access flag.

Structure the application so Stripe/Lemon Squeezy can be integrated later without rewriting the entire application.

Premium features could include:

Unlimited transactions
Advanced reports
Savings goals
Debt tracker
Full calendar
CSV export
Advanced analytics
Multiple budgets
Custom categories

Do not implement fake payment processing.

Create clear service boundaries for future payment integration.

# ================================================== 26. LANDING PAGE

The application should also have a public marketing website.

Routes:

/
/pricing
/features
/faq

Landing page sections:

Hero
Problem
Solution
Features
Dashboard preview
How it works
Benefits
Pricing
FAQ
Final CTA
Footer

Hero headline:

"Your Money. Your Plan. Your Future."

Subheading:

"A smarter way to organize your income, expenses, savings, bills, and financial goals — all in one beautiful budgeting workspace."

CTA:

"Start Budgeting"

Secondary:

"Explore Features"

Use screenshots/mockups inspired by the supplied budget planner images.

# ================================================== 27. PRODUCT UX

The user experience should feel significantly better than a spreadsheet.

Important:

Do NOT simply reproduce spreadsheet cells.

Convert the spreadsheet concepts into:

Cards
Charts
Tables
Modals
Filters
Progress bars
Calendar components
Interactive dashboards

The app should feel like:

"YNAB + modern dashboard + simple personal finance tracker"

but it must NOT copy another company's branding, interface, or proprietary design.

# ================================================== 28. DASHBOARD INTERACTIONS

Everything should feel live.

Example:

If user adds:

Expense:
$80 groceries

Then automatically update:

Transactions
Monthly expenses
Category spending
Budget progress
Dashboard totals
Spending chart
Reports

If user adds:

$200 savings

Update:

Savings total
Cash flow
Monthly overview
Savings goal if linked

If a bill is marked paid:

Update:
Upcoming bills
Monthly spending
Calendar
Dashboard

# ================================================== 29. ACCESSIBILITY

Follow WCAG-oriented practices.

Include:

Proper labels
Keyboard navigation
Focus states
ARIA where appropriate
Readable contrast
Screen-reader friendly controls

Do not rely only on color to communicate status.

# ================================================== 30. PERFORMANCE

Optimize for production.

Use:

Server Components where appropriate
Dynamic imports for heavy charts
Image optimization
Pagination
Database indexes
Efficient MongoDB queries
Caching where safe

Avoid unnecessary client-side rendering.

# ================================================== 31. ERROR HANDLING

Create polished error handling.

Examples:

Database failure
Authentication failure
Invalid form
Unauthorized request
Network failure

Show friendly messages.

Never expose internal database errors to users.

# ================================================== 32. PROJECT DELIVERABLE

Generate the complete project.

Include:

package.json
Next.js configuration
Tailwind configuration
TypeScript configuration
MongoDB/Mongoose setup
Auth setup
Models
Server actions / API routes
Reusable UI components
Pages
Forms
Charts
Responsive layouts
Seed/demo data

Create:

.env.example

Example:

MONGODB_URI=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=

Keep real secrets out of the repository.

# ================================================== 33. IMPORTANT PRODUCT REQUIREMENT

This is intended to become a real commercial product.

Therefore:

Do not create a toy demo.

Do not hard-code dashboard data.

Do not store financial data only in React state.

Use MongoDB as the persistent source of truth.

Do not expose MongoDB credentials to the client.

Do not use localStorage as the primary database.

Do not create fake API responses.

Implement real CRUD operations.

Make all important calculations dynamic.

Ensure users can refresh the browser and still see their data.

# ================================================== 34. FINAL RESULT

The final application should provide this user journey:

Visitor
↓
Landing page
↓
Sign up
↓
Onboarding
↓
Create budget
↓
Add income
↓
Add expenses
↓
Add bills
↓
Create savings goals
↓
Track debt
↓
Review dashboard
↓
Analyze reports
↓
Continue using the application every month

The end result must feel like a polished commercial personal-finance SaaS product.

Prioritize:

1. Excellent UX
2. Beautiful UI
3. Correct financial calculations
4. Secure user data
5. Responsive design
6. Scalable architecture
7. Maintainable code
8. Real MongoDB persistence
9. Production readiness
10. Future monetization support

# ================================================== 35. MONETIZATION — 1 YEAR + 2 YEAR ACCESS

The application will be sold as a paid digital budgeting SaaS.

Add TWO purchase options:

PLAN 1:
"1 Year Access"

PLAN 2:
"2 Year Access"

These are prepaid access plans, not necessarily recurring subscriptions.

The pricing must be configurable through environment variables or a database/config file.

Example:

ONE_YEAR_PRICE = "$XX"
TWO_YEAR_PRICE = "$XX"

Do NOT hard-code the actual price.

Show both plans on the pricing section.

Recommended presentation:

---

SMART BUDGET PLANNER

1 YEAR ACCESS
$XX / year

✓ Full budgeting dashboard
✓ Unlimited transaction tracking
✓ Monthly budgets
✓ Bill calendar
✓ Savings goals
✓ Debt tracker
✓ Reports & analytics
✓ Custom categories
✓ All future improvements released during access period

## [ GET 1 YEAR ACCESS ]

2 YEAR ACCESS
$XX / 2 years

BEST VALUE

✓ Everything in 1 Year
✓ Full 2-year access
✓ Better effective yearly price
✓ No monthly payment

## [ GET 2 YEARS ACCESS ]

Make the 2-year option visually highlighted with:

"BEST VALUE"

Do NOT use fake urgency or fake discounts.

# ================================================== 36. LEMON SQUEEZY CHECKOUT INTEGRATION

Use Lemon Squeezy as the payment provider.

The user must NOT be sent to a generic pricing page.

Each CTA should open the appropriate Lemon Squeezy Checkout.

Use Lemon Squeezy Checkout API / checkout URLs properly.

Create separate Lemon Squeezy products/variants for:

ONE_YEAR
TWO_YEAR

Store the variant IDs in environment variables.

Example:

LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_ONE_YEAR_VARIANT_ID=
LEMON_SQUEEZY_TWO_YEAR_VARIANT_ID=
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_WEBHOOK_SECRET=

Never expose:

LEMON_SQUEEZY_API_KEY
LEMON_SQUEEZY_WEBHOOK_SECRET

to the browser.

Only server-side code can access them.

# ================================================== 37. CHECKOUT FLOW

User journey:

Visitor
↓
Pricing
↓
Click "Get 1 Year Access"
OR
Click "Get 2 Years Access"
↓
Create Lemon Squeezy checkout
↓
Lemon Squeezy hosted checkout
↓
Customer completes payment
↓
Lemon Squeezy sends webhook
↓
Verify webhook signature
↓
Create/update user access in MongoDB
↓
User receives access
↓
Redirect user to application

The application must NOT trust the browser to confirm payment.

Payment confirmation must come from the verified Lemon Squeezy webhook.

# ================================================== 38. CHECKOUT CREATION

Create a secure server-side function:

createCheckout(plan)

Accepted values:

"one_year"
"two_year"

The server determines the correct Lemon Squeezy variant ID.

Do NOT allow the client to submit arbitrary variant IDs.

Example conceptual flow:

POST /api/checkout

Request:

{
"plan": "one_year"
}

Server:

1. Verify authenticated user if required.
2. Validate plan with Zod.
3. Map plan to the server-side variant ID.
4. Create Lemon Squeezy checkout.
5. Add customer information where appropriate.
6. Add custom data needed to associate the purchase with the application user.
7. Return the checkout URL.

The frontend then redirects the customer to Lemon Squeezy.

# ================================================== 39. LEMON SQUEEZY CUSTOM DATA

When creating the checkout, associate the purchase with the application user.

Pass application-specific information such as:

userId
selectedPlan

Do not put sensitive information into checkout custom data.

The webhook will use this information to identify which application account should receive access.

# ================================================== 40. WEBHOOK

Create:

POST /api/webhooks/lemonsqueezy

Handle relevant Lemon Squeezy events.

At minimum support successful order/payment events.

The webhook must:

1. Read raw request body.
2. Read Lemon Squeezy signature header.
3. Verify the signature using LEMON_SQUEEZY_WEBHOOK_SECRET.
4. Reject invalid signatures with 401/403.
5. Parse the verified event.
6. Determine the purchased variant.
7. Determine the application user.
8. Create/update the user's purchase record.
9. Calculate access expiration.
10. Save the Lemon Squeezy order/subscription identifiers.
11. Return HTTP 200 only after processing successfully.

Do NOT mark an account as paid merely because the customer returned to the application after checkout.

# ================================================== 41. PURCHASE DATABASE MODEL

Create a MongoDB model:

Purchase

Suggested fields:

userId
plan
provider
providerOrderId
providerSubscriptionId
providerProductId
providerVariantId
status
purchasedAt
startsAt
expiresAt
amount
currency
email
createdAt
updatedAt

Example:

plan:
"one_year"

or

"two_year"

provider:
"lemonsqueezy"

status:
"active"
"expired"
"refunded"
"cancelled"

# ================================================== 42. ACCESS EXPIRATION

Access duration should be determined server-side.

For:

ONE_YEAR:
startsAt + 1 year

TWO_YEAR:
startsAt + 2 years

Do not calculate access expiration only in the frontend.

The backend must be the source of truth.

Create a reusable function:

hasActiveAccess(userId)

It should check the user's active purchase/access period.

Example logic:

currentDate < expiresAt

If false:

The user loses premium access.

# ================================================== 43. USER ACCOUNT ACCESS

Extend the User model with appropriate access information or use the Purchase collection as the source of truth.

Possible fields:

accessStatus
activeUntil
currentPlan

However, Purchase records should remain the authoritative purchase history.

A user can have multiple purchases over time.

Example:

2026:
1-year purchase

2027:
another 1-year purchase

or:

2026:
2-year purchase

The system should handle extending access correctly.

If a customer purchases another valid access period before the current one expires, extend the expiration from the existing expiration date rather than overwriting it incorrectly.

Example:

Current access:
expires 2027-09-15

New 1-year purchase:
new expiration should become 2028-09-15

NOT:

2027-09-15

# ================================================== 44. PRICING PAGE

Create a dedicated:

/pricing

page.

Show:

FREE / DEMO
Optional limited access

1 YEAR
Paid

2 YEARS
Paid
BEST VALUE

The pricing cards must clearly explain:

"Prepaid access"

"Not a recurring monthly payment"

Use the exact commercial terms configured in the application.

Do not claim "lifetime access" unless explicitly configured.

# ================================================== 45. PURCHASE CTA

Buttons:

"Get 1 Year Access"

"Get 2 Years Access"

On click:

- Show loading state
- Call secure checkout endpoint
- Disable duplicate clicks
- Redirect to Lemon Squeezy checkout
- Show friendly error if checkout creation fails

Example UI state:

Creating secure checkout...

If an error happens:

"We couldn't create your checkout right now. Please try again."

Do not expose server errors.

# ================================================== 46. SUCCESS / CANCEL FLOW

Create:

/checkout/success
/checkout/cancel

IMPORTANT:

The success page must NOT grant access itself.

The success page should say:

"Payment received"

"Your account access will be activated automatically once your payment is confirmed."

Then check application access status.

The actual activation must happen through the verified Lemon Squeezy webhook.

Cancel page:

"No payment was completed."

"Your account has not been charged."

Only use this wording if it accurately reflects the checkout result.

# ================================================== 47. ACCOUNT BILLING PAGE

Create:

/settings/billing

Show:

Current plan
Access status
Purchase date
Access expiration date

Example:

Current Plan
2 Year Access

Status
Active

Access Until
September 15, 2028

Add:

"Manage Billing"

where supported by Lemon Squeezy.

Show purchase history:

Date
Plan
Amount
Status

# ================================================== 48. ACCESS GUARD

Premium routes should be protected.

Examples:

/dashboard
/transactions
/budget
/bills
/calendar
/savings
/debt
/priorities
/reports

When the user does not have active access:

Show a premium-access screen.

Example:

"Your access has expired."

"Renew your Smart Budget Planner access to continue using your budgeting workspace."

Buttons:

"Buy 1 Year"
"Buy 2 Years"

Do not delete user data when access expires.

The user's financial data should remain stored securely.

If they purchase again, their previous data should become available again.

# ================================================== 49. DEMO / FREE MODE

Optionally allow visitors to explore a demo version.

Demo users should use isolated demo data.

Do NOT accidentally mix demo data with real user accounts.

Clearly display:

"Demo Mode"

If enabled, limit functionality appropriately.

# ================================================== 50. PAYMENT SECURITY

Follow these requirements:

- Never expose Lemon Squeezy API keys to the client.
- Never trust client-side payment status.
- Verify webhook signatures.
- Validate webhook payloads.
- Make webhook processing idempotent.
- Prevent duplicate purchase records.
- Store provider IDs.
- Log payment processing errors securely.
- Do not log payment secrets.
- Do not store raw card information.
- Let Lemon Squeezy handle payment card data.

Webhook processing must be safe to receive the same event more than once.

Use unique constraints/indexes where appropriate.

# ================================================== 51. ENVIRONMENT VARIABLES

Create:

.env.example

Include:

MONGODB_URI=

AUTH_SECRET=
NEXT_PUBLIC_APP_URL=

LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_ONE_YEAR_VARIANT_ID=
LEMON_SQUEEZY_TWO_YEAR_VARIANT_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=

Optional:

NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_MODE=

Never commit .env files containing real credentials.

# ================================================== 52. LEMON SQUEEZY SERVICE LAYER

Create:

/lib/lemonsqueezy.ts

Keep Lemon Squeezy API logic separate from UI code.

Functions should include concepts such as:

createCheckout()
verifyWebhookSignature()
processWebhookEvent()

Keep payment-provider-specific logic isolated so another payment provider can be added later.

# ================================================== 53. BILLING UX

Do not make the app feel like a traditional subscription-only SaaS.

The product should communicate:

"Buy access for 1 year"

or

"Buy access for 2 years"

Use simple language.

Avoid confusing:

monthly / annually recurring subscription

unless the actual Lemon Squeezy product configuration is recurring.

The UI must match the actual Lemon Squeezy billing model exactly.

# ================================================== 54. FINAL COMMERCIAL FLOW

Complete customer flow:

Landing Page
↓
Explore Features
↓
Pricing
↓
Choose:

1 YEAR
OR
2 YEARS
↓
Lemon Squeezy Checkout
↓
Payment
↓
Lemon Squeezy Webhook
↓
MongoDB Purchase Record
↓
Access Activated
↓
User Dashboard
↓
Use Budget Planner
↓
Access remains active until expiration
↓
Renew when access expires

The entire system must be designed around this flow.

IMPORTANT:
Do not implement fake payment success.
Do not activate premium access based only on URL query parameters.
Do not store payment credentials.
Do not expose Lemon Squeezy secrets.
