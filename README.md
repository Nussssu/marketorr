<div align="center">

# Marketorr

**Animated agency website and custom CMS for Marketorr, a digital marketing agency in Bangladesh.**

[![Live Site](https://img.shields.io/badge/Live-marketorr.com.bd-0A66C2?logo=googlechrome&logoColor=white)](https://www.marketorr.com.bd)
![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Inertia.js](https://img.shields.io/badge/Inertia.js-3-9553E9?logo=inertia&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

**[🌐 View live site →](https://www.marketorr.com.bd)**

</div>

---

## Overview

This repository powers the public website of **Marketorr**: services, case studies, portfolio, and lead capture. It also includes a full admin CMS, so the marketing team can manage all content without touching code.

The frontend is React 19 rendered through Inertia.js, animated with GSAP, Framer Motion, and Lenis smooth scrolling. The backend is Laravel 13 and handles content, media, SEO (sitemap and robots.txt), and contact inquiries.

## Features

**Public website**
- Animated home, about, and contact pages with smooth scrolling and motion design
- Service catalog with categories, service detail pages, and sub-service pages
- "Our Work" section: case studies, grouped portfolios, and UI/UX project showcases
- Contact form with lead notifications and an interactive Leaflet map
- Dynamic CMS pages, privacy policy, and terms
- SEO: dynamic `sitemap.xml`, `robots.txt`, and per-page meta

**Admin CMS**
- Dashboard with inquiries overview
- Projects and services with drag-and-drop ordering and featured flags
- Page builder with reusable page sections and global blocks
- Centralized media library and media picker
- Menus, categories, settings, and email templates
- Mail settings and lead notification configuration
- User management and audit logs

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Backend | Laravel 13, PHP 8.3+, MySQL |
| Frontend | React 19, Inertia.js 3, Tailwind CSS 4, Vite |
| Motion & UI | GSAP, Framer Motion, Lenis, Leaflet |
| Testing | PHPUnit (Feature & Unit) |

## Screenshots

> 📸 Screenshots coming soon. In the meantime, see the [live site](https://www.marketorr.com.bd).

<!-- Add images to docs/screenshots/ and reference them here, for example:
![Home page](docs/screenshots/home.png)
![Admin CMS](docs/screenshots/admin.png)
-->

## Getting Started

### Prerequisites

- PHP 8.3+ and Composer
- Node.js 20+ and npm
- MySQL

### Installation

```bash
git clone https://github.com/Nussssu/marketorr.git
cd marketorr

composer run setup   # installs dependencies, creates .env, generates key, migrates, builds assets
```

Update the database and mail settings in `.env` before running migrations.

### Run locally

```bash
composer run dev
```

### Run tests

```bash
php artisan test
```

## Project Structure

```
app/Models/                 # Page, PageSection, Project, Service, Media, Menu, ...
resources/js/Pages/
├── Home.jsx, About.jsx, ContactPage.jsx
├── Services/               # Service listing, category, detail pages
├── Work/                   # Case studies and portfolios
└── Admin/                  # CMS (projects, services, pages, media, menus, users)
routes/web.php              # Public site + /admin routes
```

## Author

**Nusrat Jahan Ankhi** · [GitHub](https://github.com/Nussssu)
