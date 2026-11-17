import type { Locale } from "@/types";

export type WorkspaceKey =
  | "branches"
  | "clinical"
  | "treatmentPlans"
  | "services"
  | "packages"
  | "finance"
  | "inventory"
  | "procurement"
  | "employees"
  | "reports"
  | "marketing"
  | "notifications"
  | "settings";

export interface WorkspacePageCopy {
  heading: string;
  description: string;
  sectionTitle: string;
  sectionDescription: string;
  addLabel: string;
  metricLabels: [string, string, string, string];
  insightTitle: string;
  insightDescription: string;
}

export interface WorkspaceLocaleCopy {
  suiteLabel: string;
  demoBadge: string;
  demoNotice: string;
  branchScope: string;
  selectBranch: string;
  exportView: string;
  createNew: string;
  searchPlaceholder: string;
  filterAll: string;
  filterActive: string;
  filterAttention: string;
  totalLabel: string;
  totalRecords: string;
  reference: string;
  record: string;
  category: string;
  branch: string;
  value: string;
  status: string;
  actions: string;
  updated: string;
  noResultsTitle: string;
  noResultsDescription: string;
  active: string;
  pending: string;
  review: string;
  completed: string;
  draft: string;
  attention: string;
  unread: string;
  read: string;
  scheduled: string;
  inProgress: string;
  lowStock: string;
  exportReady: string;
  createDialogTitle: string;
  createDialogDescription: string;
  nameField: string;
  detailField: string;
  categoryField: string;
  createButton: string;
  cancelButton: string;
  markDone: string;
  markUnread: string;
  markRead: string;
  pauseItem: string;
  activateItem: string;
  rowAction: string;
  branchActive: string;
  branchPreview: string;
  patientsLabel: string;
  appointmentsTodayLabel: string;
  viewBranch: string;
  branchAssignmentNotice: string;
  attentionTitle: string;
  attentionEmpty: string;
  progressLabel: string;
  activityTitle: string;
  activityBody: string;
  relatedWorkspaces: string;
  settingsSaved: string;
  settingsAppearance: string;
  settingsWorkspace: string;
  settingsNotifications: string;
  settingsPrivacy: string;
  settingsLanguage: string;
  settingsTheme: string;
  settingsRole: string;
  settingsWeeklyDigest: string;
  settingsAppointmentAlerts: string;
  settingsCompactSidebar: string;
  settingsDataNote: string;
  savePreferences: string;
  enabled: string;
  disabled: string;
  themeLight: string;
  themeDark: string;
  notificationsMarkAll: string;
  notificationsUnreadOnly: string;
  pages: Record<WorkspaceKey, WorkspacePageCopy>;
  statuses: Record<string, string>;
}

