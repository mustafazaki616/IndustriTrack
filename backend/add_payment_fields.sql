-- Add missing payment fields to Payments table
ALTER TABLE Payments ADD COLUMN Currency TEXT;
ALTER TABLE Payments ADD COLUMN AdvanceReceived INTEGER DEFAULT 0;
ALTER TABLE Payments ADD COLUMN AdvanceDueDate TEXT;
ALTER TABLE Payments ADD COLUMN Remaining DECIMAL DEFAULT 0;
ALTER TABLE Payments ADD COLUMN DaysLeftForCompletePayment INTEGER;
ALTER TABLE Payments ADD COLUMN FullPaymentStartDate TEXT; 