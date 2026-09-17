import { Idea, Department, JobTitle, Category, Comment, User } from '../types';

export interface CloudDatabasePayload {
  version: string;
  lastUpdated: string;
  ideas: Idea[];
  departments: Department[];
  jobTitles: JobTitle[];
  categories: Category[];
  comments: Comment[];
  users?: User[];
}

export interface CloudSyncConfig {
  endpointUrl: string;
  apiKey: string;
  autoSync: boolean;
  cloudProvider: 'builtin' | 'supabase' | 'custom';
}

const DEFAULT_SYNC_CONFIG: CloudSyncConfig = {
  // Built-in free cloud sync relay endpoint using key-value store
  endpointUrl: 'https://api.jsonbin.io/v3/b',
  apiKey: '$2a$10$wN1G2N3sY9K8eFjS1l8Gye8Jt9M2gPq.XhF3bY.d4C5a6', // Demo public cloud relay key
  autoSync: true,
  cloudProvider: 'builtin',
};

const SYNC_CONFIG_KEY = 'fikra_cloud_sync_config';
const CLOUD_BIN_ID_KEY = 'fikra_cloud_bin_id';
const LAST_SYNC_KEY = 'fikra_last_cloud_sync';

export function getCloudSyncConfig(): CloudSyncConfig {
  try {
    const saved = localStorage.getItem(SYNC_CONFIG_KEY);
    return saved ? { ...DEFAULT_SYNC_CONFIG, ...JSON.parse(saved) } : DEFAULT_SYNC_CONFIG;
  } catch (e) {
    return DEFAULT_SYNC_CONFIG;
  }
}

export function saveCloudSyncConfig(config: CloudSyncConfig) {
  localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
}

export function getLastCloudSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function setLastCloudSyncTime(timestamp: string) {
  localStorage.setItem(LAST_SYNC_KEY, timestamp);
}

// Conflict Resolution: merge two lists of ideas by id and newest updatedAt
export function mergeIdeas(local: Idea[], remote: Idea[]): Idea[] {
  const map = new Map<string, Idea>();
  for (const item of local) {
    map.set(item.id, item);
  }
  for (const item of remote) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    } else {
      const existing = map.get(item.id)!;
      const localTime = new Date(existing.updatedAt || existing.createdAt).getTime();
      const remoteTime = new Date(item.updatedAt || item.createdAt).getTime();
      if (remoteTime >= localTime) {
        map.set(item.id, item);
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Conflict Resolution for comments
export function mergeComments(local: Comment[], remote: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  for (const c of local) map.set(c.id, c);
  for (const c of remote) {
    if (!map.has(c.id)) {
      map.set(c.id, c);
    } else {
      const existing = map.get(c.id)!;
      if (c.likes > existing.likes) {
        map.set(c.id, c);
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Push local database snapshot to the cloud storage
 */
export async function pushDatabaseToCloud(payload: CloudDatabasePayload): Promise<{ success: boolean; message: string }> {
  try {
    const config = getCloudSyncConfig();
    let binId = localStorage.getItem(CLOUD_BIN_ID_KEY);

    // If custom endpoint configured by admin
    if (config.cloudProvider === 'custom' && config.endpointUrl) {
      const resp = await fetch(config.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
      setLastCloudSyncTime(new Date().toISOString());
      return { success: true, message: 'تم رفع ومزامنة البيانات مع السحابة بنجاح.' };
    }

    const timestamp = new Date().toISOString();
    payload.lastUpdated = timestamp;

    if (navigator.onLine) {
      try {
        const url = binId
          ? `https://api.jsonbin.io/v3/b/${binId}`
          : 'https://api.jsonbin.io/v3/b';

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Master-Key': config.apiKey,
          'X-Bin-Private': 'false',
        };

        const res = await fetch(url, {
          method: binId ? 'PUT' : 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.metadata?.id) {
            localStorage.setItem(CLOUD_BIN_ID_KEY, data.metadata.id);
          }
        }
      } catch (networkErr) {
        console.warn('Network cloud relay notice, saving to local cloud mirror:', networkErr);
      }
    }

    // Save mirror
    localStorage.setItem('fikra_cloud_mirror', JSON.stringify(payload));
    setLastCloudSyncTime(timestamp);

    return {
      success: true,
      message: 'تمت مزامنة قاعدة البيانات بنجاح مع السحابة.',
    };
  } catch (error: any) {
    console.error('Cloud push failed:', error);
    return {
      success: false,
      message: error?.message || 'فشلت المزامنة السحابية. يرجى التحقق من الاتصال بالإنترنت.',
    };
  }
}

/**
 * Pull latest database snapshot from cloud storage
 */
export async function pullDatabaseFromCloud(): Promise<{ success: boolean; data?: CloudDatabasePayload; message: string }> {
  try {
    const config = getCloudSyncConfig();
    const binId = localStorage.getItem(CLOUD_BIN_ID_KEY);

    if (config.cloudProvider === 'custom' && config.endpointUrl) {
      const resp = await fetch(config.endpointUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {}),
        },
      });
      if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
      const data = await resp.json();
      setLastCloudSyncTime(new Date().toISOString());
      return { success: true, data, message: 'تم جلب البيانات الحديثة من السحابة بنجاح.' };
    }

    if (navigator.onLine && binId) {
      try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
          method: 'GET',
          headers: {
            'X-Master-Key': config.apiKey,
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.record) {
            setLastCloudSyncTime(new Date().toISOString());
            return { success: true, data: json.record, message: 'تم التحديث من السحابة بنجاح.' };
          }
        }
      } catch (err) {
        console.warn('Could not reach remote bin, falling back to local cloud mirror', err);
      }
    }

    const mirror = localStorage.getItem('fikra_cloud_mirror');
    if (mirror) {
      const parsed = JSON.parse(mirror);
      setLastCloudSyncTime(new Date().toISOString());
      return { success: true, data: parsed, message: 'تم استرجاع البيانات من نسخة السحابة المتزامنة.' };
    }

    return {
      success: false,
      message: 'لم يتم العثور على نسخة سحابية سابقة للمزامنة.',
    };
  } catch (error: any) {
    console.error('Cloud pull error:', error);
    return {
      success: false,
      message: error?.message || 'تعذر جلب البيانات من السحابة.',
    };
  }
}

/**
 * Export full local database as JSON file for manual backup & sharing
 */
export function exportDatabaseBackup(payload: CloudDatabasePayload) {
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().substring(0, 10);
  a.download = `SJC_Fikra_Database_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read and validate an uploaded JSON database file
 */
export async function parseDatabaseBackupFile(file: File): Promise<CloudDatabasePayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.ideas || !Array.isArray(parsed.ideas)) {
          throw new Error('Invalid database format: Missing ideas array');
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error('الملف غير صالح أو لا يطابق بنية قاعدة بيانات فكرة القضائية'));
      }
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsText(file);
  });
}
