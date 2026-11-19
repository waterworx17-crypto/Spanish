/* =====================================================================
   phrases.js - ALL THE PHRASES, AS DATA

   The app builds every screen from this list. To change a phrase, fix
   the Spanish, or add one, edit this file only.

   A phrase is written:   p("English", "Spanish", { extras })

   Optional extras:
     alt:     a backup way to say it. If the first one fails, the app
              offers this next time.
     fill:    choices for the ___ blank, as ["English", "Spanish"] pairs
     note:    a short tip shown under the phrase
     replies: what they might say back, as ["Spanish", "English"] pairs

   Each category also has a "replies" list: things you're likely to hear.
   Spanish is from Spain (Andalucía), polite "usted" form for strangers.
   ===================================================================== */

function p(en, es, extras) { return Object.assign({ en, es }, extras || {}); }

// Choice lists used by more than one phrase
const PEOPLE = [["two", "dos"], ["three", "tres"], ["four", "cuatro"], ["five", "cinco"], ["six", "seis"], ["one", "uno"]];
const LOST_THINGS = [["my wallet", "la cartera"], ["my passport", "el pasaporte"], ["my phone", "el móvil"],
  ["my keys", "las llaves"], ["my bag", "el bolso"], ["my car keys", "las llaves del coche"]];

