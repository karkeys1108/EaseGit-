import React from 'react';

const colorMap = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-200 dark:ring-blue-900/50',
    hover: 'hover:shadow-blue-200/40 hover:dark:shadow-blue-900/20',
    badge: 'bg-blue-500 dark:bg-blue-600',
    badgeText: 'text-white'
  },
  green: {
    bg: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-200 dark:ring-emerald-900/50',
    hover: 'hover:shadow-emerald-200/40 hover:dark:shadow-emerald-900/20',
    badge: 'bg-emerald-500 dark:bg-emerald-600',
    badgeText: 'text-white'
  },
  purple: {
    bg: 'from-violet-500 to-violet-600',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-200 dark:ring-violet-900/50',
    hover: 'hover:shadow-violet-200/40 hover:dark:shadow-violet-900/20',
    badge: 'bg-violet-500 dark:bg-violet-600',
    badgeText: 'text-white'
  },
  amber: {
    bg: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-200 dark:ring-amber-900/50',
    hover: 'hover:shadow-amber-200/40 hover:dark:shadow-amber-900/20',
    badge: 'bg-amber-500 dark:bg-amber-600',
    badgeText: 'text-white'
  },
  rose: {
    bg: 'from-rose-500 to-rose-600',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    ring: 'ring-rose-200 dark:ring-rose-900/50',
    hover: 'hover:shadow-rose-200/40 hover:dark:shadow-rose-900/20',
    badge: 'bg-rose-500 dark:bg-rose-600',
    badgeText: 'text-white'
  },
};

const StatCard = ({ 
  icon, 
  title, 
  value, 
  color = 'blue', 
  subtitle = null,
  trend = null,
  onClick = null,
  badge = null
}) => {
  // Check if icon is provided, if not use a default or empty div
  const IconComponent = icon ? React.cloneElement(icon, { className: 'w-7 h-7' }) : <div className="w-7 h-7"></div>;
  
  const colors = colorMap[color] || colorMap.blue;
  
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div 
      className={`relative overflow-hidden group bg-white dark:bg-gray-800 rounded-2xl p-6 transition-all duration-500 shadow-lg border-0
        ${colors.hover} ${onClick ? 'cursor-pointer' : ''}
        hover:shadow-xl hover:-translate-y-1.5`}
      onClick={onClick}
    >
      {/* Badge in top-right corner */}
      {badge && (
        <div className="absolute top-0 right-0">
          <div className={`${colors.badge} ${colors.badgeText} px-3 py-1 rounded-bl-lg rounded-tr-2xl text-xs font-semibold uppercase tracking-wider shadow-sm`}>
            {badge}
          </div>
        </div>
      )}
      
      {/* Floating gradient dots background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-10 -left-10 w-20 h-20 rounded-full ${colors.bg.replace('from-', 'bg-').replace('to-', '')} opacity-10 blur-xl`}></div>
        <div className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full ${colors.bg.replace('from-', 'bg-').replace('to-', '')} opacity-10 blur-xl`}></div>
      </div>
      
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${colors.bg.replace('from-', 'bg-gradient-to-br from-').replace('to-', 'to-')} mix-blend-overlay`}></div>
      
      {/* Subtle border effect */}
      <div className="absolute inset-0 rounded-2xl border border-gray-200 dark:border-gray-700 opacity-50"></div>
      
      <div className="relative flex flex-col h-full z-10">
        {/* Icon with floating effect */}
        <div className={`w-16 h-16 rounded-2xl ${colors.iconBg} ${colors.iconColor} flex items-center justify-center mx-auto mb-5 ${colors.ring} ring-4 ring-opacity-30
          transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-md`}>
          <div className="text-3xl">
            {IconComponent}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex flex-col flex-grow justify-center text-center space-y-1">
          {/* Value */}
          <div className="flex items-end justify-center space-x-2">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(value)}</h3>
            {trend && (
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full mb-1 ${trend.positive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          
          {/* Title and subtitle */}
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title || 'Stat'}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
