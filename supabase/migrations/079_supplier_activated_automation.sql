-- Seed a default automation rule for supplier_activated trigger
-- When a supplier/partner is activated, this rule can send follow-up emails
INSERT INTO automation_rules (
  name,
  trigger_type,
  trigger_config,
  action_type,
  action_config,
  delay_minutes,
  is_active
) VALUES (
  'Supplier Activated — Welcome & Pricing Follow-up',
  'supplier_activated',
  '{}',
  'send_email',
  '{
    "subject": "Your AFU Partnership — Next Steps & Pricing",
    "body": "<h2>Hi {{name}},</h2><p>Thank you for joining African Farming Union as a partner! Your account is now active.</p><p>Our partnerships team will be in touch shortly with your tailored pricing proposal based on your needs and goals.</p><p>In the meantime, log into your <a href=\"https://africanfarmingunion.org/supplier\">Supplier Portal</a> to:</p><ul><li>Complete your company profile</li><li>Start listing your products and services</li><li>Explore the Exchange to post supply offers</li></ul><p>Questions? Reply to this email or contact us at <a href=\"mailto:partners@africanfarmingunion.org\">partners@africanfarmingunion.org</a>.</p><p>Welcome aboard!</p><p><strong>The AFU Team</strong></p>"
  }',
  0,
  true
) ON CONFLICT DO NOTHING;
