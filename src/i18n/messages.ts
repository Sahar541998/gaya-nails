import type { Locale } from "@/i18n/locales";

export type Messages = {
  meta: {
    titleDefault: string;
    titleTemplate: string;
    description: string;
  };
  skipToContent: string;
  header: {
    primaryNav: string;
    mobileNav: string;
    menu: string;
    bookNow: string;
    languageSwitch: string;
    navHome: string;
    navWork: string;
    navServices: string;
    navAbout: string;
  };
  footer: {
    locationSoon: string;
    instagram: string;
    bookNow: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    servicesLine: string;
    bookNow: string;
    imageAlt: string;
  };
  work: {
    title: string;
    viewAll: string;
    placeholderNote: string;
    placeholderAlt: string;
    metaTitle: string;
  };
  services: {
    title: string;
    empty: string;
  };
  about: {
    title: string;
    body: string;
    imageAlt: string;
  };
  cta: {
    title: string;
    subtitle: string;
    bookNow: string;
  };
  manage: {
    title: string;
    description: string;
  };
  book: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    unavailable: string;
    noServices: string;
    eyebrow: string;
    heading: string;
    intro: string;
    steps: {
      service: string;
      time: string;
      details: string;
      review: string;
    };
    chooseServiceTitle: string;
    chooseServiceHint: string;
    select: string;
    chooseTimeTitle: string;
    chooseTimeHint: string;
    noDates: string;
    loadingTimes: string;
    noTimes: string;
    loadTimesFailed: string;
    pickDateHint: string;
    pickTimeHint: string;
    previousWeek: string;
    nextWeek: string;
    back: string;
    continue: string;
    detailsTitle: string;
    detailsHint: string;
    name: string;
    email: string;
    phone: string;
    phoneHint: string;
    note: string;
    optional: string;
    verificationCode: string;
    codeHint: string;
    phoneConfirmed: string;
    sendCode: string;
    sending: string;
    verify: string;
    verifying: string;
    resendCode: string;
    reviewTitle: string;
    reviewHint: string;
    confirm: string;
    booking: string;
    summaryTitle: string;
    summaryEmpty: string;
    duration: string;
    price: string;
    date: string;
    time: string;
    nameInvalid: string;
    emailInvalid: string;
    phoneInvalid: string;
    noteInvalid: string;
    codeInvalid: string;
    errors: {
      generic: string;
      unauthorized: string;
      validation: string;
      rate_limited: string;
      unavailable: string;
      conflict: string;
      SLOT_UNAVAILABLE: string;
      TIME_BLOCKED: string;
      INVALID_TIME: string;
      BOOKING_DISABLED: string;
      SERVICE_NOT_FOUND: string;
      SERVICE_INACTIVE: string;
      OUTSIDE_BUSINESS_HOURS: string;
    };
    confirmedEyebrow: string;
    confirmedTitle: string;
    confirmedSummary: string;
    backHome: string;
  };
};

