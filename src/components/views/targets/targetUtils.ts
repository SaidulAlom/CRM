import { Target, Deal, Case, Contact, User, TargetStatus, TargetType } from '../../../types';

export interface TargetCalculation {
  target: Target;
  actual: number;
  goal: number;
  remaining: number;
  percent: number;
  computedStatus: TargetStatus;
  timeRemainingDays: number;
  totalDays: number;
  elapsedDays: number;
  elapsedPercent: number;
  memberContributions: {
    user: User;
    actual: number;
    shareGoal: number;
    percent: number;
    recordsCount: number;
  }[];
  contributingRecords: {
    id: string;
    type: 'deal' | 'case' | 'contact' | 'custom';
    title: string;
    metricValue: number;
    formattedValue: string;
    ownerName: string;
    date: string;
    status: string;
  }[];
}

export interface UserPerformanceScorecard {
  user: User;
  targetsAssignedCount: number;
  targetsCompletedCount: number;
  targetsOnTrackCount: number;
  targetsAtRiskCount: number;
  totalRevenueWon: number;
  totalRevenueGoal: number;
  revenueAttainmentPercent: number;
  totalDealsWonCount: number;
  totalCasesResolvedCount: number;
  totalUnitsSoldCount: number;
  totalCustomersAcquiredCount: number;
  overallAttainmentRate: number;
  assignedTargets: TargetCalculation[];
}

export interface DepartmentPerformanceScorecard {
  department: string;
  memberCount: number;
  targetCount: number;
  activeTargetsCount: number;
  completedTargetsCount: number;
  totalGoalValue: number;
  totalAchievedValue: number;
  averageAttainmentRate: number;
  onTrackRate: number;
  topPerformer?: { user: User; attainment: number };
}

/**
 * Format currency and numerical metrics cleanly
 */
