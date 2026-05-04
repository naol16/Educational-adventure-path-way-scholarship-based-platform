import { ScholarshipSourceRepository } from "../repositories/ScholarshipSourceRepository.js";

export const seedScholarshipSources = async () => {
  const sources = [
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
    { baseUrl: "https://ju.edu.jo/Lists/Scholarships/All_Scholarships.aspx", domainName: "University of Jordan" }
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