export const en: Messages = {
  meta: {
    titleDefault: "Gaya — Nail artist",
    titleTemplate: "%s · Gaya",
    description:
      "Nail artist studio. Gel, builder gel, and nail art. Book your next set.",
  },
  skipToContent: "Skip to content",
  header: {
    primaryNav: "Primary",
    mobileNav: "Mobile",
    menu: "Menu",
    bookNow: "Book now",
    languageSwitch: "עברית",
    navHome: "Home",
    navWork: "My Work",
    navServices: "Services",
    navAbout: "About",
  },
  footer: {
    locationSoon: "Location coming soon",
    instagram: "Instagram",
    bookNow: "Book now",
  },
  hero: {
    eyebrow: "Nail artist",
    titleLine1: "Your nails,",
    titleLine2: "your style.",
    servicesLine: "Gel · Builder · Nail art",
    bookNow: "Book now",
    imageAlt: "Photograph of a manicure",
  },
  work: {
    title: "My work",
    viewAll: "View all",
    placeholderNote:
      "Preview images only. Real studio photos will replace these when the gallery is published.",
    placeholderAlt:
      "Placeholder photograph of nails. Studio work will appear here.",
    metaTitle: "My work",
  },
  services: {
    title: "Services",
    empty: "Services will appear here once they are added.",
  },
  about: {
    title: "About",
    body: "{studioName} is a nail studio focused on clean shapes, lasting gel, and considered colour.",
    imageAlt: "Portrait of {studioName}",
  },
  cta: {
    title: "Ready for your next set?",
    subtitle: "Book your appointment.",
    bookNow: "Book now",
  },
  manage: {
    title: "Manage appointment",
    description:
      "Appointment management is not available yet. Studio owners sign in at /admin.",
  },
  book: {
    metaTitle: "Book",
    metaDescription: "Book a nail appointment with Gaya.",
    title: "Book",
    unavailable: "Booking is not available right now.",
    noServices: "Services will appear here once they are added.",
    eyebrow: "Book",
    heading: "Your next set",
    intro:
      "Choose a service, pick an open time, and we’ll confirm your appointment.",
    steps: {
      service: "Service",
      time: "Time",
      details: "Details",
      review: "Review",
    },
    chooseServiceTitle: "Choose a service",
    chooseServiceHint: "Tap a service to see available times.",
    select: "Select",
    chooseTimeTitle: "Choose a date and time",
    chooseTimeHint: "Open studio hours only.",
    noDates: "No booking dates are open right now.",
    loadingTimes: "Loading times…",
    noTimes: "No times are open on this day. Try another date.",
    loadTimesFailed: "We could not load times. Try another date.",
    pickDateHint: "Pick a date to see open times.",
    pickTimeHint: "Pick a time to continue.",
    previousWeek: "Previous week",
    nextWeek: "Next week",
    back: "Back",
    continue: "Continue",
    detailsTitle: "Your details",
    detailsHint: "We’ll text a short code to confirm it’s you.",
    name: "Name",
    email: "Email",
    phone: "Phone",
    phoneHint: "Israeli mobile numbers work with or without +972.",
    note: "Note",
    optional: "(optional)",
    verificationCode: "Verification code",
    codeHint: "Enter the code we sent, then continue.",
    phoneConfirmed: "Phone number confirmed.",
    sendCode: "Send code",
    sending: "Sending…",
    verify: "Verify",
    verifying: "Verifying…",
    resendCode: "Resend code",
    reviewTitle: "Review",
    reviewHint: "Confirm the service, time, and your details before booking.",
    confirm: "Confirm booking",
    booking: "Booking…",
    summaryTitle: "Your booking",
    summaryEmpty: "Choose a service to begin.",
    duration: "Duration",
    price: "Price",
    date: "Date",
    time: "Time",
    nameInvalid: "Enter your name.",
    emailInvalid: "Enter a valid email address.",
    phoneInvalid: "Enter a valid phone number.",
    noteInvalid: "Keep the note under 500 characters.",
    codeInvalid: "Enter the code from your message.",
    errors: {
      generic: "Something went wrong. Try again.",
      unauthorized: "Verify your phone number to continue.",
      validation: "Check the details and try again.",
      rate_limited: "Too many attempts. Wait a moment and try again.",
      unavailable: "Verification is unavailable right now. Try again later.",
      conflict: "That time is no longer available. Pick another slot.",
      SLOT_UNAVAILABLE: "That time is no longer available. Pick another slot.",
      TIME_BLOCKED: "That time is blocked. Pick another slot.",
      INVALID_TIME: "That time isn’t available. Pick another slot.",
      BOOKING_DISABLED: "Booking is not available right now.",
      SERVICE_NOT_FOUND: "That service is no longer available.",
      SERVICE_INACTIVE: "That service is no longer available.",
      OUTSIDE_BUSINESS_HOURS: "That time is outside studio hours.",
    },
    confirmedEyebrow: "Confirmed",
    confirmedTitle: "You’re booked.",
    confirmedSummary: "{serviceName} on {date} at {time}. {duration}, {price}.",
    backHome: "Back home",
  },
};

