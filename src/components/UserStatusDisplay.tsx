import React from 'react';
import { Clock, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { UserStatus, userTracker } from '../utils/userTracking';

interface UserStatusDisplayProps {
  userStatus: UserStatus;
}

export const UserStatusDisplay: React.FC<UserStatusDisplayProps> = ({ userStatus }) => {
  const { remainingRequests, timeRemaining, isBlocked } = userStatus;
  
  const formatTime = (ms: number) => userTracker.formatTimeRemaining(ms);
  
  return (
    <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-slate-300">Status do Usuário</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pedidos Restantes */}
        <div className="flex items-center gap-3">
          {isBlocked ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
          <div>
            <p className="text-xs text-slate-400">Pedidos Gratuitos</p>
            <p className={`text-sm font-medium ${isBlocked ? 'text-red-300' : 'text-green-300'}`}>
              {remainingRequests} de 5 restantes
            </p>
          </div>
        </div>
        
        {/* Tempo Restante */}
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-xs text-slate-400">Tempo para Reset</p>
            <p className="text-sm font-medium text-blue-300">
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      </div>
      
      {isBlocked && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-300">
            Você atingiu o limite de 5 pedidos gratuitos.
            Aguarde {formatTime(timeRemaining)} para fazer novos pedidos.
          </p>
        </div>
      )}
    </div>
  );
};
