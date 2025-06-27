interface UserSession {
  userId: string;
  firstAccess: number;
  requestCount: number;
  lastRequest: number;
}

interface UserStatus {
  remainingRequests: number;
  timeRemaining: number; // em milissegundos
  isBlocked: boolean;
  resetTime: number;
}

class UserTrackingSystem {
  private readonly STORAGE_KEY = 'social_media_user_session';
  private readonly MAX_FREE_REQUESTS = 5;
  private readonly SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 horas em ms

  /**
   * Gera um identificador único baseado em características do dispositivo/navegador
   */
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      canvas.toDataURL(),
      navigator.platform,
      navigator.cookieEnabled
    ].join('|');

    // Gera um hash simples do fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converte para 32bit integer
    }
    
    return Math.abs(hash).toString(36) + Date.now().toString(36);
  }

  /**
   * Obtém ou cria uma sessão de usuário
   */
  private getUserSession(): UserSession {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (stored) {
      try {
        const session: UserSession = JSON.parse(stored);
        
        // Verifica se a sessão expirou (12 horas)
        const now = Date.now();
        if (now - session.firstAccess > this.SESSION_DURATION) {
          // Sessão expirou, cria uma nova
          return this.createNewSession();
        }
        
        return session;
      } catch (error) {
        console.error('Erro ao parsear sessão do usuário:', error);
        return this.createNewSession();
      }
    }
    
    return this.createNewSession();
  }

  /**
   * Cria uma nova sessão de usuário
   */
  private createNewSession(): UserSession {
    const now = Date.now();
    const session: UserSession = {
      userId: this.generateDeviceFingerprint(),
      firstAccess: now,
      requestCount: 0,
      lastRequest: 0
    };
    
    this.saveSession(session);
    return session;
  }

  /**
   * Salva a sessão no localStorage
   */
  private saveSession(session: UserSession): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Erro ao salvar sessão do usuário:', error);
    }
  }

  /**
   * Verifica se o usuário pode fazer um novo pedido
   */
  public canMakeRequest(): boolean {
    const session = this.getUserSession();
    const now = Date.now();
    
    // Verifica se a sessão expirou
    if (now - session.firstAccess > this.SESSION_DURATION) {
      // Sessão expirou, reinicia o contador
      const newSession = this.createNewSession();
      return newSession.requestCount < this.MAX_FREE_REQUESTS;
    }
    
    return session.requestCount < this.MAX_FREE_REQUESTS;
  }

  /**
   * Registra um novo pedido
   */
  public recordRequest(): boolean {
    if (!this.canMakeRequest()) {
      return false;
    }
    
    const session = this.getUserSession();
    session.requestCount += 1;
    session.lastRequest = Date.now();
    
    this.saveSession(session);
    return true;
  }

  /**
   * Obtém o status atual do usuário
   */
  public getUserStatus(): UserStatus {
    const session = this.getUserSession();
    const now = Date.now();
    
    // Verifica se a sessão expirou
    if (now - session.firstAccess > this.SESSION_DURATION) {
      // Sessão expirou, retorna status limpo
      return {
        remainingRequests: this.MAX_FREE_REQUESTS,
        timeRemaining: this.SESSION_DURATION,
        isBlocked: false,
        resetTime: now + this.SESSION_DURATION
      };
    }
    
    const remainingRequests = Math.max(0, this.MAX_FREE_REQUESTS - session.requestCount);
    const timeRemaining = this.SESSION_DURATION - (now - session.firstAccess);
    const isBlocked = remainingRequests === 0;
    const resetTime = session.firstAccess + this.SESSION_DURATION;
    
    return {
      remainingRequests,
      timeRemaining,
      isBlocked,
      resetTime
    };
  }

  /**
   * Obtém informações detalhadas da sessão (para debug)
   */
  public getSessionInfo(): UserSession & { sessionAge: number } {
    const session = this.getUserSession();
    return {
      ...session,
      sessionAge: Date.now() - session.firstAccess
    };
  }

  /**
   * Força o reset da sessão (para testes)
   */
  public resetSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Formata tempo restante em formato legível
   */
  public formatTimeRemaining(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}

// Exporta uma instância singleton
export const userTracker = new UserTrackingSystem();
export type { UserStatus, UserSession };