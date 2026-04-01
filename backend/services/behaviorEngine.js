const prisma = require('../models');

class BehaviorEngine {
  /**
   * Analyze user's historical usage to detect behavioral patterns.
   * Returns peak hours, typical load profile, and scheduling suggestions.
   */
  static async analyzeUserBehavior(userId) {
    let usageRecords = [];

    try {
      const profile = await prisma.energyProfile.findFirst({
        where: { userId },
        include: {
          historicalUsages: {
            orderBy: { timestamp: 'desc' },
            take: 168 // Last 7 days of hourly data
          }
        }
      });

      if (profile?.historicalUsages) {
        usageRecords = profile.historicalUsages;
      }
    } catch (e) {
      console.warn('[BEHAVIOR] DB read failed:', e.message);
    }

    if (usageRecords.length < 6) {
      return BehaviorEngine._getDefaultProfile();
    }

    // Group by hour of day
    const hourlyBuckets = {};
    for (let i = 0; i < 24; i++) hourlyBuckets[i] = [];

    usageRecords.forEach(r => {
      const hour = new Date(r.timestamp).getHours();
      hourlyBuckets[hour].push(r.consumptionKwh);
    });

    // Calculate average per hour
    const hourlyAverages = {};
    for (let h = 0; h < 24; h++) {
      const bucket = hourlyBuckets[h];
      hourlyAverages[h] = bucket.length > 0
        ? bucket.reduce((a, b) => a + b, 0) / bucket.length
        : 0;
    }

    // Find peak hours (top 3)
    const sorted = Object.entries(hourlyAverages)
      .sort(([, a], [, b]) => b - a);
    
    const peakHours = sorted.slice(0, 3).map(([h]) => parseInt(h));
    const offPeakHours = sorted.slice(-3).map(([h]) => parseInt(h));

    // Calculate daily patterns
    const totalDaily = Object.values(hourlyAverages).reduce((a, b) => a + b, 0);
    const peakLoad = sorted[0] ? sorted[0][1] : 0;
    const avgLoad = totalDaily / 24;

    // Detect usage style
    let usageStyle = 'balanced';
    if (peakLoad > avgLoad * 2.5) usageStyle = 'peaky';
    else if (peakLoad < avgLoad * 1.3) usageStyle = 'flat';

    // Solar utilization
    const solarRecords = usageRecords.filter(r => r.solarProdKwh && r.solarProdKwh > 0);
    const solarUtilization = solarRecords.length > 0
      ? solarRecords.reduce((a, r) => a + r.solarProdKwh, 0) / solarRecords.length
      : 0;

    return {
      peakHours,
      offPeakHours,
      hourlyAverages,
      totalDailyKwh: Math.round(totalDaily * 10) / 10,
      peakLoadKwh: Math.round(peakLoad * 10) / 10,
      avgLoadKwh: Math.round(avgLoad * 10) / 10,
      usageStyle,
      solarUtilization: Math.round(solarUtilization * 10) / 10,
      dataPoints: usageRecords.length,
      schedulingSuggestions: BehaviorEngine._generateSuggestions(peakHours, offPeakHours, usageStyle)
    };
  }

  /**
   * Generate smart scheduling suggestions based on behavior patterns.
   */
  static _generateSuggestions(peakHours, offPeakHours, usageStyle) {
    const suggestions = [];

    const formatHour = (h) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr = h % 12 || 12;
      return `${hr}:00 ${ampm}`;
    };

    if (usageStyle === 'peaky') {
      suggestions.push({
        type: 'load_shift',
        priority: 'high',
        description: `Shift heavy loads from ${formatHour(peakHours[0])} to ${formatHour(offPeakHours[0])}`,
        estimatedSavings: '$3-8/day'
      });
    }

    if (offPeakHours.some(h => h >= 0 && h <= 5)) {
      suggestions.push({
        type: 'ev_charging',
        priority: 'medium',
        description: `Schedule EV charging at ${formatHour(offPeakHours[0])} for lowest rates`,
        estimatedSavings: '$1-4/day'
      });
    }

    suggestions.push({
      type: 'hvac_optimization',
      priority: 'medium',
      description: `Pre-cool/heat before ${formatHour(peakHours[0])} to reduce peak demand`,
      estimatedSavings: '$2-5/day'
    });

    return suggestions;
  }

  static _getDefaultProfile() {
    return {
      peakHours: [18, 19, 20],
      offPeakHours: [2, 3, 4],
      hourlyAverages: {},
      totalDailyKwh: 35,
      peakLoadKwh: 4.5,
      avgLoadKwh: 1.5,
      usageStyle: 'balanced',
      solarUtilization: 0,
      dataPoints: 0,
      schedulingSuggestions: [
        {
          type: 'general',
          priority: 'medium',
          description: 'Connect your devices and log usage to enable personalized AI scheduling',
          estimatedSavings: 'Up to $200/month'
        }
      ]
    };
  }
}

module.exports = BehaviorEngine;
