import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { getReportData } from '@/api/services';
import { Avatar, Badge, Card, Chip, ChipRow, Empty, Loader, PageHeader, ProgressBar, Screen, SectionTitle, Stat, StatGrid } from '@/components/ui';
import { colors, fonts, space, type as t } from '@/theme';

const CATEGORY_COLORS = [colors.gold, colors.info, colors.onWhite, colors.success, colors.warning, '#7E5A9B', '#3F7F75', colors.danger, colors.neutral];
const RESOLUTION_COLORS: Record<string, string> = { Resolved: colors.success, 'In Review': colors.warning, Open: colors.info, Closed: colors.neutral };

const fmtMoney = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`);
const change = (cur: number, prev: number) => {
  if (prev === 0) return cur > 0 ? '+100%' : '0%';
  const pct = Math.round(((cur - prev) / prev) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
};

function Bars({ data, valueOf, labelOf, fmt }: { data: any[]; valueOf: (d: any) => number; labelOf: (d: any) => string; fmt: (d: any) => string }) {
  const max = Math.max(...data.map(valueOf), 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 190, gap: 6 }}>
      {data.map((d, i) => {
        const h = (valueOf(d) / max) * 140;
        const last = i === data.length - 1;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={[t.meta, { fontSize: 9, marginBottom: 4 }]} numberOfLines={1}>
              {fmt(d)}
            </Text>
            <View style={{ width: '70%', height: Math.max(h, valueOf(d) > 0 ? 4 : 2), borderRadius: 4, backgroundColor: last ? colors.gold : colors.surface3 }} />
            <Text style={[t.meta, { marginTop: 6 }]} numberOfLines={1}>
              {labelOf(d)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function Report() {
  const [period, setPeriod] = useState('Monthly');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportData()
      .then((r) => r.success && setData(r.data))
      .catch((e) => console.warn('Failed to fetch report data:', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!data)
    return (
      <Screen>
        <PageHeader back title="Platform Reports" />
        <Empty icon="alert-circle" title="Failed to load report data." />
      </Screen>
    );

  const { kpis, userGrowth, revenueByMonth, categoryBreakdown, resolutionOverview, successRate, topLawyers } = data;
  const casesChange = change(kpis.casesThisMonth, kpis.casesPrevMonth);
  const casesUp = kpis.casesThisMonth >= kpis.casesPrevMonth;
  const curRev = revenueByMonth.length ? revenueByMonth[revenueByMonth.length - 1].amount : 0;
  const prevRev = revenueByMonth.length > 1 ? revenueByMonth[revenueByMonth.length - 2].amount : 0;
  const revChange = change(curRev, prevRev);
  const revUp = curRev >= prevRev;
  const maxCat = Math.max(...categoryBreakdown.map((c: any) => c.pct), 1) + 5;
  const maxRes = Math.max(...resolutionOverview.map((r: any) => r.pct), 1) + 5;
  const activeCases = (resolutionOverview.find((r: any) => r.label === 'Open')?.count || 0) + (resolutionOverview.find((r: any) => r.label === 'In Review')?.count || 0);

  return (
    <Screen>
      <PageHeader back index="Reports" eyebrow="Analytics" title="Platform Reports" subtitle="Key metrics, analytics, and platform health." />
      <ChipRow>
        {['Weekly', 'Monthly', 'Quarterly'].map((p) => (
          <Chip key={p} label={p} active={period === p} onPress={() => setPeriod(p)} />
        ))}
      </ChipRow>

      <StatGrid>
        <Stat label="Total Users" value={kpis.totalUsers.toLocaleString('en-IN')} icon="users" />
        <Stat label="Active Lawyers" value={kpis.totalLawyers.toLocaleString('en-IN')} icon="award" tone="success" />
        <Stat label="Cases This Month" value={kpis.casesThisMonth.toLocaleString('en-IN')} icon="file-text" tone="info" hint={`${casesUp ? '↑' : '↓'} ${casesChange}`} />
        <Stat label="Total Revenue" value={fmtMoney(kpis.totalRevenue)} icon="dollar-sign" tone="warning" hint={`${revUp ? '↑' : '↓'} ${revChange}`} />
      </StatGrid>

      <Card style={{ marginBottom: space.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.lg }}>
          <SectionTitle title="User Growth" icon="trending-up" style={{ marginBottom: 0, flex: 1 }} />
          <Badge label={`Total: ${kpis.totalUsers.toLocaleString('en-IN')}`} tone="gold" />
        </View>
        {userGrowth.length ? (
          <Bars data={userGrowth} valueOf={(d) => d.count} labelOf={(d) => d.month} fmt={(d) => String(d.count)} />
        ) : (
          <Text style={t.bodySm}>No user data available.</Text>
        )}
      </Card>

      <Card style={{ marginBottom: space.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.lg }}>
          <SectionTitle title="Revenue (₹)" icon="bar-chart-2" style={{ marginBottom: 0, flex: 1 }} />
          <Badge label={`${revChange} MoM`} tone={revUp ? 'success' : 'danger'} />
        </View>
        {revenueByMonth.length ? (
          <Bars data={revenueByMonth} valueOf={(d) => d.amount} labelOf={(d) => d.month} fmt={(d) => fmtMoney(d.amount)} />
        ) : (
          <Text style={t.bodySm}>No revenue data available.</Text>
        )}
      </Card>

      <Card style={{ marginBottom: space.lg }}>
        <SectionTitle title="Cases by Category" icon="file-text" />
        {categoryBreakdown.length ? (
          categoryBreakdown.map((c: any, i: number) => (
            <View key={i} style={{ marginBottom: space.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={t.label}>{c.label}</Text>
                <Text style={t.bodySm}>
                  {c.count} ({c.pct}%)
                </Text>
              </View>
              <ProgressBar pct={(c.pct / maxCat) * 100} color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
            </View>
          ))
        ) : (
          <Text style={t.bodySm}>No cases filed yet.</Text>
        )}
      </Card>

      <Card style={{ marginBottom: space.lg }}>
        <SectionTitle title="Resolution Overview" icon="check-circle" />
        {resolutionOverview.filter((s: any) => s.count > 0).map((s: any, i: number) => (
          <View key={i} style={{ marginBottom: space.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={t.label}>{s.label}</Text>
              <Text style={t.bodySm}>
                {s.count} ({s.pct}%)
              </Text>
            </View>
            <ProgressBar pct={(s.pct / maxRes) * 100} color={RESOLUTION_COLORS[s.label] || colors.neutral} />
          </View>
        ))}
        {resolutionOverview.every((s: any) => s.count === 0) ? <Text style={t.bodySm}>No complaints yet.</Text> : null}
        <View style={{ flexDirection: 'row', marginTop: space.md, paddingTop: space.lg, borderTopWidth: 0.5, borderTopColor: colors.border }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.light, fontSize: 34, color: colors.success }}>{successRate}%</Text>
            <Text style={t.bodySm}>Overall Success Rate</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.light, fontSize: 34, color: colors.goldText }}>{activeCases}</Text>
            <Text style={t.bodySm}>Active Cases</Text>
          </View>
        </View>
      </Card>

      <Card>
        <SectionTitle title="Top Performing Lawyers" icon="award" />
        <Text style={[t.meta, { marginTop: -space.sm, marginBottom: space.md }]}>Ranked by assigned cases</Text>
        {topLawyers.length ? (
          topLawyers.map((l: any, i: number) => (
            <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md }, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border }]}>
              <Text style={{ fontFamily: fonts.light, fontSize: 22, width: 24, color: i === 0 ? colors.gold : i < 3 ? colors.goldText : colors.textDim }}>{i + 1}</Text>
              <Avatar name={l.name} size={38} gold={i === 0} />
              <View style={{ flex: 1 }}>
                <Text style={t.label}>{l.name}</Text>
                <Text style={t.meta}>{l.specialization}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={t.label}>{l.cases} cases</Text>
                <Text style={t.meta}>{l.consultationFee > 0 ? fmtMoney(l.consultationFee) : '—'}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={t.bodySm}>No lawyers registered yet.</Text>
        )}
      </Card>
    </Screen>
  );
}
