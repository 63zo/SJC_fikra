import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Idea, Comment, Evaluation } from '../types';

export function mapRowToIdea(row: any): Idea {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    authorId: row.author_id,
    authorName: row.author_name,
    authorDepartment: row.author_department,
    authorJobTitle: row.author_job_title,
    authorAvatar: row.author_avatar || undefined,
    departmentTarget: row.department_target,
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status,
    aiSummary: row.ai_summary || undefined,
    aiStrategicPillar: row.ai_strategic_pillar || undefined,
    upvotes: typeof row.upvotes === 'number' ? row.upvotes : 0,
    downvotes: typeof row.downvotes === 'number' ? row.downvotes : 0,
    votedUsers: row.voted_users && typeof row.voted_users === 'object' ? row.voted_users : {},
    commentsCount: typeof row.comments_count === 'number' ? row.comments_count : 0,
    evaluations: Array.isArray(row.evaluations) ? row.evaluations : [],
    audioRecorded: Boolean(row.audio_recorded),
    attachmentName: row.attachment_name || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
  };
}

export function mapIdeaToRow(idea: Idea): Record<string, any> {
  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    author_id: idea.authorId,
    author_name: idea.authorName,
    author_department: idea.authorDepartment,
    author_job_title: idea.authorJobTitle,
    author_avatar: idea.authorAvatar || null,
    department_target: idea.departmentTarget,
    category: idea.category,
    tags: idea.tags || [],
    status: idea.status || 'submitted',
    ai_summary: idea.aiSummary || null,
    ai_strategic_pillar: idea.aiStrategicPillar || null,
    upvotes: idea.upvotes ?? 0,
    downvotes: idea.downvotes ?? 0,
    voted_users: idea.votedUsers || {},
    comments_count: idea.commentsCount ?? 0,
    evaluations: idea.evaluations || [],
    audio_recorded: Boolean(idea.audioRecorded),
    attachment_name: idea.attachmentName || null,
    created_at: idea.createdAt,
    updated_at: idea.updatedAt || idea.createdAt,
  };
}

export function mapRowToComment(row: any): Comment {
  return {
    id: row.id,
    ideaId: row.idea_id,
    userId: row.user_id,
    userName: row.user_name,
    userRole: row.user_role,
    userDepartment: row.user_department,
    text: row.text,
    createdAt: row.created_at || new Date().toISOString(),
    likes: typeof row.likes === 'number' ? row.likes : 0,
    likedBy: Array.isArray(row.liked_by) ? row.liked_by : [],
  };
}

export function mapCommentToRow(comment: Comment): Record<string, any> {
  return {
    id: comment.id,
    idea_id: comment.ideaId,
    user_id: comment.userId,
    user_name: comment.userName,
    user_role: comment.userRole,
    user_department: comment.userDepartment,
    text: comment.text,
    created_at: comment.createdAt,
    likes: comment.likes ?? 0,
    liked_by: comment.likedBy || [],
  };
}

/**
 * Fetch all ideas from Supabase
 */
export async function fetchIdeasFromCloud(): Promise<Idea[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ideas from Supabase:', error);
      return null;
    }
    return (data || []).map(mapRowToIdea);
  } catch (err) {
    console.error('Supabase fetchIdeas exception:', err);
    return null;
  }
}

/**
 * Fetch all comments from Supabase
 */
export async function fetchCommentsFromCloud(): Promise<Comment[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments from Supabase:', error);
      return null;
    }
    return (data || []).map(mapRowToComment);
  } catch (err) {
    console.error('Supabase fetchComments exception:', err);
    return null;
  }
}

/**
 * Insert or update an idea in Supabase
 */
export async function upsertIdeaToCloud(idea: Idea): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const row = mapIdeaToRow(idea);
    const { error } = await supabase.from('ideas').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Error saving idea to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase upsertIdea exception:', err);
    return false;
  }
}

/**
 * Bulk seed ideas into Supabase if remote is empty
 */
export async function seedInitialIdeasToCloud(ideas: Idea[]): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || ideas.length === 0) return false;
  try {
    const rows = ideas.map(mapIdeaToRow);
    const { error } = await supabase.from('ideas').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('Error seeding ideas to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase seed ideas exception:', err);
    return false;
  }
}

/**
 * Bulk seed comments into Supabase if remote is empty
 */
export async function seedInitialCommentsToCloud(comments: Comment[]): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || comments.length === 0) return false;
  try {
    const rows = comments.map(mapCommentToRow);
    const { error } = await supabase.from('comments').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('Error seeding comments to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase seed comments exception:', err);
    return false;
  }
}

/**
 * Insert or update a comment in Supabase
 */
export async function upsertCommentToCloud(comment: Comment): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const row = mapCommentToRow(comment);
    const { error } = await supabase.from('comments').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Error saving comment to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase upsertComment exception:', err);
    return false;
  }
}

/**
 * Update comments count on an idea
 */
export async function updateIdeaCommentsCount(ideaId: string, count: number): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ comments_count: count, updated_at: new Date().toISOString() })
      .eq('id', ideaId);
    if (error) {
      console.error('Error updating comments count:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase update comments count exception:', err);
    return false;
  }
}
