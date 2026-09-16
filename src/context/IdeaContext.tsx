import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Idea,
  Department,
  JobTitle,
  Category,
  Comment,
  Evaluation,
  IdeaStatus,
  SystemStats
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_JOB_TITLES,
  INITIAL_CATEGORIES,
  INITIAL_IDEAS
} from '../data/mockData';
import { enrichIdeaWithAI } from '../services/aiService';
import { useAuth } from './AuthContext';

interface IdeaContextType {
  ideas: Idea[];
  departments: Department[];
  jobTitles: JobTitle[];
  categories: Category[];
  comments: Comment[];
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  stats: SystemStats;
  submitIdea: (data: {
    title: string;
    description: string;
    departmentTarget: string;
    audioRecorded?: boolean;
    attachmentName?: string;
  }) => Promise<Idea>;
  voteIdea: (ideaId: string, type: 'up' | 'down') => void;
  addComment: (ideaId: string, text: string) => void;
  likeComment: (commentId: string) => void;
  evaluateIdea: (ideaId: string, evaluation: Omit<Evaluation, 'id' | 'createdAt'>) => void;
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  deleteDepartment: (id: string) => void;
  addJobTitle: (job: Omit<JobTitle, 'id'>) => void;
  deleteJobTitle: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
}

const IdeaContext = createContext<IdeaContextType | undefined>(undefined);

