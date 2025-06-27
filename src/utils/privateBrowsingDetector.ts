interface DetectionResult {
  isPrivate: boolean;
  detectionMethods: string[];
  confidence: number;
  acceptLanguage?: string;
}

class PrivateBrowsingDetector {
  private detectionResults: DetectionResult = {
    isPrivate: false,
    detectionMethods: [],
    confidence: 0
  };

  /**
   * Executa detecção completa de navegação privada
   */
  public async detectPrivateBrowsing(): Promise<DetectionResult> {
    const methods: Array<() => Promise<boolean>> = [
      this.detectViaAcceptLanguage.bind(this),
      this.detectViaLocalStorage.bind(this),
      this.detectViaIndexedDB.bind(this),
      this.detectViaQuotaAPI.bind(this),
      this.detectViaWebRTC.bind(this),
      this.detectViaRequestFileSystem.bind(this),
      this.detectViaCanvas.bind(this),
      this.detectViaBatteryAPI.bind(this)
    ];

    const results = await Promise.allSettled(methods.map(method => method()));
    const detectedMethods: string[] = [];
    let positiveDetections = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        positiveDetections++;
        detectedMethods.push(this.getMethodName(index));
      }
    });

    // Calcula confiança baseada no número de métodos que detectaram
    // Accept-language tem peso maior na detecção
    const acceptLanguageDetected = detectedMethods.includes('acceptLanguage');
    const confidence = acceptLanguageDetected 
      ? Math.max(75, (positiveDetections / methods.length) * 100)
      : (positiveDetections / methods.length) * 100;
    
    const isPrivate = acceptLanguageDetected || confidence >= 50;

    this.detectionResults = {
      isPrivate,
      detectionMethods: detectedMethods,
      confidence,
      acceptLanguage: navigator.language + (navigator.languages ? ',' + navigator.languages.slice(1).join(',') : '')
    };

    return this.detectionResults;
  }

  /**
   * Detecção via Accept-Language header pattern (método principal)
   */
  private async detectViaAcceptLanguage(): Promise<boolean> {
    try {
      // Simula o header accept-language baseado nas configurações do navegador
      const languages = navigator.languages || [navigator.language];
      const language = navigator.language;
      
      // Constrói uma string similar ao header accept-language
      let acceptLanguageString = '';
      
      if (languages.length > 0) {
        acceptLanguageString = languages[0];
        
        // Adiciona qualidade (q) para idiomas adicionais
        for (let i = 1; i < languages.length; i++) {
          const quality = Math.max(0.1, 1 - (i * 0.1)).toFixed(1);
          acceptLanguageString += `,${languages[i]};q=${quality}`;
        }
      } else {
        acceptLanguageString = language || 'en-US';
      }

      // Critério principal: verifica se é muito enxuto (menos de 30 caracteres)
      if (acceptLanguageString.length < 30) {
        // Verifica se não contém "en" ou "en-US" (indicativo de configuração limitada)
        if (!acceptLanguageString.includes('en')) {
          return true;
        }
      }

      // Verifica padrões específicos de navegação anônima
      const suspiciousPatterns = [
        /^[a-z]{2}-[A-Z]{2},[a-z]{2};q=0\.9$/,  // pt-BR,pt;q=0.9
        /^[a-z]{2}-[A-Z]{2}$/,                   // pt-BR apenas
        /^en-US$/,                               // en-US apenas
        /^[a-z]{2}$/                             // pt apenas
      ];

      const isSuspicious = suspiciousPatterns.some(pattern => 
        pattern.test(acceptLanguageString)
      );

      if (isSuspicious) {
        return true;
      }

      // Verifica se há discrepância entre language e languages
      if (languages.length === 1 && language === languages[0]) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Detecção via LocalStorage
   */
  private async detectViaLocalStorage(): Promise<boolean> {
    try {
      const testKey = 'pb_test_' + Date.now();
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return false;
    } catch (e) {
      return true;
    }
  }

  /**
   * Detecção via IndexedDB
   */
  private async detectViaIndexedDB(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('pb_test_db', 1);
        
        request.onerror = () => resolve(true);
        request.onsuccess = () => {
          try {
            request.result.close();
            indexedDB.deleteDatabase('pb_test_db');
            resolve(false);
          } catch (e) {
            resolve(true);
          }
        };
        
        setTimeout(() => resolve(true), 1000);
      } catch (e) {
        resolve(true);
      }
    });
  }

  /**
   * Detecção via Quota API
   */
  private async detectViaQuotaAPI(): Promise<boolean> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota && estimate.quota < 120000000) {
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Detecção via WebRTC
   */
  private async detectViaWebRTC(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const rtc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        rtc.createDataChannel('test');
        rtc.createOffer()
          .then(() => resolve(false))
          .catch(() => resolve(true));
          
        setTimeout(() => resolve(false), 2000);
      } catch (e) {
        resolve(true);
      }
    });
  }

  /**
   * Detecção via RequestFileSystem (Chrome específico)
   */
  private async detectViaRequestFileSystem(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // @ts-ignore - API específica do Chrome
        if (window.webkitRequestFileSystem) {
          // @ts-ignore
          window.webkitRequestFileSystem(
            window.TEMPORARY,
            1024,
            () => resolve(false),
            () => resolve(true)
          );
        } else {
          resolve(false);
        }
      } catch (e) {
        resolve(false);
      }
    });
  }

  /**
   * Detecção via Canvas Fingerprinting
   */
  private async detectViaCanvas(): Promise<boolean> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return false;
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Private browsing test 🔒', 2, 15);
      
      const imageData = canvas.toDataURL();
      
      if (imageData.length < 100 || imageData === 'data:,') {
        return true;
      }
      
      return false;
    } catch (e) {
      return true;
    }
  }

  /**
   * Detecção via Battery API
   */
  private async detectViaBatteryAPI(): Promise<boolean> {
    try {
      // @ts-ignore - API experimental
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery();
        return !battery;
      }
      return false;
    } catch (e) {
      return true;
    }
  }

  /**
   * Obtém nome do método de detecção
   */
  private getMethodName(index: number): string {
    const methods = [
      'acceptLanguage',
      'localStorage',
      'indexedDB', 
      'quotaAPI',
      'webRTC',
      'requestFileSystem',
      'canvas',
      'batteryAPI'
    ];
    return methods[index] || 'unknown';
  }

  /**
   * Obtém resultado da última detecção
   */
  public getLastResult(): DetectionResult {
    return this.detectionResults;
  }

  /**
   * Verifica se está em modo privado
   */
  public isPrivate(): boolean {
    return this.detectionResults.isPrivate;
  }

  /**
   * Força nova detecção
   */
  public async redetect(): Promise<boolean> {
    const result = await this.detectPrivateBrowsing();
    return result.isPrivate;
  }

  /**
   * Simula resposta de API para casos bloqueados
   */
  public getBlockedResponse() {
    return {
      status: "blocked",
      message: "O acesso via navegação anônima está desativado por motivos de segurança. Por favor, abra o site em uma guia normal."
    };
  }
}

// Exporta instância singleton
export const privateBrowsingDetector = new PrivateBrowsingDetector();
export type { DetectionResult };