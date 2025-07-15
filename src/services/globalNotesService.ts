/**
 * Global Notes Service
 * Manages all published notes from all users in the Knowledge Bank
 * Ensures centralized storage and retrieval for multi-user environment
 */

export interface GlobalNote {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  featured: boolean;
  
  // Author information
  author: {
    id: string;
    name: string;
    avatar?: string;
    credentials: string;
    verified: boolean;
    institution?: string;
    location?: string;
    bio?: string;
    yearsOfExperience?: string;
  };
  
  // Metadata
  publishedAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  bookmarks: number;
  comments: number;
  
  // Source tracking
  publishedBy: string; // User ID who published
  sourceType: 'notepad' | 'direct' | 'import';
}

export interface GlobalNotesStats {
  totalNotes: number;
  totalAuthors: number;
  categoryCounts: Record<string, number>;
  recentActivity: {
    notesPublishedToday: number;
    notesPublishedThisWeek: number;
    notesPublishedThisMonth: number;
  };
}

class GlobalNotesService {
  private readonly STORAGE_KEY = 'medical_ai_global_notes';
  private readonly STATS_KEY = 'medical_ai_global_stats';
  private readonly FEATURED_KEY = 'medical_ai_featured_notes';
  
  private notes: GlobalNote[] = [];
  private stats: GlobalNotesStats | null = null;

  constructor() {
    this.loadNotes();
    this.initializeDefaultNotes();
  }

