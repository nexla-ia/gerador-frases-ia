import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, RefreshCw, Eye, Lock, HelpCircle } from 'lucide-react';
import { privateBrowsingDetector, DetectionResult } from '../utils/privateBrowsingDetector';
import { deviceDetector } from '../utils/deviceDetector';

interface PrivateBrowsingBlockerProps {
  children: React.ReactNode;
}

export const PrivateBrowsingBlocker: React.FC<PrivateBrowsingBlockerProps> = ({ children }) => {
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    // Verifica se é dispositivo móvel primeiro
    const shouldBypass = deviceDetector.shouldBypassSecurity();
    setIsMobileDevice(shouldBypass);
    
    if (shouldBypass) {
      // Se é móvel, pula a verificação de navegação privada
      setDetectionResult({ isPrivate: false, detectionMethods: [], confidence: 0 });
      setIsChecking(false);
      return;
    }
    
    checkPrivateBrowsing();
    
    // Verifica periodicamente
    const interval = setInterval(checkPrivateBrowsing, 30000); // A cada 30 segundos
    
    // Verifica quando a janela ganha foco
    const handleFocus = () => {
      setTimeout(checkPrivateBrowsing, 1000);
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const checkPrivateBrowsing = async () => {
    // Se é dispositivo móvel, não verifica navegação privada
    if (isMobileDevice) {
      setDetectionResult({ isPrivate: false, detectionMethods: [], confidence: 0 });
      setIsChecking(false);
      return;
    }
    
    setIsChecking(true);
    try {
      const result = await privateBrowsingDetector.detectPrivateBrowsing();
      setDetectionResult(result);
      
      if (result.isPrivate) {
        console.warn('🚫 Navegação anônima detectada:', result);
      } else {
        console.log('✅ Navegação normal detectada');
      }
    } catch (error) {
      console.error('Erro na detecção de navegação privada:', error);
      // Em caso de erro, permite acesso
      setDetectionResult({ isPrivate: false, detectionMethods: [], confidence: 0 });
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetry = () => {
    checkPrivateBrowsing();
  };

  // Se ainda está verificando, mostra loading
  if (isChecking && !detectionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Verificando modo de navegação...</p>
        </div>
      </div>
    );
  }

  // Se detectou modo privado, bloqueia acesso
  if (detectionResult?.isPrivate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
        {/* Overlay que bloqueia interações */}
        <div className="fixed inset-0 bg-black/50 z-40" />
        
        <div className="relative z-50 max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Acesso Restrito
              </h1>
              <p className="text-red-100">
                Navegação anônima detectada
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <p className="text-gray-800 leading-relaxed">
                  <strong>O acesso via navegação anônima está desativado por motivos de segurança.</strong> Por favor, abra o site em uma guia normal. Para sua segurança e melhor experiência, feche esta janela e acesse novamente utilizando uma guia normal do navegador.
                </p>
              </div>

              {/* Instruções */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Segurança</h3>
                  <p className="text-sm text-gray-600">
                    Proteção contra uso inadequado
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Eye className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Rastreamento</h3>
                  <p className="text-sm text-gray-600">
                    Necessário para funcionalidade
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Lock className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Controle</h3>
                  <p className="text-sm text-gray-600">
                    Limite de uso por usuário
                  </p>
                </div>
              </div>

              {/* Como acessar */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Como acessar corretamente:
                </h3>
                <ol className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    Feche esta janela/aba anônima
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    Abra uma nova janela normal do navegador
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    Acesse o site novamente
                  </li>
                </ol>
              </div>

              {/* Atalhos do navegador */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-800 text-sm mb-1">Chrome</div>
                  <div className="text-xs text-gray-600">Ctrl+N</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-800 text-sm mb-1">Firefox</div>
                  <div className="text-xs text-gray-600">Ctrl+N</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-800 text-sm mb-1">Safari</div>
                  <div className="text-xs text-gray-600">Cmd+N</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-800 text-sm mb-1">Edge</div>
                  <div className="text-xs text-gray-600">Ctrl+N</div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRetry}
                  disabled={isChecking}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Verificar Novamente
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes Técnicos'}
                </button>
              </div>

              {/* Detalhes técnicos */}
              {showDetails && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Informações do Sistema:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Status:</strong> Acesso bloqueado</p>
                    <p><strong>Timestamp:</strong> {new Date().toLocaleString('pt-BR')}</p>
                    <p><strong>Navegador:</strong> {navigator.userAgent.split(' ')[0]}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 text-center">
              <p className="text-xs text-gray-500">
                Esta verificação é necessária para garantir a segurança e funcionalidade do sistema
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se não está em modo privado, renderiza o conteúdo normal
  return <>{children}</>;
};
