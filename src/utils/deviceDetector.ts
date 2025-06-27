interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  userAgent: string;
  screenSize: string;
  timestamp: number;
}

interface AuditLog {
  id: string;
  timestamp: number;
  deviceInfo: DeviceInfo;
  action: 'access_granted' | 'security_bypassed' | 'blocked';
  reason: string;
  sessionId: string;
}

class DeviceDetector {
  private readonly AUDIT_STORAGE_KEY = 'device_audit_logs';
  private readonly MAX_AUDIT_LOGS = 100;

  /**
   * Detecta se o dispositivo é móvel ou tablet
   */
  public detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    // Padrões para detecção de dispositivos móveis
    const mobilePatterns = [
      /android.*mobile/,
      /iphone/,
      /ipod/,
      /blackberry/,
      /windows phone/,
      /mobile/,
      /webos/,
      /opera mini/,
      /iemobile/,
      /mobile safari/,
      /fennec/
    ];

    // Padrões para detecção de tablets
    const tabletPatterns = [
      /ipad/,
      /android(?!.*mobile)/,
      /tablet/,
      /kindle/,
      /silk/,
      /playbook/,
      /bb10/
    ];

    // Verifica se é tablet
    const isTablet = tabletPatterns.some(pattern => pattern.test(userAgent)) ||
                    (screenWidth >= 768 && screenWidth <= 1024 && 'ontouchstart' in window);

    // Verifica se é mobile (mas não tablet)
    const isMobile = !isTablet && (
      mobilePatterns.some(pattern => pattern.test(userAgent)) ||
      (screenWidth <= 768 && 'ontouchstart' in window) ||
      ('orientation' in window && screenWidth <= 896)
    );

    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (isTablet) deviceType = 'tablet';
    else if (isMobile) deviceType = 'mobile';

    const deviceInfo: DeviceInfo = {
      isMobile,
      isTablet,
      deviceType,
      userAgent: navigator.userAgent,
      screenSize: `${screenWidth}x${screenHeight}`,
      timestamp: Date.now()
    };

    // Log da detecção
    this.logDeviceAccess(deviceInfo);

    return deviceInfo;
  }

  /**
   * Verifica se deve pular o bloqueio de segurança
   */
  public shouldBypassSecurity(): boolean {
    const deviceInfo = this.detectDevice();
    const shouldBypass = deviceInfo.isMobile || deviceInfo.isTablet;

    if (shouldBypass) {
      this.addAuditLog({
        action: 'security_bypassed',
        reason: `Dispositivo ${deviceInfo.deviceType} detectado - bloqueio de segurança desativado`,
        deviceInfo
      });
    }

    return shouldBypass;
  }

  /**
   * Registra acesso do dispositivo
   */
  private logDeviceAccess(deviceInfo: DeviceInfo): void {
    console.log('🔍 Dispositivo detectado:', {
      tipo: deviceInfo.deviceType,
      tela: deviceInfo.screenSize,
      timestamp: new Date(deviceInfo.timestamp).toLocaleString('pt-BR')
    });
  }

  /**
   * Adiciona log de auditoria
   */
  private addAuditLog(logData: Omit<AuditLog, 'id' | 'timestamp' | 'sessionId'>): void {
    try {
      const auditLog: AuditLog = {
        id: this.generateId(),
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        ...logData
      };

      const logs = this.getAuditLogs();
      logs.unshift(auditLog);

      // Mantém apenas os últimos logs
      const trimmedLogs = logs.slice(0, this.MAX_AUDIT_LOGS);
      
      localStorage.setItem(this.AUDIT_STORAGE_KEY, JSON.stringify(trimmedLogs));

      console.log('📋 Log de auditoria:', {
        acao: auditLog.action,
        motivo: auditLog.reason,
        dispositivo: auditLog.deviceInfo.deviceType
      });
    } catch (error) {
      console.error('Erro ao salvar log de auditoria:', error);
    }
  }

  /**
   * Obtém logs de auditoria
   */
  public getAuditLogs(): AuditLog[] {
    try {
      const stored = localStorage.getItem(this.AUDIT_STORAGE_KEY);
      if (!stored) return [];

      const logs: AuditLog[] = JSON.parse(stored);
      
      // Remove logs muito antigos (mais de 7 dias)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const filteredLogs = logs.filter(log => log.timestamp > sevenDaysAgo);

      if (filteredLogs.length !== logs.length) {
        localStorage.setItem(this.AUDIT_STORAGE_KEY, JSON.stringify(filteredLogs));
      }

      return filteredLogs;
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas de acesso
   */
  public getAccessStats() {
    const logs = this.getAuditLogs();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs = logs.filter(log => log.timestamp >= today.getTime());
    const deviceTypes = logs.reduce((acc, log) => {
      const type = log.deviceInfo.deviceType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const securityBypasses = logs.filter(log => log.action === 'security_bypassed').length;

    return {
      totalAccess: logs.length,
      todayAccess: todayLogs.length,
      deviceTypes,
      securityBypasses,
      lastAccess: logs.length > 0 ? logs[0].timestamp : null
    };
  }

  /**
   * Limpa logs de auditoria
   */
  public clearAuditLogs(): void {
    localStorage.removeItem(this.AUDIT_STORAGE_KEY);
  }

  /**
   * Gera ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Obtém ID da sessão
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('device_session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('device_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Formata timestamp para exibição
   */
  public formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Exporta instância singleton
export const deviceDetector = new DeviceDetector();
export type { DeviceInfo, AuditLog };