const CATEGORIES = [

  /* ------------------------------------------------------------ */
  { id: "basics", name: "Basics & courtesy", es: "Lo básico", icon: "chat", tone: "blue",
    sections: [
      { title: "Hello & goodbye", phrases: [
        p("Hello", "Hola"),
        p("Hi (casual, any time of day)", "¡Buenas!", { note: "Very Andalusian. Works morning, afternoon or night." }),
        p("Good morning", "Buenos días"),
        p("Good afternoon / evening", "Buenas tardes", { note: "Used from about 2 pm until dark." }),
        p("Good night", "Buenas noches"),
        p("How are you?", "¿Qué tal?"),
        p("Fine, thank you", "Bien, gracias"),
        p("Goodbye", "Adiós"),
        p("See you later", "Hasta luego", { note: "Spaniards say this even to people they'll never see again." }),
      ]},
      { title: "Being polite", phrases: [
        p("Please", "Por favor"),
        p("Thank you very much", "Muchas gracias"),
        p("You're welcome", "De nada"),
        p("Excuse me (to get attention)", "Perdone"),
        p("Excuse me (to get past)", "Con permiso"),
        p("Sorry", "Lo siento", { alt: "Perdón" }),
        p("Yes, please", "Sí, por favor"),
        p("No, thank you", "No, gracias"),
        p("Okay / fine", "Vale"),
        p("One moment, please", "Un momento, por favor"),
      ]},
      { title: "When you don't understand", phrases: [
        p("I don't speak much Spanish", "No hablo mucho español"),
        p("I don't understand", "No entiendo", { alt: "Perdone, no le entiendo" }),
        p("Could you speak more slowly, please?", "¿Puede hablar más despacio, por favor?", { alt: "Más despacio, por favor" }),
        p("Could you repeat that, please?", "¿Puede repetirlo, por favor?", { alt: "¿Cómo dice?" }),
        p("Do you speak English?", "¿Habla usted inglés?"),
        p("Could you write it down?", "¿Me lo puede escribir?"),
        p("How do you say this in Spanish?", "¿Cómo se dice esto en español?"),
      ]},
      { title: "About me", phrases: [
        p("I live in Mijas", "Vivo en Mijas"),
        p("I'm from the United States", "Soy de Estados Unidos"),
        p("I spend part of the year here", "Paso parte del año aquí"),
        p("I'm learning Spanish", "Estoy aprendiendo español"),
      ]},
    ],
    replies: [
      ["Dígame", "Yes? / How can I help?"], ["¿Le puedo ayudar?", "Can I help you?"],
      ["¿De dónde es usted?", "Where are you from?"], ["Claro", "Of course"],
      ["No pasa nada", "No problem / don't worry"], ["Venga, hasta luego", "OK, see you"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "restaurant", name: "Restaurant & bar", es: "Restaurante y bar", icon: "utensils", tone: "red",
    sections: [
      { title: "Arriving", phrases: [
        p("A table for ___, please", "Una mesa para ___, por favor", { fill: PEOPLE,
          replies: [["¿Dentro o fuera?", "Inside or outside?"], ["¿Tienen reserva?", "Do you have a reservation?"]] }),
        p("Do you have a table outside?", "¿Tienen mesa en la terraza?"),
        p("We have a reservation", "Tenemos una reserva"),
        p("Is the kitchen open?", "¿Está abierta la cocina?", { note: "Kitchens often close between lunch and dinner (about 4–8 pm)." }),
      ]},
      { title: "Ordering", phrases: [
        p("The menu, please", "La carta, por favor"),
        p("Do you have a menu in English?", "¿Tienen la carta en inglés?"),
        p("What's the set menu today?", "¿Qué hay de menú del día?"),
        p("What do you recommend?", "¿Qué me recomienda?"),
        p("I'd like ___, please", "Me pone ___, por favor", { alt: "Quería ___, por favor",
          note: "\"Me pone…\" is how people order in Spain.",
          fill: [["a coffee with milk", "un café con leche"], ["a small draught beer", "una caña"],
            ["a glass of red wine", "una copa de vino tinto"], ["a glass of white wine", "una copa de vino blanco"],
            ["a tinto de verano", "un tinto de verano"], ["a bottle of water", "una botella de agua"],
            ["sparkling water", "un agua con gas"], ["still water", "un agua sin gas"],
            ["a fresh orange juice", "un zumo de naranja natural"]],
          replies: [["¿Grande o pequeña?", "Large or small?"], ["¿Del tiempo o fría?", "Room temperature or cold?"]] }),
        p("A black coffee", "Un café solo"),
        p("A coffee with a dash of milk", "Un cortado"),
        p("A coffee, half milk (Málaga style)", "Un mitad", { note: "Málaga has its own coffee names: solo, cortado, mitad, sombra (mostly milk)." }),
        p("Toast with tomato and olive oil", "Una tostada con tomate y aceite"),
        p("Same again, please", "Lo mismo, por favor", { alt: "Otra igual, por favor" }),
        p("Half a portion, please", "Media ración, por favor", { note: "Ración = a full sharing plate. Tapa = a small one." }),
        p("To share", "Para compartir"),
        p("I'm allergic to ___", "Soy alérgico a ___", { note: "A woman says \"alérgica\".",
          fill: [["nuts", "los frutos secos"], ["shellfish", "el marisco"], ["gluten", "el gluten"], ["dairy", "la lactosa"], ["eggs", "el huevo"]] }),
        p("Without onion, please", "Sin cebolla, por favor"),
        p("Is it spicy?", "¿Pica?"),
        p("Medium, please (steak)", "Al punto, por favor", { note: "Rare = poco hecho. Well done = muy hecho." }),
      ]},
      { title: "During the meal", phrases: [
        p("Excuse me! (to the waiter)", "¡Perdone!"),
        p("Could we have some more bread?", "¿Nos trae más pan, por favor?"),
        p("Where are the toilets?", "¿Dónde están los servicios?", { alt: "¿Dónde está el baño?" }),
        p("It was delicious", "Estaba buenísimo"),
      ]},
      { title: "Paying", phrases: [
        p("The bill, please", "La cuenta, por favor", { alt: "¿Me cobra, por favor?",
          replies: [["¿Juntos o separados?", "Together or separately?"], ["¿Con tarjeta o en efectivo?", "Card or cash?"]] }),
        p("Can I pay by card?", "¿Puedo pagar con tarjeta?"),
        p("Separately, please", "Por separado, por favor"),
        p("Keep the change", "Quédese con el cambio"),
      ]},
    ],
    replies: [
      ["¿Qué le pongo?", "What can I get you?"], ["¿Para beber?", "To drink?"], ["¿Algo más?", "Anything else?"],
      ["¿Para tomar aquí o para llevar?", "For here or to take away?"], ["Ahora mismo", "Right away"],
      ["Se nos ha acabado", "We've run out of it"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "grocery", name: "Grocery shopping", es: "El supermercado", icon: "basket", tone: "green",
    sections: [
      { title: "Finding things", phrases: [
        p("Where is ___?", "¿Dónde está ___?", { fill: [["the milk", "la leche"], ["the bread", "el pan"],
          ["the eggs", "los huevos"], ["the olive oil", "el aceite de oliva"], ["the coffee", "el café"],
          ["the wine", "el vino"], ["the toilet paper", "el papel higiénico"], ["the washing powder", "el detergente"]],
          replies: [["En el pasillo cinco", "In aisle five"], ["Al fondo", "At the back"]] }),
        p("Do you have ___?", "¿Tienen ___?", { fill: [["oat milk", "leche de avena"], ["skimmed milk", "leche desnatada"],
          ["decaf coffee", "café descafeinado"], ["gluten-free bread", "pan sin gluten"], ["batteries", "pilas"]] }),
      ]},
      { title: "At the counter", phrases: [
        p("Who's last in the queue?", "¿Quién es el último?", { alt: "¿Quién va el último?",
          note: "Essential in Spain: ask this, and remember who answers. You go after them." }),
        p("It's my turn", "Me toca a mí"),
        p("200 grams of ham, please", "Doscientos gramos de jamón, por favor"),
        p("A quarter kilo of ___, please", "Un cuarto de kilo de ___, por favor", { fill: [["cheese", "queso"],
          ["ham", "jamón"], ["prawns", "gambas"], ["olives", "aceitunas"], ["tomatoes", "tomates"]] }),
        p("Half a kilo, please", "Medio kilo, por favor"),
        p("Thinly sliced, please", "Cortado fino, por favor"),
        p("A baguette, please", "Una barra de pan, por favor"),
        p("Is it from today?", "¿Es de hoy?"),
        p("Can I taste it?", "¿Puedo probarlo?"),
        p("That's enough, thank you", "Así está bien, gracias"),
      ]},
      { title: "Paying", phrases: [
        p("A bag, please", "Una bolsa, por favor"),
        p("I don't need a bag, thanks", "No necesito bolsa, gracias"),
        p("I don't have a loyalty card", "No tengo tarjeta de cliente"),
        p("Do you take card?", "¿Aceptan tarjeta?"),
      ]},
    ],
    replies: [
      ["¿Algo más?", "Anything else?"], ["¿Quiere bolsa?", "Do you want a bag?"],
      ["¿Tiene tarjeta de cliente?", "Do you have a loyalty card?"], ["¿Le pongo un poco más?", "A bit more?"],
      ["Me he pasado un poco, ¿vale?", "It's a little over, is that OK?"], ["Son doce euros con cuarenta", "That's €12.40"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "weather", name: "Weather", es: "El tiempo", icon: "sun", tone: "ochre",
    sections: [
      { title: "Asking", phrases: [
        p("What's the weather going to be like tomorrow?", "¿Qué tiempo va a hacer mañana?"),
        p("Is it going to rain?", "¿Va a llover?"),
        p("What's the temperature?", "¿Qué temperatura hace?"),
        p("Is there an east wind (Levante) today?", "¿Hay levante hoy?", { note: "Levante (east) and Poniente (west) are the big winds on this coast." }),
        p("How's the sea today?", "¿Cómo está el mar hoy?"),
        p("Do I need a jacket?", "¿Hace falta chaqueta?"),
        p("Is there a storm warning?", "¿Hay aviso de tormenta?"),
      ]},
      { title: "Small talk", phrases: [
        p("It's very hot!", "¡Hace mucho calor!", { alt: "¡Qué calor!" }),
        p("It's cold", "Hace frío"),
        p("It's windy", "Hace viento"),
        p("It's sunny", "Hace sol"),
        p("It's raining", "Está lloviendo"),
        p("It's cloudy", "Está nublado"),
        p("What a lovely day!", "¡Qué día más bonito!"),
      ]},
    ],
    replies: [
      ["Va a hacer bueno", "It's going to be nice"], ["Mañana llueve", "It's raining tomorrow"],
      ["Hay terral", "The terral (hot dry wind from inland) is blowing"], ["Refresca por la noche", "It gets cool at night"],
      ["Hace un día de playa", "It's a beach day"], ["El mar está picado", "The sea is choppy"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "travel", name: "Travel & flying", es: "Viajar", icon: "plane", tone: "blue",
    sections: [
      { title: "At the airport", phrases: [
        p("Where is the check-in desk?", "¿Dónde está el mostrador de facturación?"),
        p("I'd like to check in this bag", "Quiero facturar esta maleta"),
        p("I only have hand luggage", "Solo llevo equipaje de mano"),
        p("A window seat, please", "Ventanilla, por favor"),
        p("An aisle seat, please", "Pasillo, por favor"),
        p("Which gate is it?", "¿Cuál es la puerta de embarque?"),
        p("Is the flight delayed?", "¿El vuelo va con retraso?"),
        p("My flight has been cancelled", "Me han cancelado el vuelo"),
        p("Where is baggage reclaim?", "¿Dónde se recogen las maletas?"),
        p("My suitcase hasn't arrived", "Mi maleta no ha llegado"),
        p("Where is passport control?", "¿Dónde está el control de pasaportes?"),
      ]},
      { title: "Trains & buses", phrases: [
        p("Where do I get the train to Fuengirola?", "¿Dónde se coge el tren para Fuengirola?", { note: "The Cercanías C1 runs airport – Málaga – Fuengirola." }),
        p("A ticket to ___, please", "Un billete para ___, por favor", { fill: [["Fuengirola", "Fuengirola"],
          ["Málaga centre", "Málaga Centro"], ["Torremolinos", "Torremolinos"], ["Marbella", "Marbella"], ["Seville", "Sevilla"]] }),
        p("Return, please", "Ida y vuelta, por favor"),
        p("One way, please", "Solo ida, por favor"),
        p("What time does it leave?", "¿A qué hora sale?"),
        p("Which platform?", "¿De qué andén sale?"),
        p("Does this bus go to ___?", "¿Este autobús va a ___?", { fill: [["La Cala de Mijas", "La Cala de Mijas"],
          ["Mijas Pueblo", "Mijas Pueblo"], ["Fuengirola", "Fuengirola"], ["Marbella", "Marbella"], ["the airport", "el aeropuerto"]] }),
        p("Is this seat free?", "¿Está libre este asiento?"),
      ]},
    ],
    replies: [
      ["Su pasaporte, por favor", "Your passport, please"], ["¿Cuántas maletas va a facturar?", "How many bags are you checking in?"],
      ["¿Ventanilla o pasillo?", "Window or aisle?"], ["Lleva retraso", "It's delayed"],
      ["Tiene que hacer transbordo en…", "You have to change at…"], ["Sale del andén dos", "It leaves from platform two"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "clothes", name: "Clothes & shoes", es: "Ropa y zapatos", icon: "shirt", tone: "teal",
    sections: [
      { title: "Browsing", phrases: [
        p("I'm just looking, thanks", "Solo estoy mirando, gracias"),
        p("How much is it?", "¿Cuánto cuesta?"),
        p("Is it on sale?", "¿Está rebajado?"),
        p("Do you have it in another colour?", "¿Lo tiene en otro color?"),
      ]},
      { title: "Trying on", phrases: [
        p("Can I try it on?", "¿Me lo puedo probar?"),
        p("Where are the fitting rooms?", "¿Dónde están los probadores?"),
        p("Do you have a bigger size?", "¿Tiene una talla más grande?"),
        p("Do you have a smaller size?", "¿Tiene una talla más pequeña?"),
        p("It's too tight", "Me queda estrecho"),
        p("It's too big", "Me queda grande"),
        p("It fits well", "Me queda bien"),
      ]},
      { title: "Shoes", phrases: [
        p("Do you have these in size ___?", "¿Los tiene en el ___?", { note: "European sizes. Men's US 9 ≈ 42.",
          fill: [["41 (US 8)", "cuarenta y uno"], ["42 (US 9)", "cuarenta y dos"], ["43 (US 10)", "cuarenta y tres"],
            ["44 (US 10½)", "cuarenta y cuatro"], ["45 (US 11)", "cuarenta y cinco"], ["46 (US 12)", "cuarenta y seis"]],
          replies: [["¿Qué número calza?", "What shoe size are you?"]] }),
        p("They're comfortable", "Son cómodos"),
        p("Do you have trainers?", "¿Tienen zapatillas de deporte?"),
      ]},
      { title: "Buying", phrases: [
        p("I'll take it", "Me lo llevo"),
        p("Can I return it?", "¿Se puede devolver?"),
        p("I'd like to return this", "Quería devolver esto"),
      ]},
    ],
    replies: [
      ["¿Le puedo ayudar?", "Can I help you?"], ["¿Qué talla usa?", "What size are you?"],
      ["Los probadores están al fondo", "The fitting rooms are at the back"], ["¿Quiere tique regalo?", "Do you want a gift receipt?"],
      ["Tiene un veinte por ciento de descuento", "It's 20% off"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "golf", name: "Golf course", es: "El campo de golf", icon: "flag", tone: "green",
    sections: [
      { title: "At the pro shop", phrases: [
        p("I have a tee time at ___", "Tengo hora de salida a las ___", { fill: [["9:00", "nueve"], ["9:30", "nueve y media"],
          ["10:00", "diez"], ["10:30", "diez y media"], ["11:00", "once"], ["12:00", "doce"]],
          replies: [["¿A nombre de quién?", "Under what name?"]] }),
        p("Do you have a tee time today?", "¿Tienen hora de salida para hoy?"),
        p("We're ___ players", "Somos ___ jugadores", { fill: PEOPLE.slice(0, 3) }),
        p("How much is the green fee?", "¿Cuánto cuesta el green fee?"),
        p("I'd like to rent a buggy", "Quería alquilar un buggy"),
        p("A pull trolley, please", "Un carro de mano, por favor", { alt: "Un carrito, por favor" }),
        p("Can I rent clubs?", "¿Se pueden alquilar palos?"),
        p("My handicap is ___", "Mi hándicap es ___", { fill: [["12", "doce"], ["15", "quince"], ["18", "dieciocho"],
          ["20", "veinte"], ["24", "veinticuatro"], ["28", "veintiocho"]] }),
        p("Where can I buy balls?", "¿Dónde puedo comprar bolas?"),
      ]},
      { title: "Getting ready", phrases: [
        p("Where is the first tee?", "¿Dónde está el tee del uno?"),
        p("Where is the driving range?", "¿Dónde está el campo de prácticas?"),
        p("A bucket of balls, please", "Un cubo de bolas, por favor"),
        p("Where are the changing rooms?", "¿Dónde están los vestuarios?"),
        p("Can I leave my bag here?", "¿Puedo dejar la bolsa aquí?"),
        p("Is the course busy today?", "¿Hay mucha gente hoy en el campo?"),
        p("Can buggies go on the fairway?", "¿Pueden ir los buggies por la calle?", { note: "Fairway = la calle." }),
        p("Can we join another group?", "¿Podemos unirnos a otro grupo?"),
      ]},
      { title: "On the course", phrases: [
        p("Fore!", "¡Bola!", { note: "Spanish golfers shout \"¡Bola!\"" }),
        p("Please play through", "Pasen, por favor"),
        p("Nice shot!", "¡Buen golpe!"),
        p("Is this your ball?", "¿Es suya esta bola?"),
      ]},
    ],
    replies: [
      ["¿Es socio?", "Are you a member?"], ["Salen a las diez", "You tee off at ten"],
      ["El buggy está fuera", "The buggy is outside"], ["Solo por caminos", "Paths only"],
      ["Hay retraso en el campo", "The course is running behind"], ["¿Cuál es su hándicap?", "What's your handicap?"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "directions", name: "Directions & taxi", es: "Direcciones y taxi", icon: "compass", tone: "ochre",
    sections: [
      { title: "Finding the way", phrases: [
        p("Where is ___?", "¿Dónde está ___?", { fill: [["the beach", "la playa"], ["the town hall", "el ayuntamiento"],
          ["the bus station", "la estación de autobuses"], ["the train station", "la estación de tren"],
          ["the market", "el mercado"], ["a cash machine", "un cajero"], ["the nearest pharmacy", "la farmacia más cercana"]] }),
        p("Is it far?", "¿Está lejos?"),
        p("Can I walk there?", "¿Se puede ir andando?"),
        p("I'm lost", "Me he perdido"),
        p("Can you show me on the map?", "¿Me lo puede enseñar en el mapa?"),
      ]},
      { title: "Taxi", phrases: [
        p("Could you call me a taxi?", "¿Me puede llamar un taxi?"),
        p("To ___, please", "A ___, por favor", { fill: [["La Cala de Mijas", "La Cala de Mijas"], ["Mijas Pueblo", "Mijas Pueblo"],
          ["Fuengirola", "Fuengirola"], ["Marbella", "Marbella"], ["this address", "esta dirección"]] }),
        p("To the airport, please", "Al aeropuerto, por favor"),
        p("How much is it to the airport?", "¿Cuánto cuesta hasta el aeropuerto?"),
        p("Stop here, please", "Pare aquí, por favor"),
        p("Could you wait for me?", "¿Me puede esperar?"),
        p("Do you take card?", "¿Acepta tarjeta?"),
      ]},
    ],
    replies: [
      ["A la derecha", "On the right"], ["A la izquierda", "On the left"], ["Todo recto", "Straight on"],
      ["En la rotonda", "At the roundabout"], ["La segunda calle", "The second street"],
      ["Al final de la calle", "At the end of the street"], ["Está a cinco minutos andando", "It's a five-minute walk"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "pharmacy", name: "Pharmacy & doctor", es: "Farmacia y médico", icon: "cross", tone: "green",
    sections: [
      { title: "Pharmacy", phrases: [
        p("I need something for ___", "Necesito algo para ___", { fill: [["a headache", "el dolor de cabeza"],
          ["a cold", "el resfriado"], ["a sore throat", "el dolor de garganta"], ["a cough", "la tos"],
          ["an upset stomach", "el estómago"], ["sunburn", "las quemaduras del sol"],
          ["insect bites", "las picaduras"], ["allergies", "la alergia"]] }),
        p("Do you have ibuprofen?", "¿Tiene ibuprofeno?"),
        p("Do you have paracetamol?", "¿Tiene paracetamol?"),
        p("Do I need a prescription?", "¿Hace falta receta?"),
        p("How many a day?", "¿Cuántas al día?"),
        p("Before or after meals?", "¿Antes o después de comer?"),
        p("I take this medication", "Tomo esta medicación", { note: "Show them the box or a photo of it." }),
        p("Is there an all-night pharmacy open?", "¿Hay alguna farmacia de guardia?", { note: "Pharmacies take turns staying open at night. Look for the \"de guardia\" list on the door." }),
      ]},
      { title: "Doctor", phrases: [
        p("I need to see a doctor", "Necesito ver a un médico"),
        p("I'd like to make an appointment", "Quería pedir cita"),
        p("It hurts here", "Me duele aquí"),
        p("I've had it for ___ days", "Lo tengo desde hace ___ días", { fill: [["two", "dos"], ["three", "tres"], ["five", "cinco"], ["seven", "siete"]] }),
        p("I have a fever", "Tengo fiebre"),
        p("I feel dizzy", "Estoy mareado", { note: "A woman says \"mareada\"." }),
        p("I'm allergic to penicillin", "Soy alérgico a la penicilina"),
        p("I have travel insurance", "Tengo seguro de viaje", { alt: "Tengo seguro médico privado" }),
      ]},
    ],
    replies: [
      ["¿Qué le pasa?", "What's the matter?"], ["¿Dónde le duele?", "Where does it hurt?"], ["¿Desde cuándo?", "Since when?"],
      ["¿Es alérgico a algo?", "Are you allergic to anything?"], ["Una cada ocho horas", "One every eight hours"],
      ["Con la comida", "With food"], ["Necesita receta", "You need a prescription"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "emergency", name: "Emergencies", es: "Emergencias", icon: "alert", tone: "urgent",
    info: "Emergency number in Spain: 112. It's free and they speak English.",
    sections: [
      { title: "Get help now", phrases: [
        p("Help!", "¡Socorro!", { alt: "¡Ayuda!" }),
        p("Call an ambulance!", "¡Llame a una ambulancia!"),
        p("Call the police!", "¡Llame a la policía!"),
        p("Fire!", "¡Fuego!"),
        p("It's an emergency", "Es una emergencia"),
        p("I need help", "Necesito ayuda"),
        p("Someone is hurt", "Hay un herido"),
        p("I have chest pain", "Me duele el pecho"),
        p("Where is the nearest hospital?", "¿Dónde está el hospital más cercano?"),
        p("Is there anyone who speaks English?", "¿Hay alguien que hable inglés?"),
        p("Can I use your phone?", "¿Puedo usar su teléfono?"),
      ]},
      { title: "Lost or stolen", phrases: [
        p("I've had an accident", "He tenido un accidente"),
        p("I've lost ___", "He perdido ___", { fill: LOST_THINGS }),
        p("Someone has stolen ___", "Me han robado ___", { fill: LOST_THINGS }),
        p("I'd like to report a theft", "Quiero denunciar un robo"),
      ]},
    ],
    replies: [
      ["¿Está bien?", "Are you OK?"], ["Tranquilo", "Stay calm"], ["¿Qué ha pasado?", "What happened?"],
      ["¿Dónde está?", "Where are you?"], ["Ya viene la ambulancia", "The ambulance is on its way"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "car", name: "Car & petrol", es: "Coche y gasolinera", icon: "car", tone: "teal",
    sections: [
      { title: "Petrol station", phrases: [
        p("Fill it up, please", "Lleno, por favor"),
        p("___ euros of fuel, please", "___ euros, por favor", { fill: [["20", "Veinte"], ["30", "Treinta"],
          ["40", "Cuarenta"], ["50", "Cincuenta"]] }),
        p("Pump number ___", "El surtidor número ___", { note: "When paying inside, give your pump number.",
          fill: [["1", "uno"], ["2", "dos"], ["3", "tres"], ["4", "cuatro"], ["5", "cinco"], ["6", "seis"], ["7", "siete"], ["8", "ocho"]] }),
        p("Unleaded 95", "Sin plomo noventa y cinco", { note: "Diesel = gasóleo or diésel." }),
        p("Is it self-service?", "¿Es autoservicio?"),
        p("Where can I check the tyre pressure?", "¿Dónde puedo mirar la presión de las ruedas?"),
      ]},
      { title: "Parking", phrases: [
        p("Can I park here?", "¿Se puede aparcar aquí?"),
        p("Is there a car park near here?", "¿Hay un aparcamiento por aquí?"),
        p("How much is it per hour?", "¿Cuánto es la hora?"),
        p("Where do I pay for parking?", "¿Dónde se paga el aparcamiento?"),
      ]},
      { title: "Car hire", phrases: [
        p("I have a car hire booking", "Tengo una reserva de coche de alquiler"),
        p("Is the insurance included?", "¿El seguro está incluido?"),
        p("Is it full to full?", "¿Es lleno a lleno?", { note: "Full to full = pick it up full, return it full." }),
        p("The car has a scratch here", "El coche tiene un arañazo aquí"),
      ]},
      { title: "Problems", phrases: [
        p("My car has broken down", "Se me ha averiado el coche"),
        p("I have a flat tyre", "Tengo una rueda pinchada"),
        p("Could you check the oil?", "¿Me puede revisar el aceite?"),
      ]},
    ],
    replies: [
      ["¿Qué surtidor?", "Which pump?"], ["¿Gasolina o diésel?", "Petrol or diesel?"],
      ["Es zona azul", "It's a pay-and-display zone (blue lines)"], ["Aquí no se puede aparcar", "You can't park here"],
      ["Hay que devolverlo lleno", "You have to return it full"], ["La franquicia es de trescientos euros", "The excess is €300"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "post", name: "Post & parcels", es: "Correos y paquetes", icon: "box", tone: "ochre",
    sections: [
      { title: "Picking up", phrases: [
        p("I've come to pick up a parcel", "Vengo a recoger un paquete"),
        p("Here's the pickup code", "Aquí tiene el código de recogida"),
        p("They left me a notice", "Me han dejado un aviso"),
        p("It's in my name", "Está a mi nombre"),
        p("Is there a parcel for me?", "¿Hay algún paquete para mí?"),
      ]},
      { title: "Sending", phrases: [
        p("I'd like to send this to the United States", "Quiero mandar esto a Estados Unidos"),
        p("How much does it cost to send?", "¿Cuánto cuesta mandarlo?"),
        p("How long does it take?", "¿Cuánto tarda en llegar?"),
        p("Stamps for postcards to the US, please", "Sellos para postales a Estados Unidos, por favor"),
        p("By registered post, please", "Certificado, por favor"),
        p("Does it need a customs form?", "¿Hace falta declaración de aduana?"),
        p("I'd like to return a parcel", "Quiero devolver un paquete"),
      ]},
    ],
    replies: [
      ["¿Me deja el pasaporte?", "Can I see your passport?"], ["¿Tiene el NIE?", "Do you have your NIE (foreigner ID number)?"],
      ["¿Qué contiene?", "What's inside?"], ["Firme aquí", "Sign here"], ["Tarda unos diez días", "It takes about ten days"],
      ["Todavía no ha llegado", "It hasn't arrived yet"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "hardware", name: "Hardware store", es: "La ferretería", icon: "wrench", tone: "red",
    sections: [
      { title: "Asking for things", phrases: [
        p("Do you have ___?", "¿Tienen ___?", { fill: [["screws", "tornillos"], ["nails", "clavos"],
          ["wall plugs", "tacos"], ["nuts and bolts", "tuercas y tornillos"], ["washers", "arandelas"],
          ["sandpaper", "papel de lija"], ["electrical tape", "cinta aislante"], ["silicone sealant", "silicona"],
          ["wood glue", "cola de carpintero"], ["super glue", "pegamento instantáneo"], ["batteries", "pilas"]] }),
        p("I'm looking for ___", "Estoy buscando ___", { fill: [["a screwdriver", "un destornillador"],
          ["a hammer", "un martillo"], ["pliers", "unos alicates"], ["an adjustable spanner", "una llave inglesa"],
          ["a drill bit", "una broca"], ["a tape measure", "un metro"], ["a spirit level", "un nivel"],
          ["a saw", "una sierra"], ["a padlock", "un candado"], ["a ladder", "una escalera"]] }),
        p("I need something like this", "Necesito algo como esto", { note: "Show them the old part or a photo. It's the fastest way.",
          replies: [["¿Para qué es?", "What's it for?"], ["¿Tiene la pieza vieja?", "Do you have the old part?"]] }),
        p("Do you have a smaller one?", "¿Lo tiene más pequeño?"),
        p("Do you have a bigger one?", "¿Lo tiene más grande?"),
        p("It's for ___", "Es para ___", { fill: [["a concrete wall", "una pared de hormigón"], ["a brick wall", "una pared de ladrillo"],
          ["wood", "madera"], ["metal", "metal"], ["tiles", "azulejo"], ["outdoors", "exterior"]] }),
        p("Which drill bit do I need for this wall plug?", "¿Qué broca necesito para este taco?"),
        p("Could you copy this key?", "¿Me puede hacer una copia de esta llave?"),
      ]},
      { title: "Plumbing", phrases: [
        p("My tap is dripping", "El grifo gotea"),
        p("I need a washer for this tap", "Necesito una junta para este grifo"),
        p("I need a new stopcock", "Necesito una llave de paso nueva"),
        p("Do you have a shower hose?", "¿Tienen un flexo de ducha?"),
        p("The toilet keeps running", "La cisterna pierde agua"),
        p("Plumber's tape (PTFE), please", "Cinta de teflón, por favor"),
      ]},
      { title: "Electrical", phrases: [
        p("An adapter for American plugs", "Un adaptador para enchufe americano"),
        p("An extension lead with several sockets", "Una regleta, por favor", { alt: "Un alargador, por favor" }),
        p("What kind of bulb is this?", "¿Qué tipo de bombilla es esta?", { note: "Bring the old bulb. Common bases: E27 (big), E14 (small), GU10 (spotlight)." }),
        p("LED, warm white", "LED, luz cálida"),
      ]},
      { title: "Paint", phrases: [
        p("I need paint for an outside wall", "Necesito pintura para exterior"),
        p("Can you match this colour?", "¿Me pueden hacer este color?"),
        p("White, matt finish", "Blanco mate"),
        p("A brush and a roller, please", "Una brocha y un rodillo, por favor"),
      ]},
      { title: "Before you pay", phrases: [
        p("How does this work?", "¿Cómo funciona esto?"),
        p("Can I return it if it doesn't fit?", "¿Lo puedo devolver si no vale?"),
      ]},
    ],
    replies: [
      ["¿De qué medida?", "What size?"], ["¿De cuántos milímetros?", "How many millimetres?"],
      ["Eso está en el pasillo tres", "That's in aisle three"], ["Se lo pido", "I'll order it for you"],
      ["Llega el jueves", "It arrives on Thursday"], ["Eso no lo tenemos", "We don't have that"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "hair", name: "Hairdresser & barber", es: "Peluquería", icon: "scissors", tone: "teal",
    sections: [
      { title: "Booking", phrases: [
        p("I'd like a haircut", "Quería cortarme el pelo"),
        p("Do you have a slot now?", "¿Tiene hueco ahora?"),
        p("Do I need an appointment?", "¿Hace falta cita?"),
      ]},
      { title: "How you want it", phrases: [
        p("Just a tidy-up", "Solo un repaso", { alt: "Solo las puntas" }),
        p("Short on the sides", "Corto por los lados"),
        p("Number ___ on the sides", "Con el ___ por los lados", { fill: [["1", "uno"], ["2", "dos"], ["3", "tres"], ["4", "cuatro"]] }),
        p("A bit longer on top", "Un poco más largo por arriba"),
        p("Not too short", "No muy corto"),
        p("Shorter, please", "Más corto, por favor"),
        p("Could you trim my beard?", "¿Me arregla la barba?"),
        p("With a wash, please", "Con lavado, por favor"),
        p("That's perfect", "Así está perfecto"),
        p("How much is it?", "¿Cuánto es?"),
      ]},
    ],
    replies: [
      ["¿Cómo lo quiere?", "How would you like it?"], ["¿Con qué número?", "Which clipper number?"],
      ["¿Le lavo el pelo?", "Shall I wash your hair?"], ["¿Así bien?", "Is that OK?"], ["¿Le quito más?", "Shall I take more off?"],
    ],
  },

  /* ------------------------------------------------------------ */
  { id: "money", name: "Bank & money", es: "Banco y dinero", icon: "euro", tone: "blue",
    sections: [
      { title: "Cash & cards", phrases: [
        p("Where is there a cash machine?", "¿Dónde hay un cajero?"),
        p("The cash machine has kept my card", "El cajero se ha tragado mi tarjeta"),
        p("My card isn't working", "Mi tarjeta no funciona"),
        p("Can I pay with my phone?", "¿Puedo pagar con el móvil?"),
        p("Do you have change for ___ euros?", "¿Tiene cambio de ___ euros?", { fill: [["20", "veinte"], ["50", "cincuenta"], ["100", "cien"]] }),
        p("How much is it altogether?", "¿Cuánto es en total?"),
        p("Could I have a receipt?", "¿Me da el tique, por favor?", { alt: "¿Me puede dar una factura?" }),
      ]},
      { title: "At the bank", phrases: [
        p("I'd like to change dollars into euros", "Quiero cambiar dólares a euros"),
        p("What's the exchange rate?", "¿A cuánto está el cambio?"),
        p("Is there a commission?", "¿Cobran comisión?"),
        p("I'd like to pay this bill", "Quiero pagar este recibo"),
        p("Here's my passport", "Aquí tiene mi pasaporte"),
      ]},
    ],
    replies: [
      ["¿Tiene cita?", "Do you have an appointment?"], ["¿Me deja el pasaporte?", "Can I see your passport?"],
      ["Introduzca el PIN", "Enter your PIN"], ["Solo en efectivo", "Cash only"],
      ["Hay una comisión de dos euros", "There's a €2 fee"], ["¿Quiere factura?", "Would you like an invoice?"],
    ],
  },
];
