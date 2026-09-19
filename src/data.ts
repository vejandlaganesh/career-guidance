// Database of Streams, Categories, and Careers for Edu Carrier

export interface CategoryData {
  recruiters: string[];
  colleges: string[];
  exams: string[];
  certifications: string[];
  eligibility: string;
  jobdesc: string;
  roadmap: string[];
  future: string;
}

export interface StreamData {
  name: string;
  full: string;
  tagline: string;
  description: string;
  ug_courses: string[];
  higher_studies: string[];
  colleges: string[];
  exams: string[];
  skills: string[];
  salary: string;
  icon: string;
  key: string;
  career_ids: string[];
  ug_count: number;
  hs_count: number;
  career_count: number;
}

export interface Career {
  id: string;
  title: string;
  category: string;
  streams: string[];
  short: string;
  degree: string;
  skills: string[];
  languages: string[] | null;
  salary: [number, number] | string;
  growth: string;
  tags: Record<string, number>;
  overrides?: Partial<CategoryData>;
}

export interface CompiledCareer extends Omit<Career, 'overrides'> {
  jobdesc: string;
  eligibility: string;
  recruiters: string[];
  colleges: string[];
  exams: string[];
  certifications: string[];
  future: string;
  roadmap: string[];
}

export const CATEGORY_LABELS: Record<string, string> = {
  software_tech: "Software & Technology",
  core_engineering: "Core Engineering",
  science_research: "Science & Research",
  defence_uniform: "Defence & Uniformed Services",
  medical_health: "Medical & Healthcare",
  agri_food: "Agriculture & Food",
  business_finance: "Business & Finance",
  law_civil_service: "Law & Civil Services",
  media_creative: "Media & Creative",
  education_social: "Education & Social Work",
  hospitality_events: "Hospitality & Events",
  skill_trades: "Skilled Trades & Freelance",
};

export const WORK_TYPE_LABELS: Record<string, string> = {
  software_tech: "Office / remote-friendly",
  core_engineering: "Field & site-based",
  science_research: "Lab & research",
  defence_uniform: "Uniformed service",
  medical_health: "Clinical / patient-facing",
  agri_food: "Field-based",
  business_finance: "Office-based",
  law_civil_service: "Administrative / legal",
  media_creative: "Creative studio",
  education_social: "Classroom / community",
  hospitality_events: "On-site / guest-facing",
  skill_trades: "Hands-on / workshop",
};

export const TAG_LABELS: Record<string, string> = {
  coding: "Coding",
  engineering: "Engineering",
  biology: "Biology",
  medicine: "Medicine",
  business: "Business",
  finance: "Finance",
  design: "Design",
  creative: "Creative Arts",
  writing: "Writing",
  research: "Research",
  science: "Science",
  law: "Law",
  government: "Government",
  teaching: "Teaching",
  "helping-people": "Helping People",
  "hands-on": "Hands-on Work",
  defence: "Defence",
  aviation: "Aviation",
  space: "Space",
  hospitality: "Hospitality",
  agriculture: "Agriculture",
  analytics: "Analytics",
};

export const CATEGORIES: Record<string, CategoryData> = {
  software_tech: {
    recruiters: ["TCS, Infosys & Wipro", "Google, Microsoft & Amazon", "Flipkart & Swiggy", "Product startups"],
    colleges: ["IIT Bombay", "IIT Delhi", "IIIT Hyderabad", "BITS Pilani", "NIT Trichy", "VIT Vellore"],
    exams: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "State CETs"],
    certifications: ["AWS Certified Cloud Practitioner", "Google Data Analytics Certificate", "Meta Front-End Developer"],
    eligibility: "Class 12 with Physics, Chemistry & Mathematics (PCM) — MPC stream is the typical route",
    jobdesc: "{title}s design, build and maintain software or technology systems, working with product and engineering teams to solve real problems.",
    roadmap: [
      "Class 11-12: strengthen Maths & start learning to code",
      "Clear an engineering entrance exam (JEE / BITSAT / State CET)",
      "Pursue {degree}",
      "Build projects and take up internships in your specialisation",
      "Earn relevant certifications",
      "Start in an entry-level role and specialise over 2-4 years"
    ],
    future: "Demand for {titlelow} talent keeps rising as more industries go digital and adopt AI-driven systems, with strong long-term growth in India's tech sector."
  },
  core_engineering: {
    recruiters: ["L&T & Tata Motors", "Reliance Industries", "Siemens", "PSUs (BHEL, NTPC, ONGC)"],
    colleges: ["IITs", "NITs", "BITS Pilani", "State Government Engineering Colleges"],
    exams: ["JEE Main", "JEE Advanced", "State CETs", "GATE (for PSU/PG entry)"],
    certifications: ["AutoCAD", "SolidWorks", "PMP (for senior roles)"],
    eligibility: "Class 12 with Physics, Chemistry & Mathematics (PCM)",
    jobdesc: "{title}s apply engineering principles to design, build, test or maintain physical systems, structures or machinery.",
    roadmap: [
      "Class 11-12: build a strong base in Physics & Maths",
      "Clear an engineering entrance exam",
      "Pursue {degree}",
      "Complete internships and industry training",
      "Consider GATE for a PSU job or an M.Tech",
      "Enter the workforce or pursue further specialisation"
    ],
    future: "Core engineering stays foundational to infrastructure and manufacturing, with steady demand and fresh openings in green and sustainable engineering."
  },
  science_research: {
    recruiters: ["ISRO", "DRDO", "CSIR national labs", "Universities & research institutes"],
    colleges: ["IISc Bangalore", "IITs", "TIFR", "IISERs", "Central Universities"],
    exams: ["JEE Advanced", "IISER Aptitude Test", "GATE", "UGC-NET/JRF (for research)"],
    certifications: ["Research methodology courses", "Domain-specific lab certifications"],
    eligibility: "Class 12 with a science stream (PCM/PCB) and a strong aptitude for research",
    jobdesc: "{title}s carry out research and experiments to expand scientific understanding or solve applied technical problems.",
    roadmap: [
      "Class 11-12: excel in core sciences & Mathematics",
      "Pursue a B.Sc/B.Tech in a relevant discipline",
      "Complete an M.Sc/M.Tech with a research focus",
      "Qualify UGC-NET/GATE for research roles or a Ph.D.",
      "Join a research lab or institute",
      "Publish work and specialise further"
    ],
    future: "Growing national investment in space, defence and scientific research is opening more long-term, high-impact opportunities in this field."
  },
  defence_uniform: {
    recruiters: ["Indian Army", "Indian Navy", "Indian Air Force", "State & Central Police Forces"],
    colleges: ["NDA Khadakwasla", "IMA Dehradun", "OTA Chennai", "AFA Hyderabad"],
    exams: ["NDA Exam", "CDS", "AFCAT", "State Police Recruitment Exams"],
    certifications: ["Physical fitness & SSB interview preparation"],
    eligibility: "Class 12 pass (stream requirement depends on the specific force/entry); physical fitness standards apply",
    jobdesc: "{title}s serve in uniformed roles that protect citizens, defend the nation's borders, or maintain law and order.",
    roadmap: [
      "Class 11-12: build physical fitness alongside academics",
      "Appear for NDA/CDS/State recruitment exams",
      "Clear the written test, physical test & interview (SSB where applicable)",
      "Complete training at a service academy",
      "Join active service",
      "Progress through the ranks with experience"
    ],
    future: "Uniformed services continue to offer stable, respected careers with clear progression and strong post-retirement opportunities."
  },
  medical_health: {
    recruiters: ["Government & private hospitals", "AIIMS & medical colleges", "Pharma companies", "Public health bodies & NGOs"],
    colleges: ["AIIMS Delhi", "CMC Vellore", "JIPMER", "Government Medical Colleges"],
    exams: ["NEET UG", "NEET PG (for specialisation)"],
    certifications: ["Post-degree specialisation diplomas/fellowships"],
    eligibility: "Class 12 with Physics, Chemistry & Biology (PCB)",
    jobdesc: "{title}s work in healthcare settings to diagnose, treat and care for patients, or to advance medical and biological knowledge.",
    roadmap: [
      "Class 11-12: focus on Biology, Chemistry & Physics",
      "Qualify NEET UG",
      "Pursue {degree}",
      "Complete internship/residency",
      "Pursue a PG specialisation if desired",
      "Practice, research, or move into public health"
    ],
    future: "Healthcare demand in India keeps growing steadily, with rising need for specialists, rural healthcare access and health-tech integration."
  },
  agri_food: {
    recruiters: ["State Agriculture Departments", "FCI", "FSSAI", "Agri-tech startups & food processing companies"],
    colleges: ["ICAR institutes", "State Agricultural Universities"],
    exams: ["ICAR AIEEA", "State Agriculture Entrance Exams"],
    certifications: ["FSSAI certification", "Food safety auditor training"],
    eligibility: "Class 12 with Biology / Agriculture / PCB",
    jobdesc: "{title}s work to improve agricultural productivity, sustainability or food safety standards.",
    roadmap: [
      "Class 11-12: focus on Biology & allied sciences",
      "Qualify an agriculture entrance exam",
      "Pursue a degree in Agriculture/Food Technology",
      "Complete field training and internships",
      "Join government or private sector roles",
      "Specialise or move into policy/research"
    ],
    future: "Growing focus on food security and sustainable farming is creating steady, mission-driven career opportunities."
  },
  business_finance: {
    recruiters: ["Deloitte, EY, KPMG & PwC", "HDFC, ICICI & SBI", "Consulting firms", "Corporates across sectors"],
    colleges: ["Shri Ram College of Commerce", "Narsee Monjee (NMIMS)", "Christ University", "IIMs (for MBA)"],
    exams: ["CA Foundation / CS / CMA entrance", "CAT/XAT (for MBA)", "Bank PO exams"],
    certifications: ["CFA", "ACCA", "NISM certifications"],
    eligibility: "Class 12 with Commerce/Economics; Mathematics is recommended",
    jobdesc: "{title}s manage financial, business or organisational processes that help companies grow and operate efficiently.",
    roadmap: [
      "Class 11-12: focus on Accounts, Economics & Mathematics",
      "Pursue {degree}",
      "Gain internship experience in the field",
      "Consider an MBA or a professional certification (CA/CFA/CS)",
      "Build domain expertise (finance/marketing/ops)",
      "Move into managerial or specialist roles"
    ],
    future: "Business and finance roles remain in strong, steady demand as every industry needs financial and strategic expertise."
  },
  law_civil_service: {
    recruiters: ["Law firms", "The judiciary", "Central & State Government (UPSC/State PSC)", "Corporate legal teams"],
    colleges: ["National Law Universities (NLUs)", "Faculty of Law, Delhi University"],
    exams: ["CLAT", "AILET", "UPSC Civil Services Exam", "State PSC Exams"],
    certifications: ["Bar Council enrolment (for practising lawyers)"],
    eligibility: "Class 12 in any stream (Arts/Commerce preferred for Law & Civil Services)",
    jobdesc: "{title}s work within the legal or administrative system to uphold law, justice or public governance.",
    roadmap: [
      "Class 11-12: build strong reading, writing & analytical skills",
      "Qualify CLAT (Law) or complete graduation (for UPSC)",
      "Pursue {degree}",
      "Prepare for and clear the relevant exam (Bar/UPSC/State PSC)",
      "Complete training (legal practice / academy training)",
      "Practice, serve, or rise through administrative ranks"
    ],
    future: "Legal and civil-service careers offer long-term stability, real social impact and a clear progression path."
  },
  media_creative: {
    recruiters: ["Media houses (NDTV, Times Group)", "Design & ad agencies", "OTT platforms & production houses", "Freelance / self-employed"],
    colleges: ["National Institute of Design (NID)", "FTII Pune", "Xavier Institute of Communication"],
    exams: ["NID DAT", "UCEED", "Institute-specific entrance tests"],
    certifications: ["Adobe Certified Professional", "Portfolio-based industry certifications"],
    eligibility: "Class 12 in any stream; a strong portfolio or creative aptitude matters most",
    jobdesc: "{title}s create content, visuals or media experiences that inform, entertain or communicate ideas to an audience.",
    roadmap: [
      "Class 11-12: build a portfolio & explore creative tools",
      "Pursue a relevant design/media/journalism programme",
      "Intern with studios, agencies or media houses",
      "Build a strong personal portfolio or showreel",
      "Freelance or join an agency/studio",
      "Specialise and build a personal brand over time"
    ],
    future: "Creative and media careers are expanding fast as digital platforms, content creation and design-led business needs grow."
  },
  education_social: {
    recruiters: ["Schools & universities", "NGOs", "Government education boards", "Counselling centres & hospitals"],
    colleges: ["Regional Institutes of Education", "Central Universities", "TISS (for social work/psychology)"],
    exams: ["CTET/State TET (Teaching)", "UGC-NET (Professors)", "State PSC (Lecturers)"],
    certifications: ["B.Ed", "M.Ed", "Counselling certification"],
    eligibility: "Class 12 in any stream, followed by a relevant Bachelor's degree",
    jobdesc: "{title}s guide learning, wellbeing or social development for individuals and communities.",
    roadmap: [
      "Class 11-12: choose subjects aligned with your interest area",
      "Pursue a Bachelor's degree in the relevant field",
      "Complete B.Ed/M.Ed or specialised training as required",
      "Qualify CTET/NET/State PSC exams where applicable",
      "Gain classroom/field experience",
      "Progress to senior teaching, research or leadership roles"
    ],
    future: "Education and social-impact roles stay steady and essential, with growing emphasis on mental health and skilled teaching."
  },
  hospitality_events: {
    recruiters: ["Hotel chains (Taj, Oberoi, Marriott)", "Event management companies", "Airlines & travel companies"],
    colleges: ["Institutes of Hotel Management (IHM)", "Private hospitality institutes"],
    exams: ["NCHM JEE", "Institute-specific entrance tests"],
    certifications: ["Certified Meeting Professional", "Food & Beverage certifications"],
    eligibility: "Class 12 in any stream",
    jobdesc: "{title}s plan and manage guest experiences, hospitality operations or large-scale events.",
    roadmap: [
      "Class 11-12: develop communication & organisational skills",
      "Qualify NCHM JEE or an institute entrance test",
      "Pursue a hospitality/event management degree",
      "Complete internships with hotels/event companies",
      "Join as a management trainee",
      "Grow into operations or senior management roles"
    ],
    future: "Travel, tourism and the events industry keep growing steadily, creating consistent opportunities."
  },
  skill_trades: {
    recruiters: ["Manufacturing companies", "EV & automotive firms", "Digital/IT agencies", "Self-employed / freelance clients"],
    colleges: ["ITIs (Industrial Training Institutes)", "Polytechnic colleges", "Skill India / NSDC-affiliated centres"],
    exams: ["ITI/Polytechnic entrance tests", "No formal entrance exam for many freelance/digital paths"],
    certifications: ["NSDC skill certifications", "Google/Meta digital marketing certificates", "Vendor certifications (Autodesk, Cisco, etc.)"],
    eligibility: "Class 10/12 pass; hands-on, skill-based training matters more than the academic stream",
    jobdesc: "{title}s apply hands-on or specialised technical skills, usually gained through vocational or skill-based training.",
    roadmap: [
      "Class 10-12: explore hands-on projects & vocational subjects",
      "Join an ITI/Polytechnic or skill-based training programme",
      "Earn industry-recognised certifications",
      "Gain practical experience through apprenticeships or gigs",
      "Build a portfolio or client base",
      "Specialise, freelance, or move into supervisory roles"
    ],
    future: "Skill-based careers are growing fast as India invests heavily in vocational training, EV manufacturing and digital-first work."
  }
};

