// components/admin/properties/PropertyDetailsClient.tsx - ENHANCED VERSION
// components/admin/properties/PropertyDetailsClient.tsx - ENHANCED VERSION
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from '@/src/compat/next-navigation';
import {
    ArrowLeft,
    Building2,
    MapPin,
    Bed,
    DoorOpen,
    IndianRupee,
    Shield,
    User,
    Phone,
    Calendar,
    CheckCircle2,
    X,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Mail,
    Clock,
    Wifi,
    Utensils,
    Car,
    Home,
    Share2,
    Heart,
    Star,
    TrendingUp,
    AlertCircle,
    Maximize2,
    Copy,
    Check,
    Link2,
    FileText,
    Scale,
    Gavel,
    Ban,
    Lock,
    Bell,
    Receipt,
    Wrench,
    BookOpen,
    BadgeIndianRupee,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { getProperty } from '@/lib/propertyApi';
import { getOrCreateTrackingId, generatePropertySlug } from '@/lib/slugUtils';
import { getAllStaff, type StaffMember } from '@/lib/staffApi';
import { BsWhatsapp } from 'react-icons/bs';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

type Property = {
    id: string;
    name: string;
    city_id?: string | null;
    area: string;
    address: string;
    total_rooms: number;
    total_beds: number;
    occupied_beds?: number;
    starting_price: number;
    security_deposit: number;
    description?: string;
    property_manager_name: string;
    property_manager_phone: string;
    property_manager_email?: string;
    property_manager_role?: string;
    staff_id?: string | number;
    amenities: string[];
    services: string[];
    photo_urls: string[];
    property_rules?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string | null;
    lockin_period_months?: number;
    lockin_penalty_amount?: number;
    lockin_penalty_type?: string;
    notice_period_days?: number;
    notice_penalty_amount?: number;
    notice_penalty_type?: string;
    terms_conditions?: string | null;
    additional_terms?: string | null;
    tags?: string[];
};

interface PropertyDetailsClientProps {
    initialProperty: Property | null;
}

// Helper function to get salutation display
const getSalutationDisplay = (salutation: string): string => {
    const salutations: Record<string, string> = {
        mr: "Mr.",
        mrs: "Mrs.",
        miss: "Miss",
        dr: "Dr.",
        prof: "Prof.",
    };
    return salutations[salutation?.toLowerCase()] || "";
};

// Helper function to get full photo URL
const getFullPhotoUrl = (photoUrl: string | null): string | null => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http") || photoUrl.startsWith("blob:")) return photoUrl;
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const cleanUrl = photoUrl.startsWith("/") ? photoUrl.substring(1) : photoUrl;
    return `${apiUrl}/${cleanUrl}`;
};

// Helper function to parse JSON strings or handle string arrays
const parseJsonField = (field: string | null | undefined): string[] => {
    if (!field) return [];
    
    // If it's already an array (from API), return it
    if (Array.isArray(field)) return field;
    
    // Try to parse as JSON
    try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        // If it's a single string, return as array with one item
        return [String(parsed)];
    } catch {
        // If parsing fails, treat as a single string
        // Check if it might be comma-separated
        if (field.includes(',')) {
            return field.split(',').map(item => item.trim());
        }
        return [field];
    }
};

// Helper function to parse terms and conditions with headers
// Helper function to parse terms and conditions with headers
const parseTermsWithHeaders = (termsString: string | null | undefined): { header: string; content: string[] }[] => {
    if (!termsString) return [];
    
    const sections: { header: string; content: string[] }[] = [];
    const lines = termsString.split('\n').filter(line => line.trim() !== '');
    
    let currentHeader = '';
    let currentContent: string[] = [];
    
    // Define header patterns based on your form
    const headerPatterns = [
        '🔒 Minimum Lock-in Period',
        '💰 Security Deposit',
        '📅 Notice Period',
        '⚡ Electricity & Utilities',
        '🔧 Maintenance',
        '📋 Property Rules',
        '💵 Rent Includes',
        '⚠️ Damage & Liability',
        '🏢 Management Rights',
        '🧾 Taxes & Government Dues',
        '📝 Custom Term'
    ];
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Check if this line is a header
        const isHeader = headerPatterns.some(pattern => trimmedLine.includes(pattern));
        
        if (isHeader) {
            // Save previous section if exists
            if (currentHeader && currentContent.length > 0) {
                sections.push({ header: currentHeader, content: [...currentContent] });
            }
            // Start new section
            currentHeader = trimmedLine;
            currentContent = [];
        } else if (currentHeader) {
            // Add to current section content
            // Remove leading numbers like "1. " if present
            const cleanLine = trimmedLine.replace(/^\d+\.\s*/, '').trim();
            if (cleanLine) {
                currentContent.push(cleanLine);
            }
        }
    });
    
    // Add the last section
    if (currentHeader && currentContent.length > 0) {
        sections.push({ header: currentHeader, content: currentContent });
    }
    
    // If no sections were created but we have content, create a default section
    if (sections.length === 0 && lines.length > 0) {
        sections.push({ 
            header: '📝 Terms', 
            content: lines.map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
        });
    }
    
    return sections;
};

