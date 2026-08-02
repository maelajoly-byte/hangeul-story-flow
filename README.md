# K-Intermédiaire: Immersive Korean

Act as an expert full-stack developer and UI/UX designer. Build a web application for an innovative Korean learning platform tailored for intermediate learners (B1/B2) called "K-Intermédiaire". 

CRITICAL CONCEPT RULES:

- No Korean romanization anywhere. Korean text must only use pure Hangeul.

- No English base translations shown by default.

- Target audience is intermediate: they know the alphabet but struggle with native webtoons/content. 

- The product relies on "Assisted Immersive Reading": users read stories slide by slide and click on words/particles to open a premium linguistic explanation without breaking immersion.

1. ARCHITECTURE & ROUTES

Implement the following 7 core views/components:

- Home / Landing Page: High-converting hero section with a clear value proposition: "Read real stories in Korean without opening a dictionary every two sentences". Explain the freemium model, the slide-by-slide mechanic, and the serial roadmap. Feature a primary CTA: "Start Ghost of the Past for Free".

- Series Library (Dashboard): Display 9 series in a strict progression path: (1) Ghost of the Past, (2) Reality, (3) Supernatural Chase, (4) Z-Virus, (5) Clash, (6) Elevator Game, (7) Shattered, (8) Protocol Unknown, (9) Siren Call. Each card needs a visual placeholder, mini-synopsis, estimated level, number of episodes, status badge (Available / In Progress / Coming Soon), mood tags (Mystery, Horror, Drama, etc.), and a "Start/Resume" button.

- Series Overview Page: Story description, content breakdown (Episodes split into short parts, e.g., Episode 1 - Part 1/4), user progress tracker, warnings (dark atmosphere, tension), and reading tips.

- Immersive Slide Reader (The Core Product): A sleek, visual-novel-style interface. Single-slide view (no multi-image grid preview to avoid overwhelming the user). Features: Next/Prev arrows, progress bar, fullscreen mode, auto-save position, and "marked as understood" / "review later" toggles.

- Premium Interaction Overlay (Paywall & Pop-ups): When clicking/hovering on a word or particle in the slide, check user status. If Premium: open a pop-up with natural French translation, syntax role, nuance, politeness register, and short example. If Free: blur the content and show a premium teaser modal ("Unlock grammar analysis").

- "Request an Explanation" Feature: An interactive form allowing users to select a word/sentence, submit a query category (Vocab, Grammar, Particle, Nuance, Register), and send it to a queue. Include a notification state simulating an email answer that transforms the slide into an annotated version.

- User Profile & Progress Center: Google Auth login. Fields for Public Pseudo (hide real name/email for privacy), personal stats, saved vocabulary list, submitted queries, and active series passes. Includes a detailed Notification Settings panel (Essential, Community, Marketing opt-ins).

- Interactive Comment Section: Located under each episode part. Includes engagement prompts (e.g., "What did you understand? Summarize in 1 French sentence"). Premium tier users have a badge highlighting they can request 1 short Korean comment correction per episode.

2. TECHNICAL EXECUTION & AUTOMATION (IMAGE LAYERING)

- The platform will handle hundred of thousands of slides. DO NOT build pages image-by-image.

- Create a reusable "Dynamic Webtoon Reader" template component.

- The template must fetch data from a mock database mimicking a Google Sheet structured as follows: Column A (Slide Number/ID), Column B (Image File Reference), Column C (Hangeul Text Overlays with word-by-word splitting), Column D (Premium Pop-up Explanations).

- CRITICAL LAYER DESIGN: The raw story images contain original English text. The Reader component must automatically superpose an adaptive opaque background box (mask) directly over the text area. The background color of this mask must be dynamic and identical to the slide background context (e.g., solid pure Black box if the image background is black, pure White box if white) so it completely hides the English text. Write pure Hangeul text on top of this mask as selectable, individual HTML `<span>` elements for every single word/particle, making them chirurgically clickable.

3. MONETIZATION MODEL

- Implement a Series-Specific Pass system and a Founder Pack option. 

- "Ghost of the Past" must be accessible for free with an unlocked Premium trial for demonstration. Other series require unlocking via simulated Stripe Paywall triggers when trying to open the slide reader or clicking deep analysis pop-ups.

4. UI/UX STYLE GUIDE

- High-end, distraction-free aesthetic. Slate, deep blues, cream accents, crisp typography.

- Make the reading experience feel like a premium digital book, not an industrial online classroom.

- Create smooth transitions when clicking the navigation arrows between slides.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/70cef556-d91b-47ea-8863-481654d28f86).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