export const STREAMS: Record<string, StreamData> = {
  mpc: {
    name: "MPC",
    full: "Mathematics, Physics & Chemistry",
    tagline: "For future engineers, technologists, scientists and innovators.",
    description: "MPC builds a strong foundation in logic, quantitative reasoning and scientific method — the launchpad for engineering, technology, defence, aviation and research careers.",
    ug_courses: ["B.Tech (All Branches)", "B.E.", "B.Sc Mathematics", "B.Sc Physics", "B.Sc Computer Science", "BCA", "B.Arch", "Commercial Pilot Training", "Defence Academies", "Integrated M.Tech"],
    higher_studies: ["M.Tech", "M.S.", "MCA", "MBA", "M.Sc.", "Ph.D."],
    colleges: ["IIT Bombay", "IIT Delhi", "BITS Pilani", "IIIT Hyderabad", "NIT Trichy"],
    exams: ["JEE Main", "JEE Advanced", "BITSAT", "NDA", "NATA"],
    skills: ["Analytical thinking", "Mathematics", "Problem solving", "Programming logic"],
    salary: "₹3L – ₹40L+ per year depending on specialisation",
    icon: "atom",
    key: "mpc",
    career_ids: ["software-engineer", "ai-engineer", "ml-engineer", "data-scientist", "cybersecurity-analyst", "cloud-engineer", "devops-engineer", "robotics-engineer", "game-developer", "web-developer", "mobile-app-developer", "civil-engineer", "mechanical-engineer", "electrical-engineer", "electronics-engineer", "aerospace-engineer", "automobile-engineer", "architect", "pilot", "astronomer", "defence-officer", "isro-scientist", "drdo-scientist", "research-scientist"],
    ug_count: 10,
    hs_count: 6,
    career_count: 24
  },
  bipc: {
    name: "BiPC",
    full: "Biology, Physics & Chemistry",
    tagline: "For future doctors, researchers, and life-sciences professionals.",
    description: "BiPC is the traditional route into medicine and the life sciences, opening doors to clinical practice, biotechnology, agriculture and public-health careers.",
    ug_courses: ["MBBS", "BDS", "BAMS", "BHMS", "BPT", "B.Pharm", "Nursing", "Biotechnology", "Agriculture", "Veterinary Science", "Food Technology", "Microbiology", "Genetics"],
    higher_studies: ["MD", "MS", "M.Pharm", "M.Sc.", "Ph.D."],
    colleges: ["AIIMS Delhi", "CMC Vellore", "JIPMER", "Government Medical Colleges"],
    exams: ["NEET UG", "ICAR AIEEA"],
    skills: ["Biology & life sciences", "Patient/human empathy", "Attention to detail", "Scientific reasoning"],
    salary: "₹2L – ₹35L+ per year depending on specialisation",
    icon: "dna",
    key: "bipc",
    career_ids: ["doctor", "dentist", "surgeon", "pharmacist", "nurse", "physiotherapist", "veterinary-doctor", "nutritionist", "biotechnologist", "genetic-engineer", "clinical-researcher", "medical-lab-scientist", "public-health-officer", "agriculture-officer", "food-safety-officer", "biomedical-engineer", "medical-coding-specialist"],
    ug_count: 13,
    hs_count: 5,
    career_count: 17
  },
  mec: {
    name: "MEC",
    full: "Mathematics, Economics & Commerce",
    tagline: "For future business leaders, analysts, and finance professionals.",
    description: "MEC blends quantitative and commercial thinking, preparing students for careers in finance, accountancy, management and entrepreneurship.",
    ug_courses: ["B.Com", "BBA", "BA Economics", "CA", "CMA", "CS", "BMS", "Finance", "Banking"],
    higher_studies: ["MBA", "M.Com", "CFA", "Ph.D."],
    colleges: ["Shri Ram College of Commerce", "Narsee Monjee (NMIMS)", "Christ University"],
    exams: ["CA Foundation", "CAT/XAT", "Bank PO exams"],
    skills: ["Numerical ability", "Business acumen", "Financial literacy", "Communication"],
    salary: "₹3L – ₹40L+ per year depending on specialisation",
    icon: "chart",
    key: "mec",
    career_ids: ["chartered-accountant", "investment-banker", "business-analyst", "financial-analyst", "stock-market-analyst", "marketing-manager", "hr-manager", "tax-consultant", "company-secretary", "auditor", "entrepreneur", "bank-manager", "insurance-officer", "supply-chain-manager", "retail-manager"],
    ug_count: 9,
    hs_count: 4,
    career_count: 15
  },
  arts: {
    name: "Arts & Humanities",
    full: "Arts, Humanities & Design",
    tagline: "For future creators, communicators, thinkers and public leaders.",
    description: "Arts & Humanities opens the widest range of paths — law, media, design, civil services, psychology and education — built on strong communication and critical thinking.",
    ug_courses: ["BA English", "BA History", "BA Psychology", "Journalism", "Design", "Fashion Design", "Fine Arts", "Hotel Management", "Law", "Social Work"],
    higher_studies: ["MA", "LLM", "MBA", "Ph.D."],
    colleges: ["National Law Universities (NLUs)", "National Institute of Design (NID)", "FTII Pune"],
    exams: ["CLAT", "NID DAT", "UPSC Civil Services Exam"],
    skills: ["Communication", "Critical thinking", "Creativity", "Research & writing"],
    salary: "₹2L – ₹30L+ per year depending on specialisation",
    icon: "palette",
    key: "arts",
    career_ids: ["lawyer", "judge", "journalist", "news-anchor", "graphic-designer", "ux-ui-designer", "fashion-designer", "interior-designer", "animator", "filmmaker", "content-writer", "teacher", "professor", "psychologist", "ias-officer", "ips-officer", "ifs-officer", "social-worker", "hotel-manager", "event-manager"],
    ug_count: 10,
    hs_count: 4,
    career_count: 20
  },
  diploma: {
    name: "Diploma & Skill Careers",
    full: "Vocational & Skill-Based Careers",
    tagline: "For hands-on builders who want to skip straight to in-demand skills.",
    description: "Diploma and skill-based paths let students build in-demand technical or creative skills quickly, often leading straight into jobs or freelance work.",
    ug_courses: ["ITI Certificate Courses", "Polytechnic Diploma", "Skill Bootcamps (Tech/Design/Digital)"],
    higher_studies: ["Advanced Diplomas", "Lateral-entry B.Tech", "Professional certifications"],
    colleges: ["ITIs (Industrial Training Institutes)", "Polytechnic colleges", "NSDC-affiliated centres"],
    exams: ["ITI/Polytechnic entrance tests"],
    skills: ["Hands-on / technical skill", "Self-discipline", "Practical problem solving", "Client/portfolio management"],
    salary: "₹2L – ₹26L+ per year depending on skill & experience",
    icon: "tool",
    key: "diploma",
    career_ids: ["graphic-designer", "ux-ui-designer", "full-stack-developer", "ai-developer", "digital-marketer", "ethical-hacker", "video-editor", "photographer", "youtuber", "freelancer", "cad-designer", "electrician", "ev-technician", "cnc-programmer", "3d-printing-specialist"],
    ug_count: 3,
    hs_count: 3,
    career_count: 15
  },
  govt: {
    name: "Government Careers",
    full: "Government & Public Service Careers",
    tagline: "For future public servants, defenders and administrators.",
    description: "Government careers offer respected, stable paths into administration, defence, banking and public services through structured national and state exams.",
    ug_courses: ["Any Bachelor's Degree (stream depends on exact service)"],
    higher_studies: ["Academy/Service training", "MPA (Public Administration)"],
    colleges: ["NDA", "IMA Dehradun", "National Police Academy", "LBSNAA (for IAS training)"],
    exams: ["UPSC Civil Services Exam", "NDA/CDS", "SSC CGL", "IBPS/SBI PO", "State PSC Exams"],
    skills: ["Discipline", "Public administration", "Leadership", "General awareness"],
    salary: "₹4L – ₹24L+ per year depending on service & rank",
    icon: "shield",
    key: "govt",
    career_ids: ["isro-scientist", "drdo-scientist", "teacher", "ias-officer", "ips-officer", "ifs-officer", "irs-officer", "ssc-officer", "railway-officer", "police-officer", "army-officer", "navy-officer", "air-force-officer", "forest-officer", "bank-po", "sbi-officer", "lecturer"],
    ug_count: 1,
    hs_count: 2,
    career_count: 17
  },
  emerging: {
    name: "Emerging Careers",
    full: "Emerging & Future-Focused Careers",
    tagline: "For early movers into AI, space, climate and next-gen technology.",
    description: "Emerging careers sit at the frontier of technology and science — AI, blockchain, space, climate and quantum computing — fields growing fastest right now.",
    ug_courses: ["B.Tech (CS/AI/Emerging Tech)", "B.Sc (Physics/Environmental Science)"],
    higher_studies: ["M.Tech/M.Sc specialisations", "Ph.D. in emerging domains"],
    colleges: ["IITs & IIITs", "IISc Bangalore", "Specialised research institutes"],
    exams: ["JEE Advanced", "GATE", "Institute-specific entrance tests"],
    skills: ["Adaptability", "Programming/technical foundation", "Curiosity", "Interdisciplinary thinking"],
    salary: "₹3L – ₹30L+ per year depending on specialisation",
    icon: "rocket",
    key: "emerging",
    career_ids: ["ai-engineer", "ml-engineer", "robotics-engineer", "data-engineer", "prompt-engineer", "ai-trainer", "blockchain-developer", "web3-developer", "ar-vr-developer", "drone-pilot", "space-scientist", "quantum-computing-researcher", "renewable-energy-engineer", "climate-scientist", "bioinformatics-specialist"],
    ug_count: 2,
    hs_count: 2,
    career_count: 15
  },
  pcmb: {
    name: "PCMB",
    full: "Physics, Chemistry, Maths & Biology",
    tagline: "For students balancing both engineering & medicine frontiers.",
    description: "PCMB is a rigorous dual-science track designed for students who want to keep multiple pathways open. It qualifies you for both engineering and medical entries, as well as biotechnology, bioinformatics, and interdisciplinary scientific research.",
    ug_courses: ["B.Tech (All Branches)", "MBBS", "BDS", "B.Tech Biotechnology", "B.Sc Physics/Chemistry/Bio", "B.Pharm", "Integrated BS-MS"],
    higher_studies: ["MD/MS", "M.Tech", "Ph.D.", "M.Sc."],
    colleges: ["AIIMS Delhi", "IIT Bombay", "IISc Bangalore", "IISER Pune", "CMC Vellore"],
    exams: ["JEE Main", "NEET UG", "JEE Advanced", "IISER Aptitude Test (IAT)"],
    skills: ["Advanced analytical thinking", "Double-science discipline", "Complex mathematical modeling", "Biological observation"],
    salary: "₹3L – ₹40L+ per year depending on specialisation",
    icon: "dna",
    key: "pcmb",
    career_ids: ["software-engineer", "ai-engineer", "biotechnologist", "genetic-engineer", "doctor", "space-scientist", "bioinformatics-specialist", "quantum-computing-researcher", "ev-powertrain-engineer", "agricultural-ai-specialist"],
    ug_count: 7,
    hs_count: 4,
    career_count: 10
  },
  cec: {
    name: "CEC",
    full: "Civics, Economics & Commerce",
    tagline: "For future corporate legal experts, policy analysts, and business leaders.",
    description: "CEC focuses on public administration, political systems, economics, and corporate trade. It is highly valued for students targeting Civil Services, Law, Public Relations, Chartered Accountancy, and Corporate Management.",
    ug_courses: ["B.Com", "BBA", "BA Economics", "Integrated LLB (5 Years)", "BA Political Science", "Chartered Accountancy", "Company Secretary"],
    higher_studies: ["MBA", "M.Com", "LLM", "CFA", "M.A. Public Policy"],
    colleges: ["Shri Ram College of Commerce (SRCC)", "National Law School (NLSIU Bengaluru)", "Delhi University", "Christ University"],
    exams: ["CLAT", "CA Foundation", "CUET UG", "UPSC Civil Services"],
    skills: ["Policy analysis", "Public administration", "Legal reasoning", "Commercial literacy"],
    salary: "₹3L – ₹30L+ per year depending on specialisation",
    icon: "shield",
    key: "cec",
    career_ids: ["chartered-accountant", "corporate-lawyer", "tax-consultant", "cyber-law-expert", "ias-officer", "bank-po", "fintech-analyst", "product-manager"],
    ug_count: 7,
    hs_count: 5,
    career_count: 8
  }
};

