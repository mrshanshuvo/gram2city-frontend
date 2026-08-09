# Frontend Requirements — Gram2City

Upgrade your existing project into a feature-rich, production-ready, and professional application.

## 1. Global UI & Design Rules

- Use a maximum of 3 primary colors (+ optional neutral color).
- Support Light & Dark mode with proper contrast.
- Maintain consistent layout, spacing, and alignment throughout the project.
- All cards and components must have the same size, border radius, and visual style.
- Forms must include validation, error messages, success states, and loaders.
- Fully responsive for mobile, tablet, and desktop.
- No placeholder or dummy content allowed.

## 2. Home / Landing Page

### Navbar

- Full-width background.
- Minimum 4 routes (logged out). [Example: Home, Items, About, Login]
- Minimum 6 routes (logged in). [Example: Home, Items, Dashboard, Blog, Profile (Dropdown), Logout]
- At least 1 advanced menu (dropdown / profile menu).
- Sticky or fixed position.
- Fully responsive.

### Hero Section

- Height limited to 60–70% of the screen.
- Interactive elements (slider, animation, CTA).
- Clear visual flow to the next section.

### Sections

- Minimum 8 meaningful sections. Examples include Features, Services, Categories, Highlights, Statistics, Testimonials, Blogs, Newsletter, FAQ, Call to Action, etc.
- Note: These are just examples; you are free to design your own sections based on project context and ideas.

### Footer

- Fully functional footer.
- Working links only.
- Contact information and social links included.

## 3. Core Listing / Card Section

- Each card must include: Image, Title, Short description, Meta info (price, date, rating, location, etc.), “View Details” button
- Card Rules:
  - Same height and width
  - Same border radius and layout
  - Desktop view: minimum of 3 cards per row
  - Skeleton loader while data is loading

## 4. Details Page

- Publicly accessible
- Multiple images or media (if applicable).
- Separate sections:
  - Description / Overview
  - Key information / Specifications
  - Reviews / Ratings (if applicable).
  - Related items (if applicable).

## 5. Listing / Explore Page

- Search bar
- Filtering must be implemented using at least 2 fields (e.g., category, price, rating, date, location).
- Sorting options
- Pagination or infinite scroll
- Fully functional filtering

## 6. Authentication System

- Login and Registration pages
- Demo login button (auto-fill credentials)
- Social login (Google / Facebook)
- Clean and professional UI

## 7. Dashboard (Role-Based)

- Multiple Roles: Like User / Admin / Manager (Rider/Merchant in Gram2City)
- Sidebar navigation:
  - User: minimum 4 menu items / page [Example: Overview, My Items, Profile, Settings]
  - Admin: minimum 6 menu items / page [Example: Overview, Manage Users, Manage Items, Analytics, Categories, Settings]
- Implement a profile icon with a dropdown menu in the dashboard navbar, including options such as Profile, Logout, and related actions.
- Dashboard must include:
  - Overview cards
  - Charts (Bar, Line, Pie, or any other type) should reflect real, dynamic data
  - Data tables
  - Profile page with editable user information
- All tables in the dashboard should have filtering and pagination capabilities.

## 8. Additional Pages

At least 2–3 additional pages, such as:

- About
- Contact
- Blog
- Help / Support
- Privacy / Terms

## 9. UX & Responsiveness

- No lorem ipsum or placeholder content
- Fully responsive across all devices
- Proper spacing and alignment
- All buttons and links must be clickable
- Dark mode must maintain proper contrast

## 10. Forms Handling (Client-Side)

- Client-side validation (required fields, format validation)
- Proper error/success messages
- Loading state (spinner or disabled button)
- Proper label usage
- Accessible inputs (label connected with input)
- Forms required:
  - Login
  - Registration
  - Contact
  - Create item
  - Edit item
  - Profile update

## 11. Code Quality Rules

- Clean and organized folder structure
- Reusable components
- Custom hooks (if React-based)
- Proper environment variable usage
- No console logs in production

## 12. Final Submission Requirements (Frontend context)

- Live Website URL
- GitHub Repository Link (Frontend)
- Demo Credentials (User Email & Password, Admin Email & Password)
