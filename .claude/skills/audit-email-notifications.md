# Email & Notification Auditor

Check every place in the platform that should send an email, SMS, or in-app notification — and verify it actually does.

## Every Event That Should Notify Someone

### Farmer Notifications
1. Application submitted → email to farmer (confirmation) + admin (new application)
2. Application approved → email to farmer (credentials) + SMS (credentials)
3. Application rejected → email to farmer (reason)
4. KYC approved → email + SMS to farmer
5. KYC rejected → email to farmer (reason + what to fix)
6. Loan approved → email + SMS to farmer
7. Loan rejected → email to farmer (reason)
8. Loan disbursed → email + SMS to farmer (amount + wallet balance)
9. Loan repayment due (7 days before) → SMS reminder
10. Loan repayment due (3 days before) → SMS reminder
11. Loan repayment due (today) → SMS reminder
12. Loan overdue → SMS + email to farmer + admin alert
13. Payment received → SMS to farmer (receipt)
14. Membership renewed → email to farmer
15. Insurance purchased → email to farmer (policy number)
16. Insurance payout triggered → SMS + email to farmer (amount)
17. Trade order status change → SMS to farmer
18. Trade quote received → SMS to farmer
19. Warehouse receipt issued → SMS to farmer
20. Carbon credit earned → email to farmer
21. Carbon payment received → SMS + email to farmer
22. Weather alert → SMS to farmer (if subscribed)

### Admin Notifications
23. New application → in-app notification
24. New KYC submission → in-app notification
25. New loan application → in-app notification
26. Large transaction (above threshold) → in-app + email
27. Transaction flag (AML) → in-app + email
28. New investor expression of interest → email to Devon + Peter
29. New trade order → in-app notification
30. Insurance trigger detected → in-app + email
31. System error (Sentry) → email to admin

### Ambassador Notifications
32. New referral signup → email + in-app
33. Commission earned → email + in-app
34. Payout processed → email + SMS

### Supplier Notifications
35. New order → email + in-app
36. Ad approved → email
37. Ad rejected → email (with reason)
38. Trade order matching their products → in-app

### Investor Notifications
39. Quarterly report available → email
40. Fund update → email
41. New opportunity → email

## How to audit
For each notification above:
1. Find the code path that should trigger it
2. Check if emitEvent() is called
3. Check if the event handler sends the notification
4. Check if the notification actually reaches the user (email/SMS/in-app)
5. If missing → recommend exactly where to add it and what code to write

## Output format
### Notifications Working:
| # | Event | Email | SMS | In-App | Status |

### Notifications Missing:
| # | Event | Should Send | Where to Add | Code Needed |

### Recommendations:
For each missing notification, provide:
- Exact file to modify
- Exact function to add the notification call
- Template suggestion for the message
