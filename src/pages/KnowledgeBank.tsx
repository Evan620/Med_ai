import { useState, useEffect } from "react";
import { Search, Filter, Heart, Eye, BookOpen, User, Calendar, Tag, TrendingUp, Star, Share2, Bookmark, Clock, Award, Users, MessageCircle, MapPin, ChevronRight } from "lucide-react";
import { globalNotesService, type GlobalNote } from "@/services/globalNotesService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface PublishedNote {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    name: string;
    avatar?: string;
    credentials: string;
    verified: boolean;
    institution?: string;
    location?: string;
    bio?: string;
    yearsOfExperience?: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  views: number;
  likes: number;
  bookmarks: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readTime: number;
  featured: boolean;
}

const SAMPLE_NOTES: PublishedNote[] = [
  {
    id: "1",
    title: "Understanding Cardiovascular Physiology: A Comprehensive Guide",
    content: "Detailed explanation of heart anatomy and function...",
    excerpt: "Learn the fundamentals of cardiovascular system including heart chambers, blood circulation, and cardiac cycle with detailed diagrams and clinical correlations.",
    author: {
      name: "Dr. Sarah Johnson",
      credentials: "MD, Cardiologist",
      verified: true,
      institution: "Johns Hopkins Hospital",
      location: "Baltimore, MD"
    },
    category: "Cardiology",
    tags: ["Heart", "Physiology", "Anatomy", "Clinical"],
    publishedAt: "2024-01-15",
    views: 2847,
    likes: 156,
    bookmarks: 89,
    difficulty: "Intermediate",
    readTime: 12,
    featured: true
  },
  {
    id: "2",
    title: "Neurological Examination Techniques for Medical Students",
    content: "Step-by-step guide to neurological examination...",
    excerpt: "Master the essential neurological examination techniques with practical tips, common findings, and clinical significance for medical students and residents.",
    author: {
      name: "Prof. Michael Chen",
      credentials: "MD, PhD, Neurologist",
      verified: true,
      institution: "Stanford Medical Center",
      location: "Stanford, CA"
    },
    category: "Neurology",
    tags: ["Examination", "Neurology", "Clinical Skills", "Students"],
    publishedAt: "2024-01-12",
    views: 1923,
    likes: 134,
    bookmarks: 67,
    difficulty: "Beginner",
    readTime: 8,
    featured: false
  },
  {
    id: "3",
    title: "Advanced Pharmacokinetics: Drug Metabolism Pathways",
    content: "In-depth analysis of drug metabolism...",
    excerpt: "Explore complex drug metabolism pathways, enzyme kinetics, and clinical implications for personalized medicine and drug interactions.",
    author: {
      name: "Dr. Emily Rodriguez",
      credentials: "PharmD, PhD",
      verified: true,
      institution: "Mayo Clinic",
      location: "Rochester, MN"
    },
    category: "Pharmacology",
    tags: ["Pharmacokinetics", "Metabolism", "Drug Interactions", "Advanced"],
    publishedAt: "2024-01-10",
    views: 1456,
    likes: 98,
    bookmarks: 45,
    difficulty: "Advanced",
    readTime: 15,
    featured: false
  },
  {
    id: "4",
    title: "Emergency Medicine: Trauma Assessment and Management",
    content: "Critical trauma assessment protocols...",
    excerpt: "Essential trauma assessment and management protocols for emergency medicine, including ATLS principles and life-saving interventions.",
    author: {
      name: "Dr. James Wilson",
      credentials: "MD, Emergency Medicine",
      verified: true,
      institution: "Massachusetts General Hospital",
      location: "Boston, MA"
    },
    category: "Emergency Medicine",
    tags: ["Trauma", "Emergency", "ATLS", "Critical Care"],
    publishedAt: "2024-01-08",
    views: 3241,
    likes: 201,
    bookmarks: 123,
    difficulty: "Intermediate",
    readTime: 10,
    featured: true
  },
  {
    id: "5",
    title: "Pediatric Growth and Development Milestones",
    content: "Comprehensive guide to pediatric milestones...",
    excerpt: "Track normal pediatric growth and development milestones from birth to adolescence with red flags and clinical assessment tools.",
    author: {
      name: "Dr. Lisa Thompson",
      credentials: "MD, Pediatrician",
      verified: true,
      institution: "Children's Hospital of Philadelphia",
      location: "Philadelphia, PA"
    },
    category: "Pediatrics",
    tags: ["Growth", "Development", "Milestones", "Children"],
    publishedAt: "2024-01-05",
    views: 2156,
    likes: 167,
    bookmarks: 78,
    difficulty: "Beginner",
    readTime: 7,
    featured: false
  }
];

