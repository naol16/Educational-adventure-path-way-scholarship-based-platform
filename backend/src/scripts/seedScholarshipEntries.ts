import { connectSequelize } from "../config/sequelize.js";
import { Scholarship } from "../models/Scholarship.js";
import { ScholarshipSource } from "../models/ScholarshipSource.js";
import { VectorService } from "../services/VectorService.js";

async function seedScholarships() {
  try {
    await connectSequelize();
    console.log("Database connected...");

    const sources = await ScholarshipSource.findAll({ where: { isActive: true } });
    if (sources.length === 0) {
      console.log("No scholarship sources found. Please run seed:sources first.");
      process.exit(1);
    }

    console.log(`Found ${sources.length} sources. Creating sample scholarships...`);

    // Sample scholarship data matching available sources
    const sampleScholarships = [
      {
        title: "Full-Tuition Scholarship for African Students 2025",
        description: "Comprehensive scholarship covering full tuition, accommodation, and monthly stipend for undergraduate studies across Africa. Open to students from all African countries with excellent academic records.",
        amount: "Full Tuition + $10,000/year",
        fundType: "Full Funding",
        deadline: new Date("2025-12-15"),
        degreeLevels: ["Bachelor"],
        requirements: "Minimum GPA 3.5, leadership experience, community service",
        intakeSeason: "Fall 2025",
        country: "Multiple African Countries",
        originalUrl: "https://opportunitiesforafricans.com/full-tuition-scholarship-2025",
      },
      {
        title: "Master's Degree Scholarship in Germany - DAAD Excellence",
        description: "DAAD full scholarship for international students pursuing Master's programs in German universities. Includes monthly allowance, health insurance, and travel allowance.",
        amount: "€1,200/month + insurance + travel",
        fundType: "Full Funding",
        deadline: new Date("2025-10-30"),
        degreeLevels: ["Master"],
        requirements: "Bachelor's degree with GPA 3.0+, German/English proficiency, 2 years professional experience",
        intakeSeason: "Winter 2025",
        country: "Germany",
        originalUrl: "https://www.daad.de/en/study-and-research-in-germany/scholarships/daad-excellence/",
      },
      {
        title: "Chevening UK Government Scholarship 2025",
        description: "Full scholarship for one-year Master's programs in the UK. Covers tuition fees, living stipend, return flights, and visa application costs. For future leaders with at least 2 years work experience.",
        amount: "Full funding (tuition + £18,500 stipend)",
        fundType: "Full Funding",
        deadline: new Date("2025-11-05"),
        degreeLevels: ["Master"],
        requirements: "Bachelor's degree, 2+ years work experience, leadership potential, meet Chevening English requirement",
        intakeSeason: "Autumn 2025",
        country: "United Kingdom",
        originalUrl: "https://www.chevening.org/",
      },
      {
        title: "Australia Awards Scholarship for Pacific/Asia Students",
        description: "Australian Government scholarship for students from eligible developing countries to study at Australian universities. Includes tuition, return air travel, living allowance, and health coverage.",
        amount: "Full scholarship with living allowance",
        fundType: "Full Funding",
        deadline: new Date("2025-04-28"),
        degreeLevels: ["Bachelor", "Master", "PhD"],
        requirements: "Citizen of eligible country, minimum 2 years work experience, meet academic and English requirements",
        intakeSeason: "Semester 1 2026",
        country: "Australia",
        originalUrl: "https://www.australiaawards.gov.au/",
      },
      {
        title: "Fulbright Foreign Student Program USA",
        description: "Premier educational exchange program offering graduate students and young professionals from all countries to study and research in the United States. Covers tuition, airfare, living stipend, and health insurance.",
        amount: "Varies by program (typically full funding)",
        fundType: "Full Funding",
        deadline: new Date("2025-05-15"),
        degreeLevels: ["Master", "PhD"],
        requirements: "Bachelor's degree, English proficiency, strong academic record, leadership potential",
        intakeSeason: "Fall 2025",
        country: "United States",
        originalUrl: "https://www.fulbrightprogram.org/",
      },
      {
        title: "Rotary Global Grant Scholarship",
        description: "Scholarships for graduate-level study or research abroad focused on Rotary's seven areas of focus. Awards range from $30,000 to $75,000 USD.",
        amount: "$30,000 - $75,000 USD",
        fundType: "Partial Funding",
        deadline: new Date("2025-07-15"),
        degreeLevels: ["Master", "PhD"],
        requirements: "Rotary affiliation or sponsor, undergraduate degree, language proficiency, career plan aligned with Rotary focus areas",
        intakeSeason: "Varies by country",
        country: "Multiple",
        originalUrl: "https://www.rotary.org/en/our-programs/scholarships",
      },
      {
        title: "Gates Cambridge Scholarship UK",
        description: "Full-cost scholarship for international students to pursue postgraduate study at the University of Cambridge. Covers tuition, maintenance allowance, travel costs, and discretionary academic development funding.",
        amount: "Full Cambridge tuition + annual stipend + travel",
        fundType: "Full Funding",
        deadline: new Date("2025-12-03"),
        degreeLevels: ["Master", "PhD"],
        requirements: "Exceptional academic record, leadership potential, commitment to improving lives of others, admission to Cambridge",
        intakeSeason: "Michaelmas Term 2025",
        country: "United Kingdom",
        originalUrl: "https://www.gatescambridge.org/",
      },
      {
        title: "Mastercard Foundation Scholars Program",
        description: "Comprehensive scholarship for academically talented but economically disadvantaged students from Africa to study at partner universities worldwide. Includes tuition, accommodation, books, and personal expenses.",
        amount: "Full scholarship with additional living expenses",
        fundType: "Full Funding",
        deadline: new Date("2025-09-30"),
        degreeLevels: ["Bachelor", "Master"],
        requirements: "African citizenship, demonstrated financial need, academic excellence, leadership potential",
        intakeSeason: "Academic Year 2025-26",
        country: "Multiple Partner Universities",
        originalUrl: "https://www.mastercardfdn.org/projects/the-mastercard-foundation-scholars-program/",
      },
      {
        title: "Joint Japan World Bank Graduate Scholarship Program",
        description: "Scholarships for students from developing countries to pursue graduate studies in development-related fields at top universities in Japan and partner countries worldwide.",
        amount: "Full tuition + economy airfare + living allowance + health insurance",
        fundType: "Full Funding",
        deadline: new Date("2025-03-15"),
        degreeLevels: ["Master", "PhD"],
        requirements: "Citizen of World Bank member country, development-related field of study, min 3 years professional experience",
        intakeSeason: "Fall 2025",
        country: "Japan & partner countries",
        originalUrl: "https://www.worldbank.org/en/programs/scholarships",
      },
      {
        title: "Rhodes Scholarship University of Oxford",
        description: "One of the oldest and most prestigious international scholarship programs. Enables outstanding students from around the world to study at the University of Oxford. Covers university fees and personal stipend.",
        amount: "Full Oxford tuition + £17,070 annual stipend",
        fundType: "Full Funding",
        deadline: new Date("2025-07-30"),
        degreeLevels: ["Master", "PhD"],
        requirements: "Exceptional academic record, leadership, commitment to service, Rhodes character criteria, admission to Oxford",
        intakeSeason: "Michaelmas Term 2025",
        country: "United Kingdom",
        originalUrl: "https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/",
      },
      {
        title: "Erasmus Mundus Joint Master Degree Scholarship",
        description: "EU-funded scholarship for high-achieving international students to pursue Erasmus Mundus joint master's degrees at 2-3 European universities. Full scholarship including tuition, travel, installation, and monthly allowance.",
        amount: "Full scholarship + €1,400/month living allowance",
        fundType: "Full Funding",
        deadline: new Date("2026-01-15"),
        degreeLevels: ["Master"],
        requirements: "Bachelor's degree, language proficiency, meet specific program requirements",
        intakeSeason: "Academic Year 2026-27",
        country: "Multiple European Countries",
        originalUrl: "https://www.erasmusmundus.it/",
      },
      {
        title: "Women in STEM Scholarship - Society of Women Engineers",
        description: "SWE Scholarships support women pursuing bachelor's or master's degrees in engineering, engineering technology, or computer science in the U.S. and Canada. Awards range from $1,000 to $10,000.",
        amount: "$1,000 - $10,000 USD",
        fundType: "Partial Funding",
        deadline: new Date("2025-02-15"),
        degreeLevels: ["Bachelor", "Master"],
        requirements: "Female identifying, enrolled in engineering/CS program, SWE membership preferred but not required",
        intakeSeason: "All intakes",
        country: "United States & Canada",
        originalUrl: "https://www.swe.org/scholarships",
      },
      {
        title: "Commonwealth Scholarship and Fellowship Plan UK",
        description: "Offers scholarships and fellowships for citizens of Commonwealth countries to study in the UK. Supports development goals of home countries. Covers tuition, airfare, living expenses.",
        amount: "Full scholarship including flights, tuition, maintenance",
        fundType: "Full Funding",
        deadline: new Date("2025-11-30"),
        degreeLevels: ["Master", "PhD"],
        requirements: "Citizen of Commonwealth country, academic excellence, development impact potential, meet English language criteria",
        intakeSeason: "Academic Year 2026",
        country: "United Kingdom",
        originalUrl: "https://www.commonwealthscholarships.org/",
      },
      {
        title: "Google PhD Fellowship Program",
        description: "Recognizes and supports outstanding PhD students doing innovative research in computer science and related fields. Provides stipend, tuition, and research/internship opportunities.",
        amount: "Full tuition + stipend + research funding",
        fundType: "Full Funding",
        deadline: new Date("2025-09-01"),
        degreeLevels: ["PhD"],
        requirements: "PhD student in CS/related field, outstanding academic record, research proposal aligned with Google's research areas",
        intakeSeason: "Academic Year 2025-26",
        country: "Multiple (including US, Canada, Europe)",
        originalUrl: "https://research.google/our-programs/google-phd-fellowship-program/",
      },
      {
        title: "MEXT Scholarship Japan - Ministry of Education",
        description: "Japanese Government scholarship for international students wishing to study at Japanese universities as research students, undergraduate, or graduate students. Covers tuition, airfare, and monthly stipend.",
        amount: "Full tuition + ¥143,000-144,000/month stipend + airfare",
        fundType: "Full Funding",
        deadline: new Date("2025-05-31"),
        degreeLevels: ["Bachelor", "Master", "PhD"],
        requirements: "Good health, under 35 (research students), excellent academic record, language proficiency (Japanese/English) depending on program",
        intakeSeason: "October 2025 or April 2026",
        country: "Japan",
        originalUrl: "https://www.mext.go.jp/en/policy/education/highered/title02/special02/smapstop.htm",
      },
    ];

    const source = sources[0]; // Use first source (Opportunities For Africans) as default source
    console.log(`Using source: ${source.domainName} (ID: ${source.id})`);

    let createdCount = 0;
    for (const data of sampleScholarships) {
      try {
        // Generate embedding for this scholarship
        console.log(`Generating embedding for: ${data.title.substring(0, 50)}...`);
        const vector = await VectorService.generateScholarshipEmbedding(data);

        const scholarshipData = {
          ...data,
          sourceId: source.id,
          embedding: `[${vector.join(",")}]`,
        };

        const [scholarship, created] = await Scholarship.upsert({
          ...scholarshipData,
          embedding: vector,  // Sequelize setter will format
        });

        if (created) {
          console.log(`✓ Created: ${data.title}`);
          createdCount++;
        } else {
          console.log(`- Updated: ${data.title}`);
        }
      } catch (error: any) {
        console.error(`✗ Error with "${data.title}":`, error.message);
      }
    }

    console.log(`\nCompleted. ${createdCount} new scholarships created.`);
    console.log(`Total scholarships in DB: ${await Scholarship.count()}`);
    console.log("\nNote: Students will now have scholarships to match with via the Matching Service.");
    process.exit(0);
  } catch (error: any) {
    console.error("Critical error:", error.message);
    process.exit(1);
  }
}

seedScholarships();
