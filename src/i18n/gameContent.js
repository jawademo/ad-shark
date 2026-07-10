// Bilingual game content (ES/EN). Consumed by services/api.ts via getLang().
// Product brand names (Juicero 2.0, GhostPass, ...) stay in English on purpose —
// they read as brand names in both languages. Everything a player reads (taglines,
// descriptions, market signals, verdicts, outcomes) is localized.

// ── Generated-product vocabulary ─────────────────────────────────────
// Only fields that are actually rendered get localized: category label, tagline,
// and the green/red flags (which become visible market signals). Subcategory /
// target market / price are not shown, so they stay language-neutral in api.ts.

export const CATEGORY_LABELS = {
  app: { en: "App", es: "App" },
  gadget: { en: "Gadget", es: "Gadget" },
  food: { en: "Food & Drink", es: "Comida y bebida" },
  service: { en: "Service", es: "Servicio" },
  fashion: { en: "Fashion", es: "Moda" },
};

export const TAGLINES = {
  en: {
    app: ["The app your phone has been waiting for.", "Everything you need, in one tap.", "Work smarter. Live better.", "Your life, optimized.", "Connect. Create. Conquer.", "Stop wasting time. Start achieving.", "Built for the go-getters."],
    gadget: ["Small device. Big impact.", "Wear the future.", "Technology that fits your life.", "Engineered for performance.", "The gadget you never knew you needed.", "Level up your everyday.", "Built different."],
    food: ["Fuel your hustle.", "Taste the difference.", "Because you deserve better.", "Clean ingredients. Dirty gains.", "Your new daily ritual.", "Nature-powered. Science-backed.", "Snack smarter."],
    service: ["Everything you need, delivered.", "Cancel anytime. (You won't want to.)", "Join 10,000+ happy members.", "The subscription that pays for itself.", "Your unfair advantage.", "Professional tools. Startup price."],
    fashion: ["Wear what you believe in.", "Limited drop. Forever style.", "Made for the ones who move.", "Quality over hype.", "Built to last. Made to stand out.", "The uniform of the bold."],
  },
  es: {
    app: ["La app que tu teléfono estaba esperando.", "Todo lo que necesitas, a un toque.", "Trabaja más listo. Vive mejor.", "Tu vida, optimizada.", "Conecta. Crea. Conquista.", "Deja de perder el tiempo. Empieza a lograr.", "Hecha para los que van con todo."],
    gadget: ["Pequeño dispositivo. Gran impacto.", "Lleva puesto el futuro.", "Tecnología que se adapta a tu vida.", "Diseñado para el rendimiento.", "El gadget que no sabías que necesitabas.", "Sube de nivel tu día a día.", "Hecho diferente."],
    food: ["Combustible para tu hustle.", "Saborea la diferencia.", "Porque mereces algo mejor.", "Ingredientes limpios. Ganancias sucias.", "Tu nuevo ritual diario.", "Con el poder de la naturaleza. Respaldado por la ciencia.", "Snackea más listo."],
    service: ["Todo lo que necesitas, a domicilio.", "Cancela cuando quieras. (No vas a querer.)", "Únete a más de 10,000 miembros felices.", "La suscripción que se paga sola.", "Tu ventaja injusta.", "Herramientas profesionales. Precio de startup."],
    fashion: ["Viste lo que crees.", "Drop limitado. Estilo para siempre.", "Hecho para los que se mueven.", "Calidad sobre hype.", "Hecho para durar. Diseñado para destacar.", "El uniforme de los audaces."],
  },
};

export const GREEN_FLAGS = {
  en: ["Backed by a former Google engineer", "TikTok trend already forming", "Solves a real daily problem", "First mover in the category", "Strong early App Store reviews", "Featured on Product Hunt #1", "Celebrity quietly using it", "Viral waitlist — 50k signups", "Repeat purchase rate > 60%", "Profitable from day 30", "Organic word-of-mouth spreading", "Gen Z is obsessed", "Low CAC, high retention", "Patent pending technology", "Partnership with major retailer confirmed"],
  es: ["Respaldado por un ex-ingeniero de Google", "Ya se está formando una tendencia en TikTok", "Resuelve un problema real del día a día", "Primero en mover ficha en la categoría", "Buenas reseñas tempranas en la App Store", "Producto #1 destacado en Product Hunt", "Un famoso lo usa en secreto", "Lista de espera viral — 50k registros", "Tasa de recompra > 60%", "Rentable desde el día 30", "El boca a boca orgánico se está expandiendo", "La Gen Z está obsesionada", "CAC bajo, retención alta", "Tecnología con patente en trámite", "Alianza confirmada con un gran retailer"],
};

