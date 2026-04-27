import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Transactions } from "./components/Transactions";
import { FraudAnalysis } from "./components/FraudAnalysis";
import { Blacklist } from "./components/Blacklist";
import { TransactionDetail } from "./components/TransactionDetail";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout />
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "transactions", Component: Transactions },
      { path: "transactions/:id", Component: TransactionDetail },
      { path: "fraud", Component: FraudAnalysis },
      { path: "blacklist", Component: Blacklist },
    ],
  },
]);