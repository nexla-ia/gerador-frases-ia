interface SearchHistoryItem {
  id: string;
  platform: string;
  topic: string;
  timestamp: number;
  caption?: string;
}

class SearchHistoryManager {
  private readonly STORAGE_KEY = 'social_media_search_history';
  private readonly MAX_HISTORY_ITEMS = 25;

  /**
   * Adiciona uma nova pesquisa ao histórico
   */
  public addSearch(platform: string, topic: string, caption?: string): void {
    const historyItem: SearchHistoryItem = {
      id: this.generateId(),
      platform,
      topic: topic.trim(),
      timestamp: Date.now(),
      caption
    };

    const history = this.getHistory();
    
    // Remove duplicatas baseadas em platform + topic
    const filteredHistory = history.filter(
      item => !(item.platform === platform && item.topic.toLowerCase() === topic.toLowerCase())
    );

    // Adiciona o novo item no início
    filteredHistory.unshift(historyItem);

    // Mantém apenas os últimos 25 itens
    const trimmedHistory = filteredHistory.slice(0, this.MAX_HISTORY_ITEMS);

    this.saveHistory(trimmedHistory);
  }

  /**
   * Obtém todo o histórico de pesquisas
   */
  public getHistory(): SearchHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const history: SearchHistoryItem[] = JSON.parse(stored);
      
      // Filtra itens muito antigos (mais de 30 dias)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const filteredHistory = history.filter(item => item.timestamp > thirtyDaysAgo);

      // Se houve filtragem, salva a versão limpa
      if (filteredHistory.length !== history.length) {
        this.saveHistory(filteredHistory);
      }

      return filteredHistory;
    } catch (error) {
      console.error('Erro ao carregar histórico de pesquisas:', error);
      return [];
    }
  }

  /**
   * Busca no histórico por termo
   */
  public searchHistory(searchTerm: string): SearchHistoryItem[] {
    const history = this.getHistory();
    const term = searchTerm.toLowerCase().trim();

    if (!term) return history;

    return history.filter(item => 
      item.topic.toLowerCase().includes(term) ||
      item.platform.toLowerCase().includes(term) ||
      (item.caption && item.caption.toLowerCase().includes(term))
    );
  }

  /**
   * Remove um item específico do histórico
   */
  public removeItem(id: string): void {
    const history = this.getHistory();
    const filteredHistory = history.filter(item => item.id !== id);
    this.saveHistory(filteredHistory);
  }

  /**
   * Limpa todo o histórico
   */
  public clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Obtém estatísticas do histórico
   */
  public getStats() {
    const history = this.getHistory();
    const platforms = new Set(history.map(item => item.platform));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySearches = history.filter(item => item.timestamp >= today.getTime());

    return {
      totalSearches: history.length,
      uniquePlatforms: platforms.size,
      todaySearches: todaySearches.length,
      oldestSearch: history.length > 0 ? Math.min(...history.map(item => item.timestamp)) : null,
      newestSearch: history.length > 0 ? Math.max(...history.map(item => item.timestamp)) : null
    };
  }

  /**
   * Formata timestamp para exibição
   */
  public formatTimestamp(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Menos de 1 minuto
    if (diff < 60000) {
      return 'Agora mesmo';
    }
    
    // Menos de 1 hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} min atrás`;
    }
    
    // Menos de 24 horas
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h atrás`;
    }
    
    // Menos de 7 dias
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    }
    
    // Mais de 7 dias - mostra data
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }

  /**
   * Gera ID único para item do histórico
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Salva histórico no localStorage
   */
  private saveHistory(history: SearchHistoryItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico de pesquisas:', error);
    }
  }
}

// Exporta instância singleton
export const searchHistoryManager = new SearchHistoryManager();
export type { SearchHistoryItem };
