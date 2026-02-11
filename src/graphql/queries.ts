import { gql } from '@apollo/client';

export const GET_TRANSACTIONS = gql`
  query GetTransactions($limit: Int) {
    transactions(limit: $limit) {
      id
      description
      amount
      type
      category
      date
      createdAt
    }
  }
`;

export const GET_TRANSACTIONS_BY_MONTH = gql`
  query GetTransactionsByMonth($year: Int!, $month: Int!) {
    transactionsByMonth(year: $year, month: $month) {
      id
      description
      amount
      type
      category
      date
      createdAt
    }
  }
`;

export const GET_OVERVIEW_METRICS = gql`
  query GetOverviewMetrics($year: Int!, $month: Int!) {
    overviewMetrics(year: $year, month: $month) {
      totalIncome
      totalExpense
      netAmount
      transactionCount
    }
  }
`;

export const GET_SPENDING_BY_CATEGORY = gql`
  query GetSpendingByCategory($year: Int!, $month: Int!) {
    spendingByCategory(year: $year, month: $month) {
      category
      total
      count
    }
  }
`;

export const GET_DAILY_BALANCES = gql`
  query GetDailyBalances($year: Int!, $month: Int!) {
    dailyBalances(year: $year, month: $month) {
      date
      balance
      income
      expense
    }
  }
`;
