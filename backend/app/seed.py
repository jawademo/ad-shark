"""
Seed the database with initial products, achievements, and boosters.

Usage:
    python -m app.seed
    # or via the API admin endpoints
"""

import asyncio
from sqlalchemy import select
from app.database import async_session
from app.models import Product, Achievement, Booster


PRODUCTS = [
    # ── AI & Tech ──────────────────────────────────────────────
    {
        "name": "VibeCheck AI",
        "tagline": "AI that tells you if your outfit is fire or trash",
        "description": "Upload a mirror selfie and VibeCheck's neural network rates your outfit on a 1-10 scale across 47 style dimensions. Backed by fashion influencers and a proprietary dataset of 2M+ rated outfits.",
        "category": "AI & Tech",
        "difficulty": 2,
        "outcome": "flop",
        "outcome_multiplier": 0.0,
        "market_signals": ["$4.2M seed round", "50K waitlist", "15% week-over-week retention"],
        "tags": ["fashion", "consumer-ai", "social"],
        "rarity": "common",
        "humor_level": 3,
        "realism": 4,
    },
    {
        "name": "DocuMint",
        "tagline": "Blockchain-verified document signing for enterprises",
        "description": "Replace DocuSign with immutable, zero-knowledge proof verified document execution. Enterprise-grade security meets Web3 transparency. Already piloting with 3 Fortune 500 legal departments.",
        "category": "AI & Tech",
        "difficulty": 3,
        "outcome": "success",
        "outcome_multiplier": 2.5,
        "market_signals": ["$12M Series A", "3 enterprise pilots", "97% renewal rate"],
        "tags": ["enterprise", "web3", "legal-tech"],
        "rarity": "uncommon",
        "humor_level": 1,
        "realism": 5,
    },
    {
        "name": "PetGPT",
        "tagline": "ChatGPT but it only talks like your pet",
        "description": "Upload photos of your pet and PetGPT generates an AI personality that texts you throughout the day in your pet's 'voice.' Includes mood detection, treat requests, and existential 3am messages.",
        "category": "AI & Tech",
        "difficulty": 2,
        "outcome": "flop",
        "outcome_multiplier": 0.0,
        "market_signals": ["$800K pre-seed", "120K TikTok followers", "featured on Product Hunt #2"],
        "tags": ["consumer-ai", "pets", "gimmick"],
        "rarity": "common",
        "humor_level": 5,
        "realism": 3,
    },
    {
        "name": "InfernoDB",
        "tagline": "The database that's literally on fire (but in a good way)",
        "description": "A graph database that uses novel flame-propagation algorithms for sub-millisecond query times. Built by ex-FAANG engineers. The name is marketing, the performance is real.",
        "category": "AI & Tech",
        "difficulty": 4,
        "outcome": "success",
        "outcome_multiplier": 4.0,
        "market_signals": ["$28M Series B", "YC W22", "benchmarks beating Neo4j by 40x"],
        "tags": ["devtools", "infrastructure", "database"],
        "rarity": "rare",
        "humor_level": 2,
        "realism": 5,
    },
    {
        "name": "SoulSync",
        "tagline": "Find your soulmate through your Spotify history",
        "description": "Matches users based on the emotional arc of their listening history. Claims to predict relationship compatibility with 83% accuracy. 200K users in beta, mostly in Brooklyn and Silver Lake.",
        "category": "AI & Tech",
        "difficulty": 3,
        "outcome": "moderate",
        "outcome_multiplier": 0.6,
        "market_signals": ["$2.1M seed", "200K users", "but 62% churn after 30 days"],
        "tags": ["dating", "music", "consumer"],
        "rarity": "uncommon",
        "humor_level": 3,
        "realism": 4,
    },

    # ── DTC Brands ─────────────────────────────────────────────
    {
        "name": "CrunchCrate",
        "tagline": "Monthly subscription box of artisan croutons",
        "description": "Each month, receive 6 varieties of small-batch croutons sourced from bakeries across Europe. Includes pairing guide and a tiny golden spoon. $34/month, cancel anytime.",
        "category": "DTC Brands",
        "difficulty": 1,
        "outcome": "flop",
        "outcome_multiplier": 0.0,
        "market_signals": ["Shark Tank rejection", "87 one-star reviews mentioning 'why'", "$12K MRR"],
        "tags": ["subscription", "food", "niche"],
        "rarity": "common",
        "humor_level": 5,
        "realism": 2,
    },
    {
        "name": "GlowStack",
        "tagline": "Skincare regimen built on clinical trial data, not vibes",
        "description": "Custom-formulated skincare based on your DNA, microbiome, and local pollution data. Each batch is manufactured on-demand. Backed by Stanford dermatology research.",
        "category": "DTC Brands",
        "difficulty": 2,
        "outcome": "success",
        "outcome_multiplier": 1.8,
        "market_signals": ["$6M Series A", "Stanford partnership", "4.9 stars / 3K reviews"],
        "tags": ["skincare", "health", "custom"],
        "rarity": "common",
        "humor_level": 1,
        "realism": 5,
    },
    {
        "name": "Toasty",
        "tagline": "A smart toaster that tweets your toast",
        "description": "WiFi-connected toaster with a built-in camera that posts your toast to social media. Customizable browning levels via app. The founder's previous startup was acquired for $90M, so who's laughing now?",
        "category": "DTC Brands",
        "difficulty": 3,
        "outcome": "flop",
        "outcome_multiplier": 0.0,
        "market_signals": ["$3M from a16z (yes, really)", "15K units sold", "returns rate 40%"],
        "tags": ["hardware", "iot", "absurd"],
        "rarity": "uncommon",
        "humor_level": 5,
        "realism": 1,
    },

    # ── Food & Beverage ─────────────────────────────────────────
    {
        "name": "Aerogel Water",
        "tagline": "Water, but lighter. 97% less weight than regular water.",
        "description": "Proprietary aerogel technology suspends H2O molecules in a silica matrix, creating 'solid water' that hydrates you without the heaviness. Tastes like... nothing, mostly. $8/bottle.",
        "category": "Food & Beverage",
        "difficulty": 2,
        "outcome": "flop",
        "outcome_multiplier": 0.0,
        "market_signals": ["$1.5M Kickstarter hit", "FDA warning letter (unresolved)", "shipping delayed 18 months"],
        "tags": ["beverage", "gimmick", "controversial"],
        "rarity": "common",
        "humor_level": 4,
        "realism": 2,
    },
    {
        "name": "BrewLab",
        "tagline": "At-home cold brew that's ready in 2 minutes",
        "description": "Centrifugal extraction technology makes cold brew concentrate in 120 seconds. No overnight steeping. 1 pod = 1 pitcher. Already in 4,000+ offices and counting.",
        "category": "Food & Beverage",
        "difficulty": 2,
        "outcome": "success",
        "outcome_multiplier": 2.0,
        "market_signals": ["$8M Series A", "4K B2B accounts", "73% gross margin"],
        "tags": ["coffee", "hardware", "b2b"],
        "rarity": "common",
        "humor_level": 1,
        "realism": 5,
    },

    # ── Hardware ────────────────────────────────────────────────
    {
        "name": "EchoRing",
        "tagline": "A ring that lets you feel your partner's heartbeat from anywhere",
        "description": "Titanium ring with haptic motor and Bluetooth LE. Pairs with an app. When your partner wears theirs, you feel their heartbeat as a gentle pulse. $299/pair. Pre-sold 50K units on Indiegogo.",
        "category": "Hardware",
        "difficulty": 3,
        "outcome": "success",
        "outcome_multiplier": 1.5,
        "market_signals": ["$4M crowdfunding", "50K pre-orders", "shipping on time (rare for hardware)"],
        "tags": ["wearable", "relationship", "emotional-tech"],
        "rarity": "uncommon",
        "humor_level": 2,
        "realism": 4,
    },
    {
        "name": "FoldAir",
        "tagline": "A folding drone that fits in your wallet",
        "description": "Credit-card-sized drone with 4K camera, 8-minute flight time, and folding rotors. Weighs 47 grams. FAA-compliant (no registration needed). The ultimate travel companion.",
        "category": "Hardware",
        "difficulty": 4,
        "outcome": "moderate",
        "outcome_multiplier": 0.5,
        "market_signals": ["$20M raised", "DJI lawsuit threats", "battery life complaints dominate reviews"],
        "tags": ["drone", "travel", "miniaturization"],
        "rarity": "rare",
        "humor_level": 1,
        "realism": 5,
    },

    # ── Health & Wellness ───────────────────────────────────────
    {
        "name": "MindGym",
        "tagline": "Peloton for therapy",
        "description": "Live, instructor-led mental fitness classes. 45-minute sessions combining CBT techniques, guided journaling, and group discussion. $29/month. 400 licensed therapist-instructors.",
        "category": "Health & Wellness",
        "difficulty": 3,
        "outcome": "success",
        "outcome_multiplier": 3.0,
        "market_signals": ["$35M Series C", "400K subscribers", "outcomes study published in Nature"],
        "tags": ["mental-health", "subscription", "marketplace"],
        "rarity": "uncommon",
        "humor_level": 1,
        "realism": 5,
    },
    {
        "name": "SleepCoin",
        "tagline": "Earn crypto for sleeping. Finally, a use case.",
        "description": "Wearable-verified sleep tracking mints SleepCoin tokens for every hour of quality sleep. Redeemable for melatonin, weighted blankets, and other sleep products in the marketplace.",
        "category": "Health & Wellness",
        "difficulty": 2,
        "outcome": "flop",
        "outcome_multiplier": 0.0,
        "market_signals": ["$500K ICO", "SEC inquiry", "most users report worse sleep from checking token price"],
        "tags": ["crypto", "sleep", "web3"],
        "rarity": "common",
        "humor_level": 4,
        "realism": 3,
    },

    # ── Finance ─────────────────────────────────────────────────
    {
        "name": "Splitwise for Gen Z",
        "tagline": "Actually, it's 'Splid' — AI-powered group expense splitting with vibes",
        "description": "Snap a photo of the receipt. AI splits it. But also: rates the fairness of the split, suggests who 'should' cover the tip based on group dynamics, and posts a story about the meal.",
        "category": "Finance",
        "difficulty": 2,
        "outcome": "flop",
        "outcome_multiplier": 0.0,
        "market_signals": ["$2M seed", "50K downloads", "but Venmo just added the same thing for free"],
        "tags": ["fintech", "social", "gen-z"],
        "rarity": "common",
        "humor_level": 4,
        "realism": 4,
    },
    {
        "name": "TaxWarp",
        "tagline": "File your taxes in 90 seconds or your money back",
        "description": "Connects to your bank, brokerage, and payroll via Plaid. One-tap filing for W-2 employees. Uses the same API the IRS built but never marketed. 99.7% acceptance rate.",
        "category": "Finance",
        "difficulty": 2,
        "outcome": "success",
        "outcome_multiplier": 1.8,
        "market_signals": ["$15M Series A", "1.2M users", "TurboTax has entered the chat angrily"],
        "tags": ["fintech", "taxes", "consumer"],
        "rarity": "common",
        "humor_level": 2,
        "realism": 5,
    },

    # ── Social Media ────────────────────────────────────────────
    {
        "name": "Whispr",
        "tagline": "Social network where all posts disappear after being read once",
        "description": "No profiles. No history. No screenshots (blocked at OS level). Pure ephemeral conversation. 2M DAU. Mostly used for things people regret not screenshotting.",
        "category": "Social Media",
        "difficulty": 3,
        "outcome": "success",
        "outcome_multiplier": 2.2,
        "market_signals": ["$40M Series B, led by a16z", "2M DAU", "growing 15% week-over-week"],
        "tags": ["social", "privacy", "ephemeral"],
        "rarity": "uncommon",
        "humor_level": 3,
        "realism": 4,
    },
    {
        "name": "LinkBunny",
        "tagline": "Link-in-bio, but it's an AI-generated rabbit that hops through your links",
        "description": "An animated 3D rabbit avatar navigates a garden that represents your link-in-bio page. Each carrot is a link. $5/month for premium rabbit accessories. Somehow, the creator economy loves it.",
        "category": "Social Media",
        "difficulty": 2,
        "outcome": "success",
        "outcome_multiplier": 1.3,
        "market_signals": ["$800K seed", "adopted by 3 mega-influencers", "but growth is plateauing"],
        "tags": ["creator-economy", "novelty", "link-in-bio"],
        "rarity": "common",
        "humor_level": 4,
        "realism": 3,
    },

    # ── Sustainability ──────────────────────────────────────────
    {
        "name": "SeaVault",
        "tagline": "Carbon credits, but actually real this time — verified by satellite",
        "description": "Uses satellite imagery and ocean sensors to verify kelp forest carbon sequestration in real time. Sells verified credits to enterprises. Backed by climate scientists, not marketing teams.",
        "category": "Sustainability",
        "difficulty": 3,
        "outcome": "success",
        "outcome_multiplier": 2.8,
        "market_signals": ["$22M Series A", "contracts with Microsoft and Stripe", "Nature Climate paper"],
        "tags": ["climate", "carbon-credits", "satellite"],
        "rarity": "rare",
        "humor_level": 0,
        "realism": 5,
    },
    {
        "name": "PlasticBack",
        "tagline": "We turn ocean plastic into... more ocean plastic. Wait, no.",
        "description": "Reverse vending machines that pay users in cryptocurrency for depositing plastic bottles. The plastic is recycled into construction materials. 5,000 machines across Southeast Asia.",
        "category": "Sustainability",
        "difficulty": 2,
        "outcome": "success",
        "outcome_multiplier": 1.6,
        "market_signals": ["$10M from impact funds", "5K machines deployed", "unit economics barely positive"],
        "tags": ["recycling", "crypto", "hardware"],
        "rarity": "uncommon",
        "humor_level": 2,
        "realism": 4,
    },

    # ── Absurd/Meme ─────────────────────────────────────────────
    {
        "name": "NothingBox",
        "tagline": "A box. That's it. $49.99.",
        "description": "Premium unboxing experience. The box contains another, smaller box. That box contains a note that says 'You get it.' Minimalist gift for the person who has everything. 4.8 stars on TrustPilot somehow.",
        "category": "Absurd/Meme",
        "difficulty": 1,
        "outcome": "flop",
        "outcome_multiplier": 0.0,
        "market_signals": ["viral TikTok = 40M views", "but refund rate is 92%", "the founder is a performance artist"],
        "tags": ["gift", "conceptual", "performance-art"],
        "rarity": "common",
        "humor_level": 5,
        "realism": 2,
    },
    {
        "name": "Yellr",
        "tagline": "Uber for being yelled at (motivation edition)",
        "description": "Book a 5-minute call with a 'motivational yeller' who screams encouragement at you. 'FINISH THAT DECK!' 'DRINK WATER!' 'YOU'RE NOT A DISAPPOINTMENT!' 50K sessions booked. Most users are startup founders.",
        "category": "Absurd/Meme",
        "difficulty": 1,
        "outcome": "success",
        "outcome_multiplier": 1.1,
        "market_signals": ["$1M seed (surprisingly)", "50K sessions", "featured on Colbert"],
        "tags": ["gig-economy", "motivation", "bit"],
        "rarity": "uncommon",
        "humor_level": 5,
        "realism": 3,
    },
    {
        "name": "Broccol-E",
        "tagline": "Electric scooter made of vegetables",
        "description": "A fully compostable electric scooter with a frame made from compressed vegetable fiber. Range: 8 miles. Top speed: 12 mph. Decomposes after 6 months of regular use. 'Ride it till it rots.'",
        "category": "Absurd/Meme",
        "difficulty": 2,
        "outcome": "flop",
        "outcome_multiplier": 0.0,
        "market_signals": ["GreenTech award winner", "but 0 repeat customers", "literally rots in rain"],
        "tags": ["transportation", "sustainability", "absurd"],
        "rarity": "common",
        "humor_level": 5,
        "realism": 1,
    },

    # ── Wildcard ────────────────────────────────────────────────
    {
        "name": "DoorDash for Doors",
        "tagline": "We deliver doors. Just doors. Same-day.",
        "description": "Need a door? We have doors. Front doors, screen doors, closet doors, garage doors. Delivered in 2 hours or less. 97% of orders arrive undamaged (the other 3% are now windows).",
        "category": "Wildcard",
        "difficulty": 2,
        "outcome": "moderate",
        "outcome_multiplier": 0.7,
        "market_signals": ["$3M revenue", "profitable", "but TAM is literally just doors"],
        "tags": ["logistics", "niche", "surprisingly-real"],
        "rarity": "rare",
        "humor_level": 4,
        "realism": 3,
    },
    {
        "name": "QuantumPup",
        "tagline": "A dog that exists in multiple emotional states simultaneously",
        "description": "Not an actual quantum dog. It's a Tamagotchi-style app where your virtual dog's mood is calculated using actual quantum computing APIs. Is it happy? Sad? Both? Observation determines the state.",
        "category": "Wildcard",
        "difficulty": 4,
        "outcome": "flop",
        "outcome_multiplier": 0.0,
        "market_signals": ["IBM Quantum partnership", "but 98% of users say 'I don't get it'", "the app crashes constantly"],
        "tags": ["quantum", "pets", "conceptual"],
        "rarity": "legendary",
        "humor_level": 4,
        "realism": 2,
    },
]

