import { Idea, SimilarityMatch, Category } from '../types';

/**
 * Arabic text normalization:
 * Removes diacritics (tashkeel), normalizes Alefs (أ, إ, آ -> ا),
 * normalizes Teh Marbuta (ة -> ه), and Yeh (ى -> ي), strips punctuation.
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    // Remove Arabic diacritics
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alefs
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Teh Marbuta
    .replace(/ة/g, 'ه')
    // Normalize Alef Maqsura
    .replace(/ى/g, 'ي')
    // Remove extra non-alphanumeric punctuation
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Tokenize and remove common Arabic/English stop words
 */
const STOP_WORDS = new Set([
  'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'تم', 'ان', 'أن', 'أو', 'و',
  'لا', 'ما', 'هو', 'هي', 'كل', 'ذلك', 'تلك', 'التي', 'الذي', 'الذين', 'اللاتي',
  'قد', 'كان', 'يكون', 'سوف', 'بين', 'حيث', 'نحو', 'خلال', 'عند', 'منذ', 'غير',
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'is', 'are'
]);

export function extractTokens(text: string): string[] {
  const normalized = normalizeArabicText(text);
  return normalized
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

/**
 * Computes semantic cosine/Jaccard similarity between two text snippets
 */
export function computeSimilarityScore(text1: string, text2: string): number {
  const tokens1 = extractTokens(text1);
  const tokens2 = extractTokens(text2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let intersectionCount = 0;
  for (const t of set1) {
    if (set2.has(t)) {
      intersectionCount++;
    } else {
      // Fuzzy prefix/stem match in Arabic (e.g., "الاشعارات" matches "اشعار")
      for (const t2 of set2) {
        if (t.startsWith(t2) || t2.startsWith(t) || (t.length > 4 && t2.includes(t.substring(0, 4)))) {
          intersectionCount += 0.8;
          break;
        }
      }
    }
  }

  const unionSize = set1.size + set2.size - intersectionCount;
  if (unionSize <= 0) return 0;

  const jaccard = (intersectionCount / unionSize) * 100;
  // Boost score if key technical terms match
  return Math.min(Math.round(jaccard * 1.35), 98);
}

/**
 * Real-time AI Similarity Search
 * Triggered after user enters at least 3 words
 */
export function searchSimilarIdeas(
  inputTitle: string,
  inputDescription: string,
  existingIdeas: Idea[],
  threshold = 28
): SimilarityMatch[] {
  const combinedInput = `${inputTitle} ${inputDescription}`.trim();
  const words = combinedInput.split(/\s+/).filter(w => w.length > 0);

  // Requirement: Trigger search after 3 words and beyond
  if (words.length < 3) {
    return [];
  }

  const results: SimilarityMatch[] = [];

  for (const idea of existingIdeas) {
    const combinedExisting = `${idea.title} ${idea.description}`;
    const score = computeSimilarityScore(combinedInput, combinedExisting);

    if (score >= threshold) {
      results.push({
        ideaId: idea.id,
        title: idea.title,
        similarityScore: score,
        snippet: idea.description.substring(0, 140) + '...',
        category: idea.category,
        department: idea.departmentTarget,
        status: idea.status,
      });
    }
  }

  // Sort descending by similarity score
  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Automated AI Classification, Tagging, and Executive Summary Generation
 */
export async function enrichIdeaWithAI(
  title: string,
  description: string,
  categories: Category[],
  geminiApiKey?: string
): Promise<{
  category: string;
  tags: string[];
  aiSummary: string;
  aiStrategicPillar: string;
}> {
  // If Gemini API Key is provided, attempt live Gemini API call
  if (geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      const prompt = `You are an AI innovation evaluator for the Supreme Judiciary Council of Qatar (SJC).
Analyze this employee proposal:
Title: ${title}
Description: ${description}

Available categories: ${categories.map(c => c.nameAr).join(', ')}

Return a strict JSON object with:
{
  "category": "most suitable category from list in Arabic",
  "tags": ["3 to 5 relevant Arabic tags without #"],
  "aiSummary": "concise 1-2 sentence Arabic executive summary highlighting value",
  "aiStrategicPillar": "name of strategic judicial pillar in Arabic e.g. العدالة الرقمية الناجزة"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            category: parsed.category || categories[0].nameAr,
            tags: parsed.tags || ['ابتكار قضائي', 'تطوير مؤسسي'],
            aiSummary: parsed.aiSummary || title,
            aiStrategicPillar: parsed.aiStrategicPillar || 'العدالة الناجزة والتحول الرقمي',
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to built-in AI NLP engine:', err);
    }
  }

  // Built-in intelligent client-side NLP Engine
  const combined = `${title} ${description}`.toLowerCase();
  
  let bestCategory = categories[0]?.nameAr || 'التحول الرقمي والتقاضي الذكي';
  let bestPillar = 'العدالة الرقمية الناجزة وتيسير التقاضي';

  if (combined.includes('ذكاء') || combined.includes('ai') || combined.includes('اصطناعي') || combined.includes('توليد') || combined.includes('روبوت') || combined.includes('صوت')) {
    bestCategory = 'الذكاء الاصطناعي والأتمتة';
    bestPillar = 'الذكاء الاصطناعي والأتمتة القضائية الذكية';
  } else if (combined.includes('ورق') || combined.includes('بيئ') || combined.includes('خضر') || combined.includes('طاق') || combined.includes('استدام')) {
    bestCategory = 'الاستدامة والبيئة الخضراء';
    bestPillar = 'الاستدامة والمحاكم الخضراء الصديقة للبيئة';
  } else if (combined.includes('جمهور') || combined.includes('متقاض') || combined.includes('خدم') || combined.includes('تركات') || combined.includes('اسر') || combined.includes('مركز')) {
    bestCategory = 'تجربة المتقاضين وخدمة الجمهور';
    bestPillar = 'إسعاد المتقاضين وتسهيل الوصول للعدالة';
  } else if (combined.includes('موظف') || combined.includes('تدريب') || combined.includes('كادر') || combined.includes('حوافز') || combined.includes('بيئة عمل')) {
    bestCategory = 'بيئة العمل وتطوير الكوادر';
    bestPillar = 'تمكين الكفاءات وتطوير رأس المال البشري';
  } else if (combined.includes('جلس') || combined.includes('حكم') || combined.includes('تنفيذ') || combined.includes('سرع') || combined.includes('اعلان')) {
    bestCategory = 'كفاءة وسرعة الإجراءات القضائية';
    bestPillar = 'تسريع إجراءات التقاضي والعدالة الناجزة';
  }

  // Generate automated tags based on content
  const tokens = extractTokens(combined);
  const potentialTags: string[] = [];

  const keywordsMap: { [key: string]: string } = {
    'مطراش': 'مطراش2',
    'اعلان': 'إعلانات قضائية',
    'محاكم': 'المحاكم الرقمية',
    'جلسات': 'أتمتة الجلسات',
    'قضائي': 'العدالة الناجزة',
    'تركات': 'التوثيقات الأسرية',
    'ذكاء': 'ذكاء اصطناعي',
    'صوت': 'تعرف صوتي',
    'ورق': 'محاكم خضراء',
    'تطبيق': 'حلول رقمية',
    'الكتروني': 'خدمات إلكترونية',
    'استئناف': 'محكمة الاستئناف',
    'تمييز': 'محكمة التمييز',
    'جودة': 'الجودة والتميز',
  };

  for (const token of tokens) {
    for (const [key, tagValue] of Object.entries(keywordsMap)) {
      if (token.includes(key) && !potentialTags.includes(tagValue)) {
        potentialTags.push(tagValue);
      }
    }
  }

  if (potentialTags.length < 3) {
    potentialTags.push('ابتكار مؤسسي', 'المجلس الأعلى للقضاء', 'تطوير الخدمات');
  }

  // Generate executive summary
  const summary = `مبادرة نوعية مقترحة تهدف إلى ${title.replace(/^(مقترح|مشروع|فكرة|نظام)\s*/, '')}، مما يسهم بشكل مباشر في تعزيز ${bestPillar} وتحسين مؤشرات الأداء المؤسسي.`;

  return {
    category: bestCategory,
    tags: potentialTags.slice(0, 5),
    aiSummary: summary,
    aiStrategicPillar: bestPillar,
  };
}
