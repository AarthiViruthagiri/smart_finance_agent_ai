import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

function FinancialProfile() {
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({
    monthly_income: "",
    emergency_fund_target: "",
    travel_budget: "",
    food_budget: "",
    accommodation_budget: "",
    electricity_budget: "",
    transport_budget: "",
    sip_amount: "",
    insurance_amount: "",
    recharge_amount: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      const token = await getToken();

      const data = {
        monthly_income: Number(formData.monthly_income),
        emergency_fund_target: Number(
          formData.emergency_fund_target
        ),
        travel_budget: Number(
          formData.travel_budget
        ),
        food_budget: Number(
          formData.food_budget
        ),
        accommodation_budget: Number(
          formData.accommodation_budget
        ),
        electricity_budget: Number(
          formData.electricity_budget
        ),
        transport_budget: Number(
          formData.transport_budget
        ),
        sip_amount: Number(
          formData.sip_amount
        ),
        insurance_amount: Number(
          formData.insurance_amount
        ),
        recharge_amount: Number(
          formData.recharge_amount
        ),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/financial-profile/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Profile saved:",
        response.data
      );

      setMessage(
        "Financial profile saved successfully!"
      );
    } catch (error) {
      console.error(
        "Failed to save profile:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Failed to save financial profile."
      );
    }
  };

  const fields = [
    ["monthly_income", "Monthly Income"],
    [
      "emergency_fund_target",
      "Emergency Fund Target",
    ],
    ["travel_budget", "Travel Budget"],
    ["food_budget", "Food Budget"],
    [
      "accommodation_budget",
      "Accommodation Budget",
    ],
    [
      "electricity_budget",
      "Electricity Budget",
    ],
    ["transport_budget", "Transport Budget"],
    ["sip_amount", "Monthly SIP"],
    ["insurance_amount", "Insurance"],
    ["recharge_amount", "Recharge"],
  ];

  return (
    <div>
      <h2>Financial Profile</h2>

      <p>
        Enter your monthly income and planned
        financial allocations.
      </p>

      <form onSubmit={saveProfile}>
        {fields.map(([name, label]) => (
          <div key={name}>
            <label>{label}</label>

            <input
              type="number"
              name={name}
              value={formData[name]}
              onChange={handleChange}
              placeholder="₹ 0"
              min="0"
              required
            />
          </div>
        ))}

        <button type="submit">
          Save Profile
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default FinancialProfile;