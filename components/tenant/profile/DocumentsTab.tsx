import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, FileText, MapPin, Shield, 
  Download, Eye, Upload 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile, AdditionalDocument } from '@/lib/tenantDetailsApi';

interface DocumentsTabProps {
  profile: TenantProfile;
  onDocumentClick: (docData: any) => void;
  getDocumentUrl: (url: string) => string;
}

export default function DocumentsTab({ profile, onDocumentClick, getDocumentUrl }: DocumentsTabProps) {
  const handleViewDocument = (url: string, title: string, filename: string) => {
    const fullUrl = getDocumentUrl(url);
    const extension = filename.split('.').pop()?.toLowerCase();
    const isPDF = extension === 'pdf';
    
    onDocumentClick({
      open: true,
      url: fullUrl,
      title: title,
      type: isPDF ? 'pdf' : 'image',
      downloadName: filename
    });
  };

  const handleDownloadDocument = (url: string, filename: string) => {
    const fullUrl = getDocumentUrl(url);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.photo_url ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage 
                    src={getDocumentUrl(profile.photo_url)} 
                    alt={profile.full_name} 
                  />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name
                      ? profile.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDocument(
                      profile.photo_url, 
                      "Profile Photo", 
                      `profile-photo-${profile.full_name}.${profile.photo_url.split('.').pop()}`
                    )}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Full Size
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadDocument(
                      profile.photo_url,
                      `profile-photo-${profile.full_name}.${profile.photo_url.split('.').pop()}`
                    )}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Profile picture</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No profile photo uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ID Proof */}
      <Card>
        <CardHeader>
          <CardTitle>ID Proof Document</CardTitle>
          <CardDescription>Government issued identification</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.id_proof_url ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleViewDocument(
                    profile.id_proof_url,
                    "ID Proof Document",
                    `id-proof-${profile.full_name}.${profile.id_proof_url.split('.').pop()}`
                  )}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View ID Proof
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadDocument(
                    profile.id_proof_url,
                    `id-proof-${profile.full_name}.${profile.id_proof_url.split('.').pop()}`
                  )}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900">ID Proof Details</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Document: {profile.id_proof_url.split('/').pop()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-900">ID Proof Required</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please upload a government issued ID proof (Aadhar, PAN, Driving License, etc.)
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Proof */}
      <Card>
        <CardHeader>
          <CardTitle>Address Proof Document</CardTitle>
          <CardDescription>Document verifying your address</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.address_proof_url ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleViewDocument(
                    profile.address_proof_url,
                    "Address Proof Document",
                    `address-proof-${profile.full_name}.${profile.address_proof_url.split('.').pop()}`
                  )}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Address Proof
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadDocument(
                    profile.address_proof_url,
                    `address-proof-${profile.full_name}.${profile.address_proof_url.split('.').pop()}`
                  )}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Address Proof Details</p>
                    <p className="text-sm text-green-700 mt-1">
                      Document: {profile.address_proof_url.split('/').pop()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-900">Address Proof Required</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please upload a document that verifies your current address (Utility bill, Rental agreement, etc.)
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Documents</CardTitle>
          <CardDescription>Other supporting documents</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.additional_documents && profile.additional_documents.length > 0 ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.additional_documents.map((doc, index) => {
                  const filename = doc.filename || `Document ${index + 1}`;
                  
                  return (
                    <Card key={index} className="border">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium truncate">{filename}</span>
                          </div>
                          {doc.document_type && (
                            <Badge variant="outline" className="text-xs">
                              {doc.document_type}
                            </Badge>
                          )}
                          {doc.uploaded_at && (
                            <p className="text-xs text-gray-500">
                              Uploaded: {format(parseISO(doc.uploaded_at), "dd MMM yyyy")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(doc.url, filename, filename)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc.url, filename)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <p className="text-sm text-gray-500">
                Total {profile.additional_documents.length} additional document(s)
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No additional documents uploaded</p>
              <p className="text-sm text-gray-600 mb-4">
                You haven't uploaded any additional documents yet.
              </p>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Additional Documents
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}