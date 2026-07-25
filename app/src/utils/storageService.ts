import type { Palette } from './constants';

export interface SavedState {
  id: number;
  name?: string;
  patternIdx: number;
  paletteIdx: number;
  seed: number;
  zoomLevel: number;
  fitMode: 'crop' | 'fit';
  isInverted: boolean;
}

export class StorageService {
  // ── CUSTOM COLOR PALETTES CRUD ──
  static getCustomPalettes(): Palette[] {
    try {
      const saved = localStorage.getItem('ws_custom_palettes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  static saveCustomPalette(palette: Palette): Palette[] {
    const validatedName = (palette.name || 'Unnamed Palette').trim().substring(0, 32);
    const validatedColors = palette.colors.map(c => /^#[0-9A-F]{6}$/i.test(c) ? c : '#ffffff');
    
    const current = this.getCustomPalettes();
    const updated = [...current, { name: validatedName, colors: validatedColors }];
    localStorage.setItem('ws_custom_palettes', JSON.stringify(updated));
    return updated;
  }

  static deleteCustomPalette(index: number): Palette[] {
    const current = this.getCustomPalettes();
    const updated = current.filter((_, idx) => idx !== index);
    localStorage.setItem('ws_custom_palettes', JSON.stringify(updated));
    return updated;
  }

  // ── WORKSPACE SNAPSHOTS HISTORY (FIFO QUEUE) ──
  static getHistory(): SavedState[] {
    try {
      const saved = localStorage.getItem('ws_workspace_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  static addHistoryItem(item: Omit<SavedState, 'id'>, maxLimit = 12): SavedState[] {
    const newItem: SavedState = {
      ...item,
      id: Date.now()
    };
    const current = this.getHistory();
    
    // Prevent duplicate sequential entries in history queue
    if (current.length > 0) {
      const last = current[0];
      if (
        last.patternIdx === item.patternIdx &&
        last.paletteIdx === item.paletteIdx &&
        last.seed === item.seed &&
        last.zoomLevel === item.zoomLevel &&
        last.fitMode === item.fitMode &&
        last.isInverted === item.isInverted
      ) {
        return current;
      }
    }
    const updated = [newItem, ...current.slice(0, maxLimit - 1)];
    localStorage.setItem('ws_workspace_history', JSON.stringify(updated));
    return updated;
  }

  static deleteHistoryItem(id: number): SavedState[] {
    const current = this.getHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem('ws_workspace_history', JSON.stringify(updated));
    return updated;
  }

  // ── PAGINATED CUSTOM CREATIONS CATALOG ──
  static getCreations(searchQuery = '', limit = 4, offset = 0): { items: SavedState[]; total: number } {
    try {
      const saved = localStorage.getItem('ws_custom_creations');
      const all: SavedState[] = saved ? JSON.parse(saved) : [];
      
      const filtered = all.filter(item => 
        !searchQuery || 
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      const items = filtered.slice(offset, offset + limit);
      return { items, total: filtered.length };
    } catch {
      return { items: [], total: 0 };
    }
  }

  static addCreation(item: Omit<SavedState, 'id'>): SavedState[] {
    const validatedName = (item.name || 'My Creation').trim().substring(0, 48);
    const newItem: SavedState = {
      ...item,
      id: Date.now(),
      name: validatedName
    };
    
    try {
      const saved = localStorage.getItem('ws_custom_creations');
      const all: SavedState[] = saved ? JSON.parse(saved) : [];
      const updated = [newItem, ...all];
      localStorage.setItem('ws_custom_creations', JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  static deleteCreation(id: number): SavedState[] {
    try {
      const saved = localStorage.getItem('ws_custom_creations');
      const all: SavedState[] = saved ? JSON.parse(saved) : [];
      const updated = all.filter(item => item.id !== id);
      localStorage.setItem('ws_custom_creations', JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  // ── BACKUP & DATA MIGRATION SERVICES ──
  static exportBackup(): string {
    const backup = {
      palettes: this.getCustomPalettes(),
      history: this.getHistory(),
      creations: this.getCreations('', 1000).items
    };
    return JSON.stringify(backup, null, 2);
  }

  static importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.palettes && Array.isArray(parsed.palettes)) {
        localStorage.setItem('ws_custom_palettes', JSON.stringify(parsed.palettes));
      }
      if (parsed.history && Array.isArray(parsed.history)) {
        localStorage.setItem('ws_workspace_history', JSON.stringify(parsed.history));
      }
      if (parsed.creations && Array.isArray(parsed.creations)) {
        localStorage.setItem('ws_custom_creations', JSON.stringify(parsed.creations));
      }
      return true;
    } catch {
      return false;
    }
  }
}
