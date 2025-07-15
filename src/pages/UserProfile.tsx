import { useState, useEffect } from "react";
import { ArrowLeft, Save, User, Award, Mail, MapPin, Calendar, Edit3, Camera, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const MEDICAL_SPECIALTIES = [
  "Internal Medicine",
  "Cardiology",
  "Neurology",
  "Emergency Medicine",
  "Pediatrics",
  "Surgery",
  "Psychiatry",
  "Radiology",
  "Pathology",
  "Anesthesiology",
  "Dermatology",
  "Orthopedics",
  "Oncology",
  "Gastroenterology",
  "Pulmonology",
  "Endocrinology",
  "Nephrology",
  "Rheumatology",
  "Infectious Disease",
  "Family Medicine",
  "Obstetrics & Gynecology",
  "Ophthalmology",
  "Otolaryngology",
  "Urology",
  "Medical Student",
  "Nursing",
  "Pharmacy",
  "Physical Therapy",
  "Other"
];

const DEGREE_TYPES = [
  "MD", "DO", "MBBS", "PhD", "PharmD", "RN", "BSN", "MSN", "DNP", 
  "PA", "NP", "DPT", "OTD", "MS", "BS", "Other"
];

interface UserProfileProps {
  onBack: () => void;
}

export const UserProfile = ({ onBack }: UserProfileProps) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    degree: "",
    specialty: "",
    institution: "",
    location: "",
    bio: "",
    yearsOfExperience: "",
    licenseNumber: "",
    isVerified: false,
    showEmail: false,
    showLocation: true,
    allowMessages: true,
    profileImage: ""
  });

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        degree: user.degree || "",
        specialty: user.specialty || "",
        institution: user.institution || "",
        location: user.location || "",
        bio: user.bio || "",
        yearsOfExperience: user.yearsOfExperience || "",
        licenseNumber: user.licenseNumber || "",
        isVerified: user.isVerified || false,
        showEmail: user.showEmail || false,
        showLocation: user.showLocation !== undefined ? user.showLocation : true,
        allowMessages: user.allowMessages !== undefined ? user.allowMessages : true,
        profileImage: user.profileImage || ""
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUserData = {
        ...user,
        ...profileData,
        displayName: `${profileData.firstName} ${profileData.lastName}`.trim(),
        credentials: `${profileData.degree}${profileData.specialty ? `, ${profileData.specialty}` : ''}`
      };

      console.log('UserProfile - Saving user data:', updatedUserData);

      // Update user context
      if (updateUser) {
        await updateUser(updatedUserData);
      }
      
      setIsEditing(false);
      toast({
        title: "Profile Updated!",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getDisplayName = () => {
    const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
    return fullName || "User";
  };

  const getCredentials = () => {
    const parts = [];
    if (profileData.degree) parts.push(profileData.degree);
    if (profileData.specialty) parts.push(profileData.specialty);
    return parts.join(", ") || "Medical Professional";
  };

  const getInitials = () => {
    const firstName = profileData.firstName || "U";
    const lastName = profileData.lastName || "U";
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {profileData.profileImage ? (
                    <AvatarImage src={profileData.profileImage} alt={getDisplayName()} />
                  ) : (
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    title="Change profile picture"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{getDisplayName()}</h1>
                  {profileData.isVerified && (
                    <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-3">{getCredentials()}</p>
                {profileData.institution && (
                  <p className="text-gray-600 mb-2">{profileData.institution}</p>
                )}
                {profileData.location && profileData.showLocation && (
                  <div className="flex items-center gap-1 text-gray-500 mb-3">
                    <MapPin className="h-4 w-4" />
                    {profileData.location}
                  </div>
                )}
                {profileData.bio && (
                  <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell others about your medical background, interests, and expertise..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Degree/Certification *
                    </label>
                    <Select value={profileData.degree} onValueChange={(value) => handleInputChange("degree", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your degree" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEGREE_TYPES.map(degree => (
                          <SelectItem key={degree} value={degree}>
                            {degree}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialty/Field *
                    </label>
                    <Select value={profileData.specialty} onValueChange={(value) => handleInputChange("specialty", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDICAL_SPECIALTIES.map(specialty => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution/Hospital
                  </label>
                  <Input
                    value={profileData.institution}
                    onChange={(e) => handleInputChange("institution", e.target.value)}
                    placeholder="Your hospital, clinic, or medical school"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <Input
                      value={profileData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="City, State/Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <Input
                      type="number"
                      value={profileData.yearsOfExperience}
                      onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                      placeholder="0"
                      min="0"
                      max="50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showEmail"
                    checked={profileData.showEmail}
                    onCheckedChange={(checked) => handleInputChange("showEmail", checked)}
                  />
                  <label htmlFor="showEmail" className="text-sm font-medium">
                    Show email address on public profile
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showLocation"
                    checked={profileData.showLocation}
                    onCheckedChange={(checked) => handleInputChange("showLocation", checked)}
                  />
                  <label htmlFor="showLocation" className="text-sm font-medium">
                    Show location on public profile
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowMessages"
                    checked={profileData.allowMessages}
                    onCheckedChange={(checked) => handleInputChange("allowMessages", checked)}
                  />
                  <label htmlFor="allowMessages" className="text-sm font-medium">
                    Allow other users to send me messages
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Degree</h4>
                    <p className="text-gray-600">{profileData.degree || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Specialty</h4>
                    <p className="text-gray-600">{profileData.specialty || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Institution</h4>
                    <p className="text-gray-600">{profileData.institution || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Experience</h4>
                    <p className="text-gray-600">
                      {profileData.yearsOfExperience ? `${profileData.yearsOfExperience} years` : "Not specified"}
                    </p>
                  </div>
                </div>
                
                {profileData.showEmail && profileData.email && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">{profileData.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