export const workspaceCopy: Record<Locale, WorkspaceLocaleCopy> = {
  ar: {
    suiteLabel: "منظومة احتراف التشغيلية",
    demoBadge: "مساحة تجريبية",
    demoNotice: "بيانات اصطناعية للعرض فقط · التغييرات محلية في هذا النموذج · لا يوجد اتصال بخلفية تشغيلية.",
    branchScope: "نطاق الفرع",
    selectBranch: "عرض الفرع",
    exportView: "تصدير العرض",
    createNew: "إنشاء جديد",
    searchPlaceholder: "ابحث بالاسم أو الرقم أو الحالة...",
    filterAll: "كل السجلات",
    filterActive: "نشط / جارٍ",
    filterAttention: "يحتاج متابعة",
    totalLabel: "إجمالي السجلات",
    totalRecords: "سجل",
    reference: "المرجع",
    record: "السجل / العنصر",
    category: "التصنيف",
    branch: "الفرع",
    value: "القيمة / الملخص",
    status: "الحالة",
    actions: "إجراء",
    updated: "آخر تحديث",
    noResultsTitle: "لا توجد نتائج مطابقة",
    noResultsDescription: "جرّب تغيير البحث أو الفلاتر لعرض المزيد من السجلات.",
    active: "نشط",
    pending: "قيد الانتظار",
    review: "بانتظار المراجعة",
    completed: "مكتمل",
    draft: "مسودة",
    attention: "يحتاج متابعة",
    unread: "غير مقروء",
    read: "مقروء",
    scheduled: "مجدول",
    inProgress: "قيد التنفيذ",
    lowStock: "مخزون منخفض",
    exportReady: "تم تجهيز ملف التصدير للتحميل.",
    createDialogTitle: "إضافة سجل تجريبي",
    createDialogDescription: "سيُضاف هذا العنصر إلى العرض الحالي فقط، ولن يُرسل إلى أي نظام خارجي.",
    nameField: "اسم السجل",
    detailField: "وصف مختصر",
    categoryField: "التصنيف",
    createButton: "إضافة إلى العرض",
    cancelButton: "إلغاء",
    markDone: "تحديد كمكتمل",
    markUnread: "تحديد كغير مقروء",
    markRead: "تحديد كمقروء",
    pauseItem: "إيقاف مؤقت",
    activateItem: "تفعيل العنصر",
    rowAction: "تحديث الحالة",
    branchActive: "ضمن النطاق التجريبي",
    branchPreview: "الاسم والتشغيل تجريبيان",
    patientsLabel: "ملفات عرض",
    appointmentsTodayLabel: "مواعيد اليوم في العرض",
    viewBranch: "تحديد هذا الفرع",
    branchAssignmentNotice: "أسماء الفروع وتوزيع الموظفين الواردة هنا أولية لأغراض العرض، وتحتاج إلى اعتماد تشغيلي.",
    attentionTitle: "ما يحتاج إلى متابعة",
    attentionEmpty: "لا توجد عناصر عاجلة في هذا النطاق.",
    progressLabel: "مؤشر سير العمل",
    activityTitle: "موجز المساحة",
    activityBody: "الملخص مستند إلى بيانات نموذجية محلية، وليس إلى تشغيل مباشر.",
    relatedWorkspaces: "مساحات مرتبطة",
    settingsSaved: "تم حفظ تفضيلات النموذج في هذا المتصفح.",
    settingsAppearance: "المظهر وإمكانية الوصول",
    settingsWorkspace: "نطاق مساحة العمل",
    settingsNotifications: "تفضيلات التنبيه",
    settingsPrivacy: "البيانات والخصوصية",
    settingsLanguage: "لغة الواجهة",
    settingsTheme: "المظهر",
    settingsRole: "الدور التجريبي",
    settingsWeeklyDigest: "ملخص أسبوعي تجريبي",
    settingsAppointmentAlerts: "تذكيرات المواعيد التجريبية",
    settingsCompactSidebar: "قائمة جانبية مطوية",
    settingsDataNote: "لا تحفظ هذه الشاشة بيانات مرضى أو بيانات تشغيلية. عناصر التحكم تحاكي تفضيلات مساحة العمل فقط.",
    savePreferences: "حفظ التفضيلات",
    enabled: "مفعّل",
    disabled: "متوقف",
    themeLight: "فاتح",
    themeDark: "داكن",
    notificationsMarkAll: "تحديد الكل كمقروء",
    notificationsUnreadOnly: "غير المقروءة فقط",
    pages: {
      branches: {
        heading: "إدارة الفروع",
        description: "نظرة تشغيلية موحدة على مواقع المجموعة، مع الحفاظ على استقلالية كل فرع.",
        sectionTitle: "فروع المجموعة",
        sectionDescription: "قارن حجم النشاط وحدد الفرع الذي تريد استعراضه.",
        addLabel: "إضافة فرع تجريبي",
        metricLabels: ["الفروع الظاهرة", "ملفات العرض", "مواعيد اليوم", "نسبة الإشغال"],
        insightTitle: "شبكة الفروع",
        insightDescription: "توزيع النشاط يساعد على تحديد أولويات المتابعة، بينما تظل أسماء الفروع وتكليفاتها قابلة للاعتماد.",
      },
      clinical: {
        heading: "مساحة العمل السريرية",
        description: "تابع اكتمال الملاحظات وخطوات المراجعة من قائمة عمل آمنة ومجهولة الهوية.",
        sectionTitle: "قائمة المراجعة السريرية",
        sectionDescription: "ترتيب عناصر التوثيق حسب الحالة والفرع — دون عرض تفاصيل صحية حقيقية.",
        addLabel: "إضافة عنصر مراجعة",
        metricLabels: ["عناصر العمل", "بانتظار المراجعة", "مكتمل اليوم", "بحاجة إلى متابعة"],
        insightTitle: "جودة التوثيق",
        insightDescription: "حافظ على اكتمال الملاحظات قبل إغلاق الجلسات، مع إبقاء بيانات العرض مجهولة الهوية.",
      },
      treatmentPlans: {
        heading: "خطط العلاج التجريبية",
        description: "نظّم تقدم الخطط ومراجعاتها على مستوى رموز الملفات فقط.",
        sectionTitle: "الخطط النشطة والمراجعات",
        sectionDescription: "قائمة توضيحية لمراحل الخطة وعدد الجلسات — لا تتضمن تشخيصات أو سجلات فعلية.",
        addLabel: "إنشاء خطة تجريبية",
        metricLabels: ["خطط العرض", "قيد التنفيذ", "بانتظار المراجعة", "جلسات مخططة"],
        insightTitle: "متابعة التقدم",
        insightDescription: "اعرض التقدم في الخطة كمسار إداري، واترك اعتماد المؤشرات السريرية لمرحلة لاحقة.",
      },
      services: {
        heading: "كتالوج الخدمات",
        description: "إدارة أسماء الخدمات ومددها وأسعارها التجريبية ضمن قائمة موحدة للفروع.",
        sectionTitle: "الخدمات المتاحة",
        sectionDescription: "يمكن البحث والتصفية وتغيير الحالة داخل هذا النموذج فقط.",
        addLabel: "إضافة خدمة تجريبية",
        metricLabels: ["الخدمات", "الخدمات النشطة", "متوسط المدة", "متوسط السعر"],
        insightTitle: "تنسيق الكتالوج",
        insightDescription: "وحّد تعريف الخدمة ومدتها قبل ربطها بالحجز أو إعداد التقارير التشغيلية.",
      },
      packages: {
        heading: "الباقات والبرامج",
        description: "نظّم باقات الجلسات التجريبية وقواعد استخدامها بصورة واضحة وقابلة للتوسع.",
        sectionTitle: "الباقات التجريبية",
        sectionDescription: "أسعار وعدد جلسات توضيحية وليست عرضاً تجارياً معتمداً.",
        addLabel: "إنشاء باقة تجريبية",
        metricLabels: ["الباقات", "النشطة", "جلسات ضمن العرض", "متوسط القيمة"],
        insightTitle: "وضوح العرض",
        insightDescription: "اجعل عدد الجلسات ومدة الصلاحية والسعر ظاهرة قبل اعتماد أي باقة.",
      },
      finance: {
        heading: "الفواتير والتحصيل",
        description: "تابع حالات الفوترة والتحصيل بأرقام اصطناعية ونطاق واضح للفرع.",
        sectionTitle: "سجل الفواتير التجريبي",
        sectionDescription: "بيانات مالية اصطناعية لتوضيح سير العمل فقط — لا تمثل دفاتر أو أرصدة حقيقية.",
        addLabel: "إنشاء فاتورة تجريبية",
        metricLabels: ["الفواتير", "بانتظار التحصيل", "مبالغ محصلة", "متأخرة"],
        insightTitle: "متابعة التحصيل",
        insightDescription: "ركّز على الاستحقاقات القادمة أولاً، ثم طابق مبالغ العرض قبل أي اعتماد مالي.",
      },
      inventory: {
        heading: "المخزون التشغيلي",
        description: "راقب مستلزمات العيادات ومستويات إعادة الطلب عبر نطاق الفروع المحدد.",
        sectionTitle: "عناصر المخزون",
        sectionDescription: "كميات وتكاليف تجريبية لمستلزمات تشغيلية عامة، وليست سجلاً دوائياً.",
        addLabel: "إضافة عنصر للمخزون",
        metricLabels: ["أصناف العرض", "مخزون منخفض", "وحدات متاحة", "قيد التوريد"],
        insightTitle: "جاهزية الإمداد",
        insightDescription: "حدّد أصناف إعادة الطلب قبل وصولها إلى حد النفاد، مع مراجعة التوزيع على الفروع.",
      },
      procurement: {
        heading: "المشتريات والتوريد",
        description: "تابع طلبات الشراء والموافقات ومواعيد التوريد في مساحة تشغيلية واحدة.",
        sectionTitle: "طلبات الشراء",
        sectionDescription: "كل الموردين والقيم ومواعيد التوريد أدناه بيانات نموذجية قابلة للتغيير.",
        addLabel: "طلب شراء تجريبي",
        metricLabels: ["الطلبات", "بانتظار الموافقة", "تم الاستلام", "قيمة الطلبات"],
        insightTitle: "متابعة التوريد",
        insightDescription: "رتّب الطلبات حسب موعد الوصول وراجع الموافقات المفتوحة قبل إصدار طلبات جديدة.",
      },
      employees: {
        heading: "فريق العمل والموارد البشرية",
        description: "استعرض هيكل الفريق التجريبي وتوزيع التغطية دون اعتماد أسماء أو تكليفات فعلية.",
        sectionTitle: "دليل الفريق التجريبي",
        sectionDescription: "الأسماء والأدوار والفروع توضيحية وغير مؤكدة، وتحتاج إلى مراجعة الإدارة.",
        addLabel: "إضافة عضو تجريبي",
        metricLabels: ["أعضاء العرض", "تخصصات تغطيها العينة", "نشطون في العرض", "فروع ممثلة"],
        insightTitle: "تغطية القوى العاملة",
        insightDescription: "قارن التغطية حسب التخصص والفرع، ثم استبدل بيانات العرض بتوزيع معتمد.",
      },
      reports: {
        heading: "التقارير والتحليلات",
        description: "حوّل النشاط إلى مؤشرات واضحة وتقارير قابلة للتصدير مع اختيار نطاق الفرع.",
        sectionTitle: "مكتبة التقارير",
        sectionDescription: "تقارير توضيحية فقط؛ مصدر الأرقام بيانات العرض المحلية.",
        addLabel: "إنشاء تقرير تجريبي",
        metricLabels: ["التقارير", "جاهزة للعرض", "مجدولة", "آخر تحديث"],
        insightTitle: "نظرة تحليلية",
        insightDescription: "قارن اتجاهات المواعيد والتحصيل والإشغال، ثم نزّل نسخة CSV من القائمة الحالية.",
      },
      marketing: {
        heading: "التسويق والعلاقات",
        description: "تابع الحملات وقنوات التواصل بمؤشرات إجمالية من دون عرض بيانات تواصل شخصية.",
        sectionTitle: "الحملات التجريبية",
        sectionDescription: "مؤشرات الوصول والتفاعل اصطناعية؛ لا يتم إرسال أي رسائل من هذا النموذج.",
        addLabel: "إنشاء حملة تجريبية",
        metricLabels: ["الحملات", "نشطة", "وصول تقديري", "معدل التفاعل"],
        insightTitle: "أداء القنوات",
        insightDescription: "وازن بين الوصول والتفاعل وجودة المتابعة دون استهداف أشخاص حقيقيين.",
      },
      notifications: {
        heading: "مركز الإشعارات",
        description: "تابع تنبيهات المواعيد والمهام ومراجعات التشغيل من قائمة قابلة للفرز.",
        sectionTitle: "كل التحديثات",
        sectionDescription: "الإشعارات هنا تجريبية، وحالات القراءة محفوظة أثناء الجلسة فقط.",
        addLabel: "إنشاء تنبيه تجريبي",
        metricLabels: ["كل التحديثات", "غير مقروءة", "مواعيد", "مهام متابعة"],
        insightTitle: "الأولوية الآن",
        insightDescription: "ابدأ بالتنبيهات غير المقروءة ذات الأولوية، ثم صفّ القائمة حسب نوع الحدث.",
      },
      settings: {
        heading: "إعدادات مساحة العمل",
        description: "تحكم باللغة والمظهر ونطاق الفرع والدور التجريبي من مكان واحد.",
        sectionTitle: "تفضيلات المنصة",
        sectionDescription: "التغييرات تحفظ كتفضيلات عرض محلية فقط، وليست إعدادات وصول أو أمان.",
        addLabel: "حفظ التفضيلات",
        metricLabels: ["اللغة", "المظهر", "الدور الحالي", "نطاق الفرع"],
        insightTitle: "معاينة المساحة",
        insightDescription: "تجربة المستخدم تتغير حسب الدور والفرع واللغة؛ جميع الصلاحيات هنا محاكاة مرئية.",
      },
    },
    statuses: {
      active: "نشط",
      pending: "قيد الانتظار",
      review: "بانتظار المراجعة",
      completed: "مكتمل",
      draft: "مسودة",
      attention: "يحتاج متابعة",
      unread: "غير مقروء",
      read: "مقروء",
      scheduled: "مجدول",
      inProgress: "قيد التنفيذ",
      lowStock: "مخزون منخفض",
    },
  },
  en: {
    suiteLabel: "Ehteraf operations suite",
    demoBadge: "Prototype workspace",
    demoNotice: "Synthetic demo data only · Changes are local to this prototype · No operational backend is connected.",
    branchScope: "Branch scope",
    selectBranch: "View branch",
    exportView: "Export view",
    createNew: "Create new",
    searchPlaceholder: "Search by name, reference, or status...",
    filterAll: "All records",
    filterActive: "Active / in progress",
    filterAttention: "Needs attention",
    totalLabel: "Total records",
    totalRecords: "records",
    reference: "Reference",
    record: "Record / item",
    category: "Category",
    branch: "Branch",
    value: "Value / summary",
    status: "Status",
    actions: "Action",
    updated: "Last update",
    noResultsTitle: "No matching results",
    noResultsDescription: "Try changing your search or filters to see more records.",
    active: "Active",
    pending: "Pending",
    review: "In review",
    completed: "Completed",
    draft: "Draft",
    attention: "Needs attention",
    unread: "Unread",
    read: "Read",
    scheduled: "Scheduled",
    inProgress: "In progress",
    lowStock: "Low stock",
    exportReady: "Your export is ready to download.",
    createDialogTitle: "Add a demo record",
    createDialogDescription: "This item is added to the current view only and is not sent to an external system.",
    nameField: "Record name",
    detailField: "Short description",
    categoryField: "Category",
    createButton: "Add to this view",
    cancelButton: "Cancel",
    markDone: "Mark as complete",
    markUnread: "Mark as unread",
    markRead: "Mark as read",
    pauseItem: "Pause item",
    activateItem: "Activate item",
    rowAction: "Update status",
    branchActive: "In demo scope",
    branchPreview: "Provisional name and operations",
    patientsLabel: "Demo profiles",
    appointmentsTodayLabel: "Demo appointments today",
    viewBranch: "Set as current branch",
    branchAssignmentNotice: "Branch names and staff assignments shown here are provisional and require operational confirmation.",
    attentionTitle: "Needs attention",
    attentionEmpty: "Nothing urgent in this workspace.",
    progressLabel: "Workflow health",
    activityTitle: "Workspace pulse",
    activityBody: "This summary uses local sample data, not a live operational feed.",
    relatedWorkspaces: "Related workspaces",
    settingsSaved: "Prototype preferences saved in this browser.",
    settingsAppearance: "Appearance & accessibility",
    settingsWorkspace: "Workspace scope",
    settingsNotifications: "Notification preferences",
    settingsPrivacy: "Data & privacy",
    settingsLanguage: "Interface language",
    settingsTheme: "Appearance",
    settingsRole: "Demo role",
    settingsWeeklyDigest: "Weekly demo summary",
    settingsAppointmentAlerts: "Demo appointment reminders",
    settingsCompactSidebar: "Collapsed sidebar",
    settingsDataNote: "This screen does not store patient or operational records. Controls only simulate workspace preferences.",
    savePreferences: "Save preferences",
    enabled: "Enabled",
    disabled: "Disabled",
    themeLight: "Light",
    themeDark: "Dark",
    notificationsMarkAll: "Mark all as read",
    notificationsUnreadOnly: "Unread only",
    pages: {
      branches: {
        heading: "Branch management",
        description: "A unified operating view across the group, while preserving each branch's local context.",
        sectionTitle: "Group branches",
        sectionDescription: "Compare activity and choose the branch workspace you want to inspect.",
        addLabel: "Add demo branch",
        metricLabels: ["Branches in view", "Demo profiles", "Appointments today", "Average occupancy"],
        insightTitle: "Branch network",
        insightDescription: "A balanced view helps prioritize follow-up while branch names and assignments remain provisional.",
      },
      clinical: {
        heading: "Clinical workspace",
        description: "Track note completion and review steps in a privacy-conscious, anonymized work queue.",
        sectionTitle: "Clinical review queue",
        sectionDescription: "Documentation items sorted by status and branch — no real health details are shown.",
        addLabel: "Add review item",
        metricLabels: ["Work items", "Awaiting review", "Completed today", "Need follow-up"],
        insightTitle: "Documentation quality",
        insightDescription: "Keep session notes complete before closing a visit, using anonymized demo records only.",
      },
      treatmentPlans: {
        heading: "Demo treatment plans",
        description: "Organize plan progress and reviews using record codes only.",
        sectionTitle: "Active plans & reviews",
        sectionDescription: "An illustrative list of plan stages and session counts — no diagnosis or real record details.",
        addLabel: "Create demo plan",
        metricLabels: ["Demo plans", "In progress", "Awaiting review", "Planned sessions"],
        insightTitle: "Progress tracking",
        insightDescription: "Show plan progression as an administrative workflow; clinical metrics require later approval.",
      },
      services: {
        heading: "Service catalog",
        description: "Manage demo service names, durations, and prices in a unified list for the branches.",
        sectionTitle: "Available services",
        sectionDescription: "Search, filter, and update state in this prototype view only.",
        addLabel: "Add demo service",
        metricLabels: ["Services", "Active services", "Avg. duration", "Avg. price"],
        insightTitle: "Catalog alignment",
        insightDescription: "Standardize a service definition and duration before connecting it to booking or reporting.",
      },
      packages: {
        heading: "Packages & programs",
        description: "Organize illustrative session bundles and usage rules in a clear, extensible structure.",
        sectionTitle: "Demo packages",
        sectionDescription: "Session counts and prices are illustrative, not approved commercial offers.",
        addLabel: "Create demo package",
        metricLabels: ["Packages", "Active", "Demo sessions", "Average value"],
        insightTitle: "Offer clarity",
        insightDescription: "Keep session count, validity, and price visible before approving any package.",
      },
      finance: {
        heading: "Invoices & collections",
        description: "Track billing and collection states with synthetic values and clear branch scope.",
        sectionTitle: "Demo invoice register",
        sectionDescription: "Synthetic finance values for workflow illustration only — not actual books or balances.",
        addLabel: "Create demo invoice",
        metricLabels: ["Invoices", "Awaiting collection", "Collected amount", "Overdue"],
        insightTitle: "Collection follow-up",
        insightDescription: "Start with upcoming due dates, then reconcile sample amounts before any financial approval.",
      },
      inventory: {
        heading: "Operations inventory",
        description: "Monitor clinic supplies and reorder levels across the currently selected branch scope.",
        sectionTitle: "Inventory items",
        sectionDescription: "Illustrative quantities and costs for general operating supplies, not a pharmacy stock list.",
        addLabel: "Add inventory item",
        metricLabels: ["Demo items", "Low stock", "Units available", "On order"],
        insightTitle: "Supply readiness",
        insightDescription: "Identify reorder candidates before stock reaches zero, then verify branch distribution.",
      },
      procurement: {
        heading: "Procurement & suppliers",
        description: "Track purchase requests, approvals, and delivery windows in one operating workspace.",
        sectionTitle: "Purchase orders",
        sectionDescription: "Suppliers, values, and delivery dates below are sample data and can be changed.",
        addLabel: "New demo purchase order",
        metricLabels: ["Purchase orders", "Awaiting approval", "Received", "Planned spend"],
        insightTitle: "Delivery follow-up",
        insightDescription: "Prioritize arrival windows and open approvals before creating additional requests.",
      },
      employees: {
        heading: "People & workforce",
        description: "Review the demo team structure and coverage without treating assignments as confirmed.",
        sectionTitle: "Demo team directory",
        sectionDescription: "Names, roles, and branches are illustrative placeholders that require management confirmation.",
        addLabel: "Add demo team member",
        metricLabels: ["Demo roster", "Sample specialties", "Active in demo", "Branches represented"],
        insightTitle: "Workforce coverage",
        insightDescription: "Compare coverage by specialty and location, then replace demo assignments with approved data.",
      },
      reports: {
        heading: "Reports & analytics",
        description: "Turn activity into clear indicators and exportable reports with branch scope controls.",
        sectionTitle: "Report library",
        sectionDescription: "Illustrative reports only; figures are generated from local demo data.",
        addLabel: "Create demo report",
        metricLabels: ["Reports", "Ready to view", "Scheduled", "Updated this month"],
        insightTitle: "Analytics snapshot",
        insightDescription: "Compare appointment trends, collections, and utilization, then export the current CSV view.",
      },
      marketing: {
        heading: "Marketing & relationships",
        description: "Review campaigns and communication channels using aggregate metrics, not personal contact data.",
        sectionTitle: "Demo campaigns",
        sectionDescription: "Reach and engagement figures are synthetic; this prototype does not send messages.",
        addLabel: "Create demo campaign",
        metricLabels: ["Campaigns", "Live", "Estimated reach", "Engagement rate"],
        insightTitle: "Channel performance",
        insightDescription: "Balance reach, engagement, and follow-up without targeting real individuals.",
      },
      notifications: {
        heading: "Notification center",
        description: "Review appointment, task, and operations updates in a sortable, actionable queue.",
        sectionTitle: "All updates",
        sectionDescription: "Notifications are synthetic and read states are kept in this session only.",
        addLabel: "Create demo alert",
        metricLabels: ["All updates", "Unread", "Appointments", "Follow-up tasks"],
        insightTitle: "What needs attention",
        insightDescription: "Start with priority unread items, then filter the list by the type of event.",
      },
      settings: {
        heading: "Workspace settings",
        description: "Control language, appearance, branch scope, and demo role from one place.",
        sectionTitle: "Platform preferences",
        sectionDescription: "Changes are local display preferences, not security or access-control settings.",
        addLabel: "Save preferences",
        metricLabels: ["Language", "Appearance", "Current role", "Branch scope"],
        insightTitle: "Workspace preview",
        insightDescription: "The experience changes with demo role, branch, and language; all permissions are visual simulations.",
      },
    },
    statuses: {
      active: "Active",
      pending: "Pending",
      review: "In review",
      completed: "Completed",
      draft: "Draft",
      attention: "Needs attention",
      unread: "Unread",
      read: "Read",
      scheduled: "Scheduled",
      inProgress: "In progress",
      lowStock: "Low stock",
    },
  },
};
