// app/tenant/support/page.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  AlertCircle,
  Headphones,
  FileText,
  Wrench,
  Shield,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  subject: string;
  category: string;
  priority: string;
  message: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FAQS: FAQ[] = [
  {
    id: "1",
    question: "How do I pay my monthly rent?",
    answer:
      "You can pay rent through the Payments section on your dashboard. We accept Credit/Debit Cards, UPI, and Net Banking. Payments are processed instantly and you'll receive a confirmation email.",
    category: "payments",
  },
  {
    id: "2",
    question: "What happens if I miss the rent due date?",
    answer:
      "A late fee of ₹100 per day is charged for payments made after the due date. We recommend setting up reminders. Contact your property manager if you're facing financial difficulty.",
    category: "payments",
  },
  {
    id: "3",
    question: "How do I raise a maintenance complaint?",
    answer:
      "Go to your Dashboard and click 'Raise Complaint'. Select the appropriate category (maintenance, cleaning, etc.), describe the issue, and set the priority. Our team will respond within 24–48 hours.",
    category: "complaints",
  },
  {
    id: "4",
    question: "How do I request a leave of absence?",
    answer:
      "Click 'Request Leave' on your dashboard. Fill in the leave type, dates, and reason. Note that leave requests during your lock-in period may require additional approval from management.",
    category: "leave",
  },
  {
    id: "5",
    question: "How do I upload or view my documents?",
    answer:
      "Navigate to the Documents section from the sidebar. You can upload ID proofs, agreements, and other documents. All documents are encrypted and stored securely.",
    category: "documents",
  },
  {
    id: "6",
    question: "What is the notice period for vacating?",
    answer:
      "The standard notice period is 30 days (as per your agreement). You must submit a written vacate request through the Requests section at least 30 days before your intended move-out date.",
    category: "general",
  },
  {
    id: "7",
    question: "Can I change my room or bed?",
    answer:
      "Room/bed change requests can be submitted through the Requests section. Availability and approval depend on occupancy and management discretion. Processing takes 3–5 business days.",
    category: "general",
  },
  {
    id: "8",
    question: "How do I update my profile information?",
    answer:
      "Go to Profile from the sidebar or the profile dropdown in the header. You can update personal details, contact information, and profile photo. Some fields may require manager approval.",
    category: "account",
  },
];