ACHIEVEMENTS = [
    {"code": "first_blood", "name": "First Blood", "description": "Complete your first investment", "rarity": "common", "xp_reward": 50, "shark_coin_reward": 0},
    {"code": "hot_streak", "name": "Hot Streak", "description": "5 correct investments in a row", "rarity": "uncommon", "xp_reward": 200, "shark_coin_reward": 25},
    {"code": "perfect_10", "name": "Perfect 10", "description": "10/10 correct in Streak Mode", "rarity": "rare", "xp_reward": 500, "shark_coin_reward": 100},
    {"code": "all_in", "name": "All In", "description": "Invest entire bankroll and win", "rarity": "rare", "xp_reward": 300, "shark_coin_reward": 50},
    {"code": "whale", "name": "Whale", "description": "Single investment over $100K profit", "rarity": "rare", "xp_reward": 400, "shark_coin_reward": 75},
    {"code": "daily_grinder", "name": "Daily Grinder", "description": "7-day daily challenge streak", "rarity": "uncommon", "xp_reward": 300, "shark_coin_reward": 50},
    {"code": "century", "name": "Century", "description": "Evaluate 100 products", "rarity": "common", "xp_reward": 100, "shark_coin_reward": 10},
    {"code": "grandmaster", "name": "Grandmaster", "description": "Evaluate 1,000 products", "rarity": "rare", "xp_reward": 1000, "shark_coin_reward": 200},
    {"code": "oracle", "name": "Oracle", "description": "90%+ accuracy over 100+ investments", "rarity": "legendary", "xp_reward": 2000, "shark_coin_reward": 500},
    {"code": "great_white", "name": "Great White", "description": "Investor Score of 100,000+", "rarity": "legendary", "xp_reward": 2000, "shark_coin_reward": 500},
    {"code": "social_shark", "name": "Social Shark", "description": "Share 10 results", "rarity": "common", "xp_reward": 100, "shark_coin_reward": 25},
    {"code": "referral_king", "name": "Referral King", "description": "10 friend signups", "rarity": "uncommon", "xp_reward": 500, "shark_coin_reward": 200},
]

