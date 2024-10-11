const paypal = require("paypal-rest-sdk");

// Configure PayPal SDK
paypal.configure({
  mode: process.env.PAYPAL_MODE || "sandbox", // 'sandbox' or 'live'
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

// Create a plan for $5 NZD per month
const createAIPlan = () => {
  return new Promise((resolve, reject) => {
    const billingPlanAttributes = {
      name: "JobHive Premium",
      description:
        "Monthly subscription plan for users to access premium features",
      type: "INFINITE", // Use 'INFINITE' for continuous plans
      payment_definitions: [
        {
          name: "Premium Monthly Plan",
          type: "REGULAR",
          frequency: "MONTH",
          frequency_interval: "1", // Every 1 month
          amount: {
            currency: "NZD", // New Zealand Dollar
            value: "4.99", // Ensure this is a string
          },
          cycles: "0", // Use '0' for infinite cycles
        },
      ],
      merchant_preferences: {
        setup_fee: {
          value: "0.00", // Ensure correct format
          currency: "NZD",
        },
        auto_bill_amount: "YES", // Automatically charge monthly
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`, // Ensure these URLs are valid
        return_url: `${process.env.CLIENT_URL}/payment/success`,
        initial_fail_amount_action: "CONTINUE",
        max_fail_attempts: "1", // Number of failed attempts allowed
      },
    };

    // Create the plan
    paypal.billingPlan.create(billingPlanAttributes, (error, billingPlan) => {
      if (error) {
        console.error(
          "Error creating Premium subscription plan:",
          error.response
        );
        return reject(error);
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
              console.error("Error activating Premium plan:", error);
              return reject(error);
            } else {
              console.log(
                "Premium subscription plan activated successfully:",
                billingPlan.id
              );
              return resolve(billingPlan.id); // Return the active plan ID
            }
          }
        );
      }
    });
  });
};

// Export the function to create the plan
module.exports = { createAIPlan, paypal };
