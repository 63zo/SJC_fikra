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
import {
  pushDatabaseToCloud,
  pullDatabaseFromCloud,
  mergeIdeas,
  mergeComments,
  exportDatabaseBackup,
  parseDatabaseBackupFile,
  getLastCloudSyncTime,
  CloudDatabasePayload,
} from '../services/cloudSyncService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import {
  fetchIdeasFromCloud,
  fetchCommentsFromCloud,
  upsertIdeaToCloud,
  upsertCommentToCloud,
  seedInitialIdeasToCloud,
  seedInitialCommentsToCloud,
  updateIdeaCommentsCount,
  mapRowToIdea,
  mapRowToComment,
} from '../services/supabaseService';
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
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: string | null;
  isSupabaseConnected: boolean;
  syncWithCloud: () => Promise<boolean>;
  pushToCloud: () => Promise<boolean>;
  pullFromCloud: () => Promise<boolean>;
  exportBackup: () => void;
  importBackup: (file: File) => Promise<{ success: boolean; message: string }>;
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

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTimeState] = useState<string | null>(() => getLastCloudSyncTime());

  const getDatabasePayload = (): CloudDatabasePayload => ({
    version: '2.0',
    lastUpdated: new Date().toISOString(),
    ideas,
    departments,
    jobTitles,
    categories,
    comments,
  });

  const pushToCloud = async (): Promise<boolean> => {
    setSyncStatus('syncing');
    if (isSupabaseConfigured) {
      const ok = await seedInitialIdeasToCloud(ideas);
      if (ok) {
        setSyncStatus('synced');
        setLastSyncTimeState(new Date().toISOString());
        setTimeout(() => setSyncStatus('idle'), 3000);
        return true;
      }
    }
    const res = await pushDatabaseToCloud(getDatabasePayload());
    if (res.success) {
      setSyncStatus('synced');
      setLastSyncTimeState(new Date().toISOString());
      setTimeout(() => setSyncStatus('idle'), 3000);
      return true;
    } else {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 4000);
      return false;
    }
  };

  const pullFromCloud = async (): Promise<boolean> => {
    setSyncStatus('syncing');
    if (isSupabaseConfigured) {
      const cloudIdeas = await fetchIdeasFromCloud();
      const cloudComments = await fetchCommentsFromCloud();
      if (cloudIdeas) {
        setIdeas(cloudIdeas);
        if (cloudComments) setComments(cloudComments);
        setSyncStatus('synced');
        setLastSyncTimeState(new Date().toISOString());
        setTimeout(() => setSyncStatus('idle'), 3000);
        return true;
      }
    }
    const res = await pullDatabaseFromCloud();
    if (res.success && res.data) {
      if (res.data.ideas) setIdeas(prev => mergeIdeas(prev, res.data!.ideas));
      if (res.data.departments) setDepartments(res.data.departments);
      if (res.data.jobTitles) setJobTitles(res.data.jobTitles);
      if (res.data.categories) setCategories(res.data.categories);
      if (res.data.comments) setComments(prev => mergeComments(prev, res.data!.comments));
      setSyncStatus('synced');
      setLastSyncTimeState(new Date().toISOString());
      setTimeout(() => setSyncStatus('idle'), 3000);
      return true;
    } else {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 4000);
      return false;
    }
  };

  const syncWithCloud = async (): Promise<boolean> => {
    if (isSupabaseConfigured) {
      return pullFromCloud();
    }
    setSyncStatus('syncing');
    try {
      const pullRes = await pullDatabaseFromCloud();
      let mergedIdeas = ideas;
      let mergedComments = comments;

      if (pullRes.success && pullRes.data) {
        if (pullRes.data.ideas) mergedIdeas = mergeIdeas(ideas, pullRes.data.ideas);
        if (pullRes.data.comments) mergedComments = mergeComments(comments, pullRes.data.comments);
        setIdeas(mergedIdeas);
        setComments(mergedComments);
      }

      // Push combined state
      const pushPayload: CloudDatabasePayload = {
        version: '2.0',
        lastUpdated: new Date().toISOString(),
        ideas: mergedIdeas,
        departments,
        jobTitles,
        categories,
        comments: mergedComments,
      };

      const pushRes = await pushDatabaseToCloud(pushPayload);
      if (pushRes.success) {
        setSyncStatus('synced');
        setLastSyncTimeState(new Date().toISOString());
        setTimeout(() => setSyncStatus('idle'), 3000);
        return true;
      }
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 4000);
      return false;
    } catch (e) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 4000);
      return false;
    }
  };

  const exportBackup = () => {
    exportDatabaseBackup(getDatabasePayload());
  };

  const importBackup = async (file: File): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await parseDatabaseBackupFile(file);
      if (data.ideas) setIdeas(prev => mergeIdeas(prev, data.ideas));
      if (data.departments) setDepartments(data.departments);
      if (data.jobTitles) setJobTitles(data.jobTitles);
      if (data.categories) setCategories(data.categories);
      if (data.comments) setComments(prev => mergeComments(prev, data.comments));
      await pushToCloud();
      return { success: true, message: 'تم استيراد قاعدة البيانات ومزامنتها بنجاح.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'فشل استيراد قاعدة البيانات.' };
    }
  };

  // Initial Supabase fetch, auto-seed if remote empty, and live Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      if (navigator.onLine) {
        const timer = setTimeout(() => {
          syncWithCloud().catch(() => {});
        }, 1500);
        return () => clearTimeout(timer);
      }
      return;
    }

    const initData = async () => {
      setSyncStatus('syncing');
      try {
        const [cloudIdeas, cloudComments] = await Promise.all([
          fetchIdeasFromCloud(),
          fetchCommentsFromCloud(),
        ]);

        if (cloudIdeas && cloudIdeas.length > 0) {
          setIdeas(cloudIdeas);
          setLastSyncTimeState(new Date().toISOString());
        } else if (cloudIdeas && cloudIdeas.length === 0) {
          // If remote is fresh/empty, seed initial ideas so both devices start with existing ideas
          await seedInitialIdeasToCloud(ideas);
        }

        if (cloudComments && cloudComments.length > 0) {
          setComments(cloudComments);
        } else if (cloudComments && cloudComments.length === 0 && comments.length > 0) {
          await seedInitialCommentsToCloud(comments);
        }

        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 2500);
      } catch (err) {
        console.error('Supabase init error:', err);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    };

    initData();

    // Setup Supabase Realtime channel for live multi-device synchronization
    const channel = supabase
      .channel('public:sjc_live_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ideas' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newIdea = mapRowToIdea(payload.new);
            setIdeas(prev => {
              if (prev.some(i => i.id === newIdea.id)) return prev;
              return [newIdea, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedIdea = mapRowToIdea(payload.new);
            setIdeas(prev =>
              prev.map(i => (i.id === updatedIdea.id ? updatedIdea : i))
            );
          } else if (payload.eventType === 'DELETE' && payload.old?.id) {
            setIdeas(prev => prev.filter(i => i.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newComm = mapRowToComment(payload.new);
            setComments(prev => {
              if (prev.some(c => c.id === newComm.id)) return prev;
              return [newComm, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedComm = mapRowToComment(payload.new);
            setComments(prev =>
              prev.map(c => (c.id === updatedComm.id ? updatedComm : c))
            );
          } else if (payload.eventType === 'DELETE' && payload.old?.id) {
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

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

    if (isSupabaseConfigured) {
      upsertIdeaToCloud(newIdea).catch(err => {
        console.error('Failed to sync new idea to Supabase:', err);
      });
    }

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

    setIdeas(prev => {
      let targetIdea: Idea | null = null;
      const updated = prev.map(idea => {
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

        const newIdeaObj: Idea = {
          ...idea,
          upvotes: Math.max(0, idea.upvotes + upDiff),
          downvotes: Math.max(0, idea.downvotes + downDiff),
          votedUsers: updatedVotedUsers,
          updatedAt: new Date().toISOString(),
        };

        targetIdea = newIdeaObj;
        return newIdeaObj;
      });

      if (targetIdea && isSupabaseConfigured) {
        upsertIdeaToCloud(targetIdea).catch(err => {
          console.error('Failed to sync vote to Supabase:', err);
        });
      }

      return updated;
    });
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

    if (isSupabaseConfigured) {
      upsertCommentToCloud(newComment).catch(err => {
        console.error('Failed to sync comment to Supabase:', err);
      });
    }

    setIdeas(prev =>
      prev.map(i => {
        if (i.id === ideaId) {
          const updatedCount = i.commentsCount + 1;
          if (isSupabaseConfigured) {
            updateIdeaCommentsCount(ideaId, updatedCount).catch(err => {
              console.error('Failed to sync comments count to Supabase:', err);
            });
          }
          return { ...i, commentsCount: updatedCount, updatedAt: new Date().toISOString() };
        }
        return i;
      })
    );
  };

  const likeComment = (commentId: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;

    setComments(prev => {
      let targetComment: Comment | null = null;
      const updated = prev.map(comm => {
        if (comm.id !== commentId) return comm;
        const hasLiked = comm.likedBy.includes(userId);
        const updatedComm = {
          ...comm,
          likes: hasLiked ? Math.max(0, comm.likes - 1) : comm.likes + 1,
          likedBy: hasLiked ? comm.likedBy.filter(id => id !== userId) : [...comm.likedBy, userId],
        };
        targetComment = updatedComm;
        return updatedComm;
      });

      if (targetComment && isSupabaseConfigured) {
        upsertCommentToCloud(targetComment).catch(err => {
          console.error('Failed to sync comment like to Supabase:', err);
        });
      }

      return updated;
    });
  };

  const evaluateIdea = (ideaId: string, evaluationData: Omit<Evaluation, 'id' | 'createdAt'>) => {
    const newEvaluation: Evaluation = {
      ...evaluationData,
      id: `eval-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setIdeas(prev => {
      let targetIdea: Idea | null = null;
      const updated = prev.map(idea => {
        if (idea.id !== ideaId) return idea;
        const updatedIdea: Idea = {
          ...idea,
          status: evaluationData.decision,
          evaluations: [newEvaluation, ...idea.evaluations],
          updatedAt: new Date().toISOString(),
        };
        targetIdea = updatedIdea;
        return updatedIdea;
      });

      if (targetIdea && isSupabaseConfigured) {
        upsertIdeaToCloud(targetIdea).catch(err => {
          console.error('Failed to sync evaluation to Supabase:', err);
        });
      }

      return updated;
    });

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
        syncStatus,
        lastSyncTime,
        isSupabaseConnected: isSupabaseConfigured,
        syncWithCloud,
        pushToCloud,
        pullFromCloud,
        exportBackup,
        importBackup,
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
