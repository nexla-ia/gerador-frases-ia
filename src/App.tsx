import React, { useState } from 'react';
import { useEffect } from 'react';
import { ChevronDown, Sparkles, Copy, Loader2, CheckCircle, AlertCircle, Check, AlertTriangle, Instagram, Facebook, Twitter, Linkedin, Youtube, MessageCircle } from 'lucide-react';
import { UserStatusDisplay } from './components/UserStatusDisplay';
import { HistoryTab } from './components/HistoryTab';
import { PrivateBrowsingBlocker } from './components/PrivateBrowsingBlocker';
import { userTracker, UserStatus } from './utils/userTracking';
import { searchHistoryManager } from './utils/searchHistory';
import { deviceDetector } from './utils/deviceDetector';

interface Platform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const platforms: Platform[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-sky-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
];

// Webhook utilizado para gerar as legendas
const WEBHOOK_URL = 'https://n8n.nexladesenvolvimento.com.br/webhook/frase';

function App() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [generatedCaption, setGeneratedCaption] = useState<string>('');
  const [editableCaption, setEditableCaption] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showCaption, setShowCaption] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [showHistoryTab, setShowHistoryTab] = useState<boolean>(false);

  // Atualiza o status do usuário quando o componente monta e a cada minuto
  useEffect(() => {
    // Log do dispositivo para auditoria
    const deviceInfo = deviceDetector.detectDevice();
    console.log('📱 Informações do dispositivo:', {
      tipo: deviceInfo.deviceType,
      tela: deviceInfo.screenSize,
      bloqueioDesativado: deviceInfo.isMobile || deviceInfo.isTablet
    });
    
    const updateUserStatus = () => {
      const status = userTracker.getUserStatus();
      setUserStatus(status);
    };

    updateUserStatus();
    const interval = setInterval(updateUserStatus, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  const handleGenerateCaption = async () => {
    if (!selectedPlatform || !topic.trim()) {
      setError('Por favor, selecione uma plataforma e digite um tópico');
      return;
    }

    // Verifica se o usuário pode fazer um pedido
    if (!userTracker.canMakeRequest()) {
      setError('Você atingiu o limite de 5 pedidos gratuitos. Aguarde o reset do período.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      // Registra o pedido antes de fazer a requisição
      if (!userTracker.recordRequest()) {
        throw new Error('Não foi possível registrar o pedido');
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          topic: topic.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar legenda');
      }

      const caption = await response.text();
      setGeneratedCaption(caption);
      setEditableCaption(caption);
      setShowCaption(true);
      setSuccess('Legenda gerada com sucesso!');
      
      // Adiciona ao histórico de pesquisas
      searchHistoryManager.addSearch(selectedPlatform, topic.trim(), caption);
      
      // Atualiza o status do usuário após o pedido
      const newStatus = userTracker.getUserStatus();
      setUserStatus(newStatus);
    } catch (err) {
      setError('Falha ao gerar legenda. Tente novamente.');
      console.error('Erro ao gerar legenda:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = async () => {
    if (!editableCaption.trim()) {
      setError('Não há texto para copiar');
      return;
    }

    setIsCopying(true);
    setError('');
    setSuccess('');
    setCopySuccess(false);

    try {
      // Verifica se a API Clipboard está disponível
      if (!navigator.clipboard) {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = editableCaption.trim();
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Falha ao copiar texto');
        }
      } else {
        // Usa a API moderna do Clipboard
        await navigator.clipboard.writeText(editableCaption.trim());
      }

      setCopySuccess(true);
      setSuccess('Texto copiado para a área de transferência!');
      
      // Remove o feedback de sucesso após 3 segundos
      setTimeout(() => {
        setCopySuccess(false);
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Erro ao copiar texto. Tente novamente ou copie manualmente.');
      console.error('Erro ao copiar texto:', err);
    } finally {
      setIsCopying(false);
    }
  };

  const handleSelectFromHistory = (platform: string, topic: string) => {
    setSelectedPlatform(platform);
    setTopic(topic);
    setShowHistoryTab(false);
  };

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  return (
    <PrivateBrowsingBlocker>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Canto Superior Direito */}
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-color-shift"></div>
          
          {/* Canto Inferior Esquerdo */}
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-color-shift-delayed"></div>
          
          {/* Canto Superior Esquerdo */}
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-color-shift-alt"></div>
          
          {/* Canto Inferior Direito */}
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-color-shift-alt-delayed"></div>
        </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">Gerador de Conteúdo com IA</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gerador de Legendas para Redes Sociais
            </h1>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              Crie legendas e descrições envolventes para suas redes sociais com IA. Selecione sua plataforma, digite um tópico e deixe a IA criar a legenda perfeita.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Logo NEXLA como marca d'água na linha da caixa do meio */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img 
                src="/full_trimmed_transparent_customcolor (4).png" 
                alt="NEXLA Background Logo" 
                className="w-96 h-96 opacity-[0.03] select-none animate-pulse-slow"
              />
            </div>
            
            {/* User Status Display */}
            {userStatus && <UserStatusDisplay userStatus={userStatus} />}

            {/* Platform Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Selecionar Plataforma
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-slate-700/70"
                >
                  <div className="flex items-center justify-between">
                    {selectedPlatformData ? (
                      <div className="flex items-center gap-3">
                        <selectedPlatformData.icon className={`w-5 h-5 ${selectedPlatformData.color}`} />
                        <span>{selectedPlatformData.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Escolha uma plataforma...</span>
                    )}
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-20 w-full mt-2 bg-slate-700 border border-slate-600/50 rounded-xl shadow-xl overflow-hidden">
                    {platforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => {
                          setSelectedPlatform(platform.id);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-600/50 transition-colors duration-150 flex items-center gap-3"
                      >
                        <platform.icon className={`w-5 h-5 ${platform.color}`} />
                        <span className="text-white">{platform.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Topic Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Tópico da Legenda
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Sobre o que você quer criar uma legenda?"
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
              
              {/* History Button */}
              <button
                onClick={() => setShowHistoryTab(true)}
                className="mt-3 flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver histórico de pesquisas
              </button>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateCaption}
              disabled={isGenerating || !selectedPlatform || !topic.trim() || (userStatus?.isBlocked ?? false)}
              className={`w-full font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                userStatus?.isBlocked
                  ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando Legenda...
                </>
              ) : userStatus?.isBlocked ? (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  Limite Atingido
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Legenda
                </>
              )}
            </button>

            {/* Generated Caption Section */}
            {showCaption && (
              <div className="mt-8 animate-fadeIn">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Legenda Gerada (Edite conforme necessário)
                </label>
                <textarea
                  value={editableCaption}
                  onChange={(e) => setEditableCaption(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
                  rows={6}
                  placeholder="Sua legenda gerada aparecerá aqui..."
                  aria-label="Texto gerado editável"
                />

                {/* Copy Button */}
                <button
                  onClick={handleCopyText}
                  disabled={isCopying || !editableCaption.trim()}
                  className={`w-full mt-4 font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                    copySuccess 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white'
                  }`}
                  aria-label={copySuccess ? 'Texto copiado com sucesso' : 'Copiar texto para área de transferência'}
                  title={copySuccess ? 'Texto copiado!' : 'Copiar texto'}
                >
                  {isCopying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Copiando...
                    </>
                  ) : copySuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      Texto Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copiar Texto
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Success/Error Messages */}
            {success && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 animate-fadeIn">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">{success}</span>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="space-y-4">
              {/* Status do usuário */}
              <p className="text-slate-500 text-sm">
                {userStatus ? `${userStatus.remainingRequests} pedidos gratuitos restantes` : 'Carregando...'}
              </p>
              
              {/* Branding NEXLA */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/30 border border-slate-700/30 rounded-full">
                    <img 
                      src="/icon_trimmed_transparent_customcolor (1).png" 
                      alt="NEXLA Logo" 
                      className="w-6 h-6 hover:scale-110 transition-transform duration-300"
                    />
                    <span className="text-sm font-medium text-slate-300">
                      Desenvolvido pela <span className="text-blue-400 font-semibold">NEXLA</span>
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-slate-500">
                  Automação e Inteligência Artificial
                </div>
                
                {/* Instagram */}
                <a 
                  href="https://instagram.com/nexla_ia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-pink-400 transition-colors duration-200 group"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm">@nexla_ia</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        </div>
        
        {/* History Tab */}
        <HistoryTab
          isOpen={showHistoryTab}
          onClose={() => setShowHistoryTab(false)}
          onSelectSearch={handleSelectFromHistory}
        />
      </div>
    </PrivateBrowsingBlocker>
  );
}

export default App;