const CATEGORIES = [
  "All Categories",
  "Cardiology",
  "Neurology", 
  "Pharmacology",
  "Emergency Medicine",
  "Pediatrics",
  "Internal Medicine",
  "Surgery",
  "Psychiatry",
  "Radiology"
];

interface KnowledgeBankProps {
  onViewNote?: (noteId: string, noteData?: GlobalNote) => void;
  onPublishNote?: () => void;
  publishedNotes?: any[]; // Legacy prop, now ignored
}

export const KnowledgeBank = ({ onViewNote, onPublishNote }: KnowledgeBankProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("trending");
  const [notes, setNotes] = useState<GlobalNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<GlobalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load all notes from global service
  useEffect(() => {
    const loadNotes = () => {
      try {
        const globalNotes = globalNotesService.getAllNotes();
        const stats = globalNotesService.getStats();

        console.log('=== GLOBAL KNOWLEDGE BANK STATUS ===');
        console.log(`📚 Total Notes: ${globalNotes.length}`);
        console.log(`👥 Total Authors: ${stats.totalAuthors}`);
        console.log(`📊 Categories:`, stats.categoryCounts);
        console.log(`🔥 Recent Activity:`, stats.recentActivity);
        console.log('📝 All Notes:', globalNotes.map(n => ({
          id: n.id,
          title: n.title,
          author: n.author.name,
          publishedBy: n.publishedBy
        })));
        console.log('=====================================');

        setNotes(globalNotes);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading global notes:', error);
        setIsLoading(false);
      }
    };

    loadNotes();

    // Refresh notes every 30 seconds to catch new publications
    const interval = setInterval(loadNotes, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter and search functionality using global service
  useEffect(() => {
    let filtered: GlobalNote[] = [];

    // Use global service for search and filtering
    if (searchTerm) {
      filtered = globalNotesService.searchNotes(searchTerm);
      // Apply category filter to search results if needed
      if (selectedCategory !== "All Categories") {
        filtered = filtered.filter(note => note.category === selectedCategory);
      }
    } else {
      filtered = globalNotesService.getNotesByCategory(selectedCategory);
    }

    // Sort results
    switch (sortBy) {
      case "trending":
        filtered.sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case "popular":
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case "bookmarked":
        filtered.sort((a, b) => b.bookmarks - a.bookmarks);
        break;
    }

    setFilteredNotes(filtered);
  }, [searchTerm, selectedCategory, sortBy, notes]);

  const handleLike = (noteId: string) => {
    globalNotesService.updateEngagement(noteId, 'like', 1);
    // Refresh notes to show updated counts
    const updatedNotes = globalNotesService.getAllNotes();
    setNotes(updatedNotes);

    toast({
      title: "Note liked!",
      description: "Thank you for your feedback.",
    });
  };

  const handleBookmark = (noteId: string) => {
    globalNotesService.updateEngagement(noteId, 'bookmark', 1);
    // Refresh notes to show updated counts
    const updatedNotes = globalNotesService.getAllNotes();
    setNotes(updatedNotes);

    toast({
      title: "Note bookmarked!",
      description: "Added to your reading list.",
    });
  };

  const handleViewNote = (noteId: string, noteData: GlobalNote) => {
    // Track view
    globalNotesService.updateEngagement(noteId, 'view', 1);

    // Call parent handler
    if (onViewNote) {
      onViewNote(noteId, noteData);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 animate-fade-in relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Enhanced Header with Glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-white/85 border-b border-gray-200/30 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent leading-tight">
                  Medicine Knowledge Bank
                </h1>
                <p className="text-gray-600 font-medium text-lg">Discover and share medical knowledge with the global community</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100/80 rounded-full px-3 py-1">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{filteredNotes.length} notes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100/80 rounded-full px-3 py-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Growing daily</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Test Multi-User Button (for development) */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    globalNotesService.simulateMultiUserPublishing();
                    // Refresh notes
                    const updatedNotes = globalNotesService.getAllNotes();
                    setNotes(updatedNotes);
                    toast({
                      title: "Test Notes Added",
                      description: "Added sample notes from multiple users for testing.",
                    });
                  }}
                  className="text-xs border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                  🧪 Test Multi-User
                </Button>
              )}

              <Button
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-6 py-3 text-base font-semibold rounded-2xl"
                onClick={onPublishNote}
                title="Publish a new note or from your notepad"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Publish Note
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {/* Enhanced Search and Filters */}
        <div className="mb-12 animate-slide-up">
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>

            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/30">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Enhanced Search Bar */}
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                    <Input
                      placeholder="Search medical notes, authors, specialties, conditions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-14 pr-12 py-4 bg-white/95 border-2 border-gray-200/50 rounded-2xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 shadow-lg text-lg font-medium"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Enhanced Filter Dropdowns */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-56 bg-white/95 border-2 border-gray-200/50 rounded-2xl py-4 px-5 hover:border-blue-300 transition-colors duration-200 shadow-lg">
                      <div className="flex items-center gap-3">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <SelectValue className="font-medium" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-200/50 shadow-2xl bg-white/95 backdrop-blur-xl">
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category} className="rounded-xl py-3 px-4 font-medium hover:bg-blue-50 transition-colors">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48 bg-white/95 border-2 border-gray-200/50 rounded-2xl py-4 px-5 hover:border-blue-300 transition-colors duration-200 shadow-lg">
                      <SelectValue className="font-medium" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-200/50 shadow-2xl bg-white/95 backdrop-blur-xl">
                      <SelectItem value="trending" className="rounded-xl py-3 px-4 hover:bg-orange-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-orange-500" />
                          <span className="font-medium">Trending</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="newest" className="rounded-xl py-3 px-4 hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">Newest</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="popular" className="rounded-xl py-3 px-4 hover:bg-red-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Heart className="h-5 w-5 text-red-500" />
                          <span className="font-medium">Most Liked</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bookmarked" className="rounded-xl py-3 px-4 hover:bg-green-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Bookmark className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Most Saved</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enhanced Search Results Summary */}
              {searchTerm && (
                <div className="mt-6 pt-6 border-t border-gray-200/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Search className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-gray-700 font-medium">
                      Found <span className="font-bold text-blue-600 text-lg">{filteredNotes.length}</span> notes matching
                      <span className="font-semibold text-gray-900"> "{searchTerm}"</span>
                      {selectedCategory !== "All Categories" && (
                        <span> in <span className="font-semibold text-indigo-600">{selectedCategory}</span></span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Featured Notes */}
        {filteredNotes.some(note => note.featured) && (
          <div className="mb-20 animate-slide-up">
            <div className="flex items-center gap-4 mb-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl">
                  <Star className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent">Featured Notes</h2>
                <p className="text-gray-600 text-lg font-medium">Curated medical insights from verified professionals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {filteredNotes.filter(note => note.featured).slice(0, 2).map((note, index) => (
                <Card
                  key={note.id}
                  className="group relative overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 cursor-pointer border-0 shadow-xl hover:scale-[1.03] animate-scale-in rounded-3xl"
                  style={{ animationDelay: `${index * 150}ms` }}
                  onClick={() => handleViewNote(note.id, note)}
                >
                  {/* Enhanced Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Animated Border Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Enhanced Featured Badge */}
                  <div className="absolute top-6 right-6 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white border-0 shadow-xl px-3 py-1.5 rounded-full font-semibold">
                      <Star className="h-4 w-4 mr-1.5" />
                      Featured
                    </Badge>
                  </div>

                  <CardHeader className="pb-6 relative z-10 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-wrap gap-2">
                        {note.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-sm bg-blue-50/80 text-blue-700 hover:bg-blue-100 transition-colors px-3 py-1 rounded-full font-medium">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100/80 rounded-full px-3 py-2">
                        <Eye className="h-4 w-4" />
                        <span className="font-semibold">{note.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl leading-tight text-gray-900 group-hover:text-blue-700 transition-colors duration-300 font-bold mb-3">
                      {note.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0 relative z-10 px-8">
                    <p className="text-gray-600 text-base mb-8 line-clamp-3 leading-relaxed font-medium">{note.excerpt}</p>

                    {/* Enhanced Author Section */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12 ring-3 ring-white shadow-xl">
                            <AvatarFallback className="text-base bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white font-bold">
                              {note.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {note.author.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-1.5 shadow-lg">
                              <Award className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">{note.author.name}</p>
                          <p className="text-sm text-gray-600 font-medium">{note.author.credentials}</p>
                          {note.author.institution && (
                            <p className="text-sm text-gray-500">{note.author.institution}</p>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Engagement Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                          <Heart className="h-5 w-5" />
                          <span className="font-semibold">{note.likes}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors cursor-pointer">
                          <MessageCircle className="h-5 w-5" />
                          <span className="font-semibold">{note.comments || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Read More Indicator */}
                    <div className="mt-6 pt-6 border-t border-gray-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{note.publishedAt}</span>
                      </div>
                      <div className="flex items-center gap-2 text-base text-blue-600 group-hover:text-blue-700 font-semibold">
                        <span>Read full note</span>
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Notes Grid */}
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl shadow-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                  All Notes
                </h2>
                <p className="text-gray-600 text-lg font-medium">
                  {filteredNotes.length} medical notes from the community
                </p>
              </div>
            </div>

            {/* Enhanced View Toggle */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
              <button className="px-4 py-2 rounded-xl bg-white shadow-md text-sm font-semibold text-gray-700 transition-all duration-200 hover:shadow-lg">
                Grid
              </button>
              <button className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-all duration-200">
                List
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNotes.map((note, index) => (
            <Card
              key={note.id}
              className="group relative overflow-hidden bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-lg hover:scale-[1.03] animate-scale-in rounded-2xl"
              style={{ animationDelay: `${index * 75}ms` }}
              onClick={() => handleViewNote(note.id, note)}
            >
              {/* Enhanced Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-indigo-500/5 to-purple-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>

              {/* Subtle Border Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-400"></div>

              <CardHeader className="pb-5 relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-sm bg-gray-100/80 text-gray-700 hover:bg-gray-200 transition-colors px-3 py-1 rounded-full font-medium">
                      {note.category}
                    </Badge>
                    <Badge className={`text-sm px-3 py-1 rounded-full font-medium ${getDifficultyColor(note.difficulty)}`}>
                      {note.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100/80 rounded-full px-3 py-1.5">
                    <Eye className="h-4 w-4" />
                    <span className="font-semibold">{note.views.toLocaleString()}</span>
                  </div>
                </div>
                <CardTitle className="text-xl leading-tight text-gray-900 group-hover:text-blue-700 transition-colors duration-300 line-clamp-2 font-bold mb-3">
                  {note.title}
                </CardTitle>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed font-medium">{note.excerpt}</p>
              </CardHeader>
              <CardContent className="pt-0 px-6">
                <div className="flex flex-wrap gap-2 mb-5">
                  {note.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs px-2 py-1 rounded-full border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-1 rounded-full border-gray-300 text-gray-500">
                      +{note.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 ring-2 ring-gray-200">
                      <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                        {note.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900">{note.author.name}</span>
                        {note.author.verified && <Award className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">{note.author.credentials}</div>
                      {note.author.institution && (
                        <div className="text-xs text-gray-500">{note.author.institution}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1 font-medium">
                    {Math.ceil(note.content.length / 200)} min read
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-5">
                  <span className="flex items-center gap-2 bg-gray-100/80 rounded-full px-3 py-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{formatDate(note.publishedAt)}</span>
                  </span>
                  <span className="flex items-center gap-2 bg-gray-100/80 rounded-full px-3 py-1">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">{note.views.toLocaleString()}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(note.id);
                      }}
                      className="h-9 px-3 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                    >
                      <Heart className="h-4 w-4 mr-1.5" />
                      <span className="font-semibold">{note.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(note.id);
                      }}
                      className="h-9 px-3 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                    >
                      <Bookmark className="h-4 w-4 mr-1.5" />
                      <span className="font-semibold">{note.bookmarks}</span>
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-gray-100 rounded-xl transition-all duration-200">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800 mb-2">
                💡 <strong>Tip:</strong> You can publish notes directly from your notepad!
              </p>
              <p className="text-xs text-blue-600">
                Write a note in your personal notepad, then click the "Publish" button in the toolbar to share it with the community.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