export const IdeaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const saved = localStorage.getItem('fikra_ideas');
    return saved ? JSON.parse(saved) : INITIAL_IDEAS;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('fikra_departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [jobTitles, setJobTitles] = useState<JobTitle[]>(() => {
    const saved = localStorage.getItem('fikra_job_titles');
    return saved ? JSON.parse(saved) : INITIAL_JOB_TITLES;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('fikra_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('fikra_comments');
    return saved ? JSON.parse(saved) : [
      {
        id: 'comm-1',
        ideaId: 'idea-101',
        userId: 'user-2',
        userName: 'د. عبدالله خالد المري',
        userRole: 'committee',
        userDepartment: 'إدارة التخطيط والجودة',
        text: 'مقترح استراتيجي ممتاز وسيقلل بنسبة كبيرة من تأجيل الجلسات بسبب عدم اكتمال الإعلانات.',
        createdAt: '2026-02-02T10:00:00Z',
        likes: 5,
        likedBy: ['user-1', 'user-3'],
      },
      {
        id: 'comm-2',
        ideaId: 'idea-101',
        userId: 'user-3',
        userName: 'فاطمة محمد السليطي',
        userRole: 'admin',
        userDepartment: 'إدارة نظم المعلومات',
        text: 'نظم المعلومات على أتم الاستعداد لربط الـ API مع مطراش2 بالتنسيق مع وزارة الداخلية.',
        createdAt: '2026-02-03T14:20:00Z',
        likes: 8,
        likedBy: ['user-1', 'user-2'],
      }
    ];
  });

  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(() => {
    return localStorage.getItem('fikra_gemini_api_key') || '';
  });

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    localStorage.setItem('fikra_gemini_api_key', key);
  };

  useEffect(() => {
    localStorage.setItem('fikra_ideas', JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    localStorage.setItem('fikra_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('fikra_job_titles', JSON.stringify(jobTitles));
  }, [jobTitles]);

  useEffect(() => {
    localStorage.setItem('fikra_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fikra_comments', JSON.stringify(comments));
  }, [comments]);

  // Calculated dynamic system statistics
  const stats: SystemStats = {
    totalIdeas: ideas.length,
    acceptedIdeas: ideas.filter(i => i.status === 'accepted').length,
    underReviewIdeas: ideas.filter(i => i.status === 'under_review' || i.status === 'submitted').length,
    rejectedIdeas: ideas.filter(i => i.status === 'rejected').length,
    feasibilityIdeas: ideas.filter(i => i.status === 'feasibility').length,
    totalVotes: ideas.reduce((acc, curr) => acc + curr.upvotes + curr.downvotes, 0),
    totalComments: comments.length,
    totalUsers: 3,
  };

  const submitIdea = async (data: {
    title: string;
    description: string;
    departmentTarget: string;
    audioRecorded?: boolean;
    attachmentName?: string;
  }): Promise<Idea> => {
    // Run AI classification & enrichment
    const aiEnrichment = await enrichIdeaWithAI(
      data.title,
      data.description,
      categories,
      geminiApiKey
    );

    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      title: data.title,
      description: data.description,
      authorId: currentUser?.id || 'anonymous',
      authorName: currentUser?.fullName || 'موظف مجهول',
      authorDepartment: currentUser?.department || 'إدارة نظم المعلومات',
      authorJobTitle: currentUser?.jobTitle || 'موظف',
      authorAvatar: currentUser?.avatar,
      departmentTarget: data.departmentTarget,
      category: aiEnrichment.category,
      tags: aiEnrichment.tags,
      status: 'submitted',
      aiSummary: aiEnrichment.aiSummary,
      aiStrategicPillar: aiEnrichment.aiStrategicPillar,
      upvotes: 1, // Author automatic upvote
      downvotes: 0,
      votedUsers: currentUser?.id ? { [currentUser.id]: 'up' } : {},
      commentsCount: 0,
      evaluations: [],
      audioRecorded: data.audioRecorded,
      attachmentName: data.attachmentName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIdeas(prev => [newIdea, ...prev]);

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8A1538', '#C5A059', '#FFFFFF']
      });
    } catch (e) {
      // ignore
    }

    return newIdea;
  };

  const voteIdea = (ideaId: string, type: 'up' | 'down') => {
    if (!currentUser) return;
    const userId = currentUser.id;

    setIdeas(prev =>
      prev.map(idea => {
        if (idea.id !== ideaId) return idea;

        const currentVote = idea.votedUsers[userId];
        const updatedVotedUsers = { ...idea.votedUsers };

        let upDiff = 0;
        let downDiff = 0;

        if (currentVote === type) {
          // Remove vote
          delete updatedVotedUsers[userId];
          if (type === 'up') upDiff = -1;
          if (type === 'down') downDiff = -1;
        } else {
          // New or changed vote
          updatedVotedUsers[userId] = type;
          if (type === 'up') {
            upDiff = 1;
            if (currentVote === 'down') downDiff = -1;
          } else {
            downDiff = 1;
            if (currentVote === 'up') upDiff = -1;
          }
        }

        return {
          ...idea,
          upvotes: Math.max(0, idea.upvotes + upDiff),
          downvotes: Math.max(0, idea.downvotes + downDiff),
          votedUsers: updatedVotedUsers,
        };
      })
    );
  };

  const addComment = (ideaId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      ideaId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      userDepartment: currentUser.department,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };

    setComments(prev => [newComment, ...prev]);
    setIdeas(prev =>
      prev.map(i => (i.id === ideaId ? { ...i, commentsCount: i.commentsCount + 1 } : i))
    );
  };

  const likeComment = (commentId: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;

    setComments(prev =>
      prev.map(comm => {
        if (comm.id !== commentId) return comm;
        const hasLiked = comm.likedBy.includes(userId);
        return {
          ...comm,
          likes: hasLiked ? comm.likes - 1 : comm.likes + 1,
          likedBy: hasLiked ? comm.likedBy.filter(id => id !== userId) : [...comm.likedBy, userId],
        };
      })
    );
  };

  const evaluateIdea = (ideaId: string, evaluationData: Omit<Evaluation, 'id' | 'createdAt'>) => {
    const newEvaluation: Evaluation = {
      ...evaluationData,
      id: `eval-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setIdeas(prev =>
      prev.map(idea => {
        if (idea.id !== ideaId) return idea;
        return {
          ...idea,
          status: evaluationData.decision,
          evaluations: [newEvaluation, ...idea.evaluations],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (evaluationData.decision === 'accepted') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#8A1538', '#C5A059', '#10B981']
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    setDepartments(prev => [...prev, newDept]);
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const addJobTitle = (job: Omit<JobTitle, 'id'>) => {
    const newJob: JobTitle = {
      ...job,
      id: `job-${Date.now()}`,
    };
    setJobTitles(prev => [...prev, newJob]);
  };

  const deleteJobTitle = (id: string) => {
    setJobTitles(prev => prev.filter(j => j.id !== id));
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <IdeaContext.Provider
      value={{
        ideas,
        departments,
        jobTitles,
        categories,
        comments,
        geminiApiKey,
        setGeminiApiKey,
        stats,
        submitIdea,
        voteIdea,
        addComment,
        likeComment,
        evaluateIdea,
        addDepartment,
        deleteDepartment,
        addJobTitle,
        deleteJobTitle,
        addCategory,
        deleteCategory,
      }}
    >
      {children}
    </IdeaContext.Provider>
  );
};

export const useIdeas = () => {
  const context = useContext(IdeaContext);
  if (!context) {
    throw new Error('useIdeas must be used within an IdeaProvider');
  }
  return context;
};
