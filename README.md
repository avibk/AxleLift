# Science-Based Lifting App

**The operating system for evidence-based lifting.**

Track workouts, learn the science, compete through meaningful progression, and get computed training insights powered by data—not gym myths.

</div>

---

## Vision

Most fitness apps focus on recording workouts.

Science-Based Lifting OS is designed to help users understand **why** they are training a certain way through evidence-based education, intelligent progression systems, and a deterministic insights engine.

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

### Science Feed

Short-form educational content covering:

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

* Node.js

### Installation

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

## Long-Term Goal

Build the operating system for science-based lifting and help everyday lifters train using the same principles employed by elite coaches, researchers, and evidence-based athletes.