export const RED_FLAGS = {
  en: ["Founder deleted their LinkedIn", "App crashes on iPhone 14+", "Already 12 competitors doing the same", "Zero traction after 6 months", "Negative press from major outlet", "Refund rate above 40%", "Influencer deals fell through", "Only works on Android 10+", "CEO has a controversial past", "Targeting everyone = targeting no one", "Margin barely covers shipping", "Late to a dying trend", "No clear monetization model", "Founder ghosting investors", "Product doesn't work as advertised"],
  es: ["El fundador borró su LinkedIn", "La app se cae en iPhone 14+", "Ya hay 12 competidores haciendo lo mismo", "Cero tracción después de 6 meses", "Prensa negativa de un medio importante", "Tasa de reembolsos por encima del 40%", "Se cayeron los acuerdos con influencers", "Solo funciona en Android 10+", "El CEO tiene un pasado polémico", "Apuntar a todos = no apuntar a nadie", "El margen apenas cubre el envío", "Tarde para una tendencia que ya muere", "Sin modelo de monetización claro", "El fundador les hace ghosting a los inversores", "El producto no funciona como se anuncia"],
};

// ── Curated meme products ────────────────────────────────────────────
// Language-neutral fields live at the top; localized copy lives under en/es.

const ABSURD = [
  {
    id: "meme-1", name: "Juicero 2.0", categoryEmoji: "🧃", categoryColor: "#f59e0b",
    rarity: "legendary", difficulty: 3, hypeScore: 7, successProb: 0.65, returnMultiplier: 3.5,
    en: {
      tagline: "This time the juice is digital. NFT-compatible.",
      description: "A $400 WiFi-connected juicer that requires a subscription to squeeze packets. Again. But this time the packets are NFTs.",
      market_signals: ["went viral on TikTok with 2M+ views", "founders are former Juicero engineers (unironically)", "Kevin Hart invested (he doesn't know what it does either)"],
      verdict: { win: "People will pay $400 to squeeze a packet if it's on-chain. Peak 2020s — and you called it.", loss: "Same lesson as Juicero 1.0: nobody needs a WiFi juicer. The NFTs didn't save it." },
    },
    es: {
      tagline: "Ahora el jugo es digital. Compatible con NFT.",
      description: "Un exprimidor con WiFi de $400 que necesita una suscripción para exprimir sobrecitos. Otra vez. Pero ahora los sobrecitos son NFTs.",
      market_signals: ["se hizo viral en TikTok con más de 2M de vistas", "los fundadores son ex-ingenieros de Juicero (sin ironía)", "Kevin Hart invirtió (él tampoco sabe qué hace)"],
      verdict: { win: "La gente paga $400 por exprimir un sobre si está on-chain. Puro 2020 — y lo viste venir.", loss: "La misma lección que Juicero 1.0: nadie necesita un exprimidor con WiFi. Los NFTs no lo salvaron." },
    },
  },
  {
    id: "meme-2", name: "GhostPass", categoryEmoji: "👻", categoryColor: "#10b981",
    rarity: "rare", difficulty: 2, hypeScore: 8, successProb: 0.70, returnMultiplier: 2.8,
    en: {
      tagline: "The subscription that ghosts people for you. Professionally.",
      description: "Tired of awkward conversations? GhostPass auto-reads and ignores messages from your ex, your boss, and that guy from college who wants to 'pick your brain'.",
      market_signals: ["1M signups in the first week", "founder is a former Tinder PM with 3 exits", "literally no monetization beyond $9/mo"],
      verdict: { win: "A million people hate texting back. $9/mo to never reply again — easiest yes in tech.", loss: "Charming demo, no business model past $9/mo. The novelty wore off and so did the users." },
    },
    es: {
      tagline: "La suscripción que hace ghosting por ti. Profesionalmente.",
      description: "¿Cansado de conversaciones incómodas? GhostPass lee e ignora automáticamente los mensajes de tu ex, tu jefe y ese tipo de la uni que quiere 'picarte el cerebro'.",
      market_signals: ["1M de registros en la primera semana", "el fundador es ex-PM de Tinder con 3 exits", "literalmente sin monetización más allá de $9/mes"],
      verdict: { win: "A un millón de personas les da pereza responder. $9/mes por no contestar nunca más — el sí más fácil del mundo tech.", loss: "Demo encantadora, sin modelo de negocio más allá de $9/mes. Se acabó la novedad y los usuarios también." },
    },
  },
  {
    id: "meme-3", name: "PawlyAI", categoryEmoji: "🐶", categoryColor: "#6366f1",
    rarity: "rare", difficulty: 2, hypeScore: 6, successProb: 0.45, returnMultiplier: 2.5,
    en: {
      tagline: "AI that translates your dog's barks into stock picks.",
      description: "Your golden retriever barks at the mailman? That's a buy signal for UPS. PawlyAI uses 'proprietary neural networks' (a random number generator) to turn bark patterns into investment advice.",
      market_signals: ["App Store #1 in a category they invented", "50 dog influencers already booked", "SEC is 'looking into it'"],
    },
    es: {
      tagline: "IA que traduce los ladridos de tu perro en recomendaciones de bolsa.",
      description: "¿Tu golden retriever le ladra al cartero? Eso es señal de compra para UPS. PawlyAI usa 'redes neuronales propietarias' (un generador de números aleatorios) para convertir ladridos en consejos de inversión.",
      market_signals: ["#1 en la App Store en una categoría que ellos inventaron", "50 perros influencers ya contratados", "la SEC lo 'está investigando'"],
    },
  },
  {
    id: "meme-4", name: "SweatSell", categoryEmoji: "💧", categoryColor: "#10b981",
    rarity: "uncommon", difficulty: 3, hypeScore: 7, successProb: 0.55, returnMultiplier: 3.0,
    en: {
      tagline: "We bottle your gym sweat and sell it as 'pre-workout'.",
      description: "Why let your sweat go to waste? SweatSell bottles your post-workout perspiration and sells it to supplement companies. You get 2% revenue share. In sweatcoins.",
      market_signals: ["partnered with a cosmetics company that needs human sweat for testing", "surprisingly high retention — people love getting paid", "regulatory nightmare in 14 states"],
    },
    es: {
      tagline: "Embotellamos tu sudor del gym y lo vendemos como 'pre-entreno'.",
      description: "¿Por qué desperdiciar tu sudor? SweatSell embotella tu transpiración post-entreno y la vende a empresas de suplementos. Te llevas el 2% de los ingresos. En sweatcoins.",
      market_signals: ["alianza con una cosmética que necesita sudor humano para pruebas", "retención sorprendentemente alta — a la gente le encanta que le paguen", "pesadilla regulatoria en 14 estados"],
    },
  },
  {
    id: "meme-5", name: "CloudLoaf", categoryEmoji: "🍞", categoryColor: "#f59e0b",
    rarity: "uncommon", difficulty: 4, hypeScore: 3, successProb: 0.15, returnMultiplier: 1.5,
    en: {
      tagline: "Bread that exists only in the blockchain. You can't eat it.",
      description: "The world's first NFT bread. Each loaf is uniquely generated and stored on-chain. You can't eat it, toast it, or smell it. But you CAN trade it. Current floor price: 0.003 ETH.",
      market_signals: ["pivoted from a failed NFT marketplace", "actually profitable — $0.99 minting fee adds up", "nobody can explain what cloud bread is"],
      verdict: { win: "That $0.99 minting fee quietly printed money. Dumb idea, real margins — nice catch.", loss: "It's bread you can't eat, on a chain nobody uses. The floor price found zero." },
    },
    es: {
      tagline: "Pan que solo existe en la blockchain. No te lo puedes comer.",
      description: "El primer pan NFT del mundo. Cada hogaza se genera de forma única y se guarda on-chain. No te lo puedes comer, tostar ni oler. Pero SÍ lo puedes tradear. Precio mínimo actual: 0.003 ETH.",
      market_signals: ["pivote desde un marketplace de NFT fracasado", "de hecho rentable — la comisión de $0.99 por acuñar suma", "nadie sabe explicar qué es el pan nube"],
      verdict: { win: "Esa comisión de $0.99 por acuñar imprimía dinero en silencio. Idea tonta, márgenes reales — buen ojo.", loss: "Es pan que no puedes comer, en una cadena que nadie usa. El precio mínimo llegó a cero." },
    },
  },
  {
    id: "meme-6", name: "MoodMug", categoryEmoji: "☕", categoryColor: "#f59e0b",
    rarity: "uncommon", difficulty: 2, hypeScore: 5, successProb: 0.35, returnMultiplier: 2.2,
    en: {
      tagline: "A coffee mug that posts your mood to LinkedIn.",
      description: "Smart mug with biometric sensors that detects your stress level and auto-posts to LinkedIn: 'Feeling challenged but growing! 💪 #hustle'. Your network will never know you're crying.",
      market_signals: ["TikTok trend where people screenshot the awkward posts", "LinkedIn integration is technically against ToS", "pre-orders sold out in 4 hours"],
    },
    es: {
      tagline: "Una taza de café que publica tu estado de ánimo en LinkedIn.",
      description: "Taza inteligente con sensores biométricos que detecta tu nivel de estrés y publica solo en LinkedIn: '¡Retado pero creciendo! 💪 #hustle'. Tu red nunca sabrá que estás llorando.",
      market_signals: ["tendencia en TikTok donde la gente captura las publicaciones incómodas", "la integración con LinkedIn técnicamente viola los términos", "las preventas se agotaron en 4 horas"],
    },
  },
  {
    id: "meme-7", name: "ShamePlug", categoryEmoji: "🔌", categoryColor: "#06b6d4",
    rarity: "rare", difficulty: 1, hypeScore: 6, successProb: 0.50, returnMultiplier: 2.4,
    en: {
      tagline: "A smart plug that turns off your devices when you procrastinate.",
      description: "ShamePlug monitors your screen activity. Open Reddit? Your monitor turns off. Check Instagram? Your phone charger disconnects. It texts your mom every time you slack off.",
      market_signals: ["72% of users throw it away within a week", "but the 28% who keep it report 40% productivity gains", "viral unboxing videos of people destroying them"],
    },
    es: {
      tagline: "Un enchufe inteligente que apaga tus dispositivos cuando procrastinas.",
      description: "ShamePlug vigila tu actividad en pantalla. ¿Abres Reddit? Se apaga tu monitor. ¿Revisas Instagram? Se desconecta el cargador de tu teléfono. Le manda un mensaje a tu mamá cada vez que holgazaneas.",
      market_signals: ["el 72% de los usuarios lo tira a la basura en una semana", "pero el 28% que lo conserva reporta 40% más de productividad", "videos virales de unboxing de gente destruyéndolos"],
    },
  },
  {
    id: "meme-8", name: "VibeCheck", categoryEmoji: "📸", categoryColor: "#6366f1",
    rarity: "common", difficulty: 1, hypeScore: 8, successProb: 0.75, returnMultiplier: 3.2,
    en: {
      tagline: "An app that rates your vibe on a scale of 1-10 using your selfies.",
      description: "Upload a selfie. Our AI (a Magic 8-Ball) rates your vibe. If you score below 4, the app suggests you 'touch grass'. Premium tier ($19.99/mo) gives you a 10/10 every time.",
      market_signals: ["Gen Z adoption is insane — 200k DAU in month one", "premium tier ($19.99) is 40% of revenue", "founder is 19 and dropped out of high school"],
      verdict: { win: "200k daily Gen Z users and a $19.99 vanity tier. The Magic 8-Ball is a goldmine.", loss: "Under the hood it's a selfie-rating Magic 8-Ball. Gen Z got bored and touched grass." },
    },
    es: {
      tagline: "Una app que califica tu vibra del 1 al 10 usando tus selfies.",
      description: "Sube una selfie. Nuestra IA (una bola mágica 8) califica tu vibra. Si sacas menos de 4, la app te sugiere 'tocar pasto'. El plan premium ($19.99/mes) te da un 10/10 siempre.",
      market_signals: ["adopción brutal de la Gen Z — 200k usuarios diarios en el primer mes", "el plan premium ($19.99) es el 40% de los ingresos", "el fundador tiene 19 y dejó la prepa"],
      verdict: { win: "200k usuarios Gen Z al día y un plan de vanidad de $19.99. La bola mágica 8 es una mina de oro.", loss: "Por dentro es una bola mágica 8 que califica selfies. La Gen Z se aburrió y se fue a tocar pasto." },
    },
  },
  {
    id: "meme-9", name: "ExBox", categoryEmoji: "📦", categoryColor: "#ec4899",
    rarity: "uncommon", difficulty: 2, hypeScore: 6, successProb: 0.55, returnMultiplier: 2.6,
    en: {
      tagline: "A subscription box that sends you something your ex would hate.",
      description: "Every month, ExBox delivers items curated to annoy your ex: a couples' cooking class voucher, a 'World's Best Girlfriend' mug, a gym membership brochure. Petty? Yes. Profitable? Also yes.",
      market_signals: ["TikTok reviews averaging 500k views each", "gross margin is 70% — the items are dirt cheap", "founder was on a reality TV show"],
    },
    es: {
      tagline: "Una caja de suscripción que te manda algo que tu ex odiaría.",
      description: "Cada mes, ExBox entrega artículos pensados para molestar a tu ex: un cupón de clase de cocina en pareja, una taza de 'La Mejor Novia del Mundo', un folleto de membresía de gimnasio. ¿Mezquino? Sí. ¿Rentable? También.",
      market_signals: ["reseñas en TikTok con 500k vistas de promedio", "margen bruto del 70% — los artículos son baratísimos", "el fundador salió en un reality"],
    },
  },
  {
    id: "meme-10", name: "BrainRot", categoryEmoji: "🧠", categoryColor: "#6366f1",
    rarity: "legendary", difficulty: 2, hypeScore: 9, successProb: 0.80, returnMultiplier: 4.0,
    en: {
      tagline: "An app that pays you to scroll TikTok. (In brainrot tokens.)",
      description: "Watch TikToks for 4 hours? You earn 47 BrainRot tokens. 1,000 BrainRot tokens = $1 (non-transferable, non-refundable, does not exist). But the streaks feel real.",
      market_signals: ["3M downloads in first month", "the token has no real value but users don't care", "average session length: 3.7 hours"],
      verdict: { win: "3.7-hour sessions and a worthless token nobody cashes out. Engagement IS the product.", loss: "Regulators noticed you were paying people fake money to doomscroll. That ended fast." },
    },
    es: {
      tagline: "Una app que te paga por hacer scroll en TikTok. (En tokens brainrot.)",
      description: "¿Ves TikToks 4 horas? Ganas 47 tokens BrainRot. 1,000 tokens BrainRot = $1 (no transferible, no reembolsable, no existe). Pero las rachas se sienten reales.",
      market_signals: ["3M de descargas en el primer mes", "el token no tiene valor real pero a los usuarios no les importa", "duración media de sesión: 3.7 horas"],
      verdict: { win: "Sesiones de 3.7 horas y un token sin valor que nadie cobra. El engagement ES el producto.", loss: "Los reguladores notaron que pagabas dinero falso por doomscrollear. Eso se acabó rápido." },
    },
  },
  {
    id: "meme-11", name: "CricketFarm", categoryEmoji: "🦗", categoryColor: "#10b981",
    rarity: "common", difficulty: 3, hypeScore: 4, successProb: 0.25, returnMultiplier: 1.8,
    en: {
      tagline: "Urban cricket farming kits. For protein. Yes, really.",
      description: "Grow your own crickets at home! Each kit includes 500 crickets, a terrarium, and a recipe book. Because nothing says 'I'm an environmentalist' like eating bugs in your studio apartment.",
      market_signals: ["UN report says insects are the future of protein", "average user gets attached to crickets and can't eat them", "PETA gave it a 'cruelty-free' rating (the crickets disagree)"],
    },
    es: {
      tagline: "Kits de cría urbana de grillos. Por la proteína. Sí, en serio.",
      description: "¡Cría tus propios grillos en casa! Cada kit incluye 500 grillos, un terrario y un recetario. Porque nada dice 'soy ecologista' como comer insectos en tu monoambiente.",
      market_signals: ["un informe de la ONU dice que los insectos son el futuro de la proteína", "el usuario promedio se encariña con los grillos y no puede comérselos", "PETA le dio calificación 'libre de crueldad' (los grillos no opinan igual)"],
    },
  },
  {
    id: "meme-12", name: "WiFiWater", categoryEmoji: "📶", categoryColor: "#06b6d4",
    rarity: "rare", difficulty: 2, hypeScore: 5, successProb: 0.30, returnMultiplier: 2.0,
    en: {
      tagline: "Water but it has WiFi. Don't ask questions.",
      description: "Smart water bottles with embedded WiFi hotspots. The water is regular water. The WiFi is regular WiFi. But the bottle costs $89 and the subscription is $15/mo. VCs love it.",
      market_signals: ["Sequoia led the seed round (they won't confirm)", "$5M in pre-orders from tech bros", "the WiFi doesn't actually work underwater"],
    },
    es: {
      tagline: "Agua pero con WiFi. No hagas preguntas.",
      description: "Botellas de agua inteligentes con hotspot WiFi integrado. El agua es agua normal. El WiFi es WiFi normal. Pero la botella cuesta $89 y la suscripción es $15/mes. A los VCs les encanta.",
      market_signals: ["Sequoia lideró la ronda seed (no lo confirman)", "$5M en preventas de tech bros", "el WiFi en realidad no funciona bajo el agua"],
    },
  },
  {
    id: "meme-13", name: "TherapizeMe", categoryEmoji: "🛋️", categoryColor: "#a855f7",
    rarity: "uncommon", difficulty: 2, hypeScore: 7, successProb: 0.60, returnMultiplier: 2.7,
    en: {
      tagline: "Uber for therapy. But the therapists are AI. And the AI is a chatbot. And the chatbot is just Eliza from 1966.",
      description: "Why pay $200/hr for a real therapist when you can pay $49/mo for a 1960s chatbot that says 'How does that make you feel?' on loop? Now with NFT mood rings.",
      market_signals: ["600% increase in users since the CEO's viral TED talk", "lawsuit from the APA pending", "users report it 'actually kind of helps' (placebo effect)"],
    },
    es: {
      tagline: "Uber para terapia. Pero los terapeutas son IA. Y la IA es un chatbot. Y el chatbot es solo Eliza, de 1966.",
      description: "¿Por qué pagar $200/hora por un terapeuta real cuando puedes pagar $49/mes por un chatbot de los 60 que repite 'y eso, ¿cómo te hace sentir?' en bucle? Ahora con anillos de humor NFT.",
      market_signals: ["aumento del 600% de usuarios desde la charla TED viral del CEO", "demanda pendiente de la APA", "los usuarios dicen que 'de hecho algo ayuda' (efecto placebo)"],
    },
  },
  {
    id: "meme-14", name: "GymCoin", categoryEmoji: "💪", categoryColor: "#10b981",
    rarity: "legendary", difficulty: 2, hypeScore: 8, successProb: 0.70, returnMultiplier: 3.8,
    en: {
      tagline: "A crypto you can only mine by doing bicep curls.",
      description: "GymCoin mining rig is a dumbbell with an accelerometer. Do a curl? Mine a coin. The coin has no market value but your arms look great. Powered by Proof of Gains.",
      market_signals: ["gym influencers are ALL IN — 200+ posts last week", "the blockchain is just a Google Sheet", "but 50k people are mining and getting jacked"],
    },
    es: {
      tagline: "Una cripto que solo puedes minar haciendo curls de bíceps.",
      description: "El equipo de minería de GymCoin es una mancuerna con acelerómetro. ¿Haces un curl? Minas una moneda. La moneda no tiene valor de mercado pero tus brazos se ven geniales. Impulsado por Proof of Gains.",
      market_signals: ["los influencers de gym van con TODO — 200+ posts la última semana", "la blockchain es solo una hoja de Google", "pero 50k personas están minando y poniéndose mamados"],
    },
  },
  {
    id: "meme-15", name: "SnoozeFest", categoryEmoji: "😴", categoryColor: "#6366f1",
    rarity: "common", difficulty: 1, hypeScore: 6, successProb: 0.50, returnMultiplier: 2.3,
    en: {
      tagline: "A social network where you only post when you're asleep.",
      description: "SnoozeFest uses your phone's accelerometer to detect sleep-talking, sleep-texting, and sleep-scrolling. Your unconscious posts go public. Your friends rate your dream content.",
      market_signals: ["viral after someone proposed in their sleep", "average user posts 3.2 things per night", "nobody remembers what they posted"],
    },
    es: {
      tagline: "Una red social donde solo publicas cuando estás dormido.",
      description: "SnoozeFest usa el acelerómetro de tu teléfono para detectar hablar, textear y scrollear dormido. Tus publicaciones inconscientes se hacen públicas. Tus amigos califican el contenido de tus sueños.",
      market_signals: ["viral después de que alguien propuso matrimonio dormido", "el usuario promedio publica 3.2 cosas por noche", "nadie recuerda qué publicó"],
    },
  },
  {
    id: "meme-16", name: "CouponDAO", categoryEmoji: "🎫", categoryColor: "#a855f7",
    rarity: "uncommon", difficulty: 4, hypeScore: 3, successProb: 0.10, returnMultiplier: 1.3,
    en: {
      tagline: "A decentralized autonomous organization for clipping coupons.",
      description: "Why clip coupons alone when you can do it on the blockchain? CouponDAO lets users collectively negotiate discounts at Subway. Gas fees: $14. Savings: $2.50.",
      market_signals: ["Web3 community is hyped (they don't know what coupons are)", "raised $12M in a token sale", "the only real partnership is with a single Subway franchise"],
    },
    es: {
      tagline: "Una organización autónoma descentralizada para recortar cupones.",
      description: "¿Por qué recortar cupones solo cuando puedes hacerlo en la blockchain? CouponDAO permite negociar descuentos en Subway de forma colectiva. Comisiones de gas: $14. Ahorro: $2.50.",
      market_signals: ["la comunidad Web3 está hypeada (no saben qué son los cupones)", "recaudó $12M en una venta de tokens", "la única alianza real es con una sola franquicia de Subway"],
    },
  },
  {
    id: "meme-17", name: "Platonic", categoryEmoji: "🤝", categoryColor: "#ec4899",
    rarity: "common", difficulty: 2, hypeScore: 4, successProb: 0.20, returnMultiplier: 1.6,
    en: {
      tagline: "Tinder but you swipe right to make friends. Nobody swipes right.",
      description: "Making friends as an adult is hard. Platonic makes it harder by adding dating-app anxiety to platonic relationships. Swipe right to be friends! (They never swipe back.)",
      market_signals: ["500k downloads but 0.3% match rate", "users report feeling MORE lonely", "but the UX is beautiful and investors love the pitch deck"],
    },
    es: {
      tagline: "Tinder pero deslizas a la derecha para hacer amigos. Nadie desliza a la derecha.",
      description: "Hacer amigos de adulto es difícil. Platonic lo hace más difícil añadiendo la ansiedad de las apps de citas a las relaciones platónicas. ¡Desliza a la derecha para ser amigos! (Nunca te devuelven el swipe.)",
      market_signals: ["500k descargas pero 0.3% de match", "los usuarios reportan sentirse MÁS solos", "pero la UX es hermosa y a los inversores les encanta el pitch deck"],
    },
  },
  {
    id: "meme-18", name: "CaffeinePatch", categoryEmoji: "⚡", categoryColor: "#f59e0b",
    rarity: "rare", difficulty: 2, hypeScore: 7, successProb: 0.55, returnMultiplier: 3.0,
    en: {
      tagline: "A nicotine patch but it's caffeine. Stick it on, never sleep again.",
      description: "Slow-release caffeine delivered transdermally. One patch = 12 cups of coffee. Side effects include: trembling, productivity, and a vague sense that you can see through time.",
      market_signals: ["Silicon Valley VCs are literally addicted", "$3M in pre-orders from Y Combinator batch", "FDA approval is 'pending' (they keep rejecting it)"],
    },
    es: {
      tagline: "Un parche de nicotina pero es cafeína. Póntelo y no vuelvas a dormir.",
      description: "Cafeína de liberación lenta administrada por vía transdérmica. Un parche = 12 tazas de café. Efectos secundarios: temblores, productividad y una vaga sensación de que puedes ver a través del tiempo.",
      market_signals: ["los VCs de Silicon Valley están literalmente adictos", "$3M en preventas del batch de Y Combinator", "la aprobación de la FDA está 'pendiente' (la siguen rechazando)"],
    },
  },
  {
    id: "meme-19", name: "RentAFriend", categoryEmoji: "🎭", categoryColor: "#ec4899",
    rarity: "uncommon", difficulty: 2, hypeScore: 6, successProb: 0.55, returnMultiplier: 2.5,
    en: {
      tagline: "Airbnb but you rent a friend's friend for social events.",
      description: "Need a plus-one for a wedding? A wingman for a bar? Someone to stand next to you in photos so you don't look alone? RentAFriend connects you with someone else's friend for $25/hr.",
      market_signals: ["massive demand during wedding season", "60% of renters become repeat customers", "the 'friends' are mostly aspiring actors"],
    },
    es: {
      tagline: "Airbnb pero rentas al amigo de un amigo para eventos sociales.",
      description: "¿Necesitas un acompañante para una boda? ¿Un wingman para un bar? ¿Alguien que se pare junto a ti en las fotos para no verte solo? RentAFriend te conecta con el amigo de alguien más por $25/hora.",
      market_signals: ["demanda masiva en temporada de bodas", "el 60% de quienes rentan repiten", "los 'amigos' son en su mayoría actores aspirantes"],
    },
  },
  {
    id: "meme-20", name: "CancelBot", categoryEmoji: "🤖", categoryColor: "#6366f1",
    rarity: "rare", difficulty: 1, hypeScore: 7, successProb: 0.65, returnMultiplier: 2.9,
    en: {
      tagline: "An AI that cancels your subscriptions before you forget. Also cancels plans.",
      description: "CancelBot auto-cancels free trials before they charge you. But it also cancels your dinner plans, your dentist appointments, and your gym membership. It just really likes canceling things.",
      market_signals: ["saves users $340/year on average", "but also cancels important things 12% of the time", "users are 'frustrated but addicted'"],
    },
    es: {
      tagline: "Una IA que cancela tus suscripciones antes de que se te olvide. También cancela planes.",
      description: "CancelBot cancela automáticamente las pruebas gratis antes de que te cobren. Pero también cancela tus cenas, tus citas con el dentista y tu membresía del gimnasio. Simplemente le gusta mucho cancelar cosas.",
      market_signals: ["ahorra a los usuarios $340/año en promedio", "pero también cancela cosas importantes el 12% de las veces", "los usuarios están 'frustrados pero adictos'"],
    },
  },
];

