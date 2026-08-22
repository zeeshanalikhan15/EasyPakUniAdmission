export const en = {
  common: {
    appName: "University Admissions — Pakistan",
    tagline:
      "Admission dates, entry tests and how to apply — in simple Urdu, all in one place.",
    nextUpcoming: "Next upcoming",
    daysLeft: "days left",
    howToApply: "How to apply",
    applicationFee: "Application fee",
    entryTest: "Entry test",
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
    },
  },
}

export type Translation = typeof en
