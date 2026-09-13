import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const MetricCard = ({ icon: Icon, label, value, change, changeLabel }) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  return (
    <Card>
      <div className="flex items-start">
        <div className="p-3 rounded-lg bg-slate-700/50 text-emerald-400 mr-4">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-slate-400">{label}</h4>
          <div className="mt-1 flex items-baseline">
            <span className="text-2xl font-bold text-slate-100">{value}</span>
          </div>
          {change !== undefined && change !== null && (
            <div className="mt-2 flex items-center text-sm">
              <span className={`flex items-center font-medium ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400'}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : isNegative ? <ArrowDownRight className="w-4 h-4 mr-1" /> : null}
                {Math.abs(change)}%
              </span>
              {changeLabel && <span className="ml-2 text-slate-500">{changeLabel}</span>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
