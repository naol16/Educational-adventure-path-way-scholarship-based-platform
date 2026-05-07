import { ScholarshipSourceRepository } from "../repositories/ScholarshipSourceRepository.js";

export const seedScholarshipSources = async () => {
  const sources = [
    // Government Scholarships
    { baseUrl: "https://foreign.fulbrightonline.org/", domainName: "Fulbright Foreign Student Program (USA)" },
    { baseUrl: "https://www.chevening.org/scholarships/", domainName: "Chevening Scholarships (UK)" },
    { baseUrl: "https://erasmus-plus.ec.europa.eu/", domainName: "Erasmus+ (EU)" },
    { baseUrl: "https://www2.daad.de/deutschland/stipendium/", domainName: "DAAD Scholarships (Germany)" },
    { baseUrl: "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence", domainName: "Eiffel Excellence Scholarship (France)" },
    { baseUrl: "https://www.sbfi.admin.ch/", domainName: "Swiss Government Excellence Scholarships" },
    { baseUrl: "https://www.mext.go.jp/en/", domainName: "MEXT Scholarships (Japan)" },
    { baseUrl: "https://www.dfat.gov.au/people-to-people/australia-awards", domainName: "Australia Awards Scholarships" },

    // Top NGO & Foundation Scholarships
    { baseUrl: "https://www.gatescambridge.org/", domainName: "Gates Cambridge Scholarships" },
    { baseUrl: "https://www.rhodeshouse.ox.ac.uk/", domainName: "Rhodes Trust Scholarships" },
    { baseUrl: "https://mastercardfdn.org/all/scholars/", domainName: "Mastercard Foundation Scholars Program" },
    { baseUrl: "https://www.rotary.org/en/our-programs/peace-fellowships", domainName: "Rotary Peace Fellowships" },
    { baseUrl: "https://www.worldbank.org/en/programs/scholarships", domainName: "Joint Japan/World Bank Graduate Scholarship" },

    // --- NORTH AMERICA ---
    { baseUrl: "https://sfs.mit.edu/", domainName: "MIT Scholarships" },
    { baseUrl: "https://college.harvard.edu/financial-aid", domainName: "Harvard University" },
    { baseUrl: "https://finaid.yale.edu/", domainName: "Yale University" },
    { baseUrl: "https://admission.princeton.edu/cost-aid", domainName: "Princeton University" },
    { baseUrl: "https://financialaid.stanford.edu/", domainName: "Stanford University" },
    { baseUrl: "https://finaid.caltech.edu/", domainName: "Caltech" },
    { baseUrl: "https://financialaid.columbia.edu/", domainName: "Columbia University" },
    { baseUrl: "https://srfs.upenn.edu/financial-aid", domainName: "University of Pennsylvania" },
    { baseUrl: "https://finaid.cornell.edu/", domainName: "Cornell University" },
    { baseUrl: "https://financialaid.berkeley.edu/", domainName: "UC Berkeley" },
    { baseUrl: "https://financialaid.ucla.edu/", domainName: "UCLA" },
    { baseUrl: "https://financialaid.uchicago.edu/", domainName: "University of Chicago" },
    { baseUrl: "https://future.utoronto.ca/finances/scholarships/", domainName: "University of Toronto (Canada)" },
    { baseUrl: "https://www.mcgill.ca/studentaid/scholarships-aid", domainName: "McGill University (Canada)" },
    { baseUrl: "https://students.ubc.ca/enrolment/finances/scholarships", domainName: "University of British Columbia (Canada)" },
    { baseUrl: "https://uwaterloo.ca/student-awards-financial-aid/", domainName: "University of Waterloo (Canada)" },

    // --- EUROPE ---
    { baseUrl: "https://www.ox.ac.uk/admissions/graduate/fees-and-funding", domainName: "University of Oxford (UK)" },
    { baseUrl: "https://www.cambridgetrust.org/", domainName: "University of Cambridge (UK)" },
    { baseUrl: "https://www.imperial.ac.uk/study/fees-and-funding/", domainName: "Imperial College London (UK)" },
    { baseUrl: "https://www.ucl.ac.uk/scholarships/", domainName: "UCL (UK)" },
    { baseUrl: "https://www.lse.ac.uk/study-at-lse/Graduate/fees-and-funding", domainName: "LSE (UK)" },
    { baseUrl: "https://www.ed.ac.uk/student-funding", domainName: "University of Edinburgh (UK)" },
    { baseUrl: "https://www.kcl.ac.uk/study/funding", domainName: "King's College London (UK)" },
    { baseUrl: "https://ethz.ch/students/en/studies/financial/", domainName: "ETH Zurich (Switzerland)" },
    { baseUrl: "https://www.epfl.ch/education/studies/en/financing-study/", domainName: "EPFL (Switzerland)" },
    { baseUrl: "https://www.tum.de/en/studies/fees-and-financial-aid", domainName: "Technical University of Munich (Germany)" },
    { baseUrl: "https://www.lmu.de/en/workspace-for-students/student-support-services/finance-your-studies/", domainName: "LMU Munich (Germany)" },
    { baseUrl: "https://www.tudelft.nl/en/education/practical-matters/scholarships", domainName: "TU Delft (Netherlands)" },
    { baseUrl: "https://www.uva.nl/en/education/master-s/scholarships--tuition/scholarships-and-loans", domainName: "University of Amsterdam (Netherlands)" },
    { baseUrl: "https://www.kuleuven.be/english/admissions/funding", domainName: "KU Leuven (Belgium)" },
    { baseUrl: "https://www.sciencespo.fr/students/en/fees-funding/bursaries-financial-aid/", domainName: "Sciences Po (France)" },
    { baseUrl: "https://www.sorbonne-universite.fr/en", domainName: "Sorbonne University (France)" },
    { baseUrl: "https://www.uniroma1.it/en/pagina/scholarships", domainName: "Sapienza University of Rome (Italy)" },
    { baseUrl: "https://www.polimi.it/en/international-prospective-students/laurea-magistrale-programmes-equivalent-to-master-of-science/scholarships", domainName: "Politecnico di Milano (Italy)" },
    { baseUrl: "https://www.su.se/english/education/fees-and-scholarships/scholarships", domainName: "Stockholm University (Sweden)" },
    { baseUrl: "https://www.uu.se/en/admissions/scholarships", domainName: "Uppsala University (Sweden)" },
    { baseUrl: "https://www.ku.dk/english/admissions/scholarships/", domainName: "University of Copenhagen (Denmark)" },
    { baseUrl: "https://www.helsinki.fi/en/admissions/scholarships-and-tuition-fees", domainName: "University of Helsinki (Finland)" },

    // --- ASIA ---
    { baseUrl: "https://nus.edu.sg/oam/scholarships", domainName: "National University of Singapore (NUS)" },
    { baseUrl: "https://www.ntu.edu.sg/admissions/undergraduate/scholarships", domainName: "Nanyang Technological University (NTU)" },
    { baseUrl: "https://www.tsinghua.edu.cn/en/Admissions/Scholarships.htm", domainName: "Tsinghua University (China)" },
    { baseUrl: "https://www.isd.pku.edu.cn/scholarships/", domainName: "Peking University (China)" },
    { baseUrl: "https://hku.hk/international/scholarships.html", domainName: "University of Hong Kong (HKU)" },
    { baseUrl: "https://www.ust.hk/admissions/scholarships", domainName: "Hong Kong University of Science and Technology (HKUST)" },
    { baseUrl: "https://www.u-tokyo.ac.jp/en/prospective-students/scholarships.html", domainName: "University of Tokyo (Japan)" },
    { baseUrl: "https://www.kyoto-u.ac.jp/en/education-campus/student-life/scholarships", domainName: "Kyoto University (Japan)" },
    { baseUrl: "https://en.snu.ac.kr/admission/graduate/scholarships", domainName: "Seoul National University (South Korea)" },
    { baseUrl: "https://admission.kaist.ac.kr/intl-graduate/kaist-scholarships/", domainName: "KAIST (South Korea)" },
    { baseUrl: "https://ntu.edu.tw/english/academics/scholarship.html", domainName: "National Taiwan University (Taiwan)" },

    // --- AUSTRALIA & NEW ZEALAND ---
    { baseUrl: "https://scholarships.unimelb.edu.au/", domainName: "University of Melbourne (Australia)" },
    { baseUrl: "https://www.sydney.edu.au/scholarships/", domainName: "University of Sydney (Australia)" },
    { baseUrl: "https://www.anu.edu.au/study/scholarships", domainName: "Australian National University (ANU)" },
    { baseUrl: "https://www.scholarships.unsw.edu.au/", domainName: "UNSW Sydney (Australia)" },
    { baseUrl: "https://scholarships.uq.edu.au/", domainName: "University of Queensland (Australia)" },
    { baseUrl: "https://www.monash.edu/study/fees-scholarships/scholarships", domainName: "Monash University (Australia)" },
    { baseUrl: "https://www.auckland.ac.nz/en/study/scholarships-and-awards.html", domainName: "University of Auckland (New Zealand)" },

    // --- LATIN AMERICA ---
    { baseUrl: "https://www.usp.br/internationaloffice/en/", domainName: "University of São Paulo (Brazil)" },
    { baseUrl: "https://www.unam.mx/", domainName: "UNAM (Mexico)" },
    { baseUrl: "https://www.uc.cl/en/", domainName: "Pontificia Universidad Católica de Chile" },
    { baseUrl: "https://tecnosfera.tec.mx/es/becas", domainName: "Tecnológico de Monterrey (Mexico)" },
    { baseUrl: "https://uniandes.edu.co/es/apoyo-financiero", domainName: "Universidad de los Andes (Colombia)" },
    { baseUrl: "https://www.uba.ar/", domainName: "Universidad de Buenos Aires (Argentina)" },

    // --- AFRICA & MIDDLE EAST ---
    { baseUrl: "https://uct.ac.za/students/fees-funding/bursaries-scholarships", domainName: "University of Cape Town (South Africa)" },
    { baseUrl: "https://www.wits.ac.za/study-at-wits/fees-and-funding/", domainName: "University of the Witwatersrand (South Africa)" },
    { baseUrl: "https://www.up.ac.za/fees-and-funding", domainName: "University of Pretoria (South Africa)" },
    { baseUrl: "https://www.aucegypt.edu/admissions/scholarships", domainName: "American University in Cairo (Egypt)" },
    { baseUrl: "https://international.tau.ac.il/scholarship_funding", domainName: "Tel Aviv University (Israel)" },
    { baseUrl: "https://www.kaust.edu.sa/en/admissions/kaust-fellowship", domainName: "KAUST (Saudi Arabia)" },
    { baseUrl: "https://www.ku.ac.ae/scholarships", domainName: "Khalifa University (UAE)" },
    { baseUrl: "https://www.qu.edu.qa/students/admission/scholarships", domainName: "Qatar University (Qatar)" },
    { baseUrl: "https://www.aub.edu.lb/admissions/scholarships/", domainName: "American University of Beirut (Lebanon)" },
    { baseUrl: "https://www.kfupm.edu.sa/", domainName: "King Fahd University (KFUPM)" }
  ];

  console.log(`Seeding ${sources.length} scholarship sources...`);

  for (const source of sources) {
    try {
      const [record, created] = await ScholarshipSourceRepository.findOrCreate({
        baseUrl: source.baseUrl,
        domainName: source.domainName,
        isActive: true,
      });

      if (created) {
        console.log(`Added: ${source.domainName}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error seeding ${source.domainName}:`, errorMessage);
    }
  }
  console.log("Scholarship sources seeding completed.");
};
