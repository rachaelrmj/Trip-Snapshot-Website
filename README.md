# Trip Snapshot

Trip Snapshot is a responsive travel planning web application that helps users create personalized travel itineraries in seconds. Designed as a one-stop trip planning solution, the application combines destination discovery, itinerary generation, travel inspiration, and itinerary management into a streamlined user experience.

Users can search destinations, customize travel preferences, explore recommendations, and generate organized travel plans without creating an account. Registered users gain access to additional features such as saved itineraries and bookmarked destinations.

---

## Project Overview

Planning a trip often requires visiting multiple websites to research destinations, organize activities, and build an itinerary. Trip Snapshot simplifies the process by providing a centralized platform where travelers can:

* Search destinations using real-time autocomplete
* Generate customized travel itineraries
* Organize activities by travel category
* Save favorite destinations
* Store and revisit trip plans
* Access travel information through integrated APIs

The project was developed as a frontend-focused web application emphasizing user experience, accessibility, responsive design, and client-side state management.

---

## Features

### Personalized Travel Planning

* Generate customized travel itineraries based on user preferences
* Organize recommendations into logical travel categories
* Quickly adjust travel parameters and regenerate plans

### Destination Search

* Real-time destination autocomplete
* Integrated travel data from external APIs
* Fast destination discovery and validation

### Guest-Friendly Experience

* No account required to explore destinations
* Generate itineraries instantly
* Browse recommendations without registration

### User Accounts

Registered users can:

* Save personalized itineraries
* Bookmark favorite destinations
* Manage saved travel plans
* Maintain travel preferences

### Accessibility

* WCAG-compliant color contrast
* Keyboard navigation support
* Skip-link implementation
* Semantic HTML structure
* Screen-reader-friendly design

### Responsive Design

* Mobile-first development approach
* Tablet and desktop optimization
* Flexible layouts using CSS Grid and Flexbox
* Consistent experience across devices

---

## Project Structure

### Core Pages

| Page             | Purpose                              |
| ---------------- | ------------------------------------ |
| `index.html`     | Landing page and homepage experience |
| `planner.html`   | Travel preference input form         |
| `results.html`   | Displays destination recommendations |
| `itinerary.html` | Generated itinerary view             |

### User Management

| Page           | Purpose             |
| -------------- | ------------------- |
| `login.html`   | User authentication |
| `signup.html`  | Account creation    |
| `profile.html` | User dashboard      |
| `logout.js`    | Session handling    |

### Informational Pages

| Page                  | Purpose                    |
| --------------------- | -------------------------- |
| `about.html`          | Project information        |
| `faqs.html`           | Frequently asked questions |
| `contact.html`        | Contact information        |
| `privacy-policy.html` | Privacy policy             |

### Utility Scripts

| File         | Purpose                              |
| ------------ | ------------------------------------ |
| `storage.js` | Local and session storage management |
| `theme.js`   | Dark mode and theme controls         |

---

## Frontend Architecture

Trip Snapshot follows a modular frontend architecture that separates content, styling, and functionality.

### HTML

* Semantic page structure
* Accessibility-focused markup
* SEO-friendly content organization

### CSS

* Modular page-specific stylesheets
* Mobile-first responsive design
* Custom design system
* Dark mode support
* CSS Grid and Flexbox layouts
* Meyer Reset for browser consistency

### JavaScript

* Vanilla JavaScript implementation
* Dynamic DOM manipulation
* API integration
* Form validation
* State management
* Local storage persistence

---

## State Management

Trip Snapshot uses browser storage to create a seamless user experience without requiring a backend database.

### Session Storage

Used for:

* Active trip planning sessions
* Temporary itinerary data
* Guest user workflows

### Local Storage

Used for:

* User account information
* Saved itineraries
* Favorite destinations
* User preferences

### Auto-Save Functionality

* Draft trip information is automatically preserved
* Form inputs are continuously synchronized
* Users can safely navigate between pages without losing progress

---

## API Integrations

### Priceline API

Provides:

* Destination autocomplete
* Travel search functionality
* Location recommendations

### TripAdvisor API

Provides:

* Travel information
* Destination insights
* Activity recommendations

---

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript (ES6+)

### Development Concepts

* Responsive Web Design
* Mobile-First Design
* Accessibility (WCAG)
* Client-Side Storage
* API Integration
* User Experience Design

### Browser Features

* Local Storage API
* Session Storage API
* Fetch API

---

## Responsive Design

The application is optimized for:

* Mobile Devices
* Tablets
* Laptops
* Desktop Monitors

Responsive layouts are achieved through media queries and flexible grid systems to ensure usability across all screen sizes.

---

## Future Enhancements

* Real-time weather integration
* Interactive travel maps
* Budget planning tools
* Flight and hotel comparison features
* Social itinerary sharing
* User-generated travel reviews
* Progressive Web App (PWA) support

---

## Author

**Rachael R. Martinez-Jones**

Graphic Information Technology Student
Arizona State University

---

## 📄 License

This project was developed for educational and portfolio purposes.
