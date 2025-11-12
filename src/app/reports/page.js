'use client'
// src/app/reports/page.js
import { useState } from 'react'
import { FileText, Download, Calendar, RefreshCw } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatNumber } from '@/lib/utils'

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const generateReport = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dateRange)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setReportData(data.report)
      } else {
        alert('Error generating report')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!reportData) return

    const doc = new jsPDF()
    const { overview, topVideos, teamPerformance, subtitleProgress, adStats } = reportData
    
    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Veer Bharat - Performance Report', 14, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Cultural Department, Government of Madhya Pradesh`, 14, 27)
    doc.text(`Period: ${new Date(reportData.period.startDate).toLocaleDateString()} to ${new Date(reportData.period.endDate).toLocaleDateString()}`, 14, 32)
    doc.text(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`, 14, 37)

    let yPos = 45

    // Executive Summary
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Executive Summary', 14, yPos)
    yPos += 7

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Videos: ${overview.totalVideos}`, 14, yPos)
    doc.text(`Total Views: ${formatNumber(overview.totalViews)}`, 80, yPos)
    doc.text(`Avg Views: ${formatNumber(overview.avgViews)}`, 140, yPos)
    yPos += 5
    doc.text(`Total Likes: ${formatNumber(overview.totalLikes)}`, 14, yPos)
    doc.text(`Total Comments: ${formatNumber(overview.totalComments)}`, 80, yPos)
    yPos += 5
    doc.text(`Uploaded: ${overview.uploadedCount}`, 14, yPos)
    doc.text(`Scheduled: ${overview.scheduledCount}`, 60, yPos)
    doc.text(`Delayed: ${overview.delayedCount}`, 106, yPos)
    yPos += 10

    // Top 10 Videos
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Top 10 Videos by Views', 14, yPos)
    yPos += 7

    autoTable(doc, {
      startY: yPos,
      head: [['Title', 'Views', 'Likes', 'Series', 'Team']],
      body: topVideos.slice(0, 10).map(v => [
        v.title.substring(0, 40) + (v.title.length > 40 ? '...' : ''),
        formatNumber(v.views),
        formatNumber(v.likes),
        v.series || '-',
        v.team || '-'
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      theme: 'striped'
    })

    yPos = doc.lastAutoTable.finalY + 10

    // Team Performance
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Team Performance', 14, yPos)
    yPos += 7

    autoTable(doc, {
      startY: yPos,
      head: [['Team', 'Lead', 'Videos', 'Total Views', 'Avg Views', 'Delayed']],
      body: teamPerformance.map(t => [
        t.name,
        t.lead,
        t.totalVideos,
        formatNumber(t.totalViews),
        formatNumber(t.avgViews),
        t.delayedCount
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      theme: 'striped'
    })

    yPos = doc.lastAutoTable.finalY + 10

    // Subtitle Progress
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Subtitle Progress', 14, yPos)
    yPos += 7

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Complete (100 languages): ${subtitleProgress.complete} videos`, 14, yPos)
    yPos += 5
    doc.text(`Partial (1-99 languages): ${subtitleProgress.partial} videos`, 14, yPos)
    yPos += 5
    doc.text(`None (0 languages): ${subtitleProgress.none} videos`, 14, yPos)
    yPos += 5
    doc.text(`Average: ${subtitleProgress.avgSubtitles} languages per video`, 14, yPos)
    yPos += 10

    // Ad Status
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Ad Campaign Status', 14, yPos)
    yPos += 7

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Running: ${adStats.running} videos`, 14, yPos)
    yPos += 5
    doc.text(`Stopped: ${adStats.stopped} videos`, 14, yPos)
    yPos += 5
    doc.text(`Pending: ${adStats.pending} videos`, 14, yPos)
    yPos += 5
    doc.text(`Not Set: ${adStats.notSet} videos`, 14, yPos)
    yPos += 15

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128)
    doc.text('This is an auto-generated report from Veer Bharat Content Management System', 14, 285)
    doc.text(`Page 1 of ${doc.internal.getNumberOfPages()}`, 180, 285)

    // Save PDF
    const fileName = `VeerBharat_Report_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Generate comprehensive performance reports</p>
      </div>

      {/* Report Generator */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Generate New Report</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Date Ranges */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const now = new Date()
              setDateRange({
                startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0]
              })
            }}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            This Month
          </button>
          <button
            onClick={() => {
              const now = new Date()
              const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
              const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
              setDateRange({
                startDate: lastMonth.toISOString().split('T')[0],
                endDate: lastMonthEnd.toISOString().split('T')[0]
              })
            }}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            Last Month
          </button>
          <button
            onClick={() => {
              const now = new Date()
              const threeMonths = new Date(now.getFullYear(), now.getMonth() - 3, 1)
              setDateRange({
                startDate: threeMonths.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0]
              })
            }}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            Last 3 Months
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {reportData && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Report Preview</h2>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={20} />
              Download PDF
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard label="Total Videos" value={reportData.overview.totalVideos} />
            <SummaryCard label="Total Views" value={formatNumber(reportData.overview.totalViews)} />
            <SummaryCard label="Total Likes" value={formatNumber(reportData.overview.totalLikes)} />
            <SummaryCard label="Avg Views" value={formatNumber(reportData.overview.avgViews)} />
          </div>

          {/* Top Videos */}
          <div>
            <h3 className="font-semibold mb-3">Top 5 Videos</h3>
            <div className="space-y-2">
              {reportData.topVideos.slice(0, 5).map((video, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{video.title}</p>
                    <p className="text-sm text-gray-600">{video.series} • {video.team}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-bold text-blue-600">{formatNumber(video.views)}</p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Performance */}
          <div>
            <h3 className="font-semibold mb-3">Team Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Team</th>
                    <th className="text-left p-2">Videos</th>
                    <th className="text-left p-2">Total Views</th>
                    <th className="text-left p-2">Avg Views</th>
                    <th className="text-left p-2">Delayed</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.teamPerformance.map((team, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{team.name}</td>
                      <td className="p-2">{team.totalVideos}</td>
                      <td className="p-2">{formatNumber(team.totalViews)}</td>
                      <td className="p-2">{formatNumber(team.avgViews)}</td>
                      <td className="p-2">{team.delayedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subtitle & Ad Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Subtitle Progress</h3>
              <div className="space-y-2">
                <StatRow label="Complete (100 langs)" value={reportData.subtitleProgress.complete} />
                <StatRow label="Partial (1-99 langs)" value={reportData.subtitleProgress.partial} />
                <StatRow label="None" value={reportData.subtitleProgress.none} />
                <StatRow label="Average" value={`${reportData.subtitleProgress.avgSubtitles} langs`} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Ad Campaign Status</h3>
              <div className="space-y-2">
                <StatRow label="Running" value={reportData.adStats.running} color="green" />
                <StatRow label="Stopped" value={reportData.adStats.stopped} color="red" />
                <StatRow label="Pending" value={reportData.adStats.pending} color="yellow" />
                <StatRow label="Not Set" value={reportData.adStats.notSet} color="gray" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!reportData && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How to Generate Reports</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Select the date range for your report</li>
            <li>Click "Generate Report" to preview the data</li>
            <li>Review the report preview on this page</li>
            <li>Click "Download PDF" to save the report</li>
            <li>Submit the PDF to your department head</li>
          </ol>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function StatRow({ label, value, color = 'blue' }) {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    gray: 'text-gray-600'
  }

  return (
    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
      <span className="text-sm">{label}</span>
      <span className={`font-bold ${colors[color]}`}>{value}</span>
    </div>
  )
}