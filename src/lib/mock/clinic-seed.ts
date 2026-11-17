import type {
  ClinicAppointment,
  ClinicPatient,
  ClinicService,
  ClinicTherapist,
} from "@/types";

export const DEMO_TODAY = "2026-11-17";

export const CLINIC_SERVICES: ClinicService[] = [
  {
    id: "service-physio",
    nameAr: "جلسة علاج طبيعي",
    nameEn: "Physical therapy session",
    categoryAr: "علاج العظام",
    categoryEn: "Orthopedic therapy",
    durationMinutes: 45,
    price: 250,
  },
  {
    id: "service-sports",
    nameAr: "تأهيل إصابة رياضية",
    nameEn: "Sports injury rehabilitation",
    categoryAr: "الإصابات الرياضية",
    categoryEn: "Sports injuries",
    durationMinutes: 60,
    price: 320,
  },
  {
    id: "service-post-op",
    nameAr: "تأهيل ما بعد الجراحة",
    nameEn: "Post-surgery rehabilitation",
    categoryAr: "التأهيل الحركي",
    categoryEn: "Rehabilitation",
    durationMinutes: 60,
    price: 300,
  },
  {
    id: "service-manual",
    nameAr: "علاج يدوي",
    nameEn: "Manual therapy",
    categoryAr: "العلاج اليدوي",
    categoryEn: "Manual therapy",
    durationMinutes: 45,
    price: 280,
  },
  {
    id: "service-neuro",
    nameAr: "تأهيل عصبي",
    nameEn: "Neurological rehabilitation",
    categoryAr: "علاج الأعصاب",
    categoryEn: "Neurological therapy",
    durationMinutes: 60,
    price: 350,
  },
  {
    id: "service-pediatric",
    nameAr: "علاج طبيعي للأطفال",
    nameEn: "Pediatric physiotherapy",
    categoryAr: "علاج الأطفال",
    categoryEn: "Pediatric therapy",
    durationMinutes: 45,
    price: 275,
  },
];

export const CLINIC_THERAPISTS: ClinicTherapist[] = [
  {
    id: "therapist-khalid",
    nameAr: "د. خالد العتيبي",
    nameEn: "Dr. Khalid Al-Otaibi",
    branchId: "ghadeer",
    specialtyAr: "العلاج العضلي الهيكلي",
    specialtyEn: "Musculoskeletal therapy",
  },
  {
    id: "therapist-noura",
    nameAr: "أ. نورة السالم",
    nameEn: "Noura Al-Salem",
    branchId: "ghadeer",
    specialtyAr: "الإصابات الرياضية",
    specialtyEn: "Sports rehabilitation",
  },
  {
    id: "therapist-layan",
    nameAr: "أ. ليان المطيري",
    nameEn: "Layan Al-Mutairi",
    branchId: "darAlbaida",
    specialtyAr: "التأهيل بعد الجراحة",
    specialtyEn: "Post-operative rehabilitation",
  },
  {
    id: "therapist-saad",
    nameAr: "د. سعد الدوسري",
    nameEn: "Dr. Saad Al-Dosari",
    branchId: "darAlbaida",
    specialtyAr: "العلاج اليدوي",
    specialtyEn: "Manual therapy",
  },
  {
    id: "therapist-fahad",
    nameAr: "د. فهد الشمري",
    nameEn: "Dr. Fahad Al-Shammari",
    branchId: "quwayiyah",
    specialtyAr: "العلاج الطبيعي العام",
    specialtyEn: "General physiotherapy",
  },
  {
    id: "therapist-maha",
    nameAr: "أ. مها الزهراني",
    nameEn: "Maha Al-Zahrani",
    branchId: "quwayiyah",
    specialtyAr: "التأهيل العصبي",
    specialtyEn: "Neurological rehabilitation",
  },
];

const patientNames: Array<{ ar: string; en: string; gender: "male" | "female" }> = [
  { ar: "أحمد محمد", en: "Ahmed Mohammed", gender: "male" },
  { ar: "سارة عبدالله", en: "Sara Abdullah", gender: "female" },
  { ar: "محمد الحربي", en: "Mohammed Al-Harbi", gender: "male" },
  { ar: "ريم القحطاني", en: "Reem Al-Qahtani", gender: "female" },
  { ar: "عبدالرحمن فهد", en: "Abdulrahman Fahd", gender: "male" },
  { ar: "نورة السبيعي", en: "Noura Al-Subaie", gender: "female" },
  { ar: "خالد العتيبي", en: "Khalid Al-Otaibi", gender: "male" },
  { ar: "مريم الزهراني", en: "Maryam Al-Zahrani", gender: "female" },
  { ar: "فيصل الدوسري", en: "Faisal Al-Dosari", gender: "male" },
  { ar: "هيا المطيري", en: "Haya Al-Mutairi", gender: "female" },
  { ar: "يوسف الشمري", en: "Yousef Al-Shammari", gender: "male" },
  { ar: "جود العنزي", en: "Joud Al-Anazi", gender: "female" },
  { ar: "تركي السالم", en: "Turki Al-Salem", gender: "male" },
  { ar: "لمى الغامدي", en: "Lama Al-Ghamdi", gender: "female" },
  { ar: "ماجد الشهراني", en: "Majed Al-Shahrani", gender: "male" },
  { ar: "دانة المالكي", en: "Dana Al-Maliki", gender: "female" },
  { ar: "سلمان الرشيد", en: "Salman Al-Rashid", gender: "male" },
  { ar: "عبير الحارثي", en: "Abeer Al-Harthi", gender: "female" },
  { ar: "بدر المطيري", en: "Bader Al-Mutairi", gender: "male" },
  { ar: "أمل القحطاني", en: "Amal Al-Qahtani", gender: "female" },
];

