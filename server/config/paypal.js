const paypal = require("paypal-rest-sdk");

// Configure PayPal SDK
paypal.configure({
  mode: process.env.PAYPAL_MODE || "sandbox", // 'sandbox' or 'live'
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

// Create a plan for $5 NZD per month
const createAIPlan = () => {
  const billingPlanAttributes = {
    name: "AI Features for Employers",
    description:
      "Monthly subscription plan for employers to access AI features",
    type: "fixed", // Fixed subscription plan
    payment_definitions: [
      {
        name: "AI Monthly Plan",
        type: "REGULAR",
        frequency: "MONTH",
        frequency_interval: "1", // Every 1 month
        amount: {
          currency: "NZD", // New Zealand Dollar
          value: "5.00", // $5 per month
        },
        cycles: "12",
      },
    ],
    merchant_preferences: {
      auto_bill_amount: "YES",
      cancel_url: `${process.env.CLIENT_URL}/cancel`, // Full URLs required
      return_url: `${process.env.CLIENT_URL}/success`,
      initial_fail_amount_action: "CONTINUE",
      max_fail_attempts: "1", // Number of failed attempts allowed
    },
  };

  // Create the plan
  paypal.billingPlan.create(billingPlanAttributes, (error, billingPlan) => {
    if (error) {
      console.error("Error creating AI subscription plan:", error.response);
    } else {
      // Activate the plan
      const billingPlanUpdateAttributes = [
        {
          op: "replace",
          path: "/",
          value: {
            state: "ACTIVE", // Activate the plan
          },
        },
      ];

      paypal.billingPlan.update(
        billingPlan.id,
        billingPlanUpdateAttributes,
        (error, response) => {
          if (error) {
            console.error("Error activating AI plan:", error);
          } else {
            console.log(
              "AI subscription plan activated successfully:",
              billingPlan.id
            );
          }
        }
      );
    }
  });
};

// Export the function to create the plan
module.exports = createAIPlan;
