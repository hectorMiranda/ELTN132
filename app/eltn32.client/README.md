  # ELTN132 - Digital Electronics Companion

## Inspiration
This application serves as an essential reinforcement tool for students learning digital electronics. In many community colleges, lectures introduce concepts quickly, and when students struggle to grasp them in real time, especially when textbooks are outdated or not providedthey can fall behind and have difficulty catching up. Without consistent practice, key skills such as understanding logic gates, Boolean algebra, and circuit design begin to fade.

This app bridges that gap by offering a hands-on, interactive environment where students can experiment, visualize, and strengthen their understanding. Its goal is to ensure that these foundational digital-electronics skills not only make sense in the moment, but stay with students as they advance in their academic and engineering journey.

## Architecture
This project is a modern web application built with:
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Auth**: [Firebase](https://firebase.google.com/)
- **Backend/AI**: [Azure Functions](https://azure.microsoft.com/en-us/services/functions/)
- **Backend/Analytics**: [Google Analytics](https://analytics.google.com/)
- **Language**: TypeScript

## Modules
The application currently features the following educational modules:
- **Digital Circuit Analyzer** (`/dig-viewer`): Interactive viewer for `.dig` circuit files with AI analysis capabilities.
- **Boolean Algebra** (`/boolean-algebra`, `/boolean-expressions`): Tools for simplifying and understanding boolean logic.
- **Karnaugh Maps** (`/k-map`): Interactive K-Map solver for visual logic simplification.
- **Number Systems**:
  - Binary to Decimal (`/binary-to-decimal`)
  - Decimal to Binary (`/decimal-to-binary`)
- **Logic Gates** (`/logic-gates`): Visual reference and playground for fundamental logic gates.
- **MSI Components** (`/msi`): Educational resources for Medium Scale Integration components.
- **Associative Rules** (`/associative-rules`): Practice with the laws of boolean algebra.
- **SPI Protocol** (`/spi`): Visualizer for Serial Peripheral Interface communication.

## How to Add Pages
This application uses the Next.js Pages Router. To add a new module or page:
1. Create a new `.tsx` file in `src/pages/` (e.g., `src/pages/new-module.tsx`).
2. Export a React component as the default export.
   ```tsx
   export default function NewModule() {
     return <div className="p-4">My New Module</div>;
   }
   ```
3. The page will be automatically available at `/new-module`.
4. Remember to link it in the main navigation (update `src/pages/index.tsx` or your navigation component).

---
*Built for the students of ELTN132.*
