-- Insert tygkasse product with specific UUID
INSERT INTO products (
  id,
  title,
  description,
  price,
  image_url,
  category,
  in_stock,
  featured,
  sort_order
) VALUES (
  'f8e9d0c1-b2a3-4567-8901-234567890abc',
  'Tygkasse, svart',
  'Svart tygkasse med citat: "Men du, det finns bättre mål i livet än att dö duktig."',
  8900,
  'tygkasse-svart-1.jpg',
  'merch',
  true,
  false,
  100
);