export const CAREERS_RAW: Record<string, Career> = {
  "software-engineer": {
    id: "software-engineer",
    title: "Software Engineer",
    category: "software_tech",
    streams: ["mpc"],
    short: "Builds and ships the software behind apps, websites and platforms.",
    degree: "B.Tech/BCA/B.Sc in Computer Science",
    skills: ["Problem solving", "Data structures & algorithms", "Teamwork", "Debugging"],
    languages: ["Python", "Java", "JavaScript", "C++"],
    salary: [4, 24],
    growth: "High Growth",
    tags: { coding: 3, engineering: 1 }
  },
  "ai-engineer": {
    id: "ai-engineer",
    title: "AI Engineer",
    category: "software_tech",
    streams: ["mpc", "emerging"],
    short: "Designs and deploys AI models that power intelligent products.",
    degree: "B.Tech in CS/AI & Data Science",
    skills: ["Machine learning", "Python", "Statistics", "Model deployment"],
    languages: ["Python", "SQL"],
    salary: [6, 30],
    growth: "Very High Growth",
    tags: { coding: 3, science: 1 }
  },
  "ml-engineer": {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    category: "software_tech",
    streams: ["mpc", "emerging"],
    short: "Turns machine learning research into production-ready systems.",
    degree: "B.Tech in CS/AI, M.Tech optional",
    skills: ["Machine learning", "Data engineering", "Python", "Cloud platforms"],
    languages: ["Python", "SQL", "C++"],
    salary: [6, 28],
    growth: "Very High Growth",
    tags: { coding: 3, science: 1 }
  },
  "data-scientist": {
    id: "data-scientist",
    title: "Data Scientist",
    category: "software_tech",
    streams: ["mpc"],
    short: "Turns raw data into insights and predictions that guide decisions.",
    degree: "B.Tech/B.Sc + Data Science specialisation",
    skills: ["Statistics", "Python/R", "Data visualisation", "Business acumen"],
    languages: ["Python", "R", "SQL"],
    salary: [5, 26],
    growth: "Very High Growth",
    tags: { coding: 2, analytics: 3 }
  },
  "cybersecurity-analyst": {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    category: "software_tech",
    streams: ["mpc"],
    short: "Protects systems and data from cyber threats and breaches.",
    degree: "B.Tech in CS/IT or Cybersecurity",
    skills: ["Network security", "Ethical hacking", "Risk analysis", "Incident response"],
    languages: ["Python", "Bash"],
    salary: [5, 22],
    growth: "Very High Growth",
    tags: { coding: 2, analytics: 2 }
  },
  "cloud-engineer": {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    category: "software_tech",
    streams: ["mpc"],
    short: "Builds and manages the cloud infrastructure apps run on.",
    degree: "B.Tech in CS/IT",
    skills: ["Cloud platforms (AWS/Azure/GCP)", "Networking", "DevOps basics", "Security"],
    languages: ["Python", "Go"],
    salary: [5, 24],
    growth: "Very High Growth",
    tags: { coding: 2, engineering: 2 }
  },
  "devops-engineer": {
    id: "devops-engineer",
    title: "DevOps Engineer",
    category: "software_tech",
    streams: ["mpc"],
    short: "Automates and streamlines how software is built, tested and released.",
    degree: "B.Tech in CS/IT",
    skills: ["CI/CD pipelines", "Containers (Docker/K8s)", "Scripting", "Cloud platforms"],
    languages: ["Python", "Bash", "Go"],
    salary: [5, 22],
    growth: "Very High Growth",
    tags: { coding: 3 }
  },
  "robotics-engineer": {
    id: "robotics-engineer",
    title: "Robotics Engineer",
    category: "core_engineering",
    streams: ["mpc", "emerging"],
    short: "Designs and programs robots and automated mechanical systems.",
    degree: "B.Tech in Robotics/Mechatronics",
    skills: ["Embedded systems", "Control systems", "Programming", "CAD design"],
    languages: ["C++", "Python"],
    salary: [4, 18],
    growth: "High Growth",
    tags: { engineering: 3, coding: 1 }
  },
  "game-developer": {
    id: "game-developer",
    title: "Game Developer",
    category: "software_tech",
    streams: ["mpc"],
    short: "Codes and builds the mechanics behind video games.",
    degree: "B.Tech/BCA + game development specialisation",
    skills: ["Game engines (Unity/Unreal)", "C#/C++", "3D maths", "Creativity"],
    languages: ["C#", "C++"],
    salary: [3, 15],
    growth: "High Growth",
    tags: { coding: 2, creative: 2 }
  },
  "web-developer": {
    id: "web-developer",
    title: "Web Developer",
    category: "software_tech",
    streams: ["mpc"],
    short: "Builds and maintains websites and web applications.",
    degree: "B.Tech/BCA in Computer Science",
    skills: ["HTML/CSS/JS", "Frontend frameworks", "APIs", "Responsive design"],
    languages: ["JavaScript", "HTML/CSS"],
    salary: [3, 14],
    growth: "High Growth",
    tags: { coding: 2, design: 1 }
  },
  "mobile-app-developer": {
    id: "mobile-app-developer",
    title: "Mobile App Developer",
    category: "software_tech",
    streams: ["mpc"],
    short: "Builds apps for Android and iOS devices.",
    degree: "B.Tech/BCA in Computer Science",
    skills: ["Mobile frameworks", "UI design", "APIs", "App store deployment"],
    languages: ["Kotlin", "Swift", "Flutter/Dart"],
    salary: [4, 16],
    growth: "High Growth",
    tags: { coding: 2, design: 1 }
  },
  "civil-engineer": {
    id: "civil-engineer",
    title: "Civil Engineer",
    category: "core_engineering",
    streams: ["mpc"],
    short: "Plans and builds infrastructure — roads, bridges and buildings.",
    degree: "B.Tech/B.E. in Civil Engineering",
    skills: ["Structural design", "AutoCAD", "Project management", "Site supervision"],
    languages: null,
    salary: [3, 12],
    growth: "Growing",
    tags: { engineering: 3 }
  },
  "mechanical-engineer": {
    id: "mechanical-engineer",
    title: "Mechanical Engineer",
    category: "core_engineering",
    streams: ["mpc"],
    short: "Designs, builds and maintains machines and mechanical systems.",
    degree: "B.Tech/B.E. in Mechanical Engineering",
    skills: ["CAD/CAM", "Thermodynamics", "Manufacturing processes", "Problem solving"],
    languages: null,
    salary: [3, 12],
    growth: "Growing",
    tags: { engineering: 3 }
  },
  "electrical-engineer": {
    id: "electrical-engineer",
    title: "Electrical Engineer",
    category: "core_engineering",
    streams: ["mpc"],
    short: "Designs and maintains electrical systems and power equipment.",
    degree: "B.Tech/B.E. in Electrical Engineering",
    skills: ["Circuit design", "Power systems", "Control systems", "Safety standards"],
    languages: null,
    salary: [3, 12],
    growth: "Growing",
    tags: { engineering: 3 }
  },
  "electronics-engineer": {
    id: "electronics-engineer",
    title: "Electronics Engineer",
    category: "core_engineering",
    streams: ["mpc"],
    short: "Designs electronic circuits, chips and communication systems.",
    degree: "B.Tech/B.E. in Electronics & Communication",
    skills: ["Circuit design", "Embedded systems", "Signal processing", "PCB design"],
    languages: null,
    salary: [3, 13],
    growth: "Growing",
    tags: { engineering: 3, coding: 1 }
  },
  "aerospace-engineer": {
    id: "aerospace-engineer",
    title: "Aerospace Engineer",
    category: "core_engineering",
    streams: ["mpc"],
    short: "Designs aircraft, spacecraft and their propulsion systems.",
    degree: "B.Tech in Aerospace/Aeronautical Engineering",
    skills: ["Aerodynamics", "CAD design", "Materials science", "Simulation tools"],
    languages: null,
    salary: [4, 16],
    growth: "High Growth",
    tags: { engineering: 3, space: 1 }
  },
  "automobile-engineer": {
    id: "automobile-engineer",
    title: "Automobile Engineer",
    category: "core_engineering",
    streams: ["mpc"],
    short: "Designs and improves vehicles, engines and automotive systems.",
    degree: "B.Tech in Automobile/Mechanical Engineering",
    skills: ["Vehicle design", "CAD/CAM", "Manufacturing", "EV systems"],
    languages: null,
    salary: [3, 13],
    growth: "Growing",
    tags: { engineering: 3 }
  },
  "architect": {
    id: "architect",
    title: "Architect",
    category: "core_engineering",
    streams: ["mpc"],
    short: "Designs buildings and spaces that are functional and beautiful.",
    degree: "B.Arch (5-year programme)",
    skills: ["Design software (AutoCAD/Revit)", "Spatial planning", "Sketching", "Client communication"],
    languages: null,
    salary: [3, 15],
    growth: "Growing",
    tags: { design: 3, engineering: 1 },
    overrides: {
      exams: ["NATA", "JEE Main Paper 2"],
      eligibility: "Class 12 with Mathematics; qualify NATA or JEE Main Paper 2",
      colleges: ["School of Planning & Architecture (SPA)", "IITs (Architecture)", "CEPT University"]
    }
  },
  "pilot": {
    id: "pilot",
    title: "Pilot",
    category: "defence_uniform",
    streams: ["mpc"],
    short: "Flies commercial aircraft and is responsible for passenger safety.",
    degree: "Commercial Pilot Licence (CPL) after Class 12",
    skills: ["Flight skills", "Quick decision-making", "Communication", "Discipline"],
    languages: null,
    salary: [8, 40],
    growth: "Growing",
    tags: { aviation: 3 },
    overrides: {
      recruiters: ["IndiGo, Air India & Vistara", "Cargo & charter operators"],
      colleges: ["DGCA-approved flying schools", "Indira Gandhi Rashtriya Uran Akademi"],
      exams: ["DGCA Class 1 Medical", "CPL ground exams"],
      eligibility: "Class 12 with Physics & Mathematics; DGCA medical fitness required",
      certifications: ["Commercial Pilot Licence (CPL)", "Type rating on specific aircraft"]
    }
  },
  "astronomer": {
    id: "astronomer",
    title: "Astronomer",
    category: "science_research",
    streams: ["mpc"],
    short: "Studies celestial objects and the physics of the universe.",
    degree: "B.Sc/M.Sc Physics + Ph.D. in Astronomy/Astrophysics",
    skills: ["Physics & maths", "Data analysis", "Research writing", "Programming"],
    languages: ["Python"],
    salary: [4, 12],
    growth: "Steady",
    tags: { science: 3, space: 2 }
  },
  "defence-officer": {
    id: "defence-officer",
    title: "Defence Officer",
    category: "defence_uniform",
    streams: ["mpc"],
    short: "Leads and serves in the Indian Armed Forces.",
    degree: "NDA / CDS entry, followed by academy training",
    skills: ["Leadership", "Physical fitness", "Strategic thinking", "Discipline"],
    languages: null,
    salary: [6, 18],
    growth: "Steady",
    tags: { defence: 3 }
  },
  "isro-scientist": {
    id: "isro-scientist",
    title: "ISRO Scientist",
    category: "science_research",
    streams: ["mpc", "govt"],
    short: "Works on India's space missions, satellites and launch vehicles.",
    degree: "B.Tech/M.Tech/M.Sc in relevant engineering or science",
    skills: ["Engineering fundamentals", "Research", "Precision", "Teamwork"],
    languages: ["Python", "C++"],
    salary: [6, 18],
    growth: "Steady",
    tags: { science: 3, space: 3 }
  },
  "drdo-scientist": {
    id: "drdo-scientist",
    title: "DRDO Scientist",
    category: "science_research",
    streams: ["mpc", "govt"],
    short: "Researches and develops advanced defence technology for India.",
    degree: "B.Tech/M.Tech/M.Sc in relevant engineering or science",
    skills: ["Engineering fundamentals", "Research", "Precision", "Security clearance"],
    languages: null,
    salary: [6, 18],
    growth: "Steady",
    tags: { science: 3, defence: 2 }
  },
  "research-scientist": {
    id: "research-scientist",
    title: "Research Scientist",
    category: "science_research",
    streams: ["mpc"],
    short: "Conducts original research to advance knowledge in a chosen field.",
    degree: "B.Sc/B.Tech + M.Sc/Ph.D.",
    skills: ["Research design", "Analytical thinking", "Academic writing", "Lab/technical skills"],
    languages: null,
    salary: [4, 14],
    growth: "Steady",
    tags: { science: 3, research: 2 }
  },
  "doctor": {
    id: "doctor",
    title: "Doctor",
    category: "medical_health",
    streams: ["bipc"],
    short: "Diagnoses and treats patients across general or specialised medicine.",
    degree: "MBBS (5.5 years incl. internship)",
    skills: ["Clinical diagnosis", "Patient communication", "Attention to detail", "Resilience"],
    languages: null,
    salary: [6, 20],
    growth: "Growing",
    tags: { medicine: 3, "helping-people": 2 }
  },
  "dentist": {
    id: "dentist",
    title: "Dentist",
    category: "medical_health",
    streams: ["bipc"],
    short: "Diagnoses and treats problems of teeth, gums and the mouth.",
    degree: "BDS (5 years incl. internship)",
    skills: ["Manual dexterity", "Patient care", "Precision", "Communication"],
    languages: null,
    salary: [3, 12],
    growth: "Growing",
    tags: { medicine: 3 }
  },
  "surgeon": {
    id: "surgeon",
    title: "Surgeon",
    category: "medical_health",
    streams: ["bipc"],
    short: "Performs operations to treat injuries, diseases and deformities.",
    degree: "MBBS + MS/MCh specialisation",
    skills: ["Surgical precision", "Decision-making under pressure", "Stamina", "Teamwork"],
    languages: null,
    salary: [10, 35],
    growth: "High Growth",
    tags: { medicine: 3 }
  },
  "pharmacist": {
    id: "pharmacist",
    title: "Pharmacist",
    category: "medical_health",
    streams: ["bipc"],
    short: "Prepares and dispenses medication and advises on safe use.",
    degree: "B.Pharm (4 years)",
    skills: ["Pharmacology knowledge", "Attention to detail", "Customer communication", "Record keeping"],
    languages: null,
    salary: [2, 8],
    growth: "Growing",
    tags: { medicine: 2 }
  },
  "nurse": {
    id: "nurse",
    title: "Nurse",
    category: "medical_health",
    streams: ["bipc"],
    short: "Provides patient care, treatment and support in clinical settings.",
    degree: "B.Sc Nursing (4 years)",
    skills: ["Patient care", "Clinical procedures", "Empathy", "Attention to detail"],
    languages: null,
    salary: [2, 7],
    growth: "Growing",
    tags: { medicine: 2, "helping-people": 3 }
  },
  "physiotherapist": {
    id: "physiotherapist",
    title: "Physiotherapist",
    category: "medical_health",
    streams: ["bipc"],
    short: "Helps patients recover movement and manage pain through therapy.",
    degree: "BPT (Bachelor of Physiotherapy)",
    skills: ["Anatomy knowledge", "Patient assessment", "Hands-on therapy techniques", "Patience"],
    languages: null,
    salary: [3, 9],
    growth: "Growing",
    tags: { medicine: 2, "helping-people": 2 }
  },
  "veterinary-doctor": {
    id: "veterinary-doctor",
    title: "Veterinary Doctor",
    category: "medical_health",
    streams: ["bipc"],
    short: "Diagnoses and treats illnesses and injuries in animals.",
    degree: "B.V.Sc & AH (5 years incl. internship)",
    skills: ["Animal handling", "Diagnosis", "Surgery basics", "Compassion"],
    languages: null,
    salary: [3, 10],
    growth: "Growing",
    tags: { medicine: 2, agriculture: 1 }
  },
  "nutritionist": {
    id: "nutritionist",
    title: "Nutritionist",
    category: "medical_health",
    streams: ["bipc"],
    short: "Advises individuals and organisations on diet and healthy eating.",
    degree: "B.Sc in Nutrition & Dietetics",
    skills: ["Nutrition science", "Counselling", "Meal planning", "Communication"],
    languages: null,
    salary: [2, 8],
    growth: "Growing",
    tags: { medicine: 2, "helping-people": 1 }
  },
  "biotechnologist": {
    id: "biotechnologist",
    title: "Biotechnologist",
    category: "science_research",
    streams: ["bipc"],
    short: "Uses biology to develop products in medicine, agriculture and industry.",
    degree: "B.Sc/B.Tech in Biotechnology",
    skills: ["Lab techniques", "Molecular biology", "Data analysis", "Research design"],
    languages: null,
    salary: [3, 12],
    growth: "High Growth",
    tags: { biology: 3, research: 2 }
  },
  "genetic-engineer": {
    id: "genetic-engineer",
    title: "Genetic Engineer",
    category: "science_research",
    streams: ["bipc"],
    short: "Modifies genetic material for medical, agricultural or industrial use.",
    degree: "B.Tech/M.Sc in Genetic Engineering",
    skills: ["Molecular biology", "Lab techniques", "Bioinformatics basics", "Precision"],
    languages: null,
    salary: [4, 14],
    growth: "High Growth",
    tags: { biology: 3, research: 2 }
  },
  "clinical-researcher": {
    id: "clinical-researcher",
    title: "Clinical Researcher",
    category: "science_research",
    streams: ["bipc"],
    short: "Designs and runs clinical trials that test new treatments.",
    degree: "B.Pharm/MBBS/B.Sc + Clinical Research diploma",
    skills: ["Trial design", "Regulatory knowledge", "Data analysis", "Documentation"],
    languages: null,
    salary: [4, 14],
    growth: "High Growth",
    tags: { biology: 2, research: 3 }
  },
  "medical-lab-scientist": {
    id: "medical-lab-scientist",
    title: "Medical Laboratory Scientist",
    category: "medical_health",
    streams: ["bipc"],
    short: "Runs diagnostic tests that help doctors detect and treat disease.",
    degree: "B.Sc in Medical Lab Technology (MLT)",
    skills: ["Lab techniques", "Equipment handling", "Accuracy", "Report writing"],
    languages: null,
    salary: [2, 7],
    growth: "Growing",
    tags: { medicine: 2, analytics: 1 }
  },
  "public-health-officer": {
    id: "public-health-officer",
    title: "Public Health Officer",
    category: "medical_health",
    streams: ["bipc"],
    short: "Plans and runs programmes that protect community health.",
    degree: "MBBS/B.Sc + MPH (Master of Public Health)",
    skills: ["Epidemiology", "Programme planning", "Communication", "Data analysis"],
    languages: null,
    salary: [4, 12],
    growth: "High Growth",
    tags: { medicine: 2, government: 1, "helping-people": 2 }
  },
  "agriculture-officer": {
    id: "agriculture-officer",
    title: "Agriculture Officer",
    category: "agri_food",
    streams: ["bipc"],
    short: "Supports farmers with modern techniques, schemes and resources.",
    degree: "B.Sc Agriculture (4 years)",
    skills: ["Crop science", "Field assessment", "Government scheme knowledge", "Communication"],
    languages: null,
    salary: [3, 9],
    growth: "Growing",
    tags: { agriculture: 3, government: 1 }
  },
  "food-safety-officer": {
    id: "food-safety-officer",
    title: "Food Safety Officer",
    category: "agri_food",
    streams: ["bipc"],
    short: "Inspects and certifies that food meets safety and quality standards.",
    degree: "B.Sc/B.Tech in Food Technology",
    skills: ["Food science", "Regulatory knowledge (FSSAI)", "Inspection & auditing", "Report writing"],
    languages: null,
    salary: [3, 9],
    growth: "Growing",
    tags: { agriculture: 2, government: 1 }
  },
  "biomedical-engineer": {
    id: "biomedical-engineer",
    title: "Biomedical Engineer",
    category: "core_engineering",
    streams: ["bipc"],
    short: "Designs medical devices and equipment used in healthcare.",
    degree: "B.Tech in Biomedical Engineering",
    skills: ["Medical device design", "Electronics basics", "Biology knowledge", "Problem solving"],
    languages: null,
    salary: [3, 12],
    growth: "High Growth",
    tags: { medicine: 2, engineering: 2 }
  },
  "medical-coding-specialist": {
    id: "medical-coding-specialist",
    title: "Medical Coding Specialist",
    category: "medical_health",
    streams: ["bipc"],
    short: "Translates medical records into standardised billing codes.",
    degree: "Life-science degree + medical coding certification",
    skills: ["Medical terminology", "Coding standards (ICD/CPT)", "Accuracy", "Software tools"],
    languages: null,
    salary: [2, 7],
    growth: "Growing",
    tags: { medicine: 1, analytics: 2 }
  },
  "chartered-accountant": {
    id: "chartered-accountant",
    title: "Chartered Accountant",
    category: "business_finance",
    streams: ["mec"],
    short: "Manages accounting, audits, tax and financial strategy for organisations.",
    degree: "CA (via ICAI — Foundation, Inter, Final)",
    skills: ["Accounting standards", "Taxation", "Auditing", "Analytical thinking"],
    languages: null,
    salary: [7, 25],
    growth: "Growing",
    tags: { finance: 3, business: 1 }
  },
  "investment-banker": {
    id: "investment-banker",
    title: "Investment Banker",
    category: "business_finance",
    streams: ["mec"],
    short: "Helps companies raise capital and advises on mergers & acquisitions.",
    degree: "B.Com/BBA + MBA (Finance)",
    skills: ["Financial modelling", "Valuation", "Negotiation", "Long working hours tolerance"],
    languages: null,
    salary: [8, 40],
    growth: "High Growth",
    tags: { finance: 3 }
  },
  "business-analyst": {
    id: "business-analyst",
    title: "Business Analyst",
    category: "business_finance",
    streams: ["mec"],
    short: "Studies business processes and recommends data-driven improvements.",
    degree: "BBA/B.Com + analytics skills",
    skills: ["Data analysis", "Process mapping", "Communication", "Excel/SQL"],
    languages: null,
    salary: [5, 18],
    growth: "High Growth",
    tags: { business: 3, analytics: 2 }
  },
  "financial-analyst": {
    id: "financial-analyst",
    title: "Financial Analyst",
    category: "business_finance",
    streams: ["mec"],
    short: "Analyses financial data to guide investment and business decisions.",
    degree: "B.Com/BBA (Finance) + CFA optional",
    skills: ["Financial modelling", "Excel", "Market research", "Reporting"],
    languages: null,
    salary: [4, 16],
    growth: "High Growth",
    tags: { finance: 3 }
  },
  "stock-market-analyst": {
    id: "stock-market-analyst",
    title: "Stock Market Analyst",
    category: "business_finance",
    streams: ["mec"],
    short: "Researches markets and companies to guide trading/investment calls.",
    degree: "B.Com/BBA + NISM certifications",
    skills: ["Market research", "Technical & fundamental analysis", "Risk assessment", "Reporting"],
    languages: null,
    salary: [4, 18],
    growth: "Growing",
    tags: { finance: 3 }
  },
  "marketing-manager": {
    id: "marketing-manager",
    title: "Marketing Manager",
    category: "business_finance",
    streams: ["mec"],
    short: "Plans campaigns and strategy to grow a brand's reach and sales.",
    degree: "BBA/B.Com + MBA (Marketing)",
    skills: ["Brand strategy", "Digital marketing", "Communication", "Analytics"],
    languages: null,
    salary: [6, 22],
    growth: "Growing",
    tags: { business: 3, creative: 1 }
  },
  "hr-manager": {
    id: "hr-manager",
    title: "HR Manager",
    category: "business_finance",
    streams: ["mec"],
    short: "Manages hiring, culture, performance and employee wellbeing.",
    degree: "BBA/B.Com + MBA (HR)",
    skills: ["People management", "Communication", "Conflict resolution", "Labour law basics"],
    languages: null,
    salary: [5, 18],
    growth: "Growing",
    tags: { business: 3, "helping-people": 1 }
  },
  "tax-consultant": {
    id: "tax-consultant",
    title: "Tax Consultant",
    category: "business_finance",
    streams: ["mec"],
    short: "Advises individuals and businesses on tax planning and compliance.",
    degree: "B.Com + CA/CMA or tax law specialisation",
    skills: ["Tax law knowledge", "Analytical thinking", "Attention to detail", "Client communication"],
    languages: null,
    salary: [4, 14],
    growth: "Growing",
    tags: { finance: 3 }
  },
  "company-secretary": {
    id: "company-secretary",
    title: "Company Secretary",
    category: "business_finance",
    streams: ["mec"],
    short: "Ensures a company follows legal and regulatory compliance.",
    degree: "CS (via ICSI)",
    skills: ["Corporate law", "Compliance management", "Documentation", "Attention to detail"],
    languages: null,
    salary: [5, 15],
    growth: "Growing",
    tags: { finance: 2, law: 1 }
  },
  "auditor": {
    id: "auditor",
    title: "Auditor",
    category: "business_finance",
    streams: ["mec"],
    short: "Examines financial records to ensure accuracy and compliance.",
    degree: "B.Com + CA/CMA",
    skills: ["Accounting standards", "Analytical thinking", "Attention to detail", "Report writing"],
    languages: null,
    salary: [4, 14],
    growth: "Growing",
    tags: { finance: 3 }
  },
  "entrepreneur": {
    id: "entrepreneur",
    title: "Entrepreneur",
    category: "business_finance",
    streams: ["mec"],
    short: "Builds and runs a business venture from the ground up.",
    degree: "Any degree (BBA/B.Com common); real-world learning is key",
    skills: ["Risk-taking", "Leadership", "Problem solving", "Resilience"],
    languages: null,
    salary: "Variable — depends on the venture",
    growth: "High Growth",
    tags: { business: 3 }
  },
  "bank-manager": {
    id: "bank-manager",
    title: "Bank Manager",
    category: "business_finance",
    streams: ["mec"],
    short: "Oversees branch operations, lending decisions and customer service.",
    degree: "B.Com/BBA + bank probationary officer exams",
    skills: ["Financial products knowledge", "People management", "Risk assessment", "Communication"],
    languages: null,
    salary: [6, 18],
    growth: "Growing",
    tags: { finance: 2, business: 1 }
  },
  "insurance-officer": {
    id: "insurance-officer",
    title: "Insurance Officer",
    category: "business_finance",
    streams: ["mec"],
    short: "Assesses risk and manages insurance policies and claims.",
    degree: "B.Com/BBA + insurance sector exams",
    skills: ["Risk assessment", "Policy knowledge", "Customer service", "Attention to detail"],
    languages: null,
    salary: [4, 12],
    growth: "Growing",
    tags: { finance: 2 }
  },
  "supply-chain-manager": {
    id: "supply-chain-manager",
    title: "Supply Chain Manager",
    category: "business_finance",
    streams: ["mec"],
    short: "Coordinates the flow of goods from production to delivery.",
    degree: "BBA/B.Tech + Supply Chain/Operations specialisation",
    skills: ["Logistics planning", "Negotiation", "Data analysis", "Vendor management"],
    languages: null,
    salary: [5, 18],
    growth: "High Growth",
    tags: { business: 3, analytics: 1 }
  },
  "retail-manager": {
    id: "retail-manager",
    title: "Retail Manager",
    category: "business_finance",
    streams: ["mec"],
    short: "Runs store operations, staff and sales performance.",
    degree: "BBA/B.Com in Retail Management",
    skills: ["Team management", "Sales strategy", "Inventory management", "Customer service"],
    languages: null,
    salary: [4, 14],
    growth: "Growing",
    tags: { business: 2 }
  },
  "lawyer": {
    id: "lawyer",
    title: "Lawyer",
    category: "law_civil_service",
    streams: ["arts"],
    short: "Represents and advises clients on legal matters and disputes.",
    degree: "BA LLB / LLB (5 or 3 years)",
    skills: ["Legal research", "Argumentation", "Writing", "Negotiation"],
    languages: null,
    salary: [3, 25],
    growth: "Growing",
    tags: { law: 3 }
  },
  "judge": {
    id: "judge",
    title: "Judge",
    category: "law_civil_service",
    streams: ["arts"],
    short: "Presides over court proceedings and delivers legal verdicts.",
    degree: "LLB + Judicial Services Exam",
    skills: ["Legal expertise", "Impartial judgement", "Analytical thinking", "Integrity"],
    languages: null,
    salary: [8, 24],
    growth: "Steady",
    tags: { law: 3, government: 1 }
  },
  "journalist": {
    id: "journalist",
    title: "Journalist",
    category: "media_creative",
    streams: ["arts"],
    short: "Researches, reports and writes news stories for the public.",
    degree: "BA/BJMC in Journalism & Mass Communication",
    skills: ["Research", "Interviewing", "Writing", "Fact-checking"],
    languages: null,
    salary: [3, 12],
    growth: "Growing",
    tags: { writing: 3, creative: 1 }
  },
  "news-anchor": {
    id: "news-anchor",
    title: "News Anchor",
    category: "media_creative",
    streams: ["arts"],
    short: "Presents news and hosts broadcast programmes on-air.",
    degree: "BA/BJMC in Journalism & Mass Communication",
    skills: ["On-camera presence", "Voice modulation", "Quick thinking", "Research"],
    languages: null,
    salary: [4, 18],
    growth: "High Growth",
    tags: { writing: 2, creative: 2 }
  },
  "graphic-designer": {
    id: "graphic-designer",
    title: "Graphic Designer",
    category: "media_creative",
    streams: ["arts", "diploma"],
    short: "Creates visual content for brands, products and media.",
    degree: "BFA/Diploma in Graphic Design",
    skills: ["Adobe Creative Suite", "Typography", "Visual storytelling", "Client briefs"],
    languages: null,
    salary: [3, 12],
    growth: "Growing",
    tags: { design: 3, creative: 2 }
  },
  "ux-ui-designer": {
    id: "ux-ui-designer",
    title: "UX/UI Designer",
    category: "media_creative",
    streams: ["arts", "diploma"],
    short: "Designs digital products that are intuitive and easy to use.",
    degree: "BDes/Diploma in UX Design",
    skills: ["User research", "Wireframing & prototyping", "Design tools (Figma)", "Usability testing"],
    languages: null,
    salary: [4, 18],
    growth: "Very High Growth",
    tags: { design: 3, coding: 1 }
  },
  "fashion-designer": {
    id: "fashion-designer",
    title: "Fashion Designer",
    category: "media_creative",
    streams: ["arts"],
    short: "Designs clothing and accessories from concept to collection.",
    degree: "B.Des in Fashion Design (e.g. NIFT)",
    skills: ["Sketching", "Textile knowledge", "Trend forecasting", "Pattern making"],
    languages: null,
    salary: [3, 15],
    growth: "High Growth",
    tags: { design: 3, creative: 2 }
  },
  "interior-designer": {
    id: "interior-designer",
    title: "Interior Designer",
    category: "media_creative",
    streams: ["arts"],
    short: "Plans and designs functional, aesthetic interior spaces.",
    degree: "B.Des/Diploma in Interior Design",
    skills: ["Space planning", "3D visualisation tools", "Material knowledge", "Client communication"],
    languages: null,
    salary: [3, 14],
    growth: "High Growth",
    tags: { design: 3 }
  },
  "animator": {
    id: "animator",
    title: "Animator",
    category: "media_creative",
    streams: ["arts"],
    short: "Brings characters and stories to life through motion and visuals.",
    degree: "B.Des/Diploma in Animation",
    skills: ["2D/3D animation software", "Storyboarding", "Timing & motion", "Creativity"],
    languages: null,
    salary: [3, 13],
    growth: "High Growth",
    tags: { design: 2, creative: 3 }
  },
  "filmmaker": {
    id: "filmmaker",
    title: "Filmmaker",
    category: "media_creative",
    streams: ["arts"],
    short: "Writes, shoots and directs films or video content.",
    degree: "BA/Diploma in Film Making (e.g. FTII)",
    skills: ["Storytelling", "Direction", "Editing basics", "Project management"],
    languages: null,
    salary: "Variable — project-based",
    growth: "Growing",
    tags: { creative: 3, writing: 1 }
  },
  "content-writer": {
    id: "content-writer",
    title: "Content Writer",
    category: "media_creative",
    streams: ["arts"],
    short: "Writes articles, scripts and copy for brands and publications.",
    degree: "BA in English/Journalism/Mass Comm",
    skills: ["Writing", "Research", "SEO basics", "Editing"],
    languages: null,
    salary: [2, 10],
    growth: "High Growth",
    tags: { writing: 3 }
  },
  "teacher": {
    id: "teacher",
    title: "Teacher",
    category: "education_social",
    streams: ["arts", "govt"],
    short: "Educates and mentors students at the school level.",
    degree: "Bachelor's degree + B.Ed",
    skills: ["Subject expertise", "Classroom management", "Communication", "Patience"],
    languages: null,
    salary: [3, 9],
    growth: "Growing",
    tags: { teaching: 3, "helping-people": 2 }
  },
  "professor": {
    id: "professor",
    title: "Professor",
    category: "education_social",
    streams: ["arts"],
    short: "Teaches and conducts research at the university level.",
    degree: "Master's degree + Ph.D. (+ UGC-NET)",
    skills: ["Subject mastery", "Research", "Academic writing", "Mentorship"],
    languages: null,
    salary: [6, 18],
    growth: "Growing",
    tags: { teaching: 3, research: 2 }
  },
  "psychologist": {
    id: "psychologist",
    title: "Psychologist",
    category: "education_social",
    streams: ["arts"],
    short: "Studies behaviour and mind, and supports mental wellbeing.",
    degree: "BA/M.A. in Psychology (+ RCI licence for clinical practice)",
    skills: ["Active listening", "Assessment techniques", "Empathy", "Ethics"],
    languages: null,
    salary: [3, 12],
    growth: "High Growth",
    tags: { "helping-people": 3, research: 1 }
  },
  "ias-officer": {
    id: "ias-officer",
    title: "IAS Officer",
    category: "law_civil_service",
    streams: ["arts", "govt"],
    short: "Administers government policy as part of India's premier civil service.",
    degree: "Any Bachelor's degree + UPSC Civil Services",
    skills: ["Public administration", "Decision-making", "Leadership", "Analytical thinking"],
    languages: null,
    salary: [8, 24],
    growth: "Steady",
    tags: { government: 3, law: 1 }
  },
  "ips-officer": {
    id: "ips-officer",
    title: "IPS Officer",
    category: "law_civil_service",
    streams: ["arts", "govt"],
    short: "Leads police forces and oversees law-and-order administration.",
    degree: "Any Bachelor's degree + UPSC Civil Services",
    skills: ["Leadership", "Crisis management", "Investigation oversight", "Physical fitness"],
    languages: null,
    salary: [8, 22],
    growth: "Steady",
    tags: { government: 3, defence: 1 }
  },
  "ifs-officer": {
    id: "ifs-officer",
    title: "IFS Officer (Foreign Service)",
    category: "law_civil_service",
    streams: ["arts", "govt"],
    short: "Represents India abroad through diplomacy and foreign policy.",
    degree: "Any Bachelor's degree + UPSC Civil Services",
    skills: ["Diplomacy", "Foreign languages", "Negotiation", "Cultural awareness"],
    languages: null,
    salary: [8, 24],
    growth: "Steady",
    tags: { government: 3 }
  },
  "social-worker": {
    id: "social-worker",
    title: "Social Worker",
    category: "education_social",
    streams: ["arts"],
    short: "Supports vulnerable individuals and communities to improve lives.",
    degree: "BSW/MSW (Bachelor/Master of Social Work)",
    skills: ["Empathy", "Community outreach", "Case management", "Communication"],
    languages: null,
    salary: [2, 7],
    growth: "Growing",
    tags: { "helping-people": 3 }
  },
  "hotel-manager": {
    id: "hotel-manager",
    title: "Hotel Manager",
    category: "hospitality_events",
    streams: ["arts"],
    short: "Oversees hotel operations, staff and guest experience.",
    degree: "BHM (Bachelor of Hotel Management)",
    skills: ["Operations management", "Customer service", "Team leadership", "Budgeting"],
    languages: null,
    salary: [4, 14],
    growth: "High Growth",
    tags: { hospitality: 3 }
  },
  "event-manager": {
    id: "event-manager",
    title: "Event Manager",
    category: "hospitality_events",
    streams: ["arts"],
    short: "Plans and executes events from weddings to corporate conferences.",
    degree: "BBA/Diploma in Event Management",
    skills: ["Vendor coordination", "Budgeting", "Client management", "Problem solving under pressure"],
    languages: null,
    salary: [3, 14],
    growth: "High Growth",
    tags: { hospitality: 2, creative: 1 }
  },
  "full-stack-developer": {
    id: "full-stack-developer",
    title: "Full Stack Developer",
    category: "software_tech",
    streams: ["diploma"],
    short: "Builds both the front-end and back-end of web applications.",
    degree: "Diploma/Bootcamp in Full Stack Development",
    skills: ["Frontend & backend frameworks", "Databases", "APIs", "Version control (Git)"],
    languages: ["JavaScript", "Node.js", "SQL"],
    salary: [4, 20],
    growth: "High Growth",
    tags: { coding: 3 }
  },
  "ai-developer": {
    id: "ai-developer",
    title: "AI Developer",
    category: "software_tech",
    streams: ["diploma"],
    short: "Builds practical AI-powered features and applications.",
    degree: "Diploma/Bootcamp in AI & Machine Learning",
    skills: ["Python", "ML frameworks", "APIs & integration", "Problem solving"],
    languages: ["Python"],
    salary: [6, 26],
    growth: "Very High Growth",
    tags: { coding: 3 }
  },
  "digital-marketer": {
    id: "digital-marketer",
    title: "Digital Marketer",
    category: "skill_trades",
    streams: ["diploma"],
    short: "Plans and runs online campaigns across social, search and ads.",
    degree: "Diploma/Certification in Digital Marketing",
    skills: ["SEO/SEM", "Social media strategy", "Analytics tools", "Content planning"],
    languages: null,
    salary: [3, 14],
    growth: "Very High Growth",
    tags: { business: 2, creative: 1 }
  },
  "ethical-hacker": {
    id: "ethical-hacker",
    title: "Ethical Hacker",
    category: "software_tech",
    streams: ["diploma"],
    short: "Tests systems for vulnerabilities before real attackers find them.",
    degree: "Diploma/Certification (CEH) after a CS background",
    skills: ["Penetration testing", "Networking", "Security tools", "Reporting"],
    languages: ["Python", "Bash"],
    salary: [5, 22],
    growth: "Very High Growth",
    tags: { coding: 3 }
  },
  "video-editor": {
    id: "video-editor",
    title: "Video Editor",
    category: "media_creative",
    streams: ["diploma"],
    short: "Edits raw footage into polished videos for media and brands.",
    degree: "Diploma in Video Editing/Film Production",
    skills: ["Editing software (Premiere/DaVinci)", "Storytelling", "Colour grading", "Sound editing"],
    languages: null,
    salary: [2, 10],
    growth: "High Growth",
    tags: { creative: 3 }
  },
  "photographer": {
    id: "photographer",
    title: "Photographer",
    category: "media_creative",
    streams: ["diploma"],
    short: "Captures images for events, brands, journalism or art.",
    degree: "Diploma in Photography",
    skills: ["Camera & lighting skills", "Photo editing", "Composition", "Client management"],
    languages: null,
    salary: "Variable — project-based",
    growth: "High Growth",
    tags: { creative: 3 }
  },
  "youtuber": {
    id: "youtuber",
    title: "YouTuber / Content Creator",
    category: "media_creative",
    streams: ["diploma"],
    short: "Creates and grows a video channel around a niche or personality.",
    degree: "No formal degree required; content & consistency matter most",
    skills: ["Content creation", "Video editing", "Audience engagement", "Consistency"],
    languages: null,
    salary: "Variable — audience-dependent",
    growth: "High Growth",
    tags: { creative: 3, writing: 1 }
  },
  "freelancer": {
    id: "freelancer",
    title: "Freelancer",
    category: "skill_trades",
    streams: ["diploma"],
    short: "Offers a specialised skill independently to multiple clients.",
    degree: "Skill-based training in a chosen craft (design/writing/dev/etc.)",
    skills: ["Self-management", "Client communication", "A marketable skill", "Time management"],
    languages: null,
    salary: "Variable — depends on skill & clients",
    growth: "High Growth",
    tags: { business: 1, "hands-on": 2 }
  },
  "cad-designer": {
    id: "cad-designer",
    title: "CAD Designer",
    category: "skill_trades",
    streams: ["diploma"],
    short: "Creates technical drawings and 3D models for engineering/architecture.",
    degree: "Diploma in CAD/Mechanical Design",
    skills: ["AutoCAD/SolidWorks", "Technical drawing", "Precision", "Spatial visualisation"],
    languages: null,
    salary: [3, 10],
    growth: "High Growth",
    tags: { design: 2, engineering: 2 }
  },
  "electrician": {
    id: "electrician",
    title: "Electrician",
    category: "skill_trades",
    streams: ["diploma"],
    short: "Installs and repairs electrical wiring and systems.",
    degree: "ITI Certificate in Electrician trade",
    skills: ["Wiring & circuits", "Safety protocols", "Troubleshooting", "Manual dexterity"],
    languages: null,
    salary: [2, 7],
    growth: "Growing",
    tags: { "hands-on": 3, engineering: 1 }
  },
  "ev-technician": {
    id: "ev-technician",
    title: "Electric Vehicle Technician",
    category: "skill_trades",
    streams: ["diploma"],
    short: "Services and repairs electric vehicles and charging systems.",
    degree: "ITI/Diploma in EV Technology",
    skills: ["EV systems knowledge", "Battery diagnostics", "Electrical safety", "Troubleshooting"],
    languages: null,
    salary: [3, 8],
    growth: "Very High Growth",
    tags: { "hands-on": 3, engineering: 1 }
  },
  "cnc-programmer": {
    id: "cnc-programmer",
    title: "CNC Programmer",
    category: "skill_trades",
    streams: ["diploma"],
    short: "Programs CNC machines to manufacture precision parts.",
    degree: "ITI/Diploma in CNC/Tool & Die",
    skills: ["CNC programming", "Blueprint reading", "Precision measurement", "Machine maintenance"],
    languages: null,
    salary: [3, 9],
    growth: "Growing",
    tags: { "hands-on": 3, engineering: 1 }
  },
  "3d-printing-specialist": {
    id: "3d-printing-specialist",
    title: "3D Printing Specialist",
    category: "skill_trades",
    streams: ["diploma"],
    short: "Designs and prints 3D models for prototyping and production.",
    degree: "Diploma/Certification in 3D Printing & Design",
    skills: ["3D modelling", "Printer operation", "Material knowledge", "Troubleshooting"],
    languages: null,
    salary: [3, 10],
    growth: "High Growth",
    tags: { "hands-on": 2, design: 2 }
  },
  "irs-officer": {
    id: "irs-officer",
    title: "IRS Officer",
    category: "law_civil_service",
    streams: ["govt"],
    short: "Administers India's direct and indirect tax systems.",
    degree: "Any Bachelor's degree + UPSC Civil Services",
    skills: ["Tax knowledge", "Analytical thinking", "Integrity", "Administration"],
    languages: null,
    salary: [8, 22],
    growth: "Steady",
    tags: { government: 3, finance: 1 }
  },
  "ssc-officer": {
    id: "ssc-officer",
    title: "SSC Officer",
    category: "law_civil_service",
    streams: ["govt"],
    short: "Works in central government departments via SSC recruitment.",
    degree: "Bachelor's degree + SSC CGL/CHSL exam",
    skills: ["General awareness", "Reasoning & aptitude", "Administration", "Discipline"],
    languages: null,
    salary: [4, 12],
    growth: "Growing",
    tags: { government: 3 }
  },
  "railway-officer": {
    id: "railway-officer",
    title: "Railway Officer",
    category: "law_civil_service",
    streams: ["govt"],
    short: "Manages operations and administration of Indian Railways.",
    degree: "Bachelor's degree + RRB/UPSC exams",
    skills: ["Operations management", "Administration", "Safety protocols", "Leadership"],
    languages: null,
    salary: [5, 15],
    growth: "Growing",
    tags: { government: 3, engineering: 1 }
  },
  "police-officer": {
    id: "police-officer",
    title: "Police Officer",
    category: "defence_uniform",
    streams: ["govt"],
    short: "Maintains law and order and investigates crime at the state level.",
    degree: "Class 12/Bachelor's + State Police Recruitment",
    skills: ["Physical fitness", "Investigation", "Discipline", "Crisis management"],
    languages: null,
    salary: [4, 14],
    growth: "Growing",
    tags: { defence: 3, government: 1 }
  },
  "army-officer": {
    id: "army-officer",
    title: "Army Officer",
    category: "defence_uniform",
    streams: ["govt"],
    short: "Leads troops and operations in the Indian Army.",
    degree: "NDA/CDS entry + IMA training",
    skills: ["Leadership", "Physical fitness", "Tactical thinking", "Discipline"],
    languages: null,
    salary: [6, 18],
    growth: "Steady",
    tags: { defence: 3 }
  },
  "navy-officer": {
    id: "navy-officer",
    title: "Navy Officer",
    category: "defence_uniform",
    streams: ["govt"],
    short: "Serves and leads operations in the Indian Navy.",
    degree: "NDA/CDS entry + Naval Academy training",
    skills: ["Leadership", "Technical aptitude", "Physical fitness", "Discipline"],
    languages: null,
    salary: [6, 18],
    growth: "Steady",
    tags: { defence: 3 }
  },
  "air-force-officer": {
    id: "air-force-officer",
    title: "Air Force Officer",
    category: "defence_uniform",
    streams: ["govt"],
    short: "Serves as a pilot, engineer or officer in the Indian Air Force.",
    degree: "NDA/CDS/AFCAT entry + AFA training",
    skills: ["Technical/flying aptitude", "Discipline", "Quick decision-making", "Physical fitness"],
    languages: null,
    salary: [6, 18],
    growth: "Steady",
    tags: { defence: 3, aviation: 1 }
  },
  "forest-officer": {
    id: "forest-officer",
    title: "Forest Officer",
    category: "defence_uniform",
    streams: ["govt"],
    short: "Manages and protects forests, wildlife and natural resources.",
    degree: "B.Sc + UPSC Indian Forest Service Exam",
    skills: ["Environmental science", "Field survey skills", "Administration", "Physical fitness"],
    languages: null,
    salary: [5, 14],
    growth: "Growing",
    tags: { agriculture: 2, government: 2 },
    overrides: {
      exams: ["UPSC Indian Forest Service Exam"]
    }
  },
  "bank-po": {
    id: "bank-po",
    title: "Bank PO",
    category: "business_finance",
    streams: ["govt"],
    short: "Manages banking operations as a Probationary Officer.",
    degree: "Any Bachelor's degree + IBPS/SBI PO exam",
    skills: ["Financial products knowledge", "Customer service", "Numerical ability", "Administration"],
    languages: null,
    salary: [5, 14],
    growth: "Growing",
    tags: { finance: 2, government: 1 }
  },
  "sbi-officer": {
    id: "sbi-officer",
    title: "SBI Officer",
    category: "business_finance",
    streams: ["govt"],
    short: "Manages banking operations within the State Bank of India.",
    degree: "Any Bachelor's degree + SBI PO/Clerk exam",
    skills: ["Banking knowledge", "Customer service", "Numerical ability", "Administration"],
    languages: null,
    salary: [5, 15],
    growth: "Growing",
    tags: { finance: 2, government: 1 }
  },
  "lecturer": {
    id: "lecturer",
    title: "Lecturer",
    category: "education_social",
    streams: ["govt"],
    short: "Teaches undergraduate students at a college level.",
    degree: "Master's degree + UGC-NET/State PSC exam",
    skills: ["Subject expertise", "Teaching skills", "Communication", "Research basics"],
    languages: null,
    salary: [4, 12],
    growth: "Growing",
    tags: { teaching: 3 }
  },
  "data-engineer": {
    id: "data-engineer",
    title: "Data Engineer",
    category: "software_tech",
    streams: ["emerging"],
    short: "Builds the data pipelines that power analytics and AI systems.",
    degree: "B.Tech in CS/IT",
    skills: ["SQL & databases", "Data pipelines (ETL)", "Python", "Cloud platforms"],
    languages: ["Python", "SQL"],
    salary: [6, 24],
    growth: "Very High Growth",
    tags: { coding: 3, analytics: 2 }
  },
  "prompt-engineer": {
    id: "prompt-engineer",
    title: "Prompt Engineer",
    category: "software_tech",
    streams: ["emerging"],
    short: "Designs prompts and workflows that get the best results from AI models.",
    degree: "Any degree + hands-on AI/LLM experience",
    skills: ["Writing & logic", "Understanding of LLMs", "Testing & iteration", "Domain knowledge"],
    languages: null,
    salary: [6, 24],
    growth: "Very High Growth",
    tags: { coding: 2, writing: 2 }
  },
  "ai-trainer": {
    id: "ai-trainer",
    title: "AI Trainer",
    category: "software_tech",
    streams: ["emerging"],
    short: "Reviews, labels and refines data used to train AI models.",
    degree: "Any degree; domain expertise + AI familiarity helps",
    skills: ["Attention to detail", "Domain expertise", "Data annotation", "Communication"],
    languages: null,
    salary: [4, 16],
    growth: "Very High Growth",
    tags: { coding: 1, analytics: 2 }
  },
  "blockchain-developer": {
    id: "blockchain-developer",
    title: "Blockchain Developer",
    category: "software_tech",
    streams: ["emerging"],
    short: "Builds decentralised applications and smart contracts.",
    degree: "B.Tech in CS/IT",
    skills: ["Smart contracts (Solidity)", "Cryptography basics", "Distributed systems", "Security"],
    languages: ["Solidity", "JavaScript"],
    salary: [6, 24],
    growth: "Very High Growth",
    tags: { coding: 3 }
  },
  "web3-developer": {
    id: "web3-developer",
    title: "Web3 Developer",
    category: "software_tech",
    streams: ["emerging"],
    short: "Builds decentralised web applications on blockchain networks.",
    degree: "B.Tech in CS/IT",
    skills: ["Smart contracts", "Frontend frameworks", "Wallet integrations", "Security"],
    languages: ["Solidity", "JavaScript"],
    salary: [6, 24],
    growth: "Very High Growth",
    tags: { coding: 3 }
  },
  "ar-vr-developer": {
    id: "ar-vr-developer",
    title: "AR/VR Developer",
    category: "software_tech",
    streams: ["emerging"],
    short: "Builds immersive augmented and virtual reality experiences.",
    degree: "B.Tech in CS/IT + AR/VR specialisation",
    skills: ["3D engines (Unity/Unreal)", "Spatial design", "C#/C++", "UX for immersive media"],
    languages: ["C#", "C++"],
    salary: [5, 20],
    growth: "Very High Growth",
    tags: { coding: 2, design: 2 }
  },
  "drone-pilot": {
    id: "drone-pilot",
    title: "Drone Pilot",
    category: "skill_trades",
    streams: ["emerging"],
    short: "Operates drones for mapping, filming, agriculture or delivery.",
    degree: "Remote Pilot Certificate (DGCA-approved course)",
    skills: ["Drone operation", "Aerial photography/mapping", "Regulations (DGCA)", "Precision control"],
    languages: null,
    salary: [3, 12],
    growth: "Very High Growth",
    tags: { aviation: 2, "hands-on": 2 }
  },
  "space-scientist": {
    id: "space-scientist",
    title: "Space Scientist",
    category: "science_research",
    streams: ["emerging"],
    short: "Researches space phenomena and contributes to space missions.",
    degree: "B.Tech/M.Sc + Ph.D. in a space-related discipline",
    skills: ["Physics & maths", "Research", "Programming", "Analytical thinking"],
    languages: ["Python"],
    salary: [6, 18],
    growth: "High Growth",
    tags: { science: 3, space: 3 }
  },
  "quantum-computing-researcher": {
    id: "quantum-computing-researcher",
    title: "Quantum Computing Researcher",
    category: "science_research",
    streams: ["emerging"],
    short: "Researches and develops quantum algorithms and hardware.",
    degree: "B.Tech/M.Sc Physics/CS + Ph.D.",
    skills: ["Quantum mechanics", "Linear algebra", "Programming", "Research"],
    languages: ["Python", "Q#"],
    salary: [6, 20],
    growth: "Very High Growth",
    tags: { science: 3, coding: 1 }
  },
  "renewable-energy-engineer": {
    id: "renewable-energy-engineer",
    title: "Renewable Energy Engineer",
    category: "core_engineering",
    streams: ["emerging"],
    short: "Designs solar, wind and other clean-energy systems.",
    degree: "B.Tech in Electrical/Renewable Energy Engineering",
    skills: ["Renewable systems design", "Electrical fundamentals", "Project management", "Sustainability knowledge"],
    languages: null,
    salary: [4, 16],
    growth: "Very High Growth",
    tags: { engineering: 3 }
  },
  "climate-scientist": {
    id: "climate-scientist",
    title: "Climate Scientist",
    category: "science_research",
    streams: ["emerging"],
    short: "Studies climate patterns and their impact on the planet.",
    degree: "B.Sc/M.Sc in Environmental Science/Atmospheric Science",
    skills: ["Data analysis", "Climate modelling", "Research", "Report writing"],
    languages: ["Python", "R"],
    salary: [4, 14],
    growth: "High Growth",
    tags: { science: 3, research: 2 }
  },
  "bioinformatics-specialist": {
    id: "bioinformatics-specialist",
    title: "Bioinformatics Specialist",
    category: "science_research",
    streams: ["emerging", "pcmb"],
    short: "Uses computing to analyse biological and genetic data.",
    degree: "B.Sc/B.Tech in Bioinformatics",
    skills: ["Programming", "Molecular biology", "Statistics", "Data analysis"],
    languages: ["Python", "R"],
    salary: [4, 15],
    growth: "High Growth",
    tags: { biology: 2, coding: 2 }
  },
  "ev-powertrain-engineer": {
    id: "ev-powertrain-engineer",
    title: "EV Powertrain Engineer",
    category: "core_engineering",
    streams: ["mpc", "emerging", "pcmb"],
    short: "Designs and builds batteries, electric motors, and control systems for Electric Vehicles.",
    degree: "B.Tech in Electrical/Automotive/Mechanical Engineering + Specialisation in EV systems",
    skills: ["Battery management systems (BMS)", "Electric motors", "Power electronics", "Thermal management"],
    languages: ["C", "C++", "Python"],
    salary: [5, 22],
    growth: "Very High Growth",
    tags: { engineering: 3, "hands-on": 2 }
  },
  "cyber-law-expert": {
    id: "cyber-law-expert",
    title: "Cyber Law Expert",
    category: "law_civil_service",
    streams: ["arts", "cec"],
    short: "Advises companies and represents cases regarding digital crimes, intellectual property, and data privacy laws.",
    degree: "Integrated LLB/BA-LLB + Specialisation/Diploma in Cyber Law",
    skills: ["IT Act knowledge", "Data privacy frameworks (DPDP)", "Legal representation", "Digital forensics understanding"],
    languages: null,
    salary: [4, 18],
    growth: "Very High Growth",
    tags: { law: 3, government: 1 }
  },
  "fintech-analyst": {
    id: "fintech-analyst",
    title: "Fintech Analyst",
    category: "business_finance",
    streams: ["mec", "cec", "emerging"],
    short: "Analyses digital payment, lending, and investment products using data and financial models.",
    degree: "B.Com/BBA/BA Economics or B.Tech CS + Fintech Certification",
    skills: ["Financial analysis", "Data query", "Payment gateways", "Regulatory compliance"],
    languages: ["SQL", "Python"],
    salary: [5, 20],
    growth: "Very High Growth",
    tags: { finance: 3, analytics: 2 }
  },
  "product-manager": {
    id: "product-manager",
    title: "Product Manager",
    category: "business_finance",
    streams: ["mpc", "mec", "cec", "emerging"],
    short: "Coordinates engineering, design, and business teams to launch and improve successful software products.",
    degree: "B.Tech/BBA/B.Com + MBA (optional but common)",
    skills: ["Product strategy", "User research", "Agile methodologies", "Roadmapping"],
    languages: null,
    salary: [6, 28],
    growth: "Very High Growth",
    tags: { business: 3, design: 1 }
  },
  "agricultural-ai-specialist": {
    id: "agricultural-ai-specialist",
    title: "Agricultural AI Specialist",
    category: "agri_food",
    streams: ["bipc", "pcmb", "emerging"],
    short: "Integrates AI models, drones, and sensors to improve crop yields, soil health, and farming sustainability.",
    degree: "B.Tech in Agricultural Engineering or B.Sc Agriculture + Data Science Certificate",
    skills: ["AI & computer vision", "Precision farming", "Drone analysis", "Soil sensor telemetry"],
    languages: ["Python"],
    salary: [4, 18],
    growth: "Very High Growth",
    tags: { agriculture: 3, coding: 2, science: 1 }
  },
  "digital-content-director": {
    id: "digital-content-director",
    title: "Digital Content Director",
    category: "media_creative",
    streams: ["arts"],
    short: "Directs and manages the entire content strategy, video production, and social channels for digital brands.",
    degree: "BA in Media/Journalism or BFA + creative portfolio",
    skills: ["Creative direction", "Content strategy", "Editing supervision", "Audience metrics analysis"],
    languages: null,
    salary: [4, 16],
    growth: "High Growth",
    tags: { creative: 3, writing: 1 }
  }
};

