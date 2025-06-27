import React, { useState, useEffect } from 'react';
import { Search, Trash2, X, Clock, Instagram, Facebook, Twitter, Linkedin, Youtube, MessageCircle, Smartphone } from 'lucide-react';
import { searchHistoryManager, SearchHistoryItem } from '../utils/searchHistory';

interface HistoryTabProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSearch: (platform: string, topic: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ 
  isOpen, 
  onClose, 
  onSelectSearch 
}) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    const historyData = searchHistoryManager.getHistory();
    setHistory(historyData);
  };

  const handleSelectItem = (item: SearchHistoryItem) => {
    onSelectSearch(item.platform, item.topic);
    onClose();
  };

  const handleRemoveItem = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    searchHistoryManager.removeItem(id);
    loadHistory();
  };

  const handleClearHistory = () => {
    searchHistoryManager.clearHistory();
    loadHistory();
    setShowConfirmClear(false);
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string }> = {
      instagram: { icon: Instagram, color: 'text-pink-500' },
      facebook: { icon: Facebook, color: 'text-blue-600' },
      twitter: { icon: Twitter, color: 'text-sky-500' },
      linkedin: { icon: Linkedin, color: 'text-blue-700' },
      youtube: { icon: Youtube, color: 'text-red-600' },
      whatsapp: { icon: MessageCircle, color: 'text-green-500' }
    };
    return icons[platform] || { icon: Smartphone, color: 'text-gray-500' };
  };

  const getPlatformName = (platform: string) => {
    const names: Record<string, string> = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      whatsapp: 'WhatsApp'
    };
    return names[platform] || platform;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Histórico de Pesquisas</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Fechar histórico"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma pesquisa ainda</h3>
              <p className="text-gray-500 text-center max-w-sm">
                Suas pesquisas recentes aparecerão aqui para facilitar o acesso rápido.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 group"
                >
                  {/* Search Icon */}
                  <div className="flex-shrink-0">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {(() => {
                        const platformData = getPlatformIcon(item.platform);
                        const IconComponent = platformData.icon;
                        return <IconComponent className={`w-4 h-4 ${platformData.color}`} />;
                      })()}
                      <span className="text-sm font-medium text-gray-600">
                        {getPlatformName(item.platform)}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium truncate mb-1">
                      {item.topic}
                    </p>
                    <p className="text-sm text-gray-500">
                      {searchHistoryManager.formatTimestamp(item.timestamp)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemoveItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 rounded-lg transition-all duration-200"
                    title="Remover do histórico"
                    aria-label="Remover item do histórico"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="border-t border-gray-100 p-6">
            {showConfirmClear ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Tem certeza que deseja limpar todo o histórico?
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Limpar Tudo
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Limpar histórico completo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
