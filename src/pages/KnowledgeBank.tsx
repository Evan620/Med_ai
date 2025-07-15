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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-fade-in">
      {/* Modern Header with Glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Medicine Knowledge Bank
                </h1>
                <p className="text-gray-600 font-medium">Discover and share medical knowledge with the global community</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>{filteredNotes.length} notes</span>
              </div>

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
                  className="text-xs"
                >
                  🧪 Test Multi-User
                </Button>
              )}

              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={onPublishNote}
                title="Publish a new note or from your notepad"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Publish Note
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Search and Filters */}
        <div className="mb-10 animate-slide-up">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Enhanced Search Bar */}
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                  <Input
                    placeholder="Search medical notes, authors, specialties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white/90 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 shadow-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Modern Filter Dropdowns */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-52 bg-white/90 border-2 border-gray-200 rounded-xl py-3 px-4 hover:border-blue-300 transition-colors duration-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category} className="rounded-lg">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-44 bg-white/90 border-2 border-gray-200 rounded-xl py-3 px-4 hover:border-blue-300 transition-colors duration-200 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                    <SelectItem value="trending" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <span>Trending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="newest" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Newest</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="popular" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>Most Liked</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="bookmarked" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4 text-green-500" />
                        <span>Most Saved</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Results Summary */}
            {searchTerm && (
              <div className="mt-4 pt-4 border-t border-gray-200/50">
                <p className="text-sm text-gray-600">
                  Found <span className="font-semibold text-blue-600">{filteredNotes.length}</span> notes matching
                  <span className="font-medium"> "{searchTerm}"</span>
                  {selectedCategory !== "All Categories" && (
                    <span> in <span className="font-medium">{selectedCategory}</span></span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modern Featured Notes */}
        {filteredNotes.some(note => note.featured) && (
          <div className="mb-16 animate-slide-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Featured Notes</h2>
                <p className="text-gray-600">Curated medical insights from verified professionals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredNotes.filter(note => note.featured).slice(0, 2).map((note, index) => (
                <Card
                  key={note.id}
                  className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-lg hover:scale-[1.02] animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleViewNote(note.id, note)}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Featured Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>

                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap gap-2">
                        {note.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 rounded-full px-2 py-1">
                        <Eye className="h-3 w-3" />
                        <span>{note.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-tight text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                      {note.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0 relative z-10">
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">{note.excerpt}</p>

                    {/* Author Section */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                            <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                              {note.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {note.author.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                              <Award className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{note.author.name}</p>
                          <p className="text-xs text-gray-500">{note.author.credentials}</p>
                          {note.author.institution && (
                            <p className="text-xs text-gray-400">{note.author.institution}</p>
                          )}
                        </div>
                      </div>

                      {/* Engagement Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{note.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>{note.comments || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Read More Indicator */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{note.publishedAt}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                        <span>Read more</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Modern Notes Grid */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                All Notes
              </h2>
              <p className="text-gray-600">
                {filteredNotes.length} medical notes from the community
              </p>
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button className="px-3 py-1 rounded-md bg-white shadow-sm text-sm font-medium text-gray-700">
                Grid
              </button>
              <button className="px-3 py-1 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700">
                List
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNotes.map((note, index) => (
            <Card
              key={note.id}
              className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-md hover:scale-[1.02] animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleViewNote(note.id, note)}
            >
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                      {note.category}
                    </Badge>
                    <Badge className={`text-xs ${getDifficultyColor(note.difficulty)}`}>
                      {note.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 rounded-full px-2 py-1">
                    <Eye className="h-3 w-3" />
                    <span>{note.views.toLocaleString()}</span>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight text-gray-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2">
                  {note.title}
                </CardTitle>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mt-2">{note.excerpt}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1 mb-4">
                  {note.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{note.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {note.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium">{note.author.name}</span>
                        {note.author.verified && <Award className="h-3 w-3 text-blue-500" />}
                      </div>
                      <div className="text-xs text-gray-500">{note.author.credentials}</div>
                      {note.author.institution && (
                        <div className="text-xs text-gray-400">{note.author.institution}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.ceil(note.content.length / 200)} min read
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(note.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {note.views.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(note.id);
                      }}
                      className="h-8 px-2 hover:text-red-600"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {note.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(note.id);
                      }}
                      className="h-8 px-2 hover:text-blue-600"
                    >
                      <Bookmark className="h-4 w-4 mr-1" />
                      {note.bookmarks}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
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