const diagnoses = [
  { ar: "آلام أسفل الظهر", en: "Lower back pain" },
  { ar: "إصابة في الركبة", en: "Knee injury" },
  { ar: "تيبس في الكتف", en: "Shoulder stiffness" },
  { ar: "تأهيل بعد الجراحة", en: "Post-surgery rehabilitation" },
  { ar: "التواء الكاحل", en: "Ankle sprain" },
  { ar: "آلام الرقبة", en: "Neck pain" },
  { ar: "تأهيل عصبي", en: "Neurological rehabilitation" },
  { ar: "إصابة رياضية", en: "Sports injury" },
];

function dateAtOffset(offset: number): string {
  const date = new Date(`${DEMO_TODAY}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export const SEED_PATIENTS: ClinicPatient[] = Array.from({ length: 100 }, (_, index) => {
  const serial = 124 + index;
  const base = patientNames[index % patientNames.length];
  const diagnosis = diagnoses[index % diagnoses.length];
  const branchId = (["ghadeer", "darAlbaida", "quwayiyah"] as const)[index % 3];
  const age = 18 + ((index * 7) % 54);
  const month = String(1 + ((index * 5) % 12)).padStart(2, "0");
  const day = String(1 + ((index * 11) % 27)).padStart(2, "0");
  const episodes: ClinicPatient["episodes"] = [
    {
      id: `EP-${serial}-01`,
      labelAr: "البرنامج العلاجي الأول",
      labelEn: "Treatment episode 1",
      diagnosisAr: diagnosis.ar,
      diagnosisEn: diagnosis.en,
      startedAt: dateAtOffset(-90 + (index % 60)),
      status: "active" as const,
    },
  ];
  if (index % 11 === 0) {
    const previousDiagnosis = diagnoses[(index + 3) % diagnoses.length];
    episodes.push({
      id: `EP-${serial}-00`,
      labelAr: "برنامج علاجي سابق",
      labelEn: "Previous treatment episode",
      diagnosisAr: previousDiagnosis.ar,
      diagnosisEn: previousDiagnosis.en,
      startedAt: dateAtOffset(-240 + (index % 45)),
      status: "discharged" as const,
    });
  }

  return {
    id: `EH-${String(serial).padStart(5, "0")}`,
    nameAr: base.ar,
    nameEn: base.en,
    phone: `05${String((index * 37) % 100000000).padStart(8, "0")}`,
    email: `patient${serial}@example.test`,
    gender: base.gender,
    dateOfBirth: `${2026 - age}-${month}-${day}`,
    branchId,
    status: index % 13 === 0 ? "inactive" : "active",
    createdAt: dateAtOffset(-90 + (index % 90)),
    lastVisit: index % 9 === 0 ? null : dateAtOffset(-1 - (index % 28)),
    sessionsTotal: 4 + ((index * 3) % 22),
    sessionsRemaining: index % 7,
    diagnosisAr: diagnosis.ar,
    diagnosisEn: diagnosis.en,
    allergiesAr: index % 17 === 0 ? "حساسية موسمية" : "لا يوجد",
    allergiesEn: index % 17 === 0 ? "Seasonal allergies" : "None reported",
    emergencyContact: `05${String((index * 41 + 1) % 100000000).padStart(8, "0")}`,
    episodes,
  };
});

const timeSlots = ["08:00", "08:45", "09:30", "10:15", "11:00", "11:45", "13:00", "13:45", "14:30", "15:15"];

export const SEED_APPOINTMENTS: ClinicAppointment[] = Array.from({ length: 200 }, (_, index) => {
  const dayOffset = Math.floor(index / 3) - 14;
  const branchId = (["ghadeer", "darAlbaida", "quwayiyah"] as const)[index % 3];
  const therapists = CLINIC_THERAPISTS.filter((therapist) => therapist.branchId === branchId);
  const status: ClinicAppointment["status"] =
    dayOffset < 0
      ? index % 19 === 0
        ? "noShow"
        : index % 17 === 0
          ? "cancelled"
          : "completed"
      : dayOffset === 0
        ? index % 9 === 0
          ? "inSession"
          : index % 7 === 0
            ? "checkedIn"
            : "confirmed"
        : index % 6 === 0
          ? "booked"
          : "confirmed";

  return {
    id: `APT-${String(index + 1).padStart(5, "0")}`,
    patientId: SEED_PATIENTS[(index * 7) % SEED_PATIENTS.length].id,
    branchId,
    serviceId: CLINIC_SERVICES[index % CLINIC_SERVICES.length].id,
    therapistId: therapists[Math.floor(index / 3) % therapists.length].id,
    date: dateAtOffset(dayOffset),
    time: timeSlots[Math.floor(index / 3) % timeSlots.length],
    durationMinutes: CLINIC_SERVICES[index % CLINIC_SERVICES.length].durationMinutes,
    visitType: (index % 17 === 0 ? "home" : "clinic") as ClinicAppointment["visitType"],
    status,
    createdAt: new Date(`${dateAtOffset(dayOffset)}T07:00:00.000Z`).toISOString(),
  };
}).sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`));
