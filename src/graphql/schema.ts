export const typeDefs = `
  type Transaction {
    id: ID!
    description: String!
    amount: Float!
    type: String!
    category: String!
    date: String!
    createdAt: String!
  }

  type CategorySummary {
    category: String!
    total: Float!
    count: Int!
  }

  type DailyBalance {
    date: String!
    balance: Float!
    income: Float!
    expense: Float!
  }

  type OverviewMetrics {
    totalIncome: Float!
    totalExpense: Float!
    netAmount: Float!
    transactionCount: Int!
  }

  type Query {
    transactions(limit: Int): [Transaction!]!
    transactionsByMonth(year: Int!, month: Int!): [Transaction!]!
    overviewMetrics(year: Int!, month: Int!): OverviewMetrics!
    spendingByCategory(year: Int!, month: Int!): [CategorySummary!]!
    dailyBalances(year: Int!, month: Int!): [DailyBalance!]!
  }
`;