const ABSURD_LABEL = { en: "Absurd/Meme", es: "Absurdo/Meme" };

// Returns the absurd-product catalog with all copy resolved to `lang`.
export function getAbsurdProducts(lang) {
  const L = lang === "es" ? "es" : "en";
  return ABSURD.map((p) => ({
    id: p.id,
    name: p.name,
    categoryLabel: ABSURD_LABEL[L],
    categoryEmoji: p.categoryEmoji,
    categoryColor: p.categoryColor,
    rarity: p.rarity,
    difficulty: p.difficulty,
    hypeScore: p.hypeScore,
    successProb: p.successProb,
    returnMultiplier: p.returnMultiplier,
    tagline: p[L].tagline,
    description: p[L].description,
    market_signals: p[L].market_signals,
    verdict: p[L].verdict,
  }));
}

// ── Outcome flavor text (templates with {name} and {mult}) ───────────

export const OUTCOMES = {
  en: {
    win: [
      "🚀 {name} went VIRAL on TikTok! {mult}x return!",
      "📈 {name} got acquired by Meta for some reason! Huge payday!",
      "🔥 {name} hit #1 on Product Hunt! Investors are FOMOing in!",
      "💰 {name} raised a Series B at a $500M valuation! You're a genius!",
      "👑 {name} is now a household name. Literally. It's in people's houses.",
      "🤑 {name} IPO'd. You're on a yacht now. The yacht has WiFi.",
      "⭐ {name} got a shoutout from Elon on X. Stock mooned. You mooned.",
      "🎯 {name} pivoted to AI and 10x'd revenue overnight! Classic.",
    ],
    loss: [
      "💥 {name} flopped. The market wasn't ready (or ever will be).",
      "📉 {name} ran out of runway. Founder pivoted to an AI dog translator.",
      "💀 {name} got roasted on Twitter for 48 hours straight. Refund requests flooding in.",
      "🪦 {name} shut down. The CEO posted a LinkedIn apology. It has 3 likes.",
      "🔥 {name} literally caught fire. Product liability lawsuit incoming.",
      "📉 {name} was a scam. The founder is in Bali. You're not.",
      "💸 {name} burned through $50M in 8 months. All spent on branded swag.",
      "😭 {name} got disrupted by a 19-year-old's side project. Embarrassing.",
    ],
  },
  es: {
    win: [
      "🚀 ¡{name} se hizo VIRAL en TikTok! ¡Retorno de {mult}x!",
      "📈 ¡Meta compró {name} por alguna razón! ¡Pago enorme!",
      "🔥 ¡{name} llegó al #1 en Product Hunt! ¡Los inversores tienen FOMO!",
      "💰 ¡{name} levantó una Serie B con valoración de $500M! ¡Eres un genio!",
      "👑 {name} ahora es un nombre de casa. Literalmente. Está en las casas de la gente.",
      "🤑 {name} salió a bolsa. Ahora estás en un yate. El yate tiene WiFi.",
      "⭐ Elon mencionó a {name} en X. La acción se fue a la luna. Tú también.",
      "🎯 ¡{name} pivoteó a IA y 10x sus ingresos de la noche a la mañana! Clásico.",
    ],
    loss: [
      "💥 {name} fracasó. El mercado no estaba listo (ni lo estará).",
      "📉 {name} se quedó sin runway. El fundador pivoteó a un traductor de perros con IA.",
      "💀 Destrozaron a {name} en Twitter durante 48 horas seguidas. Lluvia de reembolsos.",
      "🪦 {name} cerró. El CEO publicó una disculpa en LinkedIn. Tiene 3 likes.",
      "🔥 {name} literalmente se prendió fuego. Se viene la demanda por responsabilidad del producto.",
      "📉 {name} era una estafa. El fundador está en Bali. Tú no.",
      "💸 {name} quemó $50M en 8 meses. Todo en merch de marca.",
      "😭 A {name} lo disrumpió el proyecto paralelo de un chico de 19 años. Vergonzoso.",
    ],
  },
};

