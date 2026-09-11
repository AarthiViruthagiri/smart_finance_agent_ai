import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

function Dashboard() {
  const { getToken } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = await getToken({
        skipCache: true,
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/dashboard/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard loading failed:", error);

      setMessage(
        error.response?.data?.detail ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <h2>Loading your financial dashboard...</h2>
      </div>
    );
  }

  if (message) {
    return (
      <div className="dashboard-page">
        <h2>Dashboard</h2>

        <p>{message}</p>

        <button onClick={loadDashboard}>
          Retry
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>
          <h1>Financial Dashboard</h1>

          <p>
            Your financial overview at a glance.
          </p>
        </div>

        <button onClick={loadDashboard}>
          Refresh
        </button>

      </div>


      {/* SUMMARY CARDS */}

      <div className="dashboard-cards">

        <div className="dashboard-card">
          <span>Monthly Income</span>

          <h2>
            ₹
            {Number(
              dashboard.monthly_income || 0
            ).toLocaleString("en-IN")}
          </h2>
        </div>


        <div className="dashboard-card">
          <span>Total Expenses</span>

          <h2>
            ₹
            {Number(
              dashboard.total_expenses || 0
            ).toLocaleString("en-IN")}
          </h2>
        </div>


        <div className="dashboard-card">
          <span>Remaining Balance</span>

          <h2>
            ₹
            {Number(
              dashboard.remaining_balance || 0
            ).toLocaleString("en-IN")}
          </h2>
        </div>


        <div className="dashboard-card">
          <span>Savings Rate</span>

          <h2>
            {Number(
              dashboard.savings_rate || 0
            ).toFixed(1)}
            %
          </h2>
        </div>

      </div>


      {/* CATEGORY SPENDING */}

      <div className="dashboard-section">

        <h2>Spending by Category</h2>

        {Object.keys(
          dashboard.category_spending || {}
        ).length === 0 ? (

          <p>No category spending yet.</p>

        ) : (

          <div className="category-list">

            {Object.entries(
              dashboard.category_spending || {}
            ).map(([category, amount]) => (

              <div
                className="category-row"
                key={category}
              >

                <span>
                  {category}
                </span>

                <strong>
                  ₹
                  {Number(
                    amount || 0
                  ).toLocaleString("en-IN")}
                </strong>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* BUDGET STATUS */}

      <div className="dashboard-section">

        <h2>Budget vs Actual</h2>

        {dashboard.budget_status?.length === 0 ? (

          <p>
            No budget information available.
          </p>

        ) : (

          <div className="budget-list">

            {(dashboard.budget_status || []).map(
              (item) => (

                <div
                  className="budget-item"
                  key={item.category}
                >

                  <div className="budget-header">

                    <span>
                      {item.category}
                    </span>

                    <span>
                      ₹
                      {Number(
                        item.spent || 0
                      ).toLocaleString(
                        "en-IN"
                      )}

                      {" / "}

                      ₹
                      {Number(
                        item.budget || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>


                  <div className="budget-bar">

                    <div
                      className="budget-progress"
                      style={{
                        width: `${Math.min(
                          Number(
                            item.percentage_used || 0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>


                  <small>

                    {Number(
                      item.percentage_used || 0
                    ).toFixed(1)}

                    % used

                    {" • "}

                    ₹
                    {Math.abs(
                      Number(
                        item.remaining || 0
                      )
                    ).toLocaleString(
                      "en-IN"
                    )}

                    {Number(
                      item.remaining || 0
                    ) >= 0
                      ? " remaining"
                      : " over budget"}

                  </small>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* RECENT EXPENSES */}

      <div className="dashboard-section">

        <h2>Recent Expenses</h2>

        {dashboard.recent_expenses?.length === 0 ? (

          <p>
            No expenses recorded yet.
          </p>

        ) : (

          <div className="expense-table">

            <div className="expense-table-header">

              <span>
                Description
              </span>

              <span>
                Category
              </span>

              <span>
                Date
              </span>

              <span>
                Amount
              </span>

            </div>


            {(dashboard.recent_expenses || []).map(
              (expense) => (

                <div
                  className="expense-row"
                  key={expense.id}
                >

                  <span>
                    {expense.description ||
                      "Expense"}
                  </span>

                  <span>
                    {expense.category}
                  </span>

                  <span>
                    {expense.expense_date
                      ? new Date(
                          expense.expense_date
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </span>

                  <strong>
                    ₹
                    {Number(
                      expense.amount || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Dashboard;