// Helper function to get icon for term header
const getTermHeaderIcon = (header: string) => {
    if (header.includes('Lock-in')) return <Lock className="h-4 w-4" />;
    if (header.includes('Security Deposit')) return <Shield className="h-4 w-4" />;
    if (header.includes('Notice Period')) return <Bell className="h-4 w-4" />;
    if (header.includes('Electricity')) return <Receipt className="h-4 w-4" />;
    if (header.includes('Maintenance')) return <Wrench className="h-4 w-4" />;
    if (header.includes('Property Rules')) return <BookOpen className="h-4 w-4" />;
    if (header.includes('Rent Includes')) return <BadgeIndianRupee className="h-4 w-4" />;
    if (header.includes('Damage')) return <AlertTriangle className="h-4 w-4" />;
    if (header.includes('Management')) return <Building2 className="h-4 w-4" />;
    if (header.includes('Taxes')) return <Receipt className="h-4 w-4" />;
    if (header.includes('Custom Term')) return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
};

// Helper function to get color for term header
const getTermHeaderColor = (header: string) => {
    if (header.includes('Lock-in')) return 'border-blue-500 bg-blue-50 text-blue-800';
    if (header.includes('Security Deposit')) return 'border-emerald-500 bg-emerald-50 text-emerald-800';
    if (header.includes('Notice Period')) return 'border-amber-500 bg-amber-50 text-amber-800';
    if (header.includes('Electricity')) return 'border-yellow-500 bg-yellow-50 text-yellow-800';
    if (header.includes('Maintenance')) return 'border-orange-500 bg-orange-50 text-orange-800';
    if (header.includes('Property Rules')) return 'border-purple-500 bg-purple-50 text-purple-800';
    if (header.includes('Rent Includes')) return 'border-green-500 bg-green-50 text-green-800';
    if (header.includes('Damage')) return 'border-red-500 bg-red-50 text-red-800';
    if (header.includes('Management')) return 'border-indigo-500 bg-indigo-50 text-indigo-800';
    if (header.includes('Taxes')) return 'border-gray-500 bg-gray-50 text-gray-800';
    if (header.includes('Custom')) return 'border-cyan-500 bg-cyan-50 text-cyan-800';
    return 'border-gray-300 bg-gray-50 text-gray-800';
};

