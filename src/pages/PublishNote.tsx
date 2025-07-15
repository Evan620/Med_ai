import { useState } from "react";
import { ArrowLeft, Save, Eye, Upload, Tag, AlertCircle, CheckCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { globalNotesService, type GlobalNote } from "@/services/globalNotesService";
import { getUserDisplayName, getUserCredentials } from "@/utils/userUtils";

const CATEGORIES = [
  "Cardiology",
  "Neurology", 
  "Pharmacology",
  "Emergency Medicine",
  "Pediatrics",
  "Internal Medicine",
  "Surgery",
  "Psychiatry",
  "Radiology",
  "Pathology",
  "Anatomy",
  "Physiology"
];

const DIFFICULTY_LEVELS = [
  { value: "Beginner", description: "Medical students, basic concepts" },
  { value: "Intermediate", description: "Residents, clinical applications" },
  { value: "Advanced", description: "Specialists, complex topics" }
];

interface PublishNoteProps {
  onBack: () => void;
  noteData?: {
    title: string;
    content: string;
  };
  onNotePublished?: (publishedNote: any) => void;
}

export const PublishNote = ({ onBack, noteData, onNotePublished }: PublishNoteProps) => {
  const { user } = useAuth();
  // Estimate read time function
  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  // Generate automatic excerpt from content
  const generateExcerpt = (content: string) => {
    if (!content) return "";

    // Remove HTML tags and markdown formatting
    const cleanContent = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[#*_`~\[\]()]/g, '') // Remove markdown symbols
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    // Take first 150 characters and end at word boundary
    if (cleanContent.length <= 150) return cleanContent;

    const truncated = cleanContent.substring(0, 150);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 100 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  const [formData, setFormData] = useState({
    title: noteData?.title || "",
    excerpt: noteData?.content ? generateExcerpt(noteData.content) : "",
    content: noteData?.content || "",
    category: "",
    tags: [] as string[],
    difficulty: "",
    estimatedReadTime: noteData?.content ? estimateReadTime(noteData.content) : 5,
    allowComments: true,
    makePublic: true,
    agreeToTerms: false
  });
  const [currentTag, setCurrentTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleContentChange = (content: string) => {
    handleInputChange("content", content);
    handleInputChange("estimatedReadTime", estimateReadTime(content));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.title.trim()) errors.push("Title is required");
    if (!formData.excerpt.trim()) errors.push("Excerpt is required");
    if (!formData.content.trim()) errors.push("Content is required");
    if (!formData.category) errors.push("Category is required");
    if (!formData.difficulty) errors.push("Difficulty level is required");
    if (formData.tags.length === 0) errors.push("At least one tag is required");
    if (!formData.agreeToTerms) errors.push("You must agree to the terms and conditions");
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Get user display name and credentials from profile
    const getUserDisplayName = () => {
      // Priority: displayName > firstName + lastName > firstName > fallback
      if (user?.displayName) return user.displayName;
      if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
      if (user?.firstName) return user.firstName;
      return "Anonymous User";
    };

    const getUserCredentials = () => {
      // Priority: saved credentials > degree + specialty > individual fields > fallback
      if (user?.credentials) return user.credentials;

      const parts = [];
      if (user?.degree) parts.push(user.degree);
      if (user?.specialty) parts.push(user.specialty);
      if (user?.specialization) parts.push(user.specialization); // fallback to old field

      if (parts.length > 0) return parts.join(", ");

      // Fallback based on role
      if (user?.role === 'student') return "Medical Student";
      if (user?.role === 'resident') return "Medical Resident";
      if (user?.role === 'practitioner') return "Medical Practitioner";
      if (user?.role === 'educator') return "Medical Educator";

      return "Medical Professional";
    };

    const getUserAvatar = () => {
      // Return profile image or generate initials-based avatar
      if (user?.profileImage) return user.profileImage;
      return undefined; // Will use initials in Avatar component
    };

    // Create the published note object with complete user profile data
    const noteToPublish = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      category: formData.category,
      tags: formData.tags,
      difficulty: formData.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      featured: false,
      author: {
        id: user?.id || 'anonymous',
        name: getUserDisplayName(),
        avatar: getUserAvatar(),
        credentials: getUserCredentials(),
        verified: user?.isVerified || false,
        institution: user?.institution,
        location: user?.showLocation ? user?.location : undefined,
        bio: user?.bio,
        yearsOfExperience: user?.yearsOfExperience
      },
      publishedBy: user?.id || 'anonymous',
      sourceType: noteData ? 'notepad' : 'direct' as const
    };

    // Simulate API call
    setTimeout(() => {
      try {
        // Publish to global Knowledge Bank
        const publishedNote = globalNotesService.publishNote(noteToPublish);

        console.log('Note published to global Knowledge Bank:', publishedNote);

        // Call the callback to notify parent component
        if (onNotePublished) {
          onNotePublished(publishedNote);
        }

        setIsSubmitting(false);

        toast({
          title: "Note Published Successfully!",
          description: `"${formData.title}" is now available in the Medicine Knowledge Bank for all users to discover. Published as ${getUserDisplayName()} (${getUserCredentials()}).`,
        });

        // Don't call onBack() here since onNotePublished will handle navigation
      } catch (error) {
        console.error('Error publishing note:', error);
        setIsSubmitting(false);

        toast({
          title: "Publishing Failed",
          description: "There was an error publishing your note. Please try again.",
          variant: "destructive"
        });
      }
    }, 2000);
  };

  const renderPreview = () => {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">{formData.category}</Badge>
            <Badge className={
              formData.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
              formData.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {formData.difficulty}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{formData.excerpt}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {formData.tags.map(tag => (
              <Badge key={tag} variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="prose prose-lg max-w-none">
          {formData.content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) {
              return <h1 key={index} className="text-2xl font-bold mt-8 mb-4">{line.substring(2)}</h1>;
            } else if (line.startsWith('## ')) {
              return <h2 key={index} className="text-xl font-semibold mt-6 mb-3">{line.substring(3)}</h2>;
            } else if (line.startsWith('### ')) {
              return <h3 key={index} className="text-lg font-medium mt-4 mb-2">{line.substring(4)}</h3>;
            } else if (line.startsWith('- ')) {
              return <li key={index} className="ml-4">{line.substring(2)}</li>;
            } else if (line.match(/^\d+\. /)) {
              return <li key={index} className="ml-4">{line.substring(line.indexOf(' ') + 1)}</li>;
            } else if (line.trim() === '') {
              return <br key={index} />;
            } else {
              return <p key={index} className="mb-3 leading-relaxed">{line}</p>;
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Knowledge Bank
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {isPreview ? "Edit" : "Preview"}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Publish Note
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPreview ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {renderPreview()}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Publish Your Note</h1>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Share your medical knowledge with the community. Help other healthcare professionals and students learn from your expertise.
              </p>
              {noteData && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
                  <p className="text-sm text-blue-800 mb-2">
                    📝 Publishing note from your notepad: <strong>"{noteData.title}"</strong>
                  </p>
                  <div className="text-xs text-blue-600 bg-blue-25 p-2 rounded border">
                    <p className="font-medium mb-1">Author information from your profile:</p>
                    <p>• Name: {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || "Not set"}</p>
                    <p>• Credentials: {user?.degree || user?.credentials || "Not set"}</p>
                    {user?.institution && <p>• Institution: {user.institution}</p>}
                    {user?.isVerified && <p>• ✓ Verified professional</p>}
                    <p className="mt-1 text-blue-500">
                      <button
                        onClick={() => window.alert("Edit your profile to update this information")}
                        className="underline hover:no-underline"
                      >
                        Edit profile to update this information
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    placeholder="Enter a clear, descriptive title for your note"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt *
                  </label>
                  <Textarea
                    placeholder="Write a brief summary that will appear in search results (2-3 sentences)"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.excerpt.length}/300 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level *
                    </label>
                    <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <div className="font-medium">{level.value}</div>
                              <div className="text-sm text-gray-500">{level.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags * (Max 10)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add a tag and press Enter"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addTag} disabled={formData.tags.length >= 10}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note Content * (Supports Markdown)
                  </label>
                  <Textarea
                    placeholder="Write your note content here. You can use Markdown formatting:&#10;# Heading 1&#10;## Heading 2&#10;- Bullet point&#10;**Bold text**&#10;*Italic text*"
                    value={formData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    rows={20}
                    className="w-full font-mono"
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>Estimated read time: {formData.estimatedReadTime} minutes</span>
                    <span>{formData.content.length} characters</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowComments"
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => handleInputChange("allowComments", checked)}
                  />
                  <label htmlFor="allowComments" className="text-sm font-medium">
                    Allow comments and discussions
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="makePublic"
                    checked={formData.makePublic}
                    onCheckedChange={(checked) => handleInputChange("makePublic", checked)}
                  />
                  <label htmlFor="makePublic" className="text-sm font-medium">
                    Make this note publicly visible
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                  />
                  <label htmlFor="agreeToTerms" className="text-sm font-medium">
                    I agree to the terms and conditions and confirm that this content is original or properly attributed *
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Publishing Guidelines:</strong> Ensure your content is accurate, well-researched, and follows medical ethics. 
                Include proper citations for any referenced material. Content will be reviewed before publication.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};
