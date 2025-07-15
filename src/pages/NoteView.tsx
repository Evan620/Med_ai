import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Bookmark, Share2, Eye, Calendar, Clock, Award, User, Tag, MessageCircle, ThumbsUp, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    credentials: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

interface NoteViewProps {
  noteId: string;
  onBack: () => void;
  noteData?: any; // The actual published note data
}

const SAMPLE_NOTE = {
  id: "1",
  title: "Understanding Cardiovascular Physiology: A Comprehensive Guide",
  content: `
# Understanding Cardiovascular Physiology

## Introduction

The cardiovascular system is one of the most critical systems in the human body, responsible for transporting oxygen, nutrients, hormones, and waste products throughout the body. This comprehensive guide will walk you through the fundamental concepts of cardiovascular physiology.

## Heart Anatomy

### Chambers of the Heart

The heart consists of four chambers:

1. **Right Atrium** - Receives deoxygenated blood from the body
2. **Right Ventricle** - Pumps blood to the lungs
3. **Left Atrium** - Receives oxygenated blood from the lungs
4. **Left Ventricle** - Pumps oxygenated blood to the body

### Heart Valves

The heart contains four valves that ensure unidirectional blood flow:

- **Tricuspid Valve** - Between right atrium and right ventricle
- **Pulmonary Valve** - Between right ventricle and pulmonary artery
- **Mitral (Bicuspid) Valve** - Between left atrium and left ventricle
- **Aortic Valve** - Between left ventricle and aorta

## Cardiac Cycle

The cardiac cycle consists of two main phases:

### Systole (Contraction Phase)
- Ventricles contract
- Blood is ejected from the heart
- Duration: ~0.3 seconds

### Diastole (Relaxation Phase)
- Ventricles relax and fill with blood
- Duration: ~0.5 seconds

## Blood Circulation

### Pulmonary Circulation
Blood flows from the right ventricle → pulmonary arteries → lungs → pulmonary veins → left atrium

### Systemic Circulation
Blood flows from the left ventricle → aorta → body tissues → vena cavae → right atrium

## Clinical Correlations

Understanding cardiovascular physiology is essential for:
- Diagnosing heart conditions
- Interpreting ECGs
- Managing hypertension
- Understanding heart failure
- Prescribing cardiovascular medications

## Key Takeaways

1. The heart is a dual pump system
2. Cardiac output = Heart Rate × Stroke Volume
3. Blood pressure regulation involves multiple mechanisms
4. The cardiac cycle is precisely coordinated
5. Understanding normal physiology helps identify pathology

## References

1. Guyton & Hall Textbook of Medical Physiology
2. Cardiovascular Physiology Concepts - Klabunde
3. Braunwald's Heart Disease: A Textbook of Cardiovascular Medicine
  `,
  author: {
    name: "Dr. Sarah Johnson",
    credentials: "MD, Cardiologist",
    verified: true,
    institution: "Johns Hopkins Hospital",
    location: "Baltimore, MD",
    bio: "Board-certified cardiologist with 15+ years of experience in clinical cardiology and medical education. Passionate about teaching cardiovascular physiology to medical students and residents.",
    yearsOfExperience: "15"
  },
  category: "Cardiology",
  tags: ["Heart", "Physiology", "Anatomy", "Clinical"],
  publishedAt: "2024-01-15",
  views: 2847,
  likes: 156,
  bookmarks: 89,
  difficulty: "Intermediate" as const,
  readTime: 12,
  featured: true
};

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "1",
    author: {
      name: "Dr. Michael Chen",
      credentials: "MD, Internal Medicine"
    },
    content: "Excellent comprehensive overview! The section on cardiac cycle is particularly well explained. This will be very helpful for my residents.",
    timestamp: "2024-01-16T10:30:00Z",
    likes: 12
  },
  {
    id: "2",
    author: {
      name: "Sarah Williams",
      credentials: "Medical Student"
    },
    content: "Thank you for this detailed explanation! The clinical correlations section really helps connect the physiology to real-world applications. Could you add more about heart murmurs?",
    timestamp: "2024-01-16T14:20:00Z",
    likes: 8
  },
  {
    id: "3",
    author: {
      name: "Dr. James Rodriguez",
      credentials: "MD, Emergency Medicine"
    },
    content: "Great resource! I'll be sharing this with our medical students during their cardiology rotation. The diagrams would be a nice addition.",
    timestamp: "2024-01-17T09:15:00Z",
    likes: 15
  }
];

export const NoteView = ({ noteId, onBack, noteData }: NoteViewProps) => {
  const [note] = useState(noteData || SAMPLE_NOTE);
  const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Like removed" : "Note liked!",
      description: isLiked ? "Removed from your liked notes." : "Thank you for your feedback.",
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Bookmark removed" : "Note bookmarked!",
      description: isBookmarked ? "Removed from your reading list." : "Added to your reading list.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Note link has been copied to your clipboard.",
    });
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: "Current User",
        credentials: "Medical Student"
      },
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    setComments([comment, ...comments]);
    setNewComment("");
    toast({
      title: "Comment posted!",
      description: "Your comment has been added to the discussion.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Knowledge Bank
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                {note.likes + (isLiked ? 1 : 0)}
              </Button>
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? "bg-blue-500 hover:bg-blue-600" : ""}
              >
                <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked ? "fill-current" : ""}`} />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Note Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{note.category}</Badge>
                <Badge className={getDifficultyColor(note.difficulty)}>
                  {note.difficulty}
                </Badge>
                {note.featured && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{note.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Author Info */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {note.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{note.author.name}</h3>
                    {note.author.verified && <Award className="h-4 w-4 text-blue-500" />}
                  </div>
                  <p className="text-gray-600 mb-1">{note.author.credentials}</p>
                  {note.author.institution && (
                    <p className="text-sm text-gray-500 mb-1">{note.author.institution}</p>
                  )}
                  {note.author.location && (
                    <p className="text-sm text-gray-500 mb-2">{note.author.location}</p>
                  )}
                  {note.author.yearsOfExperience && (
                    <p className="text-sm text-gray-500 mb-2">{note.author.yearsOfExperience} years of experience</p>
                  )}
                  <p className="text-sm text-gray-700">{note.author.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Published {formatDate(note.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {note.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {note.views.toLocaleString()} views
            </span>
          </div>
        </div>

        {/* Note Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              {note.content.split('\n').map((line, index) => {
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
                } else if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={index} className="font-semibold mb-2">{line.slice(2, -2)}</p>;
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index} className="mb-3 leading-relaxed">{line}</p>;
                }
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Discussion ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment */}
            <div className="mb-6">
              <Textarea
                placeholder="Share your thoughts, ask questions, or provide additional insights..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
                rows={3}
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Be respectful and constructive in your comments.
                </p>
                <Button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
                  Post Comment
                </Button>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback>
                      {comment.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.author.name}</span>
                      <span className="text-sm text-gray-500">{comment.author.credentials}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-400">{formatTimeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-blue-600">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {comment.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500">
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500">
                        <Flag className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
