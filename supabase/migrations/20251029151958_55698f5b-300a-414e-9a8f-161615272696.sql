-- Set correct ex-VAT price for merch bag so that inc VAT shows 89 kr (25% VAT)
UPDATE products
SET price = 71
WHERE title = 'Tygkasse, svart';