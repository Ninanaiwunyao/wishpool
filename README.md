# Wishpool

**Wishpool** is an interactive platform that combines wish-making and dream-fulfilling, allowing users to make wishes or help others achieve their dreams. You can explore the platform live at [Wishpool Website](https://appworks-school-wishpool.web.app/landingpage).

Through features like the achievement system, leaderboards, and messaging, the platform enhances community interaction and engagement. Developed using React, with TailwindCSS for styling, framer-motion for animations, and React Router for routing management.

## Features
1. Wish Creation:
- Users can create a wish through a form by selecting the amount to invest, wish title, wish tags, and wish content.
- Clicking on a wish card opens a detailed view where users can see more information and find a "Help Fulfill" button. By clicking this button, they can send an in-app message to the wish creator. Once a wish is taken, the card is closed and added to the dream fulfiller's personal profile.
2. Progress Tracking for Dream Fulfillment:

- On the wish detail page, users can track how much progress has been made towards fulfilling the wish, such as how much support is still needed or how much of the goal has already been achieved.
3. Reputation System:

- A reputation system is in place for dream fulfillers. Each fulfiller receives a rating based on their past dream fulfillment records and achievements, helping to build trust within the platform.
4. Messaging:

- Once a dream fulfiller has been matched with a wish, an automatic chat room is created between the parties. The chat room exists only for a limited number of days.
5. Leaderboard Classification:

- Users are ranked based on different categories, such as wish type or number of fulfilled dreams. This allows users to see where they excel and compare their achievements with others.
## Technologies Used
- **React** (v18.3.1): Core framework for building the UI.
- **TailwindCSS** (v3.4.10): Utility-first CSS framework for rapid styling.
- **framer-motion** (v11.8.0): Library for smooth animations.
- **React Router** (v6.26.1): Routing library for managing navigation between pages.

## Getting Started

### Prerequisites
- Ensure you have **Node.js** installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:Ninanaiwunyao/wishpool.git

2. Navigate into the project directory:
   ```bash
   cd wishpool
3. Install the required dependencies:
   ```bash
   npm install

### Running the Project
To start the development server:
   ```bash
   npm run dev
   ```
This command will run the application locally. Open your browser and navigate to http://localhost:5173 to view it.


