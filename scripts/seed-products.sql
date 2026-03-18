-- Seed products for existing suppliers
-- Get supplier IDs first, then insert products

DO $$
DECLARE
  v_kalahari UUID;
  v_zimequip UUID;
  v_tanzalog UUID;
  v_agroprocess UUID;
  v_farmtech UUID;
  v_agrifin UUID;
  v_greenharv UUID;
BEGIN
  SELECT id INTO v_kalahari FROM suppliers WHERE company_name = 'Kalahari Seeds' LIMIT 1;
  SELECT id INTO v_zimequip FROM suppliers WHERE company_name = 'ZimEquip Solutions' LIMIT 1;
  SELECT id INTO v_tanzalog FROM suppliers WHERE company_name = 'TanzaLogistics' LIMIT 1;
  SELECT id INTO v_agroprocess FROM suppliers WHERE company_name = 'AgroProcess BW' LIMIT 1;
  SELECT id INTO v_farmtech FROM suppliers WHERE company_name = 'FarmTech Africa' LIMIT 1;
  SELECT id INTO v_agrifin FROM suppliers WHERE company_name = 'Agri Finance Corp' LIMIT 1;
  SELECT id INTO v_greenharv FROM suppliers WHERE company_name = 'Green Harvest Seeds' LIMIT 1;

  -- Kalahari Seeds products
  IF v_kalahari IS NOT NULL THEN
    INSERT INTO products (supplier_id, name, description, category, price, member_price, discount_percent, unit, image_url, in_stock, stock_quantity, sold_count, rating, review_count, featured, tags) VALUES
    (v_kalahari, 'Hybrid Maize Seed SC513 (25kg)', 'Drought-resistant hybrid maize seed with 95%+ germination rate. Ideal for Southern African climates. Matures in 120-140 days.', 'input-supplier', 185.00, 157.25, 15, 'bag', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop', true, 500, 342, 4.8, 89, true, ARRAY['maize','seeds','hybrid','drought-resistant']),
    (v_kalahari, 'NPK Fertilizer 2:3:4 (50kg)', 'Balanced NPK fertilizer for optimal crop nutrition. Suitable for maize, sorghum, and legumes.', 'input-supplier', 95.00, 80.75, 15, 'bag', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', true, 1200, 567, 4.6, 124, false, ARRAY['fertilizer','npk','nutrition']),
    (v_kalahari, 'Organic Compost Blend (25kg)', 'Premium organic compost made from locally sourced materials. Improves soil structure and water retention.', 'input-supplier', 45.00, 38.25, 15, 'bag', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop', true, 800, 203, 4.5, 56, false, ARRAY['organic','compost','soil']),
    (v_kalahari, 'Sorghum Seed PAN 8816 (20kg)', 'High-yield sorghum variety suited to semi-arid conditions. Early maturing at 90-100 days.', 'input-supplier', 120.00, 102.00, 15, 'bag', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', true, 350, 156, 4.7, 42, true, ARRAY['sorghum','seeds','semi-arid']);
  END IF;

  -- ZimEquip Solutions products
  IF v_zimequip IS NOT NULL THEN
    INSERT INTO products (supplier_id, name, description, category, price, member_price, discount_percent, unit, image_url, in_stock, stock_quantity, sold_count, rating, review_count, featured, tags) VALUES
    (v_zimequip, 'Solar Water Pump 3HP', 'Solar-powered submersible water pump. Ideal for irrigation and livestock watering. Includes 6 solar panels.', 'equipment', 2450.00, 2156.00, 12, 'unit', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop', true, 25, 48, 4.9, 31, true, ARRAY['solar','pump','irrigation']),
    (v_zimequip, 'Drip Irrigation Kit (1 Hectare)', 'Complete drip irrigation system for 1 hectare. Includes mainline, laterals, drippers, and fittings.', 'equipment', 1850.00, 1628.00, 12, 'kit', 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop', true, 40, 72, 4.7, 45, true, ARRAY['irrigation','drip','water-efficient']),
    (v_zimequip, 'Backpack Sprayer 20L', 'Professional-grade manual backpack sprayer. Adjustable nozzle for various spray patterns.', 'equipment', 85.00, 74.80, 12, 'unit', 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400&h=300&fit=crop', true, 150, 234, 4.4, 67, false, ARRAY['sprayer','pest-control','manual']),
    (v_zimequip, 'Hand Planter Pro', 'Precision hand planter for direct seeding. Works with maize, beans, and groundnuts.', 'equipment', 65.00, 57.20, 12, 'unit', 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=400&h=300&fit=crop', true, 200, 189, 4.3, 52, false, ARRAY['planter','seeding','manual']);
  END IF;

  -- TanzaLogistics products
  IF v_tanzalog IS NOT NULL THEN
    INSERT INTO products (supplier_id, name, description, category, price, member_price, discount_percent, unit, image_url, in_stock, stock_quantity, sold_count, rating, review_count, featured, tags) VALUES
    (v_tanzalog, 'Cold Chain Transport (per tonne)', 'Temperature-controlled transport for perishable agricultural products. GPS-tracked fleet.', 'logistics', 320.00, 288.00, 10, 'tonne', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop', true, 0, 890, 4.8, 156, true, ARRAY['cold-chain','transport','perishable']),
    (v_tanzalog, 'Grain Haulage (per tonne)', 'Bulk grain transport across East Africa. Covered trucks with moisture protection.', 'logistics', 180.00, 162.00, 10, 'tonne', 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400&h=300&fit=crop', true, 0, 1240, 4.7, 198, false, ARRAY['grain','haulage','bulk']),
    (v_tanzalog, 'Warehouse Storage (monthly per tonne)', 'Secure warehouse storage with pest control and moisture management. 24/7 security.', 'logistics', 45.00, 40.50, 10, 'tonne/month', 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=400&h=300&fit=crop', true, 0, 567, 4.6, 89, false, ARRAY['storage','warehouse','secure']);
  END IF;

  -- AgroProcess BW products
  IF v_agroprocess IS NOT NULL THEN
    INSERT INTO products (supplier_id, name, description, category, price, member_price, discount_percent, unit, image_url, in_stock, stock_quantity, sold_count, rating, review_count, featured, tags) VALUES
    (v_agroprocess, 'Grain Milling Service (per tonne)', 'Professional grain milling to specification. Maize meal, sorghum flour, and custom blends.', 'processing', 150.00, 123.00, 18, 'tonne', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop', true, 0, 420, 4.7, 78, true, ARRAY['milling','grain','processing']),
    (v_agroprocess, 'Oil Extraction Service (per tonne)', 'Cold-press and solvent extraction for sunflower, soybean, and groundnut oils.', 'processing', 280.00, 229.60, 18, 'tonne', 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=400&h=300&fit=crop', true, 0, 210, 4.6, 45, false, ARRAY['oil','extraction','cold-press']),
    (v_agroprocess, 'Hermetic Storage Bags (50 pack)', 'Triple-layer hermetic bags for grain storage. Prevents insect damage without chemicals. 50kg capacity each.', 'processing', 125.00, 102.50, 18, 'pack', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop', true, 300, 345, 4.8, 92, true, ARRAY['storage','hermetic','pest-free']);
  END IF;

  -- FarmTech Africa products
  IF v_farmtech IS NOT NULL THEN
    INSERT INTO products (supplier_id, name, description, category, price, member_price, discount_percent, unit, image_url, in_stock, stock_quantity, sold_count, rating, review_count, featured, tags) VALUES
    (v_farmtech, 'IoT Soil Sensor Kit (5-pack)', 'Wireless soil moisture, pH, and temperature sensors. Solar-powered with mobile app dashboard.', 'technology', 890.00, 712.00, 20, 'kit', 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=400&h=300&fit=crop', true, 60, 89, 4.6, 34, true, ARRAY['iot','sensors','soil','smart-farming']),
    (v_farmtech, 'Drone Mapping Service (per hectare)', 'NDVI crop health analysis via drone. Includes detailed report with recommendations.', 'technology', 35.00, 28.00, 20, 'hectare', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop', true, 0, 156, 4.5, 28, false, ARRAY['drone','mapping','ndvi','crop-health']),
    (v_farmtech, 'Weather Station Pro', 'Solar-powered weather station with rain gauge, wind speed, humidity, and temperature. WiFi-enabled.', 'technology', 650.00, 520.00, 20, 'unit', 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop', true, 30, 67, 4.7, 22, true, ARRAY['weather','station','monitoring']);
  END IF;

  -- Agri Finance Corp products
  IF v_agrifin IS NOT NULL THEN
    INSERT INTO products (supplier_id, name, description, category, price, member_price, discount_percent, unit, image_url, in_stock, stock_quantity, sold_count, rating, review_count, featured, tags) VALUES
    (v_agrifin, 'Crop Insurance Plan (per hectare/season)', 'Comprehensive crop insurance covering drought, flood, pest, and disease. Index-based payout.', 'financial-services', 45.00, 41.40, 8, 'hectare/season', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop', true, 0, 1240, 4.9, 234, true, ARRAY['insurance','crop','protection']),
    (v_agrifin, 'Input Finance Package', 'Pre-approved input financing up to $5,000 per season. Repay at harvest. 12% APR.', 'financial-services', 0.00, 0.00, 0, 'application', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop', true, 0, 890, 4.8, 167, true, ARRAY['finance','inputs','loan','seasonal']);
  END IF;

  -- Green Harvest Seeds products
  IF v_greenharv IS NOT NULL THEN
    INSERT INTO products (supplier_id, name, description, category, price, member_price, discount_percent, unit, image_url, in_stock, stock_quantity, sold_count, rating, review_count, featured, tags) VALUES
    (v_greenharv, 'Cowpea Seed IT18 (10kg)', 'High-protein cowpea variety. Excellent nitrogen fixer. Matures in 65-75 days.', 'input-supplier', 55.00, 48.40, 12, 'bag', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', true, 400, 178, 4.4, 38, false, ARRAY['cowpea','seeds','legume','nitrogen-fixing']),
    (v_greenharv, 'Groundnut Seed Nyanda (15kg)', 'Virginia-type groundnut with high oil content. Resistant to rosette virus.', 'input-supplier', 78.00, 68.64, 12, 'bag', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop', true, 250, 134, 4.5, 29, false, ARRAY['groundnut','seeds','oil-crop']),
    (v_greenharv, 'Foliar Spray Concentrate (5L)', 'Micronutrient foliar spray with zinc, boron, and manganese. For all crop types.', 'input-supplier', 38.00, 33.44, 12, 'bottle', 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400&h=300&fit=crop', true, 600, 245, 4.3, 51, false, ARRAY['foliar','spray','micronutrient']);
  END IF;

  -- Update product counts on suppliers
  UPDATE suppliers SET products_count = (SELECT count(*) FROM products WHERE products.supplier_id = suppliers.id);
END $$;
