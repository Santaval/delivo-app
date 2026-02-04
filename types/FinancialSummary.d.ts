interface IncomesFinancialSummary {
 total: number;
    increasePercentage: number;
    averagePerDay: number;
    byDay: Record<string, number>;
    byWeek: Record<string, number>;
    byMonth: Record<string, number>;
    byQuarter: Record<string, number>;
    byYear: Record<string, number>;
}

type FinancialSummary = {
  incomes: IncomesFinancialSummary;
};