  /**
   * Load all notes from localStorage
   */
  private loadNotes(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.notes = JSON.parse(stored);
        console.log(`Loaded ${this.notes.length} global notes from storage`);
      }
    } catch (error) {
      console.error('Error loading global notes:', error);
      this.notes = [];
    }
  }

  /**
   * Save all notes to localStorage
   */
  private saveNotes(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notes));
      this.updateStats();
      console.log(`Saved ${this.notes.length} global notes to storage`);
    } catch (error) {
      console.error('Error saving global notes:', error);
    }
  }

  /**
   * Initialize with some default sample notes for demonstration
   */
  private initializeDefaultNotes(): void {
    if (this.notes.length === 0) {
      const defaultNotes: GlobalNote[] = [
        {
          id: 'global_note_1',
          title: 'Understanding Cardiovascular Physiology: A Comprehensive Guide',
          content: 'Detailed explanation of cardiovascular physiology...',
          excerpt: 'A comprehensive overview of how the cardiovascular system works, including heart anatomy, blood flow, and regulatory mechanisms.',
          category: 'Cardiology',
          tags: ['Heart', 'Physiology', 'Anatomy', 'Clinical'],
          difficulty: 'Intermediate',
          featured: true,
          author: {
            id: 'sample_author_1',
            name: 'Dr. Sarah Johnson',
            credentials: 'MD, Cardiologist',
            verified: true,
            institution: 'Johns Hopkins Hospital',
            location: 'Baltimore, MD',
            bio: 'Board-certified cardiologist with 15+ years of experience in clinical cardiology and medical education.',
            yearsOfExperience: '15'
          },
          publishedAt: '2024-01-15',
          updatedAt: '2024-01-15',
          views: 2847,
          likes: 156,
          bookmarks: 89,
          comments: 23,
          publishedBy: 'sample_author_1',
          sourceType: 'direct'
        },
        {
          id: 'global_note_2',
          title: 'Emergency Medicine Protocols: Trauma Assessment',
          content: 'Step-by-step trauma assessment protocols...',
          excerpt: 'Essential protocols for rapid trauma assessment in emergency settings, including ABCDE approach and critical decision points.',
          category: 'Emergency Medicine',
          tags: ['Trauma', 'Emergency', 'Protocols', 'Assessment'],
          difficulty: 'Advanced',
          featured: true,
          author: {
            id: 'sample_author_2',
            name: 'Dr. Michael Chen',
            credentials: 'MD, Emergency Medicine',
            verified: true,
            institution: 'Massachusetts General Hospital',
            location: 'Boston, MA',
            bio: 'Emergency medicine physician specializing in trauma care and emergency protocols.',
            yearsOfExperience: '12'
          },
          publishedAt: '2024-01-14',
          updatedAt: '2024-01-14',
          views: 1923,
          likes: 134,
          bookmarks: 67,
          comments: 18,
          publishedBy: 'sample_author_2',
          sourceType: 'direct'
        },
        {
          id: 'global_note_3',
          title: 'Pharmacology Basics: Drug Interactions and Safety',
          content: 'Understanding drug interactions and safety considerations...',
          excerpt: 'A beginner-friendly guide to understanding how medications interact and key safety considerations for clinical practice.',
          category: 'Pharmacology',
          tags: ['Drugs', 'Safety', 'Interactions', 'Clinical'],
          difficulty: 'Beginner',
          featured: false,
          author: {
            id: 'sample_author_3',
            name: 'Dr. Emily Rodriguez',
            credentials: 'PharmD, Clinical Pharmacist',
            verified: true,
            institution: 'UCLA Medical Center',
            location: 'Los Angeles, CA',
            bio: 'Clinical pharmacist with expertise in drug interactions and medication safety.',
            yearsOfExperience: '8'
          },
          publishedAt: '2024-01-13',
          updatedAt: '2024-01-13',
          views: 1456,
          likes: 98,
          bookmarks: 45,
          comments: 12,
          publishedBy: 'sample_author_3',
          sourceType: 'direct'
        }
      ];

      this.notes = defaultNotes;
      this.saveNotes();
      console.log('Initialized global notes with default content');
    }
  }

  /**
   * Publish a new note to the global Knowledge Bank
   */
  publishNote(noteData: Omit<GlobalNote, 'id' | 'publishedAt' | 'updatedAt' | 'views' | 'likes' | 'bookmarks' | 'comments'>): GlobalNote {
    const newNote: GlobalNote = {
      ...noteData,
      id: this.generateNoteId(),
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0,
      bookmarks: 0,
      comments: 0
    };

    this.notes.unshift(newNote); // Add to beginning for newest first
    this.saveNotes();
    
    console.log(`Published new global note: "${newNote.title}" by ${newNote.author.name}`);
    return newNote;
  }

  /**
   * Get all published notes
   */
  getAllNotes(): GlobalNote[] {
    return [...this.notes];
  }

  /**
   * Get featured notes
   */
  getFeaturedNotes(): GlobalNote[] {
    return this.notes.filter(note => note.featured);
  }

  /**
   * Get notes by category
   */
  getNotesByCategory(category: string): GlobalNote[] {
    if (category === 'All Categories') {
      return this.getAllNotes();
    }
    return this.notes.filter(note => note.category === category);
  }

  /**
   * Search notes by title, content, tags, or author
   */
  searchNotes(query: string): GlobalNote[] {
    if (!query.trim()) {
      return this.getAllNotes();
    }

    const searchTerm = query.toLowerCase();
    return this.notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      note.excerpt.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      note.author.name.toLowerCase().includes(searchTerm) ||
      note.author.credentials.toLowerCase().includes(searchTerm) ||
      note.category.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get note by ID
   */
  getNoteById(id: string): GlobalNote | null {
    return this.notes.find(note => note.id === id) || null;
  }

  /**
   * Update note engagement (views, likes, bookmarks)
   */
  updateEngagement(noteId: string, type: 'view' | 'like' | 'bookmark' | 'comment', increment: number = 1): void {
    const note = this.notes.find(n => n.id === noteId);
    if (note) {
      switch (type) {
        case 'view':
          note.views += increment;
          break;
        case 'like':
          note.likes += increment;
          break;
        case 'bookmark':
          note.bookmarks += increment;
          break;
        case 'comment':
          note.comments += increment;
          break;
      }
      this.saveNotes();
    }
  }

  /**
   * Get global statistics
   */
  getStats(): GlobalNotesStats {
    if (!this.stats) {
      this.updateStats();
    }
    return this.stats!;
  }

  /**
   * Update global statistics
   */
  private updateStats(): void {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const categoryCounts: Record<string, number> = {};
    const uniqueAuthors = new Set<string>();

    this.notes.forEach(note => {
      // Count categories
      categoryCounts[note.category] = (categoryCounts[note.category] || 0) + 1;
      
      // Count unique authors
      uniqueAuthors.add(note.author.id);
    });

    this.stats = {
      totalNotes: this.notes.length,
      totalAuthors: uniqueAuthors.size,
      categoryCounts,
      recentActivity: {
        notesPublishedToday: this.notes.filter(note => note.publishedAt >= today).length,
        notesPublishedThisWeek: this.notes.filter(note => note.publishedAt >= weekAgo).length,
        notesPublishedThisMonth: this.notes.filter(note => note.publishedAt >= monthAgo).length,
      }
    };

    localStorage.setItem(this.STATS_KEY, JSON.stringify(this.stats));
  }

  /**
   * Generate unique note ID
   */
  private generateNoteId(): string {
    return `global_note_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Clear all notes (for testing/reset purposes)
   */
  clearAllNotes(): void {
    this.notes = [];
    this.stats = null;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STATS_KEY);
    console.log('Cleared all global notes');
  }

  /**
   * Get notes by author
   */
  getNotesByAuthor(authorId: string): GlobalNote[] {
    return this.notes.filter(note => note.author.id === authorId);
  }

  /**
   * Get all unique categories
   */
  getAllCategories(): string[] {
    const categories = new Set(this.notes.map(note => note.category));
    return ['All Categories', ...Array.from(categories).sort()];
  }

  /**
   * Get all unique tags
   */
  getAllTags(): string[] {
    const tags = new Set<string>();
    this.notes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  /**
   * Simulate multiple users publishing notes (for testing multi-user functionality)
   */
  simulateMultiUserPublishing(): void {
    const testUsers = [
      {
        id: 'test_user_1',
        name: 'Dr. Jennifer Martinez',
        credentials: 'MD, Pediatrician',
        verified: true,
        institution: 'Children\'s Hospital of Philadelphia',
        location: 'Philadelphia, PA',
        bio: 'Pediatric specialist with focus on childhood development.',
        yearsOfExperience: '10'
      },
      {
        id: 'test_user_2',
        name: 'Dr. Robert Kim',
        credentials: 'MD, PhD, Neurologist',
        verified: true,
        institution: 'Mayo Clinic',
        location: 'Rochester, MN',
        bio: 'Neurologist and researcher specializing in neurodegenerative diseases.',
        yearsOfExperience: '18'
      },
      {
        id: 'test_user_3',
        name: 'Dr. Lisa Thompson',
        credentials: 'MD, Emergency Medicine',
        verified: false,
        institution: 'General Hospital',
        location: 'Chicago, IL',
        bio: 'Emergency medicine physician with trauma care expertise.',
        yearsOfExperience: '6'
      }
    ];

    const testNotes = [
      {
        title: 'Pediatric Vaccination Schedules: 2024 Updates',
        content: 'Comprehensive guide to updated vaccination schedules for children...',
        excerpt: 'Latest updates to pediatric vaccination schedules with new recommendations and timing adjustments.',
        category: 'Pediatrics',
        tags: ['Vaccines', 'Children', 'Prevention', 'Guidelines'],
        difficulty: 'Intermediate' as const,
        featured: false,
        author: testUsers[0],
        publishedBy: testUsers[0].id,
        sourceType: 'direct' as const
      },
      {
        title: 'Alzheimer\'s Disease: Early Detection Strategies',
        content: 'Advanced neurological assessment techniques for early Alzheimer\'s detection...',
        excerpt: 'Cutting-edge approaches to identifying early signs of Alzheimer\'s disease through neurological assessment.',
        category: 'Neurology',
        tags: ['Alzheimer\'s', 'Neurology', 'Diagnosis', 'Research'],
        difficulty: 'Advanced' as const,
        featured: true,
        author: testUsers[1],
        publishedBy: testUsers[1].id,
        sourceType: 'direct' as const
      },
      {
        title: 'Emergency Trauma Protocols: Quick Reference',
        content: 'Essential trauma protocols for emergency situations...',
        excerpt: 'Quick reference guide for emergency trauma protocols in high-pressure situations.',
        category: 'Emergency Medicine',
        tags: ['Trauma', 'Emergency', 'Protocols', 'Quick Reference'],
        difficulty: 'Beginner' as const,
        featured: false,
        author: testUsers[2],
        publishedBy: testUsers[2].id,
        sourceType: 'direct' as const
      }
    ];

    testNotes.forEach(noteData => {
      this.publishNote(noteData);
    });

    console.log(`✅ Simulated ${testNotes.length} notes from ${testUsers.length} different users`);
  }
}

// Export singleton instance
export const globalNotesService = new GlobalNotesService();
export default globalNotesService;
