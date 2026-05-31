# The Final Option

The Final Option is a modular, client-side interactive quiz platform built using vanilla JavaScript, semantic HTML5, and CSS3. The application features a dynamic data-routing architecture that fetches multi-category quiz payloads on-demand to optimize client bandwidth and runtime memory footprint.

---

## Architecture Overview

Unlike monolithic frontend architectures that load global datasets on initialization, this platform implements a decoupled, asynchronous, two-step data fetch execution pipeline:

1. **Catalog Sync:** On application bootstrap, the engine fetches a lightweight structural map (`catalog.json`). This footprint data is used to dynamically construct the category selection and quiz dashboard views.
2. **On-Demand Fetch:** When a target quiz is initialized by the user, the engine builds a relative directory path and queries only the discrete JSON payload mapping to that specific quiz ID.

### Key Features
* **Asynchronous Lazy-Loading:** Network overhead remains minimal by delaying data traffic until a quiz module is explicitly requested.
* **Semantic Form Constraints:** Leverages visually hidden native `<input type="radio">` primitives paired with structural `<label>` selectors for reliable native browser keyboard focus and accessibility.
* **Session Persistence:** State configurations (`currentQuestionIndex`, `userAnswers` arrays, and directory routes) synchronize continuously to `localStorage`, allowing graceful session recovery on unexpected page refreshes.
* **Exit Lifecycle Interception:** Implements window `beforeunload` event hooks to prevent accidental browser tab destruction mid-session.
* **Fluid Viewport Design:** Constructed around a viewport-height (`vh`) Flexbox framework to enforce structured card scaling on high-resolution desktop layouts, paired with media query overrides to collapse into standard natural document flows on mobile displays.

---

## Directory Structure

```text
THE_FINAL_OPTION/
├── assets
│   ├── brand-banner.png
│   └── favicon.png
├── css
│   ├── css_reset.css
│   ├── css_reset.min.css
│   ├── styles.css
│   └── styles.min.css
├── data
│   ├── catalog.json
│   ├── biology
│   │   ├── bio_cell.json
│   │   ├── bio_evolution.json
│   │   ├── bio_genetics.json
│   │   └── bio_physiology.json
│   ├── chemistry
│   │   ├── chem_analytical.json
│   │   ├── chem_general.json
│   │   ├── chem_organic.json
│   │   └── chem_physical.json
│   ├── computer_science
│   │   ├── cs_algorithms.json
│   │   ├── cs_databases.json
│   │   ├── cs_networking.json
│   │   └── cs_operating_systems.json
│   ├── history
│   │   ├── hist_ancient.json
│   │   ├── hist_cold_war.json
│   │   ├── hist_medieval.json
│   │   └── hist_modern_world_wars.json
│   ├── mathematics
│   │   ├── math_abstract.json
│   │   ├── math_calculus.json
│   │   ├── math_discrete.json
│   │   └── math_linear_algebra.json
│   └── physics
│       ├── phys_em.json
│       ├── phys_mechanics.json
│       ├── phys_quantum.json
│       └── phys_thermo.json
├── fonts
│   ├── theLastTrunks.ttf
│   ├── theLastTrunks.woff
│   └── theLastTrunks.woff2
├── js
│   ├── script.js
│   └── script.min.js
├── index.html
└── README.md
```