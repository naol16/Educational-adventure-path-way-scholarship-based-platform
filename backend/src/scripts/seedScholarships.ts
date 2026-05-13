import { ScholarshipSourceRepository } from "../repositories/ScholarshipSourceRepository.js";
import { connectSequelize } from "../config/sequelize.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

export const seedScholarshipSources = async () => {
  const sources = [
    // --- YOUR ORIGINAL SOURCES ---
    {
      baseUrl: "https://opportunitiesforafricans.com/",
      domainName: "Opportunities For Africans",
    },
    {
      baseUrl: "https://www.afterschoolafrica.com/",
      domainName: "After School Africa",
    },
    {
      baseUrl: "https://www.scholarshiptab.com/",
      domainName: "ScholarshipTab",
    },
    {
      baseUrl: "https://scholarship-positions.com/",
      domainName: "Scholarship Positions",
    },
    {
      baseUrl: "https://www.scholarshipregion.com/",
      domainName: "Scholarship Region",
    },
    {
      baseUrl: "https://globalscholarships.com/",
      domainName: "Global Scholarships",
    },
    { baseUrl: "https://www.profellow.com/", domainName: "ProFellow" },
    { baseUrl: "https://opportunitydesk.org/", domainName: "Opportunity Desk" },
    {
      baseUrl: "https://www.internationalscholarships.com/",
      domainName: "International Scholarships",
    },
    { baseUrl: "https://www.scholars4dev.com/", domainName: "Scholars4Dev" },
    { baseUrl: "https://www.iefa.org/scholarships", domainName: "IEFA" },
    {
      baseUrl: "https://www.educations.com/scholarships/",
      domainName: "Educations Scholarships",
    },
    {
      baseUrl: "https://www.mastersportal.com/scholarships/",
      domainName: "Masters Portal Scholarships",
    },
    {
      baseUrl: "https://www.phdportal.com/scholarships/",
      domainName: "PhD Portal Scholarships",
    },
    {
      baseUrl: "https://www.bachelorsportal.com/scholarships/",
      domainName: "Bachelors Portal Scholarships",
    },

    // --- GLOBAL AGGREGATORS & SEARCH ENGINES ---
    { baseUrl: "https://www.fastweb.com/", domainName: "Fastweb" },
    {
      baseUrl: "https://www.scholarships.com/",
      domainName: "Scholarships.com",
    },
    { baseUrl: "https://www.cappex.com/", domainName: "Cappex" },
    {
      baseUrl: "https://www.niche.com/colleges/scholarships/",
      domainName: "Niche Scholarships",
    },
    { baseUrl: "https://www.unigo.com/", domainName: "Unigo" },
    {
      baseUrl: "https://www.petersons.com/scholarship-search.aspx",
      domainName: "Petersons",
    },
    {
      baseUrl: "https://www.chegg.com/scholarships",
      domainName: "Chegg Scholarships",
    },
    { baseUrl: "https://www.bold.org/", domainName: "Bold.org" },
    { baseUrl: "https://www.goingmerry.com/", domainName: "Going Merry" },
    {
      baseUrl: "https://www.scholarshipowl.com/",
      domainName: "ScholarshipOwl",
    },
    { baseUrl: "https://www.collegexpress.com/", domainName: "CollegeExpress" },
    {
      baseUrl: "https://www.salliemae.com/college-planning/scholarship-search/",
      domainName: "Sallie Mae",
    },
    {
      baseUrl: "https://www.scholarshipmonkey.com/",
      domainName: "ScholarshipMonkey",
    },
    { baseUrl: "https://www.brokescholar.com/", domainName: "BrokeScholar" },
    {
      baseUrl:
        "https://www.careeronestop.org/Toolkit/Training/find-scholarships.aspx",
      domainName: "CareerOneStop (US Dept of Labor)",
    },
    {
      baseUrl: "https://www.collegeboard.org/",
      domainName: "College Board BigFuture",
    },
    {
      baseUrl: "https://www.accessscholarships.com/",
      domainName: "Access Scholarships",
    },
    {
      baseUrl: "https://www.scholarships360.org/",
      domainName: "Scholarships360",
    },
    {
      baseUrl: "https://www.jlvcollegecounseling.com/",
      domainName: "JLV College Counseling",
    },

    // --- EUROPE & UK PORTALS ---
    {
      baseUrl:
        "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
      domainName: "DAAD Germany",
    },
    {
      baseUrl:
        "https://www.britishcouncil.org/study-work-abroad/outside-uk/scholarships",
      domainName: "British Council",
    },
    {
      baseUrl: "https://study-uk.britishcouncil.org/scholarships-funding",
      domainName: "Study UK",
    },
    { baseUrl: "https://www.chevening.org/", domainName: "Chevening Awards" },
    { baseUrl: "https://www.erasmusmundus.it/", domainName: "Erasmus Mundus" },
    {
      baseUrl: "https://www.campusfrance.org/en/bourses-etudiants-etrangers",
      domainName: "Campus France",
    },
    {
      baseUrl: "https://www.studyinholland.nl/finances/scholarships",
      domainName: "Study in Holland",
    },
    {
      baseUrl: "https://www.studyinsweden.se/scholarships",
      domainName: "Study in Sweden",
    },
    {
      baseUrl: "https://www.studyaustria.at/en/study/scholarships",
      domainName: "Study in Austria",
    },
    {
      baseUrl: "https://www.educationsuisse.ch/",
      domainName: "Education Suisse",
    },
    {
      baseUrl: "https://www.studyinbelgium.be/en/scholarships",
      domainName: "Study in Belgium",
    },
    { baseUrl: "https://www.euraxess.es/", domainName: "Euraxess Spain" },
    {
      baseUrl: "https://www.studyinfinland.fi/scholarships",
      domainName: "Study in Finland",
    },
    {
      baseUrl: "https://www.studyinnorway.no/study-in-norway/scholarships",
      domainName: "Study in Norway",
    },
    {
      baseUrl:
        "https://www.studyindenmark.dk/study-options/tuition-fees-scholarships",
      domainName: "Study in Denmark",
    },
    {
      baseUrl: "https://www.postgrad.com/fees_and_funding/scholarships/",
      domainName: "Postgrad.com",
    },
    {
      baseUrl: "https://www.findamasters.com/funding/",
      domainName: "FindAMasters",
    },
    { baseUrl: "https://www.findaphd.com/funding/", domainName: "FindAPhD" },

    // --- NORTH AMERICA (USA/CANADA) PORTALS ---
    {
      baseUrl:
        "https://www.canada.ca/en/services/benefits/education/scholarships.html",
      domainName: "Government of Canada Scholarships",
    },
    {
      baseUrl: "https://www.univcan.ca/programs-and-scholarships/",
      domainName: "Universities Canada",
    },
    {
      baseUrl: "https://www.scholarshipscanada.com/",
      domainName: "Scholarships Canada",
    },
    { baseUrl: "https://www.yconic.com/", domainName: "Yconic" },
    {
      baseUrl: "https://www.cicsnews.com/category/scholarships",
      domainName: "Canada Immigration News Scholarships",
    },
    {
      baseUrl: "https://www.edupass.org/financial-aid/scholarships/",
      domainName: "EduPass",
    },
    {
      baseUrl: "https://www.fulbrightprogram.org/",
      domainName: "Fulbright Program",
    },
    {
      baseUrl: "https://www.iie.org/",
      domainName: "Institute of International Education",
    },
    {
      baseUrl: "https://www.amideast.org/our-work/exchange-programs",
      domainName: "Amideast",
    },
    {
      baseUrl: "https://www.hacu.net/hacu/Scholarships.asp",
      domainName: "HACU (Hispanic Association)",
    },
    {
      baseUrl: "https://www.uncf.org/scholarships",
      domainName: "UNCF (United Negro College Fund)",
    },
    { baseUrl: "https://www.apiascholars.org/", domainName: "APIA Scholars" },
    {
      baseUrl: "https://www.aauw.org/resources/programs/fellowships-grants/",
      domainName: "AAUW (Women/Girls)",
    },
    {
      baseUrl: "https://www.jackierobinson.org/scholarship/",
      domainName: "Jackie Robinson Foundation",
    },

    // --- ASIA, OCEANIA & MIDDLE EAST ---
    {
      baseUrl:
        "https://www.studyinaustralia.gov.au/english/australian-education/scholarships",
      domainName: "Study in Australia",
    },
    {
      baseUrl: "https://www.australiaawards.gov.au/",
      domainName: "Australia Awards",
    },
    {
      baseUrl: "https://www.enz.govt.nz/support/funding/scholarships/",
      domainName: "Education New Zealand",
    },
    {
      baseUrl:
        "https://www.mext.go.jp/en/policy/education/highered/title02/special02/smapstop.htm",
      domainName: "MEXT Japan",
    },
    {
      baseUrl: "https://www.studyinkorea.go.kr/en/sub/gks/all_scholarships.do",
      domainName: "Global Korea Scholarship",
    },
    {
      baseUrl: "https://www.csc.edu.cn/studyinchina/",
      domainName: "China Scholarship Council",
    },
    {
      baseUrl: "https://www.straitstimes.com/tags/scholarships",
      domainName: "Straits Times Scholarships (Singapore)",
    },
    {
      baseUrl: "https://www.moe.gov.sg/financial-matters/awards-scholarships",
      domainName: "MOE Singapore",
    },
    {
      baseUrl: "https://www.twas.org/opportunities",
      domainName: "TWAS (Developing World)",
    },
    {
      baseUrl: "https://www.isdb.org/scholarships",
      domainName: "Islamic Development Bank",
    },
    {
      baseUrl: "https://www.kaust.edu.sa/en/study/fellowship",
      domainName: "KAUST Fellowship",
    },

    // --- INTERNATIONAL ORGANIZATIONS & NGOS ---
    {
      baseUrl: "https://www.worldbank.org/en/programs/scholarships",
      domainName: "World Bank Scholarships",
    },
    {
      baseUrl: "https://www.unesco.org/en/fellowships",
      domainName: "UNESCO Fellowships",
    },
    {
      baseUrl: "https://www.rotary.org/en/our-programs/scholarships",
      domainName: "Rotary International",
    },
    {
      baseUrl: "https://www.fordfoundation.org/work/our-grants/",
      domainName: "Ford Foundation",
    },
    {
      baseUrl: "https://www.gatesfoundation.org/about/careers/scholarships",
      domainName: "Gates Foundation",
    },
    {
      baseUrl: "https://www.gatescambridge.org/",
      domainName: "Gates Cambridge",
    },
    {
      baseUrl:
        "https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/",
      domainName: "Rhodes Trust",
    },
    {
      baseUrl:
        "https://www.mastercardfdn.org/projects/the-mastercard-foundation-scholars-program/",
      domainName: "Mastercard Foundation",
    },
    {
      baseUrl: "https://www.opensocietyfoundations.org/grants",
      domainName: "Open Society Foundations",
    },
    {
      baseUrl:
        "https://www.akdn.org/our-agencies/aga-khan-foundation/international-scholarship-programme",
      domainName: "Aga Khan Foundation",
    },

    // --- SPECIALIZED & NICHE ---
    {
      baseUrl: "https://www.computer.org/scholarships",
      domainName: "IEEE Computer Society",
    },
    {
      baseUrl: "https://www.swe.org/scholarships",
      domainName: "Society of Women Engineers",
    },
    {
      baseUrl: "https://www.nsbe.org/scholarships",
      domainName: "National Society of Black Engineers",
    },
    {
      baseUrl: "https://www.shpe.org/students/scholarships",
      domainName: "SHPE (Hispanic Engineers)",
    },
    {
      baseUrl: "https://www.outtoswm.org/scholarships",
      domainName: "Out to Innovate (LGBTQ+ STEM)",
    },
    {
      baseUrl: "https://www.pointfoundation.org/",
      domainName: "Point Foundation",
    },
    {
      baseUrl: "https://www.thebeamanfoundation.com/",
      domainName: "Beaman Foundation",
    },
    {
      baseUrl: "https://www.wemakescholars.com/",
      domainName: "WeMakeScholars",
    },
    {
      baseUrl: "https://www.scholarshipsads.com/",
      domainName: "ScholarshipAds",
    },
    {
      baseUrl: "https://www.indixital.com/",
      domainName: "Indixital Scholarships",
    },
    {
      baseUrl: "https://www.bestschools.com/scholarships/",
      domainName: "Best Schools",
    },
    {
      baseUrl:
        "https://www.topuniversities.com/student-info/scholarship-advice",
      domainName: "QS TopUniversities",
    },
    {
      baseUrl:
        "https://www.timeshighereducation.com/student/advice/scholarships",
      domainName: "THE Student",
    },
    {
      baseUrl: "https://www.moneygeek.com/financial-search/scholarships/",
      domainName: "MoneyGeek Scholarships",
    },
    {
      baseUrl: "https://www.goodcall.com/scholarships/",
      domainName: "GoodCall",
    },
    {
      baseUrl: "https://www.discover.com/student-loans/scholarships/search",
      domainName: "Discover Scholarships",
    },
    { baseUrl: "https://www.finaid.org/scholarships/", domainName: "FinAid" },
    {
      baseUrl: "https://www.internationalscholarships.ca/",
      domainName: "International Scholarships Canada",
    },
    {
      baseUrl: "https://www.scholarshipdesk.com/",
      domainName: "Scholarship Desk",
    },
    { baseUrl: "https://www.youthop.com/", domainName: "Youth Opportunities" },
    {
      baseUrl: "https://www.opportunitiescircle.com/",
      domainName: "Opportunities Circle",
    },
    {
      baseUrl: "https://www.opportunitiesforyouth.org/",
      domainName: "Opportunities For Youth",
    },
    {
      baseUrl: "https://www.oecd.org/careers/internships-scholarships.htm",
      domainName: "OECD",
    },
    {
      baseUrl: "https://www.commonwealthscholarships.org/",
      domainName: "Commonwealth Scholarships",
    },
    { baseUrl: "https://www.daad.org.in/", domainName: "DAAD India" },
    {
      baseUrl: "https://www.france-education-international.fr/",
      domainName: "France Education International",
    },
    { baseUrl: "https://www.campus-austria.at/", domainName: "Campus Austria" },
    {
      baseUrl: "https://www.viva-mundo.com/en/scholarships",
      domainName: "Viva Mundo",
    },

    // --- TEAM'S NEW SOURCES (from previous merges) ---
    { baseUrl: "https://en.snu.ac.kr/admission/graduate/scholarships/before_admission", domainName: "Seoul National University" },
    { baseUrl: "https://admission.kaist.ac.kr/intl-graduate/kaist-scholarships/", domainName: "KAIST" },
    { baseUrl: "https://uic.yonsei.ac.kr/main/admission.asp?mid=m04_03_02", domainName: "Yonsei University" },
    { baseUrl: "https://graduate2.korea.ac.kr/graden/scholarship/scholarship.do", domainName: "Korea University" },
    { baseUrl: "https://www.skku.edu/eng/International/GlobalProgram/GlobalScholarship.do", domainName: "Sungkyunkwan University (SKKU)" },
    { baseUrl: "https://study.hanyang.ac.kr/en/scholarships/international", domainName: "Hanyang University" },
    { baseUrl: "https://www.khu.ac.kr/eng/user/contents/view.do?menuNo=2300164", domainName: "Kyung Hee University" },
    { baseUrl: "https://www.ewha.ac.kr/ewhaen/admission/scholarship-graduate.do", domainName: "Ewha Womans University" },
    { baseUrl: "https://adm-g.postech.ac.kr/eng/scholarships-and-fellowships/", domainName: "POSTECH" },
    { baseUrl: "https://www.gist.ac.kr/en/html/sub04/040201.html", domainName: "Gwangju Institute of Science and Technology (GIST)" },
    { baseUrl: "https://oia.cau.ac.kr/sub04/sub03.php", domainName: "Chung-Ang University" },
    { baseUrl: "https://eng.sejong.ac.kr/contents/eng/cor/scholarships1.html", domainName: "Sejong University" },
    { baseUrl: "https://adm-g.unist.ac.kr/costs-aid/scholarships/", domainName: "Ulsan National Institute of Science and Technology (UNIST)" },
    { baseUrl: "https://www.tsinghua.edu.cn/en/Admissions/Scholarships.htm", domainName: "Tsinghua University" },
    { baseUrl: "https://www.isd.pku.edu.cn/scholarships/degree.html", domainName: "Peking University" },
    { baseUrl: "https://iso.fudan.edu.cn/isoenglish/16215/list.htm", domainName: "Fudan University" },
    { baseUrl: "https://iczu.zju.edu.cn/admissionsen/2020/1020/c68988a2812423/page.htm", domainName: "Zhejiang University" },
    { baseUrl: "https://isc.sjtu.edu.cn/EN/content.aspx?info_lb=44&flag=2", domainName: "Shanghai Jiao Tong University" },
    { baseUrl: "https://hwxy.nju.edu.cn/English/Scholarships/ChineseGovernmentScholarships/index.html", domainName: "Nanjing University" },
    { baseUrl: "https://admission.whu.edu.cn/en/?c=content&a=list&catid=102", domainName: "Wuhan University" },
    { baseUrl: "https://is.sysu.edu.cn/en/scholarships", domainName: "Sun Yat-sen University" },
    { baseUrl: "https://isc.bit.edu.cn/scholarships/index.htm", domainName: "Beijing Institute of Technology" },
    { baseUrl: "https://sie.xjtu.edu.cn/en/SCHOLARSHIPS1/Scholarships_Programs.htm", domainName: "Xian Jiaotong University" },
    { baseUrl: "https://intl.scu.edu.cn/en/admissions/scholarships", domainName: "Sichuan University" },
    { baseUrl: "http://studyathit.hit.edu.cn/18705/list.htm", domainName: "Harbin Institute of Technology" },
    { baseUrl: "https://www.tudelft.nl/en/education/practical-matters/scholarships", domainName: "TU Delft" },
    { baseUrl: "https://www.uva.nl/en/education/master-s/scholarships--tuition/scholarships-and-loans/scholarships-and-loans.html", domainName: "University of Amsterdam" },
    { baseUrl: "https://www.universiteitleiden.nl/en/scholarships", domainName: "Leiden University" },
    { baseUrl: "https://www.uu.nl/masters/en/general-information/international-students/financial-matters/grants-and-scholarships", domainName: "Utrecht University" },
    { baseUrl: "https://www.rug.nl/education/scholarships/", domainName: "University of Groningen" },
    { baseUrl: "https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html", domainName: "ETH Zurich" },
    { baseUrl: "https://www.uzh.ch/en/studies/spending-financing/scholarships.html", domainName: "University of Zurich" },
    { baseUrl: "https://www.lunduniversity.lu.se/admissions/bachelors-and-masters-studies/scholarships-and-awards", domainName: "Lund University" },
    { baseUrl: "https://www.kth.se/en/studies/master/scholarships", domainName: "KTH Royal Institute of Technology" },
    { baseUrl: "https://www.uu.se/en/admissions/scholarships", domainName: "Uppsala University" },
    { baseUrl: "https://www.su.se/english/education/fees-and-scholarships/scholarships", domainName: "Stockholm University" },
    { baseUrl: "https://www.tum.de/en/studies/fees-and-financial-aid/scholarships", domainName: "Technical University of Munich" },
    { baseUrl: "https://www.rwth-aachen.de/cms/root/Studium/Vor-dem-Studium/Stipendien-Finanzierung/~ejx/Stipendien-fuer-Internationale/lidx/1/", domainName: "RWTH Aachen" },
    { baseUrl: "https://www.uni-heidelberg.de/en/study/management-of-studies/financing-your-studies/scholarships", domainName: "Heidelberg University" },
    { baseUrl: "https://www.helsinki.fi/en/admissions/scholarships-and-tuition-fees", domainName: "University of Helsinki" },
    { baseUrl: "https://www.kuleuven.be/english/admissions/travelling-to-leuven/funding-your-studies", domainName: "KU Leuven" },

    // --- LATEST TEAM ADDITIONS (Government, Universities, etc.) ---
    { baseUrl: "https://foreign.fulbrightonline.org/", domainName: "Fulbright Foreign Student Program (USA)" },
    { baseUrl: "https://www.chevening.org/scholarships/", domainName: "Chevening Scholarships (UK)" },
    { baseUrl: "https://erasmus-plus.ec.europa.eu/", domainName: "Erasmus+ (EU)" },
    { baseUrl: "https://www2.daad.de/deutschland/stipendium/", domainName: "DAAD Scholarships (Germany)" },
    { baseUrl: "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence", domainName: "Eiffel Excellence Scholarship (France)" },
    { baseUrl: "https://www.sbfi.admin.ch/", domainName: "Swiss Government Excellence Scholarships" },
    { baseUrl: "https://www.mext.go.jp/en/", domainName: "MEXT Scholarships (Japan)" },
    { baseUrl: "https://www.dfat.gov.au/people-to-people/australia-awards", domainName: "Australia Awards Scholarships" },
    { baseUrl: "https://www.gatescambridge.org/", domainName: "Gates Cambridge Scholarships" },
    { baseUrl: "https://www.rhodeshouse.ox.ac.uk/", domainName: "Rhodes Trust Scholarships" },
    { baseUrl: "https://mastercardfdn.org/all/scholars/", domainName: "Mastercard Foundation Scholars Program" },
    { baseUrl: "https://www.rotary.org/en/our-programs/peace-fellowships", domainName: "Rotary Peace Fellowships" },
    { baseUrl: "https://www.worldbank.org/en/programs/scholarships", domainName: "Joint Japan/World Bank Graduate Scholarship" },
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
    { baseUrl: "https://scholarships.unimelb.edu.au/", domainName: "University of Melbourne (Australia)" },
    { baseUrl: "https://www.sydney.edu.au/scholarships/", domainName: "University of Sydney (Australia)" },
    { baseUrl: "https://www.anu.edu.au/study/scholarships", domainName: "Australian National University (ANU)" },
    { baseUrl: "https://www.scholarships.unsw.edu.au/", domainName: "UNSW Sydney (Australia)" },
    { baseUrl: "https://scholarships.uq.edu.au/", domainName: "University of Queensland (Australia)" },
    { baseUrl: "https://www.monash.edu/study/fees-scholarships/scholarships", domainName: "Monash University (Australia)" },
    { baseUrl: "https://www.auckland.ac.nz/en/study/scholarships-and-awards.html", domainName: "University of Auckland (New Zealand)" },
    { baseUrl: "https://www.usp.br/internationaloffice/en/", domainName: "University of São Paulo (Brazil)" },
    { baseUrl: "https://www.unam.mx/", domainName: "UNAM (Mexico)" },
    { baseUrl: "https://www.uc.cl/en/", domainName: "Pontificia Universidad Católica de Chile" },
    { baseUrl: "https://tecnosfera.tec.mx/es/becas", domainName: "Tecnológico de Monterrey (Mexico)" },
    { baseUrl: "https://uniandes.edu.co/es/apoyo-financiero", domainName: "Universidad de los Andes (Colombia)" },
    { baseUrl: "https://www.uba.ar/", domainName: "Universidad de Buenos Aires (Argentina)" },
    { baseUrl: "https://uct.ac.za/students/fees-funding/bursaries-scholarships", domainName: "University of Cape Town (South Africa)" },
    { baseUrl: "https://www.wits.ac.za/study-at-wits/fees-and-funding/", domainName: "University of the Witwatersrand (South Africa)" },
    { baseUrl: "https://www.up.ac.za/fees-and-funding", domainName: "University of Pretoria (South Africa)" },
    { baseUrl: "https://www.kaust.edu.sa/en/admissions/kaust-fellowship", domainName: "KAUST (Saudi Arabia)" },
    { baseUrl: "https://scholarships.kfupm.edu.sa/", domainName: "King Fahd University (KFUPM)" },
    { baseUrl: "https://si.ksu.edu.sa/en/scholarships", domainName: "King Saud University" },
    { baseUrl: "https://www.psu.edu.sa/en/Admissions/Scholarships", domainName: "Prince Sultan University" },
    { baseUrl: "https://www.ku.ac.ae/scholarships-graduate", domainName: "Khalifa University (UAE)" },
    { baseUrl: "https://www.uaeu.ac.ae/en/graduate_council/scholarship_and_fellowship.shtml", domainName: "United Arab Emirates University (UAEU)" },
    { baseUrl: "https://www.zu.ac.ae/main/en/admission/undergraduate-admissions/scholarships", domainName: "Zayed University (UAE)" },
    { baseUrl: "https://www.hbku.edu.qa/en/scholarships", domainName: "Hamad Bin Khalifa University (Qatar)" },
    { baseUrl: "https://www.qu.edu.qa/students/admission/scholarships", domainName: "Qatar University" },
    { baseUrl: "https://www.aub.edu.lb/admissions/scholarships/Pages/default.aspx", domainName: "American University of Beirut (Lebanon)" },
    { baseUrl: "https://www.aucegypt.edu/admissions/scholarships", domainName: "American University in Cairo (Egypt)" },
    { baseUrl: "https://international.tau.ac.il/scholarship_funding", domainName: "Tel Aviv University (Israel)" }
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

// Run only when executed directly
if (__filename === process.argv[1]) {
  (async () => {
    try {
      await connectSequelize();
      await seedScholarshipSources();
      process.exit(0);
    } catch (error) {
      console.error("Critical error during seeding:", error);
      process.exit(1);
    }
  })();
}