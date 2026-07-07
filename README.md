# Axlelift

**Scienced & Evidence-based lifting app for beginners to advanced lifters.**

Track workouts, learn the science, compete through meaningful progression, and get computed training insights powered by data—not gym myths.

</div>

---

## Vision

Most fitness apps focus on recording workouts.

AxleLift is designed to help users understand **why** they are training a certain way through evidence-based education, fun and interactive ranked (elo) progression systems, and a deterministic insights engine.

Our mission is to make science-based lifting accessible to everyone—from complete beginners to advanced lifters.

### Core Principles

* Evidence over bro-science
* Progress over perfection
* High effort, intelligent training
* Simplicity over complexity
* Education over blind tracking
* Long-term progression

---

## Features

### Intelligent Workout Logging

Track:

* Exercises
* Sets
* Reps
* Weight
* RIR (Reps In Reserve)

Built for lifters who care about meaningful progression.

---

### Progression Engine

Automatically recommends:

* Increasing weight
* Increasing reps
* Maintaining load
* Deloading when appropriate

No more guessing what to do next session.

---

### Muscle Growth Dashboard

Track training volume by muscle group.

Examples:

* Chest
* Back
* Quads
* Side Delts

Users learn to think like coaches rather than simply counting exercises.

---

### Fitness Feed

Live research papers from Europe PMC and PubMed covering:

* Hypertrophy
* Recovery
* Volume
* Intensity
* Exercise selection
* Biomechanics
* Common fitness myths

Designed to make evidence-based lifting easier to understand.

---

### ELO & Leaderboards

Compete through:

* Lifetime ELO
* Seasonal ELO
* Strength Rankings
* Relative Strength Rankings
* Progress Rankings
* Consistency Rankings

The goal is to reward smart training—not just genetics.

---

### Insights

A fully computed analytics screen that surfaces:

* Weekly volume, sets, stimulus, and tonnage
* Lifting score breakdown (strength, progress, consistency, science)
* Weak-point detection against weekly volume targets
* Per-muscle volume status (undertrained / optimal / overreaching)
* Next-session progression targets

Every number is calculated deterministically from your logged training—no AI, no black boxes.

---

## Architecture

The platform follows a simple principle:

> Calculate with code. No black boxes.

```
Workout Data
↓
Rules Engine
↓
Metrics & Analytics
↓
Insights Dashboard
```

### Rules Engine

Handles:

* Volume calculations
* Effective set calculations
* Progression recommendations
* Science score calculations
* ELO updates
* Leaderboard rankings

All training calculations run locally in the rules engine. This keeps the platform:

* Cheaper
* Faster
* More reliable
* Easier to maintain

---

## Tech Stack

### Frontend

* React Native

### Backend

* Supabase

### Database

* PostgreSQL

---

## MVP Scope

### Included

* Workout Logger
* RIR Tracking
* Progression Engine
* Muscle Dashboard
* Science Feed
* Basic ELO System
* Leaderboards
* Computed Insights Dashboard

### Planned

* Lift Verification
* Exercise Communities
* Creator Marketplace
* Advanced Social Features
* Wearable Integrations

---

## Development Philosophy

This project intentionally avoids over-engineering.

Many fitness startups attempt to solve every problem with AI, complex infrastructure, or microservices before they have users.

Science-Based Lifting OS focuses on:

* Strong fundamentals
* Simple architecture
* Data-driven decisions
* Deterministic, on-device calculations

Build what matters first.

Optimize later.

---

## Getting Started

### Prerequisites

* Install Node.js (https://nodejs.org/en/download)
* Expo Go app on your IOS device
### Installation

Install dependencies [in your terminal (cmd)]:

```bash
npm install
```

Run the development server:

```bash
npx expo start --tunnel
```

Clear the cache after changing environment variables:

```bash
npx expo start -c --tunnel
```

### Backend (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env` and fill in:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. In the Supabase **SQL Editor**, run the full script in `supabase/schema.sql`.
4. Restart Expo with cache clear (`npx expo start -c`).
5. Sign up in the app with a real account — the demo banner disappears once credentials are valid.

Without `.env` credentials the app runs in local demo mode (AsyncStorage only).

---

## Long-Term Goal

Build the path for science-based lifting and help everyday lifters train using the same principles employed by elite coaches, researchers, and evidence-based athletes.
Features that might be added in the future:
-AI assistant
-AI physique rating
-Physique ranking
-AI form checker