// Pass-branch flavor + verdict fallbacks (templates with {mult} / {signal}).
export const FLAVOR = {
  en: {
    passRevealed: "You passed. Safe play. (Boring.)",
    passWouldHit: "It would've hit — {mult}x left on the table.",
    passGoodCall: "Good call. This one was heading for the graveyard.",
    winNoSignal: "The market actually loved it. Sometimes the hype is real.",
    lossNoSignal: "The hype evaporated. Sometimes a meme is just a meme.",
    winSignal: 'You read it right — "{signal}" was the signal that mattered.',
    lossSignal: 'The tell was right there: "{signal}".',
  },
  es: {
    passRevealed: "Pasaste. Jugada segura. (Aburrido.)",
    passWouldHit: "Habría pegado — dejaste {mult}x sobre la mesa.",
    passGoodCall: "Buena decisión. Este iba directo al cementerio.",
    winNoSignal: "Al mercado de verdad le encantó. A veces el hype es real.",
    lossNoSignal: "El hype se evaporó. A veces un meme es solo un meme.",
    winSignal: 'Lo leíste bien — "{signal}" era la señal que importaba.',
    lossSignal: 'La pista estaba ahí mismo: "{signal}".',
  },
};

// Keyword heuristics for picking the "decisive" signal, per language.
export const SIGNAL_WORDS = {
  en: {
    green: ["viral", "profitable", "retention", "sold out", "dau", "downloads", "signups", "sign-ups", "margin", "invested", "revenue", "growth", "booked", "pre-order", "preorder", "#1", "acquired", "sticky", "adoption", "exits", "love", "sold-out"],
    red: ["no ", "not ", "n't", "nobody", "nightmare", "regulatory", "sec ", "tos", "throw it away", "throw them away", "scam", "lawsuit", "illegal", "ban", "churn", "refund", "no real value", "no monetization", "caught fire", "sued", "disagree", "looking into it"],
  },
  es: {
    green: ["viral", "rentable", "retención", "agotad", "usuarios diarios", "descargas", "registros", "margen", "invirtió", "invirtieron", "ingresos", "crecimiento", "preventa", "#1", "adopción", "exits", "encanta", "repiten", "alianza", "recaudó"],
    red: ["no ", "nadie", "pesadilla", "regulator", "sec ", "términos", "tira a la basura", "estafa", "demanda", "ilegal", "prohib", "reembolso", "sin valor", "sin monetización", "fuego", "investigando", "no opinan", "se cayeron", "polémico", "frustrados", "se cae"],
  },
};

