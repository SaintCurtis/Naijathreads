'use client'
import React, { useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, LabelList,
} from 'recharts'

// One brand series colour for every chart (single-series charts: the title names the series,
// so no legend). Text never wears the series colour.
export const SERIES = '#1E6B44'
const GRID = '#EEF0EE'
const AXIS_TEXT = { fill: '#6B7280', fontSize: 12 }
const LABEL_TEXT = { fill: '#374151', fontSize: 12, fontWeight: 500 }

const compact = (n) =>
  Math.abs(n) >= 10000 ? `${Math.round(n / 1000)}K` : Number(n).toLocaleString()

const shortDate = (iso) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })

// ---------- frame ----------

export function ChartCard({ title, subtitle, children, table, className = '' }) {
  const [showTable, setShowTable] = useState(false)
  return (
    <section className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col ${className}`}>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {table && (
          <button
            onClick={() => setShowTable((s) => !s)}
            className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-md px-2 py-1 shrink-0"
          >
            {showTable ? 'Chart' : 'Table'}
          </button>
        )}
      </header>
      {showTable && table ? <DataTable {...table} /> : children}
    </section>
  )
}

function DataTable({ columns, rows }) {
  return (
    <div className="overflow-auto max-h-72">
      <table className="w-full text-sm">
        <thead className="text-left text-gray-500 text-xs">
          <tr>{columns.map((c) => <th key={c.key} className={`py-1.5 font-medium ${c.align === 'right' ? 'text-right' : ''}`}>{c.label}</th>)}</tr>
        </thead>
        <tbody className="text-gray-700">
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-gray-100">
              {columns.map((c) => (
                <td key={c.key} className={`py-1.5 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                  {c.format ? c.format(r[c.key]) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EmptyChart({ message = 'No sales in this period yet' }) {
  return (
    <div className="h-56 flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
      {message}
    </div>
  )
}

function TooltipBox({ title, lines }) {
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-900 mb-1">{title}</p>
      {lines.map(([k, v]) => (
        <p key={k} className="flex items-center gap-2 text-gray-600">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: SERIES }} />
          {k}: <span className="font-medium text-gray-900 tabular-nums">{v}</span>
        </p>
      ))}
    </div>
  )
}

// ---------- KPI tile ----------

export function KpiTile({ label, value, change, hint }) {
  const has = typeof change === 'number' && isFinite(change)
  const up = has && change >= 0
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-lg sm:text-2xl font-semibold text-gray-900 tabular-nums break-words">{value}</p>
      <p className="mt-1 text-xs text-gray-500 min-h-4">
        {has ? (
          <span className={up ? 'text-forest-700' : 'text-red-700'}>
            {up ? '▲' : '▼'} {Math.abs(change).toFixed(1)}% <span className="text-gray-500">vs previous period</span>
          </span>
        ) : hint}
      </p>
    </div>
  )
}

// ---------- charts ----------

export function RevenueChart({ data, currency }) {
  if (!data?.some((d) => d.revenue > 0)) return <EmptyChart />
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={AXIS_TEXT} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={28} />
          <YAxis tickFormatter={(v) => `${currency}${compact(v)}`} tick={AXIS_TEXT} tickLine={false} axisLine={false} width={64} />
          <Tooltip
            cursor={{ stroke: '#9CA3AF', strokeWidth: 1 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <TooltipBox
                  title={shortDate(label)}
                  lines={[
                    ['Revenue', `${currency}${payload[0].payload.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
                    ['Orders', payload[0].payload.orders],
                  ]}
                />
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={SERIES}
            strokeWidth={2}
            fill={SERIES}
            fillOpacity={0.1}
            activeDot={{ r: 5, fill: SERIES, stroke: '#fff', strokeWidth: 2 }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Horizontal bars with the value at the tip (status, top products)
const truncate = (s, n = 22) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : s)

// single-line category label (Recharts' default tick wraps long names)
const OneLineTick = ({ x, y, payload }) => (
  <text x={x} y={y} dy={4} textAnchor="end" fill={AXIS_TEXT.fill} fontSize={AXIS_TEXT.fontSize}>
    <title>{payload.value}</title>
    {truncate(payload.value)}
  </text>
)

export function HBarChart({ data, labelKey, valueKey, valueLabel, format = (v) => v, height }) {
  if (!data?.some((d) => d[valueKey] > 0)) return <EmptyChart message="Nothing to show yet" />
  const h = height || Math.max(160, data.length * 40)
  return (
    <div style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barCategoryGap={10}>
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis type="category" dataKey={labelKey} width={160} tick={<OneLineTick />} tickLine={false} axisLine={false} interval={0} />
          <Tooltip
            cursor={{ fill: '#F3F4F6' }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TooltipBox title={payload[0].payload[labelKey]} lines={[[valueLabel, format(payload[0].value)]]} />
              ) : null
            }
          />
          <Bar dataKey={valueKey} fill={SERIES} barSize={18} radius={[0, 4, 4, 0]} minPointSize={2}>
            <LabelList dataKey={valueKey} position="right" style={LABEL_TEXT} formatter={(v) => (v ? format(v) : '')} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Vertical columns (sales by category)
export function ColumnChart({ data, labelKey, valueKey, valueLabel, currency }) {
  if (!data?.length) return <EmptyChart />
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }} barCategoryGap="25%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey={labelKey} tick={AXIS_TEXT} tickLine={false} axisLine={{ stroke: GRID }} interval={0} />
          <YAxis tickFormatter={(v) => `${currency}${compact(v)}`} tick={AXIS_TEXT} tickLine={false} axisLine={false} width={64} />
          <Tooltip
            cursor={{ fill: '#F3F4F6' }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TooltipBox
                  title={payload[0].payload[labelKey]}
                  lines={[[valueLabel, `${currency}${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]]}
                />
              ) : null
            }
          />
          <Bar dataKey={valueKey} fill={SERIES} maxBarSize={24} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
