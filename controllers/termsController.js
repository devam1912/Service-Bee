export const acceptTerms = async (req, res) => {
  try {
    // works for both User and Company because req.user exists in your auth
    req.user.termsAccepted = true;
    req.user.termsAcceptedAt = new Date();
    await req.user.save();

    return res.json({ message: "Terms accepted" });
  } catch {
    return res.status(500).json({ message: "Failed to accept terms" });
  }
};

export const getTermsStatus = async (req, res) => {
  try {
    return res.json({
      termsAccepted: !!req.user.termsAccepted,
      termsAcceptedAt: req.user.termsAcceptedAt || null,
    });
  } catch {
    return res.status(500).json({ message: "Failed to get terms status" });
  }
};
