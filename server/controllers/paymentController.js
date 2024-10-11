const { createPremiumPlan, paypal } = require("../config/paypal");
const User = require("../models/user");

// Check subscription status
exports.subscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { subscription } = user;
    res.status(200).json({
      subscriptionType: subscription.type,
      status: subscription.status,
      startDate: subscription.startDate,
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create PayPal payment for monthly subscription
exports.createPayment = async (req, res) => {
  try {
    const planId = await createPremiumPlan();

    const billingAgreementAttributes = {
      name: "JobHive Premium Subscription",
      description: "Monthly subscription for JobHive Premium features",
      start_date: new Date(Date.now() + 10000).toISOString(),
      plan: {
        id: planId,
      },
      payer: {
        payment_method: "paypal",
      },
    };

    paypal.billingAgreement.create(
      billingAgreementAttributes,
      (error, billingAgreement) => {
        if (error) {
          console.error("Error creating PayPal agreement:", error);
          return res
            .status(500)
            .json({ error: "Error creating PayPal agreement" });
        }

        const approvalUrl = billingAgreement.links.find(
          (link) => link.rel === "approval_url"
        ).href;
        res.json({ approvalUrl });
      }
    );
  } catch (error) {
    console.error("Error in create-payment route:", error);
    res.status(500).json({ error: "Error creating payment" });
  }
};

// Execute payment and activate subscription
exports.executePayment = async (req, res) => {
  const { token } = req.body;

  try {
    paypal.billingAgreement.execute(
      token,
      {},
      async (error, billingAgreement) => {
        if (error) {
          console.error("Error executing PayPal payment:", error);
          return res.status(500).json({ error: "Payment execution failed" });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.subscription = {
          type: "JobHive Premium",
          status: "active",
          startDate: new Date(),
          agreementId: billingAgreement.id,
        };

        await user.save();
        res.json({
          message: "Payment executed successfully",
          billingAgreement,
        });
      }
    );
  } catch (error) {
    console.error("Error in execute-payment route:", error);
    res.status(500).json({ error: "Payment execution failed" });
  }
};

// Downgrade subscription
exports.downgradeSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (
      user.subscription.type !== "JobHive Premium" ||
      user.subscription.status !== "active"
    ) {
      return res
        .status(400)
        .json({ error: "No active JobHive Premium subscription to downgrade" });
    }

    const agreementId = user.subscription.agreementId;
    if (!agreementId) {
      return res
        .status(400)
        .json({ error: "No active PayPal agreement to cancel" });
    }

    paypal.billingAgreement.cancel(
      agreementId,
      { note: "User downgrade" },
      async (error) => {
        if (error) {
          console.error("Error canceling PayPal agreement:", error);
          return res
            .status(500)
            .json({ error: "Failed to cancel PayPal agreement" });
        }

        user.subscription.type = "Free";
        user.subscription.status = "canceled";
        user.subscription.agreementId = undefined;

        await user.save();
        res.json({
          message:
            "Subscription downgraded and PayPal agreement canceled successfully.",
          subscription: user.subscription,
        });
      }
    );
  } catch (error) {
    console.error("Error downgrading subscription:", error);
    res.status(500).json({ error: "Error downgrading subscription" });
  }
};

// Cancel route for PayPal to handle subscription cancellations
exports.cancelSubscription = async (req, res) => {
  console.log("PayPal subscription canceled:", req.body);
  const { resource } = req.body;
  const agreementId = resource.id;

  try {
    const user = await User.findOne({
      "subscription.agreementId": agreementId,
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.subscription.type = "Free";
    user.subscription.status = "canceled";
    user.subscription.agreementId = undefined;

    await user.save();
    res.json({
      message: "Subscription canceled successfully.",
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ error: "Error canceling subscription" });
  }
};