BOOSTERS = [
    {"code": "market_intel", "name": "Market Intel", "description": "Reveals one hidden signal about the product", "effect_type": "reveal_signal", "effect_value": 1, "rarity": "common", "cost_shark_coins": 50, "usable_in_daily": False},
    {"code": "second_chance", "name": "Second Chance", "description": "Re-do one investment decision after seeing the result", "effect_type": "redo_round", "effect_value": 1, "rarity": "uncommon", "cost_shark_coins": 150, "usable_in_daily": False},
    {"code": "double_down", "name": "Double Down", "description": "2x profit on next successful investment", "effect_type": "multiply_profit", "effect_value": 2.0, "rarity": "uncommon", "cost_shark_coins": 100, "usable_in_daily": False},
    {"code": "safety_net", "name": "Safety Net", "description": "Next failed investment returns 50% of capital", "effect_type": "loss_protection", "effect_value": 0.5, "rarity": "rare", "cost_shark_coins": 200, "usable_in_daily": False},
    {"code": "insider_info", "name": "Insider Info", "description": "Reveals the outcome before investing", "effect_type": "reveal_outcome", "effect_value": 1, "rarity": "legendary", "cost_shark_coins": 500, "usable_in_daily": False, "cooldown_minutes": 60},
    {"code": "category_expert", "name": "Category Expert", "description": "Bonus accuracy for one category (passive)", "effect_type": "category_bonus", "effect_value": 0.15, "rarity": "rare", "cost_shark_coins": 300, "usable_in_daily": False},
]


async def seed():
    async with async_session() as db:
        # Check if already seeded
        result = await db.execute(select(Product).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        # Products
        for p_data in PRODUCTS:
            product = Product(**p_data, is_active=True, created_by="seed")
            db.add(product)
        print(f"Seeded {len(PRODUCTS)} products")

        # Achievements
        for a_data in ACHIEVEMENTS:
            achievement = Achievement(**a_data)
            db.add(achievement)
        print(f"Seeded {len(ACHIEVEMENTS)} achievements")

        # Boosters
        for b_data in BOOSTERS:
            booster = Booster(**b_data)
            db.add(booster)
        print(f"Seeded {len(BOOSTERS)} boosters")

        await db.commit()
        print("Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