const CATEGORIES = [
  { value: "payments", label: "Payments & Billing", icon: "₹" },
  { value: "maintenance", label: "Maintenance & Repairs", icon: "🔧" },
  { value: "documents", label: "Documents", icon: "📄" },
  { value: "account", label: "Account & Profile", icon: "👤" },
  { value: "leave", label: "Leave & Vacating", icon: "🏠" },
  { value: "general", label: "General Inquiry", icon: "💬" },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all duration-200 ${
        open ? "border-[#0149ab]/30 bg-blue-50/30" : "border-slate-200 bg-white"
      }`}
    >
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-sm sm:text-base text-slate-900 pr-4">
          {faq.question}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[#0149ab] shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SupportPage() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [ticket, setTicket] = useState<SupportTicket>({
    subject: "",
    category: "",
    priority: "medium",
    message: "",
  });

  // Filter FAQs
  const filteredFAQs = FAQS.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitTicket = async () => {
    if (!ticket.subject || !ticket.category || !ticket.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1200));
    setSubmitting(false);
    setTicketSubmitted(true);
    toast.success("Support ticket submitted! We'll respond within 24 hours.");
  };


  return (
    <div className="p-0 sm:p-6 max-w-9xl mx-auto">

      {/* Page Header */}
      <div className="mb-6 bg-[#0149ab] rounded-xl p-4 sm:p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Headphones className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Support Center</h1>
            <p className="text-blue-100 text-sm">We're here to help — 24/7</p>
          </div>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          {
            icon: Phone,
            title: "Call Us",
            value: "+91 98765 43210",
            sub: "Mon–Sat, 9am–7pm",
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-200",
          },
          {
            icon: Mail,
            title: "Email Us",
            value: "support@roomac.com",
            sub: "Reply within 24 hours",
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200",
          },
          {
            icon: Clock,
            title: "Response Time",
            value: "< 24 Hours",
            sub: "For all support tickets",
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-200",
          },
        ].map(({ icon: Icon, title, value, sub, color, bg, border }) => (
          <Card key={title} className={`border ${border} shadow-sm`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{title}</p>
                <p className="font-semibold text-sm text-slate-900">{value}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: FAQ ───────────────────────────────────────────────── */}
        <div className="space-y-4">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="px-4 sm:px-6 pb-3">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#0149ab]" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-4">
              {/* Search */}
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm"
              />

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === "all"
                      ? "bg-[#0149ab] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeCategory === cat.value
                        ? "bg-[#0149ab] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.icon} {cat.label.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="space-y-2">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq) => <FAQItem key={faq.id} faq={faq} />)
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No FAQs found for your search</p>
                    <p className="text-xs text-slate-400 mt-1">Try a different keyword or submit a support ticket</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="px-4 sm:px-6 pb-3">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#0149ab]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  { icon: Wrench, label: "Raise Complaint", path: "/tenant/portal", color: "text-orange-600", bg: "bg-orange-50" },
                  { icon: FileText, label: "My Documents", path: "/tenant/documents", color: "text-purple-600", bg: "bg-purple-50" },
                  { icon: Shield, label: "Requests", path: "/tenant/requests", color: "text-green-600", bg: "bg-green-50" },
                  { icon: MessageSquare, label: "Notifications", path: "/tenant/portal#notifications", color: "text-blue-600", bg: "bg-blue-50" },
                ].map(({ icon: Icon, label, path, color, bg }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#0149ab]/30 hover:bg-blue-50/30 transition-all text-left"
                  >
                    <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Submit Ticket ─────────────────────────────────────── */}
        <div>
          <Card className="border border-slate-200 shadow-sm sticky top-24">
            <CardHeader className="px-4 sm:px-6 pb-3">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Send className="h-5 w-5 text-[#0149ab]" />
                Submit a Support Ticket
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Can't find your answer? Our team will get back to you within 24 hours.
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {ticketSubmitted ? (
                /* Success State */
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Ticket Submitted!</h3>
                  <p className="text-sm text-slate-600 mb-1">
                    We've received your request and will respond within 24 hours.
                  </p>
                  <p className="text-xs text-slate-400 mb-6">
                    Check your email for a confirmation and ticket number.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTicketSubmitted(false);
                      setTicket({ subject: "", category: "", priority: "medium", message: "" });
                    }}
                    className="border-[#0149ab] text-[#0149ab] hover:bg-blue-50"
                  >
                    Submit Another Ticket
                  </Button>
                </div>
              ) : (
                /* Form */
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Subject *</Label>
                    <Input
                      value={ticket.subject}
                      onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Category *</Label>
                    <Select
                      value={ticket.category}
                      onValueChange={(v) => setTicket({ ...ticket, category: v })}
                    >
                      <SelectTrigger className="mt-1 text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Priority</Label>
                    <Select
                      value={ticket.priority}
                      onValueChange={(v) => setTicket({ ...ticket, priority: v })}
                    >
                      <SelectTrigger className="mt-1 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                            Low — Not urgent
                          </span>
                        </SelectItem>
                        <SelectItem value="medium">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" />
                            Medium — Normal
                          </span>
                        </SelectItem>
                        <SelectItem value="high">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-orange-500 inline-block" />
                            High — Needs attention
                          </span>
                        </SelectItem>
                        <SelectItem value="urgent">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                            Urgent — Critical issue
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Message *</Label>
                    <Textarea
                      value={ticket.message}
                      onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                      rows={5}
                      placeholder="Please describe your issue in detail. Include relevant dates, amounts, or room numbers if applicable."
                      className="mt-1 text-sm resize-none"
                    />
                    <p className="text-xs text-slate-400 mt-1 text-right">
                      {ticket.message.length}/500
                    </p>
                  </div>

                  {/* Priority indicator */}
                  {ticket.priority && (
                    <div className={`p-3 rounded-lg border text-xs ${
                      ticket.priority === "urgent"
                        ? "bg-red-50 border-red-200 text-red-700"
                        : ticket.priority === "high"
                        ? "bg-orange-50 border-orange-200 text-orange-700"
                        : "bg-blue-50 border-blue-200 text-blue-700"
                    }`}>
                      {ticket.priority === "urgent"
                        ? "🚨 Urgent tickets are addressed within 2–4 hours"
                        : ticket.priority === "high"
                        ? "⚡ High priority tickets are addressed within 8 hours"
                        : "ℹ️ Standard tickets are addressed within 24 hours"}
                    </div>
                  )}

                  <Button
                    onClick={handleSubmitTicket}
                    disabled={submitting}
                    className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-11 text-sm font-medium"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Submit Ticket
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}