// ── Booster shop items ───────────────────────────────────────────────

const BOOSTERS = [
  { id: "reroll", cost_shark_coins: 50, icon: "🎲", rarity: "common", usable_in_daily: true, en: { name: "Reroll", description: "Get a new product instead of the current one" }, es: { name: "Reroll", description: "Consigue un producto nuevo en lugar del actual" } },
  { id: "hint", cost_shark_coins: 100, icon: "🔍", rarity: "uncommon", usable_in_daily: true, en: { name: "Insider Hint", description: "Reveal the hidden hype score" }, es: { name: "Pista de infiltrado", description: "Revela el hype score oculto" } },
  { id: "insurance", cost_shark_coins: 150, icon: "🛡️", rarity: "rare", usable_in_daily: true, en: { name: "Insurance", description: "Get 50% of your investment back if you lose" }, es: { name: "Seguro", description: "Recupera el 50% de tu inversión si pierdes" } },
  { id: "double_down", cost_shark_coins: 200, icon: "⚡", rarity: "rare", usable_in_daily: false, en: { name: "Double Down", description: "Double your potential return (and loss)" }, es: { name: "Doblar la apuesta", description: "Duplica tu retorno potencial (y tu pérdida)" } },
  { id: "streak_shield", cost_shark_coins: 75, icon: "🛡️", rarity: "uncommon", usable_in_daily: true, en: { name: "Streak Shield", description: "Protect your daily streak for one day" }, es: { name: "Escudo de racha", description: "Protege tu racha diaria por un día" } },
];

export function getBoosters(lang) {
  const L = lang === "es" ? "es" : "en";
  return BOOSTERS.map((b) => ({
    id: b.id,
    name: b[L].name,
    description: b[L].description,
    cost_shark_coins: b.cost_shark_coins,
    icon: b.icon,
    rarity: b.rarity,
    owned_quantity: 0,
    usable_in_daily: b.usable_in_daily,
  }));
}

// Fill {placeholders} in a template string.
export function fill(template, vars) {
  let out = template;
  for (const [k, v] of Object.entries(vars || {})) {
    out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}