export function formatMetricValue(
  value: number,
  type: TargetType,
  currency: string = 'USD',
  customUnit?: string
): string {
  if (type === 'revenue') {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (type === 'cases_resolved') {
    return `${value.toLocaleString()} ${value === 1 ? 'case' : 'cases'}`;
  }

  if (type === 'deals_closed') {
    return `${value.toLocaleString()} ${value === 1 ? 'deal' : 'deals'}`;
  }

  if (type === 'units_sold') {
    return `${value.toLocaleString()} ${value === 1 ? 'unit' : 'units'}`;
  }

  if (type === 'new_customers') {
    return `${value.toLocaleString()} ${value === 1 ? 'customer' : 'customers'}`;
  }

  if (type === 'custom_kpi') {
    return `${value.toLocaleString()} ${customUnit || 'pts'}`;
  }

  return value.toLocaleString();
}

/**
 * Helper to check whether a date falls within target start/end window
 */
function isDateWithinRange(dateStr: string | undefined, startDate: string, endDate: string): boolean {
  if (!dateStr) return false;
  // Clean date YYYY-MM-DD
  const recordDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  return recordDate >= startDate && recordDate <= endDate;
}

/**
 * Auto-calculate live achievement, status, and contributions for a target
 */
export function calculateTargetProgress(
  target: Target,
  deals: Deal[],
  cases: Case[],
  contacts: Contact[],
  users: User[],
  referenceDate: string = '2026-09-28'
): TargetCalculation {
  const goal = target.goalValue || 1;
  const assignedSet = new Set(target.assignedUserIds || []);
  const contributingRecords: TargetCalculation['contributingRecords'] = [];

  // Per-user tracker
  const userActualMap: Record<string, number> = {};
  const userRecordCountMap: Record<string, number> = {};
  target.assignedUserIds.forEach((uid) => {
    userActualMap[uid] = 0;
    userRecordCountMap[uid] = 0;
  });

  let rawActual = 0;

  if (target.type === 'revenue') {
    const eligibleDeals = deals.filter((d) => {
      if (d.deletedAt) return false;
      if (d.status !== 'won' && d.stage !== 'won') return false;
      if (!assignedSet.has(d.ownerId)) return false;
      // Date in window: check expectedCloseDate or updatedAt or createdAt
      const closeDate = d.expectedCloseDate || d.updatedAt || d.createdAt;
      return isDateWithinRange(closeDate, target.startDate, target.endDate);
    });

    eligibleDeals.forEach((d) => {
      const dealVal = d.value || 0;
      rawActual += dealVal;
      userActualMap[d.ownerId] = (userActualMap[d.ownerId] || 0) + dealVal;
      userRecordCountMap[d.ownerId] = (userRecordCountMap[d.ownerId] || 0) + 1;

      const owner = users.find((u) => u.id === d.ownerId);
      contributingRecords.push({
        id: d.id,
        type: 'deal',
        title: d.title,
        metricValue: dealVal,
        formattedValue: formatMetricValue(dealVal, 'revenue', target.currency || d.currency),
        ownerName: owner?.name || 'Assigned Rep',
        date: d.expectedCloseDate || d.updatedAt?.split('T')[0] || target.startDate,
        status: 'Closed Won',
      });
    });
  } else if (target.type === 'deals_closed') {
    const eligibleDeals = deals.filter((d) => {
      if (d.deletedAt) return false;
      if (d.status !== 'won' && d.stage !== 'won') return false;
      if (!assignedSet.has(d.ownerId)) return false;
      const closeDate = d.expectedCloseDate || d.updatedAt || d.createdAt;
      return isDateWithinRange(closeDate, target.startDate, target.endDate);
    });

    eligibleDeals.forEach((d) => {
      rawActual += 1;
      userActualMap[d.ownerId] = (userActualMap[d.ownerId] || 0) + 1;
      userRecordCountMap[d.ownerId] = (userRecordCountMap[d.ownerId] || 0) + 1;

      const owner = users.find((u) => u.id === d.ownerId);
      contributingRecords.push({
        id: d.id,
        type: 'deal',
        title: d.title,
        metricValue: 1,
        formattedValue: '1 deal',
        ownerName: owner?.name || 'Assigned Rep',
        date: d.expectedCloseDate || d.updatedAt?.split('T')[0] || target.startDate,
        status: 'Closed Won',
      });
    });
  } else if (target.type === 'units_sold') {
    const eligibleDeals = deals.filter((d) => {
      if (d.deletedAt) return false;
      if (d.status !== 'won' && d.stage !== 'won') return false;
      if (!assignedSet.has(d.ownerId)) return false;
      const closeDate = d.expectedCloseDate || d.updatedAt || d.createdAt;
      return isDateWithinRange(closeDate, target.startDate, target.endDate);
    });

    // In this CRM, each won enterprise deal constitutes a major software/hardware unit bundle
    eligibleDeals.forEach((d) => {
      rawActual += 1;
      userActualMap[d.ownerId] = (userActualMap[d.ownerId] || 0) + 1;
      userRecordCountMap[d.ownerId] = (userRecordCountMap[d.ownerId] || 0) + 1;

      const owner = users.find((u) => u.id === d.ownerId);
      contributingRecords.push({
        id: d.id,
        type: 'deal',
        title: `${d.title} (${d.product || 'Enterprise Package'})`,
        metricValue: 1,
        formattedValue: '1 unit package',
        ownerName: owner?.name || 'Assigned Rep',
        date: d.expectedCloseDate || d.updatedAt?.split('T')[0] || target.startDate,
        status: 'Sold & Contracted',
      });
    });
  } else if (target.type === 'cases_resolved') {
    const eligibleCases = cases.filter((c) => {
      if (c.deletedAt) return false;
      const isResolved = c.status === 'Closed' || c.status === 'Resolved';
      if (!isResolved) return false;
      const isAssigned = assignedSet.has(c.ownerId) || c.teamMemberIds?.some((mid) => assignedSet.has(mid));
      if (!isAssigned) return false;
      const caseDate = c.closedDate || c.updatedAt || c.createdAt;
      return isDateWithinRange(caseDate, target.startDate, target.endDate);
    });

    eligibleCases.forEach((c) => {
      rawActual += 1;
      const primaryOwnerId = assignedSet.has(c.ownerId)
        ? c.ownerId
        : c.teamMemberIds?.find((mid) => assignedSet.has(mid)) || target.assignedUserIds[0];

      if (primaryOwnerId) {
        userActualMap[primaryOwnerId] = (userActualMap[primaryOwnerId] || 0) + 1;
        userRecordCountMap[primaryOwnerId] = (userRecordCountMap[primaryOwnerId] || 0) + 1;
      }

      const owner = users.find((u) => u.id === primaryOwnerId);
      contributingRecords.push({
        id: c.id,
        type: 'case',
        title: c.title,
        metricValue: 1,
        formattedValue: '1 case resolved',
        ownerName: owner?.name || 'Support Engineer',
        date: c.closedDate || c.updatedAt?.split('T')[0] || target.startDate,
        status: c.status,
      });
    });
  } else if (target.type === 'new_customers') {
    const eligibleContacts = contacts.filter((c) => {
      if (c.deletedAt) return false;
      if (c.type !== 'customer') return false;
      if (!assignedSet.has(c.ownerId)) return false;
      return isDateWithinRange(c.createdAt, target.startDate, target.endDate);
    });

    eligibleContacts.forEach((c) => {
      rawActual += 1;
      userActualMap[c.ownerId] = (userActualMap[c.ownerId] || 0) + 1;
      userRecordCountMap[c.ownerId] = (userRecordCountMap[c.ownerId] || 0) + 1;

      const owner = users.find((u) => u.id === c.ownerId);
      contributingRecords.push({
        id: c.id,
        type: 'contact',
        title: `${c.firstName} ${c.lastName} (${c.jobTitle || 'Executive'})`,
        metricValue: 1,
        formattedValue: '1 new customer',
        ownerName: owner?.name || 'Account Executive',
        date: c.createdAt?.split('T')[0] || target.startDate,
        status: 'Converted Customer',
      });
    });
  } else {
    // Custom KPI
    rawActual = target.manualAchievement ?? 0;
    if (target.assignedUserIds.length > 0) {
      const share = rawActual / target.assignedUserIds.length;
      target.assignedUserIds.forEach((uid) => {
        userActualMap[uid] = share;
        userRecordCountMap[uid] = 1;
      });
    }
  }

  // If manual achievement is provided and target is not standard or overridden
  const actual = target.manualAchievement !== undefined && target.type === 'custom_kpi'
    ? target.manualAchievement
    : rawActual;

  const percent = Math.min(Math.round((actual / goal) * 100), 999);
  const remaining = Math.max(0, goal - actual);

  // Time metrics
  const startMs = new Date(target.startDate).getTime();
  const endMs = new Date(target.endDate).getTime();
  const nowMs = new Date(referenceDate).getTime();
  const totalDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(0, Math.min(totalDays, Math.round((nowMs - startMs) / (1000 * 60 * 60 * 24))));
  const elapsedPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
  const timeRemainingDays = Math.max(0, Math.round((endMs - nowMs) / (1000 * 60 * 60 * 24)));

  // Status calculation
  let computedStatus: TargetStatus = 'Active';
  if (target.manualOverrideStatus && target.status) {
    computedStatus = target.status;
  } else if (target.status === 'Draft' || target.status === 'Cancelled') {
    computedStatus = target.status;
  } else if (referenceDate < target.startDate) {
    computedStatus = 'Upcoming';
  } else if (actual >= goal) {
    computedStatus = 'Completed';
  } else if (referenceDate > target.endDate && actual < goal) {
    computedStatus = 'Expired';
  } else {
    // In progress: Compare elapsed progress to expected schedule pace
    if (percent >= elapsedPercent - 8) {
      computedStatus = 'On Track';
    } else {
      computedStatus = 'At Risk';
    }
  }

  // Member contributions
  const shareGoalPerMember = target.assignedUserIds.length > 0 ? Math.round(goal / target.assignedUserIds.length) : goal;
  const memberContributions = target.assignedUserIds.map((uid) => {
    const user = users.find((u) => u.id === uid) || {
      id: uid,
      name: 'Unassigned Rep',
      email: '',
      role: 'standard',
      department: target.department || 'Sales',
      active: true,
      preferences: {
        defaultCurrency: 'USD',
        timeZone: 'UTC',
        welcomeText: '',
        clockMode: '12h',
        theme: 'light',
        activityDepth: 30,
        workingDayStart: '09:00',
        workingDayEnd: '17:00',
      },
      unavailableDates: [],
    };

    const userActual = userActualMap[uid] || 0;
    const userPercent = shareGoalPerMember > 0 ? Math.min(Math.round((userActual / shareGoalPerMember) * 100), 999) : 0;

    return {
      user: user as User,
      actual: userActual,
      shareGoal: shareGoalPerMember,
      percent: userPercent,
      recordsCount: userRecordCountMap[uid] || 0,
    };
  });

  return {
    target,
    actual,
    goal,
    remaining,
    percent,
    computedStatus,
    timeRemainingDays,
    totalDays,
    elapsedDays,
    elapsedPercent,
    memberContributions,
    contributingRecords,
  };
}

/**
 * Calculate user performance scorecard across all targets
 */
export function calculateUserScorecard(
  user: User,
  allCalculations: TargetCalculation[]
): UserPerformanceScorecard {
  const userTargets = allCalculations.filter((c) => c.target.assignedUserIds.includes(user.id));

  let totalRevenueWon = 0;
  let totalRevenueGoal = 0;
  let totalDealsWonCount = 0;
  let totalCasesResolvedCount = 0;
  let totalUnitsSoldCount = 0;
  let totalCustomersAcquiredCount = 0;
  let targetsCompletedCount = 0;
  let targetsOnTrackCount = 0;
  let targetsAtRiskCount = 0;
  let totalPercentSum = 0;

  userTargets.forEach((c) => {
    if (c.computedStatus === 'Completed') targetsCompletedCount++;
    if (c.computedStatus === 'On Track') targetsOnTrackCount++;
    if (c.computedStatus === 'At Risk') targetsAtRiskCount++;

    const memberShare = c.memberContributions.find((m) => m.user.id === user.id);
    const userContribActual = memberShare?.actual || 0;
    const userContribGoal = memberShare?.shareGoal || 1;

    totalPercentSum += (userContribActual / userContribGoal) * 100;

    if (c.target.type === 'revenue') {
      totalRevenueWon += userContribActual;
      totalRevenueGoal += userContribGoal;
    } else if (c.target.type === 'deals_closed') {
      totalDealsWonCount += userContribActual;
    } else if (c.target.type === 'units_sold') {
      totalUnitsSoldCount += userContribActual;
    } else if (c.target.type === 'cases_resolved') {
      totalCasesResolvedCount += userContribActual;
    } else if (c.target.type === 'new_customers') {
      totalCustomersAcquiredCount += userContribActual;
    }
  });

  const revenueAttainmentPercent = totalRevenueGoal > 0 ? Math.round((totalRevenueWon / totalRevenueGoal) * 100) : 0;
  const overallAttainmentRate = userTargets.length > 0 ? Math.round(totalPercentSum / userTargets.length) : 0;

  return {
    user,
    targetsAssignedCount: userTargets.length,
    targetsCompletedCount,
    targetsOnTrackCount,
    targetsAtRiskCount,
    totalRevenueWon,
    totalRevenueGoal,
    revenueAttainmentPercent,
    totalDealsWonCount,
    totalCasesResolvedCount,
    totalUnitsSoldCount,
    totalCustomersAcquiredCount,
    overallAttainmentRate,
    assignedTargets: userTargets,
  };
}

/**
 * Generate CSV / Excel compatible text export
 */
export function generateTargetsExport(
  calculations: TargetCalculation[],
  users: User[],
  format: 'csv' | 'excel' = 'csv'
): { content: string; filename: string; mimeType: string } {
  const delimiter = format === 'excel' ? '\t' : ',';
  const extension = format === 'excel' ? 'xls' : 'csv';
  const mimeType = format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8' : 'text/csv;charset=utf-8';
  const nowStr = new Date().toISOString().split('T')[0];
  const filename = `CRM_Sales_Targets_Report_${nowStr}.${extension}`;

  const headers = [
    'Target ID',
    'Target Name',
    'Type',
    'Period',
    'Department',
    'Priority',
    'Status',
    'Start Date',
    'End Date',
    'Goal Value',
    'Achieved Value',
    'Remaining',
    'Achievement %',
    'Elapsed Days',
    'Days Remaining',
    'Assigned Team Members',
    'Created Date',
  ];

  const escapeCell = (val: any): string => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (format === 'excel') {
      return str.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = calculations.map((c) => {
    const t = c.target;
    const assignedNames = users
      .filter((u) => t.assignedUserIds.includes(u.id))
      .map((u) => u.name)
      .join('; ');

    return [
      escapeCell(t.id),
      escapeCell(t.name),
      escapeCell(t.type),
      escapeCell(t.period),
      escapeCell(t.department || 'All Teams'),
      escapeCell(t.priority || 'Medium'),
      escapeCell(c.computedStatus),
      escapeCell(t.startDate),
      escapeCell(t.endDate),
      escapeCell(c.goal),
      escapeCell(c.actual),
      escapeCell(c.remaining),
      escapeCell(`${c.percent}%`),
      escapeCell(c.elapsedDays),
      escapeCell(c.timeRemainingDays),
      escapeCell(assignedNames),
      escapeCell(t.createdAt?.split('T')[0] || ''),
    ].join(delimiter);
  });

  const content = [headers.map(escapeCell).join(delimiter), ...rows].join('\r\n');
  return { content, filename, mimeType };
}

/**
 * Trigger browser file download
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
