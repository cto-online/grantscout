export function ScoringResults() {
  const scoredGrants = [
    {
      id: '1',
      title: 'Research Innovation Fund',
      fitScore: 92,
      relevanceScore: 88,
      timelineScore: 95,
      overallScore: 91,
    },
    {
      id: '2',
      title: 'Environmental Impact Initiative',
      fitScore: 78,
      relevanceScore: 82,
      timelineScore: 70,
      overallScore: 76,
    },
    {
      id: '3',
      title: 'Community Development Program',
      fitScore: 65,
      relevanceScore: 58,
      timelineScore: 72,
      overallScore: 65,
    },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success'
    if (score >= 70) return 'text-warning'
    return 'text-danger'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fg">
          Scoring Results
        </h1>
        <p className="mt-2 text-muted">
          AI-powered fit scoring for extracted grants
        </p>
      </div>

      <div className="space-y-4">
        {scoredGrants.map((grant) => (
          <div
            key={grant.id}
            className="rounded-lg border border-hair bg-panel p-6"
          >
            <div className="mb-4">
              <h3 className="font-semibold text-fg text-lg">
                {grant.title}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div>
                <p className="text-xs text-faint mb-2">Fit Score</p>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${getScoreColor(grant.fitScore)}`}>
                    {grant.fitScore}
                  </div>
                  <span className="text-xs text-faint">/100</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-faint mb-2">Relevance</p>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${getScoreColor(grant.relevanceScore)}`}>
                    {grant.relevanceScore}
                  </div>
                  <span className="text-xs text-faint">/100</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-faint mb-2">Timeline</p>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${getScoreColor(grant.timelineScore)}`}>
                    {grant.timelineScore}
                  </div>
                  <span className="text-xs text-faint">/100</span>
                </div>
              </div>
              <div className="md:col-span-2 flex items-end">
                <div className="w-full">
                  <p className="text-xs text-faint mb-2">Overall Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-hair rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          grant.overallScore >= 85
                            ? 'bg-success'
                            : grant.overallScore >= 70
                              ? 'bg-warning'
                              : 'bg-danger'
                        }`}
                        style={{ width: `${grant.overallScore}%` }}
                      />
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(grant.overallScore)}`}>
                      {grant.overallScore}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
