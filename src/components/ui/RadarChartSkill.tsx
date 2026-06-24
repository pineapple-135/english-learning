import React, { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { SkillType } from '../../types';
import { getSkillName } from '../../utils/helpers';

export interface RadarChartSkillProps {
  skills: Record<SkillType, number>;
  /** 图表尺寸（px），默认 300 */
  size?: number;
  /** 主题色 */
  color?: string;
}

const RadarChartSkill: React.FC<RadarChartSkillProps> = ({
  skills,
  size = 300,
  color = '#6366f1',
}) => {
  const data = useMemo(
    () => [
      { skill: getSkillName('vocabulary'), value: skills.vocabulary ?? 0, full: 100 },
      { skill: getSkillName('grammar'), value: skills.grammar ?? 0, full: 100 },
      { skill: getSkillName('reading'), value: skills.reading ?? 0, full: 100 },
      { skill: getSkillName('listening'), value: skills.listening ?? 0, full: 100 },
      { skill: getSkillName('writing'), value: skills.writing ?? 0, full: 100 },
      { skill: getSkillName('speaking'), value: skills.speaking ?? 0, full: 100 },
    ],
    [skills],
  );

  return (
    <div className="w-full" style={{ height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickCount={5}
            axisLine={false}
          />
          <Radar
            name="能力值"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.45}
            strokeWidth={2}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
          />
          <Tooltip
            formatter={(v: number) => [`${v} / 100`, '能力值']}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: 12,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartSkill;
