export const en = {
  common: {
    appName: "University Admissions — Pakistan",
    tagline:
      "Admission dates, entry tests and how to apply — all in one place.",
    nextUpcoming: "Next upcoming",
    daysLeft: "days left",
    howToApply: "How to apply",
    applicationFee: "Application fee",
    entryTest: "Entry test",
    testPrep: "Test preparation",
    eligibility: "Who can apply",
    applyNow: "Apply now",
    upcoming: "Upcoming",
    pastCycle: "Last cycle (for reference)",
    tentative: "Tentative",
    disclaimer:
      "Dates change every year. Always confirm on the official website before applying.",
  },
  events: {
    applicationOpen: "Applications open",
    applicationClose: "Applications close",
    registrationOpen: "Registration opens",
    registrationClose: "Registration closes",
    test: "Entry test",
    merit: "Merit list",
    docsDeadline: "Documents & fee deadline",
    financialAid: "Financial aid deadline",
    satDeadline: "SAT deadline",
    actDeadline: "ACT deadline",
    decisions: "Admission decisions",
    classes: "Classes begin",
  },
  universities: {
    fast: {
      name: "FAST NUCES",
      fullName: "National University of Computer & Emerging Sciences",
      testName: "FAST NU Admission Test",
      desc: "Pakistan's top university for Computer Science, Software Engineering and AI. Campuses in Islamabad, Lahore, Karachi, Peshawar, Faisalabad and Multan.",
      feeNote: "non-refundable processing fee",
      eligibility:
        "FSc / ICS (Pre-Engineering) with at least 60% marks. Mathematics is compulsory for CS, SE, AI, Data Science and Cyber Security. Pre-Medical students need Additional Mathematics. BBA needs 50%.",
      steps: [
        "Create an account at admissions.nu.edu.pk with your email and CNIC / B-Form.",
        "Fill the online form: personal details, marks and programme choice.",
        "Upload your Matric and F.Sc result cards and a photo.",
        "Pay the Rs. 3,000 fee (online, bank, or JazzCash / Easypaisa).",
        "Download your roll number slip and appear in the FAST NU test.",
      ],
      resources: [
        { name: "Khan Academy", url: "https://www.khanacademy.org", note: "Free Math & English lessons" },
        { name: "QuizWing", url: "https://quizwing.com/entry-test/fast-nu-admission-guide/", note: "Free FAST past papers & mock tests" },
        { name: "PakAdmissions", url: "https://www.pakadmissions.com/blog/fast-entry-test-complete-guide-free-practice-quiz", note: "Free chapter-wise practice" },
        { name: "Fakhar STEM Sphere", url: "https://www.youtube.com/@fakharstemsphere", note: "YouTube · FAST lecturer" },
      ],
    },
    lums: {
      name: "LUMS",
      fullName: "Lahore University of Management Sciences",
      testName: "LCAT (or SAT / ACT)",
      desc: "One of Pakistan's leading universities for business, economics, engineering and law.",
      feeNote: "application processing fee (non-refundable)",
      eligibility:
        "Matric + FSc / HSSC or O/A Levels with strong academics. Admission is holistic — marks, test score and profile all count.",
      steps: [
        "Create an account at admissions.lums.edu.pk.",
        "Complete the online application with academic and personal details.",
        "Upload transcripts, recommendation letters and a personal statement.",
        "Pay the PKR 11,500 fee voucher at any listed bank.",
        "Take the LCAT (or submit SAT / ACT scores).",
      ],
      resources: [
        { name: "Khan Academy (SAT)", url: "https://www.khanacademy.org/sat", note: "Free official SAT prep (LCAT ≈ SAT)" },
        { name: "GoTest", url: "https://gotest.com.pk/preparation/lums-entry-test-2026-preparation-online/", note: "Free LCAT mock tests" },
        { name: "PLS Academy", url: "https://plsboost.com/lums-university/", note: "Past papers & MCQs" },
        { name: "CourseHive", url: "https://coursehive.io/courses/basic-maths-general-maths-lectures-sat-fast-nts-bcat-lcat-fast-nust-comsats-2044", note: "Free YouTube maths courses" },
      ],
    },
    nust: {
      name: "NUST",
      fullName: "National University of Sciences and Technology",
      testName: "NET (NUST Entry Test)",
      desc: "Pakistan's top engineering and technology university, with campuses in Islamabad and Rawalpindi.",
      feeNote: "per NET attempt (non-refundable)",
      eligibility:
        "At least 60% in Matric and 60% in FSc. Merit = NET 75% + FSc 15% + Matric 10%. You may appear in multiple NET series; the best score counts.",
      steps: [
        "Create an account at ugadmissions.nust.edu.pk.",
        "Fill the form and choose your NET series and test city.",
        "Pay the Rs. 5,000 fee and upload your documents.",
        "Download your admit card 3–5 days before the test.",
        "Appear in NET and check your result online within 48 hours.",
      ],
      resources: [
        { name: "Khan Academy", url: "https://www.khanacademy.org", note: "Free Math & Physics lessons" },
        { name: "Mega Lecture · Physics", url: "https://megalecture.com/courses/net-physics/", note: "Free NET Physics lectures & notes" },
        { name: "Mega Lecture · Math", url: "https://megalecture.com/courses/net-mathematics/", note: "Free NET Math lectures" },
        { name: "QuizWing", url: "https://quizwing.com/entry-test/nust-net/", note: "Free NUST past papers & mocks" },
        { name: "TopGrade", url: "https://www.topgrade.pk/net-entry-test", note: "Video lectures & MCQs" },
      ],
    },
  },
}

export type Translation = typeof en
