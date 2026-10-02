# Synapse Flow

Autonomous Agent & Workflow Automation Platform.

A high-performance, dark-mode interactive web platform inspired by the visual engineering and interaction design patterns of modern workflow automation tools.

---

## Key Features

1. **3D Perspective Horizon Grid**:
   - CSS 3D transformed perspective grid plane with smooth linear-gradient animations converging to infinity.
   - Atmospheric ambient aurora flares with backdrop blur and film-grain noise.

2. **Interactive 3D Workflow Canvas**:
   - Draggable node components with live anchor coordinate mapping.
   - Dynamic SVG cubic bezier connector cables calculated at 60 FPS.
   - Step-by-step pipeline simulation runner with animated pulse traveling effects and real-time execution telemetry.
   - Mouse-tracking 3D tilt perspective.

3. **Bento Grid Architecture**:
   - Masked gradient border glow beams on hover.
   - 500+ pre-configured connector matrix with typed schemas.
   - Embedded code editor supporting instant Python and JavaScript switching with live execution feedback.
   - Control flow nodes for branching, merging, and loop processing.

4. **Sticky Stacking Card Deck**:
   - Scroll-driven physical card stacking deck for debugging and monitoring phases.
   - Live stdout streaming terminal log mockup.
   - Time-travel payload inspection slider.
   - Isolated node re-testing and mock input pinning.
   - Visual Git diff rollout and environment promotion controls.

---

## Project Structure

```
synapse-workflow/
|-- index.html      # Complete semantic HTML5 structure and markup
|-- styles.css      # Custom animations, 3D perspective grid, and theme tokens
|-- app.js          # Interactive canvas physics, bezier cables, and simulation engine
|-- .gitignore      # Secret hygiene and cache excludes
`-- README.md       # Project documentation
```

---

## Local Development

Serve the project locally using any static web server:

```bash
# Using Python
python3 -m http.server 54321

# Using Node.js npx
npx serve .
```

Open `http://localhost:54321` in your browser.

---

## License

Private repository. All rights reserved.
