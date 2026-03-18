INSERT INTO membership_applications (full_name, email, phone, country, region, farm_name, farm_size_ha, primary_crops, requested_tier, status)
VALUES
  ('Tendai Moyo', 'tendai@farmzw.co.zw', '+263 77 890 1234', 'Zimbabwe', 'Manicaland', 'Moyo Blueberry Estate', 45, ARRAY['Blueberries','Avocados','Macadamia'], 'commercial', 'pending'),
  ('Baraka Mwanga', 'baraka@kilicoffee.co.tz', '+255 78 456 7890', 'Tanzania', 'Kilimanjaro', 'Mwanga Coffee Farm', 8, ARRAY['Coffee','Vanilla'], 'smallholder', 'pending'),
  ('Peter Banda', 'peter@banda.co.bw', '+267 74 567 890', 'Botswana', 'North-East', 'Banda Grain Farm', 12, ARRAY['Sorghum','Cowpeas'], 'smallholder', 'pending'),
  ('Fatima Hassan', 'fatima@cashew.co.tz', '+255 75 678 9012', 'Tanzania', 'Lindi', 'Hassan Cashew Plantation', 35, ARRAY['Cashews','Sesame','Coconut'], 'farmer_grower', 'pending'),
  ('Blessing Chirwa', 'blessing@chirwa.co.zw', '+263 73 890 1234', 'Zimbabwe', 'Mashonaland', 'Chirwa Agricultural Corp', 120, ARRAY['Tobacco','Maize','Soybeans'], 'commercial', 'pending'),
  ('Grace Nyathi', 'grace@nyathi.co.zw', '+263 71 234 5678', 'Zimbabwe', 'Bulawayo', 'Nyathi Farm', 25, ARRAY['Maize','Groundnuts'], 'farmer_grower', 'approved'),
  ('Samuel Nkomo', 'samuel@nkomo.co.tz', '+255 76 345 6789', 'Tanzania', 'Dodoma', 'Nkomo Sesame Farm', 15, ARRAY['Sesame','Sunflower'], 'smallholder', 'approved'),
  ('Joseph Okello', 'joseph@okello.co.tz', '+255 77 456 7890', 'Tanzania', 'Mwanza', 'Okello Rice Farm', 5, ARRAY['Rice'], 'new_enterprise', 'rejected');
