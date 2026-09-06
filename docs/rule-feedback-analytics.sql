-- Analytics Engine mapping:
-- blob1 rule_id, blob2 feedback, blob3 language, blob4 purpose,
-- blob5 severity, blob6 confidence, blob7 engine_version, double1 signed count.
-- Undo writes -1, so SUM(double1 * _sample_interval) is the net count.

SELECT
  blob1 AS rule_id,
  blob3 AS language,
  blob4 AS purpose,
  blob5 AS severity,
  blob6 AS confidence,
  SUM(if(blob2 = 'helpful', double1 * _sample_interval, 0)) AS helpful,
  SUM(if(blob2 = 'false_positive', double1 * _sample_interval, 0)) AS false_positive,
  SUM(if(blob2 = 'unclear', double1 * _sample_interval, 0)) AS unclear,
  false_positive / nullIf(helpful + false_positive + unclear, 0) AS false_positive_rate
FROM naturable_rule_feedback
WHERE timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY rule_id, language, purpose, severity, confidence
HAVING helpful + false_positive + unclear >= 20
ORDER BY false_positive_rate DESC;

-- Review candidates only. Never update a live rule automatically. Reproduce
-- failures against the fixed test corpus before changing confidence or purpose.
