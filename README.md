# System Zero
System Zero is a zero setup, browser-based React application that functions as an interactive visualiser and educational tool for learning Computer Architecture and Operating Systems concepts, letting users watch a machine think in real time and build it from the ground up.

## Project Structure

Our application follows a standard Vite + React architecture, separating reusable UI components from page-level logic.

```text
SYSTEM-ZERO/
├── node_modules/        # Automatically generated dependencies (do not edit)
├── public/              # Static assets that don't need processing
├── src/
│   ├── assets/          # Images, fonts, and other processed assets
│   ├── components/      # Reusable UI parts
│   │   ├── Content.css
│   │   ├── Content.jsx
│   │   ├── Footer.css
│   │   ├── Footer.jsx
│   │   ├── Hero.css
│   │   ├── Hero.jsx
│   │   ├── Layout.jsx   # Global layout wrapper containing Navbar, Footer, and Outlet
│   │   ├── Navbar.css
│   │   └── Navbar.jsx
│   ├── pages/           # Page-level components handling distinct routes
│   │   └── landing.jsx  
│   ├── App.css
│   ├── App.jsx          # Root component and React Router configuration
│   ├── index.css        # Global CSS variables and resets
│   └── main.jsx         # React application entry point
├── .gitignore           # Files and directories ignored by Git
├── eslint.config.js     # Linter configuration for code consistency
├── index.html           # Main HTML template
├── package-lock.json    # Exact dependency versions (auto-generated)
├── package.json         # Project metadata and top-level dependencies
├── README.md            # Project documentation (this file)
└── vite.config.js       # Vite bundler configuration

## Components Overview

The `src/components/` directory contains the building blocks of the application UI:

- **`Hero.jsx`**: The visually striking landing area featuring an interactive 3D retro-computer scene built with Three.js. It responds to scroll events and provides an engaging introduction.
- **`Content.jsx`**: Houses the main educational sections. It includes the cinematic scroll-morph text sequence ("Struggling to visualize complex concepts..."), a zigzag layout of core features with intersection observers for slide-in animations, and a dynamic value proposition grid.
- **`Navbar.jsx`**: A modern, animated navigation bar built with Framer Motion. It features glassy effects, dynamic pill-shaped highlights that follow the active tab, interactive dropdown menus, and mouse-tracking glare effects.
- **`Footer.jsx`**: A sleek footer containing secondary navigation links, platform resources, and massive typography branding.
- **`Layout.jsx`**: A global layout wrapper that structures the app by rendering the `Navbar`, the main page `Outlet` (for routing), and the `Footer`.