const PropertyDetailsClient = ({ initialProperty }: PropertyDetailsClientProps) => {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(initialProperty);
    const [loading, setLoading] = useState(!initialProperty);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [imageFullscreen, setImageFullscreen] = useState(false);
    
    // Staff data for manager with salutation
    const [staffData, setStaffData] = useState<StaffMember | null>(null);
    
    // Parsed fields
    const [propertyRules, setPropertyRules] = useState<string[]>([]);
    const [termsConditions, setTermsConditions] = useState<{ header: string; content: string[] }[]>([]);
    const [additionalTerms, setAdditionalTerms] = useState<string[]>([]);
    
    // Share modal states
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showCopyMessage, setShowCopyMessage] = useState(false);

    const propertyId = params.id as string;

    useEffect(() => {
        if (!initialProperty && propertyId) {
            loadProperty();
        }
    }, [propertyId, initialProperty]);

    // Load staff data when property has staff_id
    useEffect(() => {
        if (property?.staff_id) {
            loadStaffData(property.staff_id);
        }
    }, [property]);

    // Parse JSON fields when property changes
    useEffect(() => {
        if (property) {
            setPropertyRules(parseJsonField(property.property_rules));
            setTermsConditions(parseTermsWithHeaders(property.terms_conditions));
            setAdditionalTerms(parseJsonField(property.additional_terms));
        }
    }, [property]);

    const loadStaffData = async (staffId: string | number) => {
        setLoadingStaff(true);
        try {
            const staffList = await getAllStaff();
            const staff = staffList.find(s => String(s.id) === String(staffId));
            if (staff) {
                setStaffData(staff);
            }
        } catch (error) {
            console.error('Error loading staff data:', error);
        } finally {
            setLoadingStaff(false);
        }
    };

    const loadProperty = async () => {
        setLoading(true);
        try {
            const res = await getProperty(propertyId);
            if (res && res.success && res.data) {
                const propertyData = {
                    ...res.data,
                    id: String(res.data.id || ''),
                    name: res.data.name || '',
                    area: res.data.area || '',
                    address: res.data.address || '',
                    total_rooms: Number(res.data.total_rooms) || 0,
                    total_beds: Number(res.data.total_beds) || 0,
                    occupied_beds: Number(res.data.occupied_beds) || 0,
                    starting_price: Number(res.data.starting_price) || 0,
                    security_deposit: Number(res.data.security_deposit) || 0,
                    description: res.data.description || '',
                    property_manager_name: res.data.property_manager_name || '',
                    property_manager_phone: res.data.property_manager_phone || '',
                    property_manager_email: res.data.property_manager_email || '',
                    property_manager_role: res.data.property_manager_role || '',
                    staff_id: res.data.staff_id,
                    amenities: Array.isArray(res.data.amenities) ? res.data.amenities : [],
                    services: Array.isArray(res.data.services) ? res.data.services : [],
                    photo_urls: Array.isArray(res.data.photo_urls) ? res.data.photo_urls : [],
                    property_rules: res.data.property_rules || '',
                    is_active: Boolean(res.data.is_active),
                    lockin_period_months: res.data.lockin_period_months || 0,
                    lockin_penalty_amount: res.data.lockin_penalty_amount || 0,
                    lockin_penalty_type: res.data.lockin_penalty_type || "fixed",
                    notice_period_days: res.data.notice_period_days || 0,
                    notice_penalty_amount: res.data.notice_penalty_amount || 0,
                    notice_penalty_type: res.data.notice_penalty_type || "fixed",
                    terms_conditions: res.data.terms_conditions || "",
                    additional_terms: res.data.additional_terms || "",
                    tags: Array.isArray(res.data.tags)
                        ? res.data.tags.filter((t: any) => t != null && t !== '' && typeof t === 'string')
                        : [],
                };
                setProperty(propertyData);
            } else {
                toast.error(res?.message || "Failed to load property details");
                router.back();
            }
        } catch (err) {
            console.error("loadProperty error:", err);
            toast.error("Failed to load property details");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // Generate share URL with SEO-friendly slug and tracking ID
    const getShareUrl = useCallback(() => {
        if (!property?.id) return '';
        
        const trackingId = getOrCreateTrackingId(property.id);
        
        const seoSlug = generatePropertySlug({
            name: property.name,
            area: property.area,
            city: property.city_id,
            id: property.id
        });
        
        return `${window.location.origin}/properties/${seoSlug}?tf=${trackingId}`;
    }, [property]);

    // Handle share click
    const handleShareClick = useCallback(() => {
        setIsShareModalOpen(true);
    }, []);

    // Close share modal
    const closeShareModal = useCallback(() => {
        setIsShareModalOpen(false);
        setCopied(false);
        setShowCopyMessage(false);
    }, []);

    // Handle copy link
    const handleCopyLink = useCallback(() => {
        const shareUrl = getShareUrl();
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setShowCopyMessage(true);
            setTimeout(() => {
                setCopied(false);
                setShowCopyMessage(false);
            }, 3000);
        }
    }, [getShareUrl]);

    // Handle social share
    const handleSocialShare = useCallback((platform: string) => {
        const shareUrl = getShareUrl();
        if (!shareUrl || !property) return;
        
        const shareText = `Check out this property: ${property.name} - ${property.area}`;

        let url = '';
        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
                break;
            case 'email':
                url = `mailto:?subject=${encodeURIComponent(property.name)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
                break;
        }
        
        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
        }
    }, [property, getShareUrl]);

    // Handle call button click
    const handleCallClick = useCallback(() => {
        if (property?.property_manager_phone) {
            window.location.href = `tel:${property.property_manager_phone}`;
        } else {
            toast.error('No phone number available');
        }
    }, [property]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6" />
                        <div className="absolute inset-0 blur-xl bg-blue-600/20 rounded-full" />
                    </div>
                    <p className="text-lg text-slate-700 font-medium">Loading property details...</p>
                    <p className="text-sm text-slate-500 mt-2">Please wait</p>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-white rounded-3xl p-8 shadow-xl">
                        <div className="bg-red-50 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Property Not Found</h2>
                        <p className="text-slate-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all mx-auto"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back to Properties
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const nextImage = () => {
        if (property.photo_urls.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === property.photo_urls.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (property.photo_urls.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? property.photo_urls.length - 1 : prev - 1
            );
        }
    };

    const occupiedBeds = property.occupied_beds || 0;
    const totalBeds = property.total_beds || 1;
    const occupancyPercentage = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
    const availableBeds = totalBeds - occupiedBeds;

    const currentPhotoUrl = property.photo_urls && property.photo_urls[currentImageIndex]
        ? `${import.meta.env.VITE_API_URL || ''}${property.photo_urls[currentImageIndex]}`
        : '';

    const getAmenityIcon = (amenity: string) => {
        const lower = amenity.toLowerCase();
        if (lower.includes('wifi')) return <Wifi className="h-5 w-5" />;
        if (lower.includes('food') || lower.includes('meal')) return <Utensils className="h-5 w-5" />;
        if (lower.includes('parking')) return <Car className="h-5 w-5" />;
        if (lower.includes('security')) return <Shield className="h-5 w-5" />;
        return <CheckCircle2 className="h-5 w-5" />;
    };

    const shareUrl = getShareUrl();

    // Check if any terms exist
    const hasTerms = propertyRules.length > 0 || termsConditions.length > 0 || additionalTerms.length > 0;

    // Get manager display name with salutation
    const getManagerDisplayName = () => {
        if (staffData) {
            const salutation = getSalutationDisplay(staffData.salutation || '');
            return `${salutation} ${staffData.name}`.trim();
        }
        return property.property_manager_name || 'Not assigned';
    };

    // Get manager role
    const getManagerRole = () => {
        if (staffData) {
            return staffData.role || '';
        }
        return property.property_manager_role || '';
    };

    // Get manager email
    const getManagerEmail = () => {
        if (staffData) {
            return staffData.email || '';
        }
        return property.property_manager_email || '';
    };

    // Get manager photo
    const getManagerPhoto = () => {
        if (staffData?.photo_url) {
            return getFullPhotoUrl(staffData.photo_url);
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900">Share Property</h3>
                            <button
                                onClick={closeShareModal}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4">
                            {/* Property Info */}
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                                {property.photo_urls && property.photo_urls.length > 0 && (
                                    <img 
                                        src={`${import.meta.env.VITE_API_URL || ''}${property.photo_urls[0]}`}
                                        alt={property.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 
                                                `https://via.placeholder.com/48/0249a8/ffffff?text=${encodeURIComponent(property.name.charAt(0))}`;
                                        }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-900 truncate">{property.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{property.area}</p>
                                </div>
                            </div>

                            {/* Copy Link */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                                    <input
                                        type="text"
                                        readOnly
                                        value={shareUrl}
                                        className="flex-1 bg-transparent text-xs text-slate-600 outline-none truncate"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0249a8] hover:bg-[#023a88] text-white rounded-md text-xs font-medium transition-all hover:scale-105 flex-shrink-0"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-3.5 w-3.5" />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Social Share Buttons */}
                            <div className="grid grid-cols-3 gap-2.5">
                                <button
                                    onClick={() => handleSocialShare('whatsapp')}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 transition-all hover:scale-105 group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                        <BsWhatsapp className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-700">WhatsApp</span>
                                </button>

                                <button
                                    onClick={() => handleSocialShare('facebook')}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all hover:scale-105 group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                        <FaFacebookF className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-700">Facebook</span>
                                </button>

                                <button
                                    onClick={() => handleSocialShare('twitter')}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 border border-sky-200 transition-all hover:scale-105 group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                        <FaTwitter className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-700">Twitter</span>
                                </button>

                                <button
                                    onClick={() => handleSocialShare('linkedin')}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-300 transition-all hover:scale-105 group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-700 to-cyan-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                        <FaLinkedinIn className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-700">LinkedIn</span>
                                </button>

                                <button
                                    onClick={() => handleSocialShare('telegram')}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 border border-cyan-200 transition-all hover:scale-105 group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                        <FaTelegramPlane className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-700">Telegram</span>
                                </button>

                                <button
                                    onClick={() => handleSocialShare('email')}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-200 transition-all hover:scale-105 group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-600 to-gray-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                        <MdEmail className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-700">Email</span>
                                </button>
                            </div>

                            {showCopyMessage && (
                                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-xs text-green-700 font-medium flex items-center gap-1.5">
                                        <Check className="w-4 h-4 text-green-600" />
                                        Link copied to clipboard!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Header */}
            <div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors group"
                        >
                            <div className="bg-slate-100 group-hover:bg-blue-50 rounded-full p-2 transition-colors">
                                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            </div>
                            <span className="font-semibold hidden sm:inline">Back to Properties</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className="bg-white hover:bg-red-50 rounded-full p-2.5 shadow-md transition-all hover:scale-110"
                            >
                                <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                            </button>
                            <button
                                onClick={handleShareClick}
                                className="bg-white hover:bg-blue-50 rounded-full p-2.5 shadow-md transition-all hover:scale-110"
                            >
                                <Share2 className="h-5 w-5 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">    
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-200 to-slate-300">
                                {property.photo_urls && property.photo_urls.length > 0 ? (
                                    <>
                                        <img
                                            src={currentPhotoUrl}
                                            alt={`${property.name} - Image ${currentImageIndex + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    `https://via.placeholder.com/1200x675/f1f5f9/475569?text=${encodeURIComponent(property.name)}`;
                                            }}
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                                        {/* Image Navigation */}
                                        {property.photo_urls.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={prevImage}
                                                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2
                                                               bg-white/90 hover:bg-white text-slate-800
                                                               p-1.5 md:p-3 rounded-full shadow-lg transition-all"
                                                >
                                                    <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={nextImage}
                                                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2
                                                               bg-white/90 hover:bg-white text-slate-800
                                                               p-1.5 md:p-3 rounded-full shadow-lg transition-all"
                                                >
                                                    <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
                                                </button>

                                                <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2
                                                                flex gap-1.5 md:gap-2
                                                                bg-black/30 backdrop-blur-sm
                                                                rounded-full px-2 md:px-4 py-1 md:py-2">
                                                    {property.photo_urls.map((_, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setCurrentImageIndex(idx)}
                                                            className={`rounded-full transition-all
                                                                ${idx === currentImageIndex
                                                                    ? 'w-5 md:w-8 h-1.5 md:h-2 bg-white'
                                                                    : 'w-1.5 md:w-2 h-1.5 md:h-2 bg-white/50'}
                                                            `}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                        <Building2 className="h-16 md:h-24 w-16 md:w-24 text-slate-400 mb-2 md:mb-4" />
                                        <p className="text-xs md:text-base text-slate-500 font-medium">
                                            No images available
                                        </p>
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-2 md:top-4 right-2 md:right-4">
                                    <span
                                        className={`px-2 md:px-4 py-1 md:py-2
                                                    rounded-full text-[10px] md:text-sm
                                                    font-bold shadow-lg backdrop-blur-sm
                                                    ${property.is_active
                                            ? 'bg-emerald-500/90 text-white'
                                            : 'bg-slate-500/90 text-white'}`}
                                    >
                                        {property.is_active ? '● Active' : '● Inactive'}
                                    </span>
                                </div>

                                {/* Image Counter */}
                                {property.photo_urls && property.photo_urls.length > 0 && (
                                    <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4
                                                  bg-black/40 backdrop-blur-sm text-white
                                                  px-2 md:px-3 py-1
                                                  rounded-full text-[10px] md:text-sm font-medium">
                                        {currentImageIndex + 1} / {property.photo_urls.length}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Property Info Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-blue-100 rounded-xl p-2">
                                            <Building2 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{property.name}</h1>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">{property.area}, {property.city_id || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {property.tags && property.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {property.tags.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-[10px] font-semibold border border-blue-200">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {property.description && (
                                <div className="mb-4 pb-4 border-b border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-800 mb-2">About This Property</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{property.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center hover:scale-105 transition-transform">
                                    <DoorOpen className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-slate-900">{property.total_rooms || 0}</p>
                                    <p className="text-[10px] text-slate-600 font-medium">Rooms</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center hover:scale-105 transition-transform">
                                    <Bed className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-slate-900">{property.total_beds || 0}</p>
                                    <p className="text-[10px] text-slate-600 font-medium">Total Beds</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-3 text-center hover:scale-105 transition-transform">
                                    <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-slate-900">{availableBeds}</p>
                                    <p className="text-[10px] text-slate-600 font-medium">Available</p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-3 text-center hover:scale-105 transition-transform">
                                    <User className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-slate-900">{occupiedBeds}</p>
                                    <p className="text-[10px] text-slate-600 font-medium">Occupied</p>
                                </div>
                            </div>

                            <div className="mb-4 bg-slate-50 rounded-xl p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        <span className="text-xs font-bold text-slate-800">Occupancy</span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600">{occupancyPercentage.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 h-full rounded-full transition-all duration-700"
                                        style={{ width: `${occupancyPercentage}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                                    <span>{occupiedBeds} Occupied</span>
                                    <span>{availableBeds} Available</span>
                                </div>
                            </div>

                            {property.amenities && property.amenities.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
                                        <Star className="h-4 w-4 text-amber-500" />
                                        Amenities
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {property.amenities.slice(0, 4).map((amenity, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-2 hover:shadow-sm transition-all"
                                            >
                                                <div className="text-blue-600 flex-shrink-0">
                                                    {getAmenityIcon(amenity)}
                                                </div>
                                                <span className="text-[11px] font-medium text-slate-700 truncate">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {property.amenities.length > 4 && (
                                        <p className="text-[10px] text-slate-500 mt-2">+{property.amenities.length - 4} more amenities</p>
                                    )}
                                </div>
                            )}

                            {/* Terms & Conditions Section */}
{hasTerms && (
    <div className="mt-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 border-b pb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Terms & Conditions
        </h3>

        {/* Terms & Conditions with Headers - This now includes Custom Term */}
        {termsConditions.map((section, idx) => (
            <div 
                key={idx} 
                className={`rounded-xl p-4 border-l-4 ${getTermHeaderColor(section.header)}`}
            >
                <h4 className="font-bold text-sm mb-3 flex items-center gap-1.5">
                    {getTermHeaderIcon(section.header)}
                    {section.header}
                </h4>
                <div className="space-y-2">
                    {section.content.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-2 text-xs text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        ))}

        {/* Property Rules */}
        {propertyRules.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h4 className="font-bold text-sm text-amber-800 mb-3 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    Property Rules
                </h4>
                <div className="space-y-2">
                    {propertyRules.map((rule, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                            <span>{rule}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Additional Terms */}
        {additionalTerms.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-bold text-sm text-purple-800 mb-3 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    Additional Terms
                </h4>
                <div className="space-y-2">
                    {additionalTerms.map((term, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                            <span>{term}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
)}
                        </div>
                    </div>

                    {/* Right Sidebar - Rest remains the same */}
                    <div className="space-y-4">
                        {/* Pricing Card */}
                        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl shadow-xl p-5 text-white">
                            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                                <IndianRupee className="h-5 w-5" />
                                Pricing Details
                            </h3>

                            <div className="space-y-3 mb-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                                    <p className="text-blue-100 text-[10px] mb-1 font-medium">Starting Price</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <IndianRupee className="h-5 w-5" />
                                        <span className="text-2xl font-bold">{property.starting_price.toLocaleString()}</span>
                                        <span className="text-blue-100 text-sm">/month</span>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                                    <p className="text-blue-100 text-[10px] mb-1 font-medium">Security Deposit</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <Shield className="h-4 w-4" />
                                        <span className="text-xl font-bold">₹{property.security_deposit.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleCallClick}
                                className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 text-sm"
                            >
                                <Phone className="h-4 w-4" />
                                Call Now
                            </button>
                        </div>

                        {/* Address Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                Full Address
                            </h3>
                            <p className="text-xs text-slate-700 leading-relaxed">{property.address || 'No address provided.'}</p>
                        </div>

                        {/* Services Card */}
                        {property.services && property.services.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-4">
                                <h3 className="font-bold text-sm text-slate-900 mb-3">Services</h3>
                                <div className="space-y-1.5">
                                    {property.services.map((service, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                            <span>{service}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Manager Card with Salutation */}
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <h3 className="font-bold text-sm text-slate-900 mb-3">Property Manager</h3>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative">
                                    {getManagerPhoto() ? (
                                        <img
                                            src={getManagerPhoto()!}
                                            alt={getManagerDisplayName()}
                                            className="w-16 h-16 rounded-xl object-cover ring-2 ring-blue-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getManagerDisplayName())}&background=0249a8&color=fff&size=64`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ring-2 ring-blue-200">
                                            <span className="text-2xl font-bold text-blue-600">
                                                {getManagerDisplayName().charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    {loadingStaff && (
                                        <div className="absolute -top-1 -right-1">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-slate-900">{getManagerDisplayName()}</p>
                                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                                        <Shield className="h-3 w-3 text-green-600" />
                                        {getManagerRole() || 'Manager'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                {property.property_manager_phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl p-2">
                                            <Phone className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-medium">Phone</p>
                                            <a
                                                href={`tel:${property.property_manager_phone}`}
                                                className="font-bold text-xs text-blue-600 hover:text-blue-700"
                                            >
                                                {property.property_manager_phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {getManagerEmail() && (
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-blue-100 to-cyan-200 rounded-xl p-2">
                                            <Mail className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-medium">Email</p>
                                            <a
                                                href={`mailto:${getManagerEmail()}`}
                                                className="font-bold text-xs text-blue-600 hover:text-blue-700 truncate block max-w-[180px]"
                                            >
                                                {getManagerEmail()}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {property.property_manager_phone && (
                                <button 
                                    onClick={handleCallClick}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm"
                                >
                                    <Phone className="h-4 w-4" />
                                    Call Manager
                                </button>
                            )}
                        </div>

                        {/* Lock-in & Notice Period Card */}
                        {(property.lockin_period_months && property.lockin_period_months > 0) || 
                         (property.notice_period_days && property.notice_period_days > 0) ? (
                            <div className="bg-white rounded-2xl shadow-lg p-4">
                                <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-slate-600" />
                                    Stay Terms
                                </h3>
                                
                                {property.lockin_period_months && property.lockin_period_months > 0 && (
                                    <div className="mb-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                                        <p className="text-[10px] text-slate-500 font-medium mb-1">Lock-in Period</p>
                                        <p className="font-semibold text-xs text-slate-900">
                                            {property.lockin_period_months} months
                                            {property.lockin_penalty_amount && property.lockin_penalty_amount > 0 && (
                                                <span className="text-amber-600 ml-1">
                                                    (Penalty: ₹{property.lockin_penalty_amount} {property.lockin_penalty_type})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}
                                
                                {property.notice_period_days && property.notice_period_days > 0 && (
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-medium mb-1">Notice Period</p>
                                        <p className="font-semibold text-xs text-slate-900">
                                            {property.notice_period_days} days
                                            {property.notice_penalty_amount && property.notice_penalty_amount > 0 && (
                                                <span className="text-amber-600 ml-1">
                                                    (Penalty: ₹{property.notice_penalty_amount} {property.notice_penalty_type})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* Timeline Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-slate-600" />
                                Timeline
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-2 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="bg-blue-100 rounded-lg p-1.5 mt-0.5">
                                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-medium mb-0.5">Created</p>
                                        <p className="font-semibold text-xs text-slate-900">
                                            {property.created_at ? new Date(property.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {property.updated_at && (
                                    <div className="flex items-start gap-2">
                                        <div className="bg-green-100 rounded-lg p-1.5 mt-0.5">
                                            <Calendar className="h-3.5 w-3.5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-medium mb-0.5">Last Updated</p>
                                            <p className="font-semibold text-xs text-slate-900">
                                                {new Date(property.updated_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsClient;