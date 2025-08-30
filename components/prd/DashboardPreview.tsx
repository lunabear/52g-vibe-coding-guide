'use client';
import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DashboardPreviewProps {
  themeId?: string;
}

export function DashboardPreview({ themeId }: DashboardPreviewProps) {
  // 테마별 스타일 클래스 결정
  const getThemeClasses = () => {
    switch (themeId) {
      case 'apple-liquid-glass':
        return {
          container: 'space-y-6 font-[var(--font-sans)] bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 p-4 rounded-xl',
          card: 'liquid-glass-card p-4',
          button: 'liquid-glass-button mt-3 px-3 py-2 text-gray-800 text-xs transition-all',
          gridCard: 'liquid-glass-card p-4'
        };
      case 'bold-colors':
        return {
          container: 'space-y-6 font-[var(--font-sans)] bg-white p-4',
          card: 'brutalist-card p-4 bg-white',
          button: 'brutalist-button mt-3 px-3 py-2 text-xs',
          gridCard: 'brutalist-card p-4 bg-white'
        };
      case 'chic-black':
        return {
          container: 'space-y-6 font-[var(--font-sans)]',
          card: 'chic-minimal rounded-[var(--radius)] bg-[hsl(var(--card))] p-4',
          button: 'chic-minimal mt-3 px-3 py-2 rounded-[calc(var(--radius)-2px)] text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] text-xs',
          gridCard: 'chic-minimal rounded-[var(--radius)] bg-[hsl(var(--card))] p-4'
        };
      case 'nature-green':
        return {
          container: 'space-y-6 font-[var(--font-sans)] bg-[hsl(var(--background))] p-4',
          card: 'nature-organic border border-[hsl(var(--border))] bg-white p-4',
          button: 'nature-organic mt-3 px-3 py-2 text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] text-xs border border-[hsl(var(--border))]',
          gridCard: 'nature-organic border border-[hsl(var(--border))] bg-white p-4'
        };
      case 'modern-purple':
        return {
          container: 'space-y-6 font-[var(--font-sans)]',
          card: 'purple-glow rounded-[var(--radius)] p-4',
          button: 'purple-button mt-3 px-3 py-2 rounded-[calc(var(--radius)-2px)] text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] text-xs hover:bg-[hsl(var(--primary))]/90 transition-colors',
          gridCard: 'purple-glow rounded-[var(--radius)] p-4'
        };
      default:
        return {
          container: 'space-y-6 font-[var(--font-sans)]',
          card: 'rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow)]',
          button: 'mt-3 px-3 py-2 rounded-[calc(var(--radius)-2px)] text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] text-xs shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all',
          gridCard: 'rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow)]'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const chartData = [
    { name: 'Mon', value: 20 },
    { name: 'Tue', value: 60 },
    { name: 'Wed', value: 40 },
    { name: 'Thu', value: 80 },
    { name: 'Fri', value: 55 },
  ];

  const renderBar = () => (
    <div className="w-full h-24">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ left: 6, right: 6, top: 4, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
          <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderLine = () => (
    <div className="w-full h-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ left: 6, right: 6, top: 4, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className={themeClasses.container}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{label:'총 매출',value:'$15,231.89',delta:'+20.1%'},{label:'신규 고객',value:'1,234',delta:'-2.0%'},{label:'활성 계정',value:'45,678',delta:'+12.5%'}].map((m,i)=> (
          <div key={i} className={themeClasses.gridCard}>
            <div className={`text-xs text-[hsl(var(--muted-foreground))] mb-1 ${themeId === 'bold-colors' ? 'font-bold uppercase tracking-wider' : ''}`}>{m.label}</div>
            <div className={`text-xl font-semibold text-[hsl(var(--foreground))] ${themeId === 'bold-colors' ? 'text-2xl font-black' : ''}`}>{m.value}</div>
            <div className={`text-xs text-[hsl(var(--muted-foreground))] mt-1 ${themeId === 'bold-colors' ? 'font-bold' : ''}`}>{m.delta} 최근</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={themeClasses.card}>
          <div className={`text-sm font-medium text-[hsl(var(--foreground))] mb-3 ${themeId === 'bold-colors' ? 'font-black uppercase tracking-widest' : ''}`}>June 2025</div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[hsl(var(--muted-foreground))]">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=> <div key={d} className={themeId === 'bold-colors' ? 'font-bold' : ''}>{d}</div>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {Array.from({length:35}).map((_,i)=> (
              <div key={i} className={`h-7 flex items-center justify-center text-[11px] ${
                i===10
                  ? `bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] ${
                      themeId === 'bold-colors' 
                        ? 'rounded-none border-2 border-black shadow-[2px_2px_0px_0px_black] font-bold' 
                        : themeId === 'apple-liquid-glass'
                        ? 'rounded-lg backdrop-blur-sm'
                        : 'rounded-[calc(var(--radius)-6px)]'
                    }`
                  : themeId === 'bold-colors' 
                  ? 'rounded-none border border-black hover:bg-yellow-300 hover:border-2 transition-all font-bold' 
                  : ''
              }`}>{i%30+1}</div>
            ))}
          </div>
        </div>
        <div className={`${themeClasses.card} flex flex-col`}>
          <div className={`text-sm font-medium text-[hsl(var(--foreground))] ${themeId === 'bold-colors' ? 'font-black uppercase tracking-widest' : ''}`}>활동 목표</div>
          <div className={`text-3xl font-semibold my-2 text-[hsl(var(--foreground))] ${themeId === 'bold-colors' ? 'text-4xl font-black' : ''}`}>350</div>
          <div className={`text-xs text-[hsl(var(--muted-foreground))] ${themeId === 'bold-colors' ? 'font-bold uppercase tracking-wider' : ''}`}>CALORIES/DAY</div>
          <div className="mt-3 flex-1 flex items-end gap-1">
            {Array.from({length:16}).map((_,i)=> {
              const heightPercent = 20 + ((i * 37) % 60);
              return (
                <div 
                  key={i} 
                  className={`w-3 ${
                    themeId === 'bold-colors' 
                      ? 'rounded-none border border-black shadow-[2px_2px_0px_0px_black]' 
                      : themeId === 'apple-liquid-glass'
                      ? 'rounded-t-lg backdrop-blur-sm'
                      : 'rounded-t-[calc(var(--radius)-6px)]'
                  }`} 
                  style={{height:`${heightPercent}%`, backgroundColor:'hsl(var(--primary))'}} 
                />
              );
            })}
          </div>
          <button className={themeClasses.button}>설정하기</button>
        </div>
        <div className={themeClasses.card}>
          <div className={`text-sm font-medium text-[hsl(var(--foreground))] mb-2 ${themeId === 'bold-colors' ? 'font-black uppercase tracking-widest' : ''}`}>운동 시간</div>
          {renderBar()}
          <div className="mt-3" />
          {renderLine()}
        </div>
      </div>
    </div>
  );
}