// Helper function to get compiled career
export function getCareer(id: string): CompiledCareer | null {
  const c = CAREERS_RAW[id];
  if (!c) return null;
  const cat = CATEGORIES[c.category];
  const ov = c.overrides || {};
  return {
    id: c.id,
    title: c.title,
    category: c.category,
    streams: c.streams,
    short: c.short,
    degree: c.degree,
    skills: c.skills,
    languages: c.languages,
    salary: c.salary,
    growth: c.growth,
    tags: c.tags,
    jobdesc: ov.jobdesc || cat.jobdesc.replace("{title}", c.title),
    eligibility: ov.eligibility || cat.eligibility,
    recruiters: ov.recruiters || cat.recruiters,
    colleges: ov.colleges || cat.colleges,
    exams: ov.exams || cat.exams,
    certifications: ov.certifications || cat.certifications,
    future: ov.future || cat.future.replace("{titlelow}", c.title.toLowerCase()),
    roadmap: ov.roadmap || cat.roadmap.map((s) => s.replace("{degree}", c.degree)),
  };
}

export function allCareers(): CompiledCareer[] {
  return Object.keys(CAREERS_RAW).map(id => getCareer(id) as CompiledCareer);
}

export function updateDynamicData(customCareers: any[], customStreams: any[]) {
  if (Array.isArray(customCareers)) {
    customCareers.forEach((c) => {
      if (c && c.id) {
        CAREERS_RAW[c.id] = {
          ...CAREERS_RAW[c.id],
          ...c,
          tags: c.tags || { engineering: 1 }
        };
      }
    });
  }

  if (Array.isArray(customStreams)) {
    customStreams.forEach((s) => {
      if (s && s.key) {
        STREAMS[s.key] = {
          ...STREAMS[s.key],
          ...s
        };
      }
    });
  }
}

