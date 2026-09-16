export type Language = 'ar' | 'en';

export type UserRole = 'employee' | 'committee' | 'admin';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  jobTitle: string;
  department: string;
  avatar?: string;
  points: number;
  badges: string[];
  createdAt: string;
}

export interface Department {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  icon?: string;
}

export interface JobTitle {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  color: string;
  icon: string;
}

export type IdeaStatus = 'submitted' | 'under_review' | 'feasibility' | 'accepted' | 'rejected';

export interface Evaluation {
  id: string;
  ideaId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  feasibilityScore: number; // 1-5
  impactScore: number;      // 1-5
  costScore: number;        // 1-5
  innovationScore: number;  // 1-5
  overallScore: number;     // calculated average
  decision: IdeaStatus;
  feedback: string;
  internalNotes?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  ideaId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userDepartment: string;
  text: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export interface SimilarityMatch {
  ideaId: string;
  title: string;
  similarityScore: number; // 0 - 100
  snippet: string;
  category: string;
  department: string;
  status: IdeaStatus;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  authorDepartment: string;
  authorJobTitle: string;
  authorAvatar?: string;
  departmentTarget: string;
  category: string;
  tags: string[];
  status: IdeaStatus;
  aiSummary?: string;
  aiStrategicPillar?: string;
  upvotes: number;
  downvotes: number;
  votedUsers: { [userId: string]: 'up' | 'down' };
  commentsCount: number;
  evaluations: Evaluation[];
  audioRecorded?: boolean;
  attachmentName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  totalIdeas: number;
  acceptedIdeas: number;
  underReviewIdeas: number;
  rejectedIdeas: number;
  feasibilityIdeas: number;
  totalVotes: number;
  totalComments: number;
  totalUsers: number;
}