export const he: Messages = {
  meta: {
    titleDefault: "Gaya — אמנית ציפורניים",
    titleTemplate: "%s · Gaya",
    description:
      "סטודיו לציפורניים. ג׳ל, בילדר ג׳ל ונייל ארט. קבעי תור לסט הבא.",
  },
  skipToContent: "דלגי לתוכן",
  header: {
    primaryNav: "ניווט ראשי",
    mobileNav: "ניווט בנייד",
    menu: "תפריט",
    bookNow: "קביעת תור",
    languageSwitch: "English",
    navHome: "בית",
    navWork: "העבודות שלי",
    navServices: "שירותים",
    navAbout: "אודות",
  },
  footer: {
    locationSoon: "המיקום יפורסם בקרוב",
    instagram: "אינסטגרם",
    bookNow: "קביעת תור",
  },
  hero: {
    eyebrow: "אמנית ציפורניים",
    titleLine1: "הציפורניים שלך,",
    titleLine2: "הסגנון שלך.",
    servicesLine: "ג׳ל · בילדר · נייל ארט",
    bookNow: "קביעת תור",
    imageAlt: "צילום של מניקור",
  },
  work: {
    title: "העבודות שלי",
    viewAll: "לכל העבודות",
    placeholderNote:
      "תמונות לדוגמה בלבד. תמונות הסטודיו יופיעו כאן כשהגלריה תפורסם.",
    placeholderAlt: "תמונת דוגמה של ציפורניים. עבודות הסטודיו יופיעו כאן.",
    metaTitle: "העבודות שלי",
  },
  services: {
    title: "שירותים",
    empty: "השירותים יופיעו כאן אחרי שיתווספו.",
  },
  about: {
    title: "אודות",
    body: "{studioName} הוא סטודיו לציפורניים שמתמקד בצורות נקיות, ג׳ל שעמיד ובחירת צבע מדויקת.",
    imageAlt: "דיוקן של {studioName}",
  },
  cta: {
    title: "מוכנה לסט הבא?",
    subtitle: "קבעי תור.",
    bookNow: "קביעת תור",
  },
  manage: {
    title: "ניהול תור",
    description:
      "ניהול תורים ללקוחות עדיין לא זמין. בעלת הסטודיו נכנסת ב־/admin.",
  },
  book: {
    metaTitle: "קביעת תור",
    metaDescription: "קביעת תור לציפורניים אצל Gaya.",
    title: "קביעת תור",
    unavailable: "קביעת תורים לא זמינה כרגע.",
    noServices: "השירותים יופיעו כאן אחרי שיתווספו.",
    eyebrow: "תור",
    heading: "הסט הבא שלך",
    intro: "בחרי שירות, בחרי שעה פנויה, ואנחנו נאשר את התור.",
    steps: {
      service: "שירות",
      time: "שעה",
      details: "פרטים",
      review: "סיכום",
    },
    chooseServiceTitle: "בחרי שירות",
    chooseServiceHint: "לחצי על שירות כדי לראות שעות פנויות.",
    select: "בחירה",
    chooseTimeTitle: "בחרי תאריך ושעה",
    chooseTimeHint: "רק בשעות הפעילות של הסטודיו.",
    noDates: "אין כרגע תאריכים פתוחים לקביעת תור.",
    loadingTimes: "טוען שעות…",
    noTimes: "אין שעות פנויות ביום הזה. נסי תאריך אחר.",
    loadTimesFailed: "לא הצלחנו לטעון שעות. נסי תאריך אחר.",
    pickDateHint: "בחרי תאריך כדי לראות שעות פנויות.",
    pickTimeHint: "בחרי שעה כדי להמשיך.",
    previousWeek: "שבוע קודם",
    nextWeek: "שבוע הבא",
    back: "חזרה",
    continue: "המשך",
    detailsTitle: "הפרטים שלך",
    detailsHint: "נשלח קוד קצר ב-SMS כדי לאשר שזה את.",
    name: "שם",
    email: "אימייל",
    phone: "טלפון",
    phoneHint: "מספר ישראלי עובד עם או בלי ‎+972.",
    note: "הערה",
    optional: "(אופציונלי)",
    verificationCode: "קוד אימות",
    codeHint: "הזיני את הקוד ששלחנו, ואז המשיכי.",
    phoneConfirmed: "מספר הטלפון אומת.",
    sendCode: "שליחת קוד",
    sending: "שולח…",
    verify: "אימות",
    verifying: "מאמת…",
    resendCode: "שליחה מחדש",
    reviewTitle: "סיכום",
    reviewHint: "אשרי את השירות, השעה והפרטים לפני קביעת התור.",
    confirm: "אישור תור",
    booking: "קובע תור…",
    summaryTitle: "התור שלך",
    summaryEmpty: "בחרי שירות כדי להתחיל.",
    duration: "משך",
    price: "מחיר",
    date: "תאריך",
    time: "שעה",
    nameInvalid: "הזיני שם.",
    emailInvalid: "הזיני כתובת אימייל תקינה.",
    phoneInvalid: "הזיני מספר טלפון תקין.",
    noteInvalid: "ההערה צריכה להיות עד 500 תווים.",
    codeInvalid: "הזיני את הקוד מההודעה.",
    errors: {
      generic: "משהו השתבש. נסי שוב.",
      unauthorized: "אשרי את מספר הטלפון כדי להמשיך.",
      validation: "בדקי את הפרטים ונסי שוב.",
      rate_limited: "יותר מדי ניסיונות. המתיני קצת ונסי שוב.",
      unavailable: "האימות לא זמין כרגע. נסי שוב מאוחר יותר.",
      conflict: "השעה הזו כבר לא פנויה. בחרי שעה אחרת.",
      SLOT_UNAVAILABLE: "השעה הזו כבר לא פנויה. בחרי שעה אחרת.",
      TIME_BLOCKED: "השעה הזו חסומה. בחרי שעה אחרת.",
      INVALID_TIME: "השעה הזו לא זמינה. בחרי שעה אחרת.",
      BOOKING_DISABLED: "קביעת תורים לא זמינה כרגע.",
      SERVICE_NOT_FOUND: "השירות הזה כבר לא זמין.",
      SERVICE_INACTIVE: "השירות הזה כבר לא זמין.",
      OUTSIDE_BUSINESS_HOURS: "השעה הזו מחוץ לשעות הפעילות.",
    },
    confirmedEyebrow: "אושר",
    confirmedTitle: "התור נקבע.",
    confirmedSummary:
      "{serviceName} ב-{date} בשעה {time}. {duration}, {price}.",
    backHome: "חזרה לדף הבית",
  },
};

const byLocale: Record<Locale, Messages> = { he, en };

export function getMessages(locale: Locale): Messages {
  return byLocale[locale];
}
