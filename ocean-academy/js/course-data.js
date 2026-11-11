/**
 * IOI Ocean Academy Bangladesh (IOI Ocean Academy BD)
 * Comprehensive Curriculum & Modular Interactive Quiz Dataset
 */

export const coursesData = [
  {
    id: "ocean-101",
    code: "IOI-BD-101",
    title: "Foundations of Oceanography & Marine Governance in the Bay of Bengal",
    subtitle: "A comprehensive journey across depth zonation, estuarine ecology, UNCLOS maritime boundaries, and sustainable blue economy.",
    badge: "Accredited Flagship Course",
    category: "Oceanography & Governance",
    estimatedHours: "4 Hours Self-Paced",
    passingThreshold: 80,
    thumbnail: "depth-hero",
    description: "Designed by the International Ocean Institute - Ocean Academy Bangladesh, this foundational curriculum equips learners with fundamental oceanographic principles, bathymetric depth dynamics of the Bay of Bengal, benthic and pelagic marine biology, and the legal framework of UNCLOS governing Bangladesh's maritime borders.",
    modules: [
      {
        id: "mod-1",
        title: "Module 1: Ocean Depth Zonation & Bathymetry",
        readTime: "25 min",
        sections: [
          {
            heading: "The Vertical Architecture of the Ocean",
            content: `The world ocean is vertically stratified into distinct zones based on solar penetration, hydrostatic pressure, temperature gradients, and nutrient availability.
            
• **Epipelagic Zone (Sunlight Zone, 0 – 200 m):** Sunlight penetrates sufficiently to drive photosynthesis. Over 90% of all marine life congregates in or visits this layer. Phytoplankton (diatoms, dinoflagellates) form the primary base of the trophic food web.
• **Mesopelagic Zone (Twilight Zone, 200 – 1,000 m):** Sunlight fades to darkness. Photosynthesis is impossible here. Many organisms possess large eyes and photophores for bioluminescence. This zone hosts the daily Diel Vertical Migration (DVM)—the largest synchronized animal migration on planet Earth.
• **Bathypelagic Zone (Midnight Zone, 1,000 – 4,000 m):** Complete darkness with near-freezing temperatures (1–4°C) and immense hydrostatic pressure (>100 atm). Inhabitants like anglerfish and gulper eels rely on marine snow falling from above or bioluminescent lures.
• **Abyssopelagic & Hadalpelagic Zones (4,000 – 11,000+ m):** The abyssal plains and deep oceanic trenches. Characterized by extreme pressure, specialized amphipods, sea cucumbers, and chemosynthetic communities at hydrothermal vents.`
          },
          {
            heading: "The 'Swatch of No Ground': Bay of Bengal's Submarine Canyon",
            content: `The northern Bay of Bengal features a deep submarine canyon known as the **'Swatch of No Ground' (SoNG)**.
            
• Situated ~30 km south of Dublar Char (Sundarbans), this canyon cuts across the Bengal continental shelf with depths abruptly plummeting from 20 meters down to over 1,200 meters, feeding the colossal Bengal Fan (the largest submarine sediment fan on Earth).
• Because of internal wave breaking, canyon upwelling, and tidal mixing, nutrient-dense water fuels rich biodiversity in the SoNG, making it a critical feeding and breeding sanctuary for endangered cetaceans including Bryde's whales (*Balaenoptera edeni*), Irrawaddy dolphins (*Orcaella brevirostris*), and Indo-Pacific finless porpoises.
• Recognized by Bangladesh as a designated Marine Protected Area (MPA) in 2014.`
          }
        ]
      },
      {
        id: "mod-2",
        title: "Module 2: Marine Biology & Ecological Niches",
        readTime: "30 min",
        sections: [
          {
            heading: "Benthic vs. Pelagic Ecological Realms",
            content: `Marine ecosystems are split into two major ecological realms:
            
• **Benthic Realm:** Encompasses all organisms that live on, in, or directly attached to the seabed, continental shelf, or benthic substrate. Examples include flatfish (flounder), sea cucumbers, sea anemones, bristle worms, and deep-sea glass sponges.
• **Pelagic Realm:** Encompasses the open water column, home to free-swimming nekton (such as tuna, sharks, and dolphins) and drifting plankton (such as jellyfish, copepods, and phytoplankton).`
          },
          {
            heading: "Photosynthesis vs. Chemosynthesis",
            content: `While surface ecosystems rely on chlorophyll-driven photosynthesis powered by solar irradiance:
            $$6CO_2 + 6H_2O + \\text{photons} \\rightarrow C_6H_{12}O_6 + 6O_2$$
            deep-sea ecosystems around hydrothermal vents and cold seeps depend on **chemosynthesis**, where chemolithoautotrophic bacteria oxidize hydrogen sulfide ($H_2S$) or methane ($CH_4$) without any sunlight to synthesize organic matter for symbiotic organisms like giant tube worms (*Riftia pachyptila*).`
          }
        ]
      },
      {
        id: "mod-3",
        title: "Module 3: Estuarine Systems & Coastal Ecosystems",
        readTime: "30 min",
        sections: [
          {
            heading: "The Sundarbans: World's Largest Mangrove Biosphere",
            content: `The Sundarbans delta, shared between Bangladesh and India at the mouth of the Ganges-Brahmaputra-Meghna (GBM) river basin, is the world's largest contiguous mangrove wetland.
            
• Mangrove species like Sundari (*Heritiera fomes*) and Gewa (*Excoecaria agallocha*) have adapted pneumatophores (breathing roots) and salt-excreting leaves to thrive in brackish, tidal conditions.
• Acts as a natural bioshield against tropical cyclones, attenuating storm surges and sequestering substantial 'Blue Carbon' in coastal mud sediments.`
          },
          {
            heading: "Saint Martin's Island Coral Community",
            content: `Saint Martin's Island (Narikel Jinjira), situated in the northeastern Bay of Bengal, is Bangladesh's sole coral-bearing sedimentary continental island. It supports delicate scleractinian corals, sea fans, and rocky reef fishes vulnerable to sediment runoff and tourism pressures.`
          }
        ]
      },
      {
        id: "mod-4",
        title: "Module 4: Ocean Governance, UNCLOS & The Blue Economy",
        readTime: "35 min",
        sections: [
          {
            heading: "Maritime Boundaries & ITLOS Landmark Verdicts",
            content: `Under the United Nations Convention on the Law of the Sea (UNCLOS 1982), coastal states enjoy sovereign rights over their 200-nautical-mile Exclusive Economic Zone (EEZ) and continental shelf.
            
• In 2012 (ITLOS Myanmar vs. Bangladesh) and 2014 (PCA India vs. Bangladesh), Bangladesh resolved historical maritime boundaries peacefully through international rule of law, securing sovereign jurisdiction over **118,813 square kilometers** of territorial sea and EEZ in the Bay of Bengal.`
          },
          {
            heading: "Unlocking the Blue Economy in Bangladesh",
            content: `Sustainable ocean stewardship encompasses:
• Decarbonized shipping and green port logistics at Chittagong, Mongla, and Matarbari deep-sea port.
• Mariculture of marine algae (seaweeds like *Hypnea*, *Gracilaria*), sea cucumbers, and mud crabs.
• Combating Illegal, Unreported, and Unregulated (IUU) fishing through Vessel Monitoring Systems (VMS).
• Establishing Marine Protected Areas (MPAs) covering at least 10% of maritime territory to foster biodiversity resilience.`
          }
        ]
      }
    ],
    // The Comprehensive Modular Quiz Engine Questions
    quiz: {
      id: "quiz-ocean-101",
      title: "IOI Ocean Academy Final Examination: Bay of Bengal Oceanography & Governance",
      passingScore: 80, // 80% passing threshold required
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          type: "mcq",
          points: 20,
          title: "Question 1: Physical Oceanography of the Bay of Bengal",
          prompt: "What is the primary ecological and physical significance of the 'Swatch of No Ground' (SoNG) submarine canyon located south of the Sundarbans in the Bay of Bengal?",
          options: [
            {
              id: "opt_a",
              text: "It is an inactive shallow lagoon that acts as a land reclamation zone for rice cultivation.",
              isCorrect: false,
              explanation: "Incorrect. The Swatch of No Ground is a deep submarine canyon reaching depths over 1,200 meters, not a shallow lagoon or agricultural zone."
            },
            {
              id: "opt_b",
              text: "It is a massive submarine canyon with intense canyon upwelling and mixing that provides vital feeding grounds for cetaceans like Bryde's whales and dolphins.",
              isCorrect: true,
              explanation: "Correct! The Swatch of No Ground acts as a deep conduit channeling nutrients via canyon upwelling, creating a productive ecological hotspot declared as Bangladesh's first offshore Marine Protected Area."
            },
            {
              id: "opt_c",
              text: "It is an artificial canal dredged in 1971 to connect the Port of Mongla directly with the Indian Ocean.",
              isCorrect: false,
              explanation: "Incorrect. The canyon is a natural geological feature formed over millions of years by the sediment output of the Ganges-Brahmaputra system."
            },
            {
              id: "opt_d",
              text: "It is a freshwater thermal spring containing no marine organisms due to high temperatures.",
              isCorrect: false,
              explanation: "Incorrect. The canyon contains cold, high-salinity oceanic deep water rich in diverse marine species and cetaceans."
            }
          ]
        },
        {
          id: "q2",
          type: "true_false",
          points: 20,
          title: "Question 2: Oceanic Depth & Solar Penetration",
          statement: "In the Mesopelagic (Twilight) Zone (200 m to 1,000 m depth), ambient solar irradiance is sufficient to support massive photosynthetic phytoplankton blooms.",
          isTrue: false,
          explanation: "False! Sunlight in the Mesopelagic Zone is extremely dim and blue-shifted; it is insufficient for photosynthesis (which requires at least 1% of surface irradiance, limited strictly to the Epipelagic sunlight zone 0–200 m). Organisms in the twilight zone depend on organic particles ('marine snow') or vertical migration."
        },
        {
          id: "q3",
          type: "heading_match",
          points: 20,
          title: "Question 3: Heading Matching — Oceanographic Concepts",
          instruction: "Drag or click to match each foundational oceanographic concept with its corresponding official scientific heading.",
          pairs: [
            {
              id: "c1",
              concept: "A sharp horizontal or vertical layer in a body of water where temperature decreases rapidly with increasing depth.",
              heading: "Thermocline"
            },
            {
              id: "c2",
              concept: "Wind-driven displacement of surface waters that causes cold, dense, and nutrient-laden deep water to rise toward the euphotic zone.",
              heading: "Upwelling"
            },
            {
              id: "c3",
              concept: "Biochemical emission of visible light by marine organisms catalyzed by the enzyme luciferase reacting with a luciferin substrate.",
              heading: "Bioluminescence"
            },
            {
              id: "c4",
              concept: "Enrichment of an aquatic body with excessive minerals (nitrogen and phosphorus), triggering massive algal blooms and subsequent hypoxias.",
              heading: "Eutrophication"
            }
          ]
        },
        {
          id: "q4",
          type: "pair_match",
          points: 20,
          title: "Question 4: Side / Pair Matching — Organisms to Ocean Zones",
          instruction: "Connect each specialized marine organism with the oceanic vertical zone where it primarily thrives.",
          pairs: [
            {
              id: "p1",
              item: "Flying Fish & Scombridae (Tuna)",
              match: "Epipelagic Zone (Sunlight: 0–200 m)",
              info: "Rely on solar illumination, high dissolved oxygen, and surface schooling."
            },
            {
              id: "p2",
              item: "Lanternfish & Vampire Squid (*Vampyroteuthis*)",
              match: "Mesopelagic Zone (Twilight: 200–1,000 m)",
              info: "Equipped with photophores for counterillumination and huge sensitive eyes."
            },
            {
              id: "p3",
              item: "Deep-Sea Anglerfish & Gulper Eel",
              match: "Bathypelagic Zone (Midnight: 1,000–4,000 m)",
              info: "Adapted to complete darkness with bioluminescent lures and expandable stomachs."
            },
            {
              id: "p4",
              item: "Giant Tube Worms (*Riftia*) & Hadal Snailfish",
              match: "Abyssal & Hadal Zone (>4,000 m)",
              info: "Withstand crushing pressure (>400–1,000 atm) and utilize chemosynthetic nutrients."
            }
          ]
        },
        {
          id: "q5",
          type: "categorization",
          points: 20,
          title: "Question 5: Comparison & Categorization — Benthic vs. Pelagic",
          instruction: "Categorize each marine specimen into its correct ecological realm: Benthic (associated with the seafloor) or Pelagic (associated with the open water column).",
          categories: [
            { id: "cat_benthic", name: "Benthic Realm (Seafloor / Substrate)" },
            { id: "cat_pelagic", name: "Pelagic Realm (Water Column / Open Ocean)" }
          ],
          items: [
            { id: "item_1", name: "Sea Cucumber (Holothuroidea)", categoryId: "cat_benthic", rationale: "Crawls along the ocean floor as a detritivore sediment feeder." },
            { id: "item_2", name: "Yellowfin Tuna (Thunnus albacares)", categoryId: "cat_pelagic", rationale: "High-speed epipelagic cruiser swimming across the open ocean column." },
            { id: "item_3", name: "Deep-Sea Glass Sponge (Hexactinellida)", categoryId: "cat_benthic", rationale: "Sessile filter feeder rooted firmly into the benthic sediment." },
            { id: "item_4", name: "Moon Jellyfish (Aurelia aurita)", categoryId: "cat_pelagic", rationale: "Pelagic drifter navigating coastal and open water currents." },
            { id: "item_5", name: "Flounder / Flatfish (Pleuronectiformes)", categoryId: "cat_benthic", rationale: "Camouflaged demersal fish lying flat on sandy seafloor beds." },
            { id: "item_6", name: "Oceanic Manta Ray (Mobula birostris)", categoryId: "cat_pelagic", rationale: "Vast pelagic plankton filter feeder gliding through the water column." }
          ]
        }
      ]
    }
  },
  {
    id: "ocean-102",
    code: "IOI-BD-102",
    title: "Marine Biodiversity & The Deep Sea Frontiers",
    subtitle: "Investigating hydrothermal vent ecosystems, bioluminescence, and cetacean migration in the Indian Ocean.",
    badge: "Intermediate Elective",
    category: "Deep Sea Science",
    estimatedHours: "3 Hours Self-Paced",
    passingThreshold: 80,
    thumbnail: "deepsea-hero",
    description: "Explore the frontiers of benthic ocean exploration, sensory adaptations to zero sunlight, chemosynthetic symbiosis at abyssal depths, and marine mammal acoustic communication.",
    modules: [
      {
        id: "mod-102-1",
        title: "Module 1: Life in Extreme Environments",
        readTime: "20 min",
        sections: [
          {
            heading: "Hydrothermal Vents & Chemolithoautotrophy",
            content: "Hydrothermal vents along oceanic ridges emit superheated mineral fluids enriched in sulfides. Bacteria convert inorganic sulfur compounds into energy without any reliance on sunlight."
          }
        ]
      }
    ],
    quiz: null // Available after completing IOI-BD-101
  },
  {
    id: "ocean-103",
    code: "IOI-BD-103",
    title: "Blue Economy & Ocean Stewardship for Sustainable Coastal Futures",
    subtitle: "Harnessing sustainable mariculture, offshore renewable energy, and climate-resilient delta governance.",
    badge: "Policy & Economy",
    category: "Sustainable Blue Economy",
    estimatedHours: "3.5 Hours Self-Paced",
    passingThreshold: 80,
    thumbnail: "blue-econ-hero",
    description: "Analyze the economic potentials and ecological safeguards necessary for developing marine biotechnology, sustainable fisheries, and mangrove carbon credits under Bangladesh's Delta Plan 2100.",
    modules: [
      {
        id: "mod-103-1",
        title: "Module 1: Maritime Economy Pillars",
        readTime: "25 min",
        sections: [
          {
            heading: "Balancing Exploitation and Marine Protection",
            content: "Sustainable ocean governance ensures that fish stocks, seaweed cultivation, and coastal ecotourism flourish without degrading coastal mangrove bioshields."
          }
        ]
      }
    ],
    quiz: null
  }
];
