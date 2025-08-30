'use client';
import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function DashboardPreview() {
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
    <div className="space-y-6 font-[var(--font-sans)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{label:'총 매출',value:'$15,231.89',delta:'+20.1%'},{label:'신규 고객',value:'1,234',delta:'-2.0%'},{label:'활성 계정',value:'45,678',delta:'+12.5%'}].map((m,i)=> (
          <div key={i} className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow)]">
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{m.label}</div>
            <div className="text-xl font-semibold text-[hsl(var(--foreground))]">{m.value}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{m.delta} 최근</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow)]">
          <div className="text-sm font-medium text-[hsl(var(--foreground))] mb-3">June 2025</div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[hsl(var(--muted-foreground))]">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=> <div key={d}>{d}</div>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {Array.from({length:35}).map((_,i)=> (
              <div key={i} className={`h-7 rounded-[calc(var(--radius)-6px)] flex items-center justify-center text-[11px] ${i===10?'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]':''}`}>{i%30+1}</div>
            ))}
          </div>
        </div>
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex flex-col shadow-[var(--shadow)]">
          <div className="text-sm font-medium text-[hsl(var(--foreground))]">활동 목표</div>
          <div className="text-3xl font-semibold my-2 text-[hsl(var(--foreground))]">350</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">CALORIES/DAY</div>
          <div className="mt-3 flex-1 flex items-end gap-1">
            {Array.from({length:16}).map((_,i)=> {
              const heightPercent = 20 + ((i * 37) % 60); // SSR/CSR 동일한 결정적 값
              return (
                <div key={i} className="w-3 rounded-t-[calc(var(--radius)-6px)]" style={{height:`${heightPercent}%`, backgroundColor:'hsl(var(--primary))'}} />
              );
            })}
          </div>
          <button className="mt-3 px-3 py-2 rounded-[calc(var(--radius)-2px)] text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] text-xs shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all">설정하기</button>
        </div>
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow)]">
          <div className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">운동 시간</div>
          {renderBar()}
          <div className="mt-3" />
          {renderLine()}
        </div>
      </div>
    </div>
  );
}


