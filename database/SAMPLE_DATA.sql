-- ============================================
-- ROOMAC Co-Living Management System
-- Complete Sample Data Import
-- ============================================

-- ============================================
-- 1. PROPERTIES DATA
-- ============================================

INSERT INTO properties (id, name, address, city, state, pincode, total_rooms, occupied_rooms, manager_name, manager_phone, manager_email, amenities, rent_range, description, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ROOMAC Hinjawadi Premium', 'Phase 1, Hinjawadi', 'Pune', 'Maharashtra', '411057', 50, 15, 'Rajesh Kumar', '+919876543210', 'rajesh@roomac.com', '["WiFi", "Power Backup", "Security", "Parking", "Common Kitchen", "Laundry", "Gym"]', '₹7,000 - ₹15,000', 'Premium co-living space near IT companies', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'ROOMAC Viman Nagar', 'Near Airport Road', 'Pune', 'Maharashtra', '411014', 40, 12, 'Priya Sharma', '+919876543211', 'priya@roomac.com', '["WiFi", "Power Backup", "Security", "Parking", "Common Kitchen"]', '₹6,000 - ₹12,000', 'Affordable co-living near airport', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'ROOMAC Koramangala', 'Koramangala 4th Block', 'Bangalore', 'Karnataka', '560034', 60, 25, 'Amit Patel', '+919876543213', 'amit@roomac.com', '["WiFi", "Power Backup", "Security", "Parking", "Gym", "Cafeteria"]', '₹8,000 - ₹18,000', 'Modern co-living in tech hub', 'active');

-- ============================================
-- 2. ROOMS DATA
-- ============================================

INSERT INTO rooms (id, property_id, room_number, room_type, floor, rent_amount, deposit_amount, status, amenities, area_sqft, furnishing_status, ac_available, attached_bathroom, balcony) VALUES
-- Hinjawadi Property Rooms
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '101', 'single', '1st Floor', 10000.00, 10000.00, 'occupied', '["Bed", "Mattress", "Wardrobe", "Study Table", "Chair"]', 150, 'fully_furnished', true, true, false),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '102', 'single', '1st Floor', 9500.00, 9500.00, 'vacant', '["Bed", "Mattress", "Wardrobe", "Study Table"]', 140, 'fully_furnished', true, true, false),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '201', 'double', '2nd Floor', 12000.00, 15000.00, 'occupied', '["2 Beds", "Wardrobes", "Study Tables"]', 200, 'fully_furnished', true, true, true),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '202', 'single', '2nd Floor', 8500.00, 10000.00, 'occupied', '["Bed", "Mattress", "Wardrobe"]', 130, 'semi_furnished', false, true, false),

-- Viman Nagar Property Rooms
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '101', 'single', 'Ground Floor', 8000.00, 8000.00, 'vacant', '["Bed", "Mattress", "Wardrobe"]', 120, 'fully_furnished', false, true, false),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', '102', 'double', 'Ground Floor', 11000.00, 12000.00, 'vacant', '["2 Beds", "Wardrobes"]', 180, 'fully_furnished', true, true, false),

-- Koramangala Property Rooms
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', '301', 'deluxe', '3rd Floor', 18000.00, 20000.00, 'vacant', '["King Bed", "Wardrobe", "Study Table", "Sofa"]', 250, 'fully_furnished', true, true, true);

-- ============================================
-- 3. TENANTS DATA
-- ============================================

INSERT INTO tenants (id, name, email, phone, gender, date_of_birth, occupation, company_name, emergency_contact_name, emergency_contact_phone, permanent_address, id_proof_type, id_proof_number, status, portal_access_enabled, password) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Amit Sharma', 'amit.sharma@example.com', '+919876543212', 'male', '1995-06-15', 'Software Engineer', 'Tech Corp', 'Father Name', '+919876543200', '123 Main St, Delhi', 'aadhar', '1234-5678-9012', 'active', true, 'password123'),
('770e8400-e29b-41d4-a716-446655440002', 'Priya Singh', 'priya.singh@example.com', '+919876543214', 'female', '1997-03-22', 'Marketing Manager', 'Digital Solutions', 'Mother Name', '+919876543201', '456 Park Ave, Mumbai', 'pan', 'ABCDE1234F', 'active', true, 'password123'),
('770e8400-e29b-41d4-a716-446655440003', 'Rahul Verma', 'rahul.verma@example.com', '+919876543216', 'male', '1996-11-08', 'Data Analyst', 'Analytics Inc', 'Brother Name', '+919876543202', '789 Lake Rd, Bangalore', 'driving_license', 'MH01-2023-1234567', 'active', true, 'password123'),
('770e8400-e29b-41d4-a716-446655440004', 'Sneha Reddy', 'sneha.reddy@example.com', '+919876543217', 'female', '1998-07-19', 'UI Designer', 'Creative Studio', 'Sister Name', '+919876543203', '321 Hill View, Hyderabad', 'aadhar', '9876-5432-1098', 'active', true, 'password123'),
('770e8400-e29b-41d4-a716-446655440005', 'Vikram Joshi', 'vikram.joshi@example.com', '+919876543218', 'male', '1994-09-25', 'Business Analyst', 'Consulting Firm', 'Father Name', '+919876543204', '654 Garden St, Pune', 'passport', 'P1234567', 'active', true, 'password123');

-- ============================================
-- 4. BOOKINGS DATA
-- ============================================

INSERT INTO bookings (id, tenant_id, property_id, room_id, booking_date, move_in_date, rent_amount, deposit_amount, lock_in_period, notice_period, status) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-09-01', '2024-09-15', 10000.00, 10000.00, 90, 30, 'active'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', '2024-10-01', '2024-10-10', 12000.00, 15000.00, 90, 30, 'active'),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', '2024-10-15', '2024-11-01', 8500.00, 10000.00, 90, 30, 'active');

-- ============================================
-- 5. PAYMENTS DATA
-- ============================================

INSERT INTO payments (id, tenant_id, booking_id, payment_number, amount, payment_date, payment_type, payment_method, payment_month, status) VALUES
-- Amit Sharma's Payments
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'PAY-2024-0001', 10000.00, '2024-09-15', 'deposit', 'upi', NULL, 'completed'),
('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'PAY-2024-0002', 10000.00, '2024-10-05', 'rent', 'upi', '2024-10-01', 'completed'),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'PAY-2024-0003', 10000.00, '2024-11-05', 'rent', 'upi', '2024-11-01', 'completed'),
('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'PAY-2024-0005', 10000.00, '2024-12-05', 'rent', 'upi', '2024-12-01', 'completed'),

-- Priya Singh's Payments
('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 'PAY-2024-0006', 15000.00, '2024-10-10', 'deposit', 'bank_transfer', NULL, 'completed'),
('990e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 'PAY-2024-0007', 12000.00, '2024-11-05', 'rent', 'upi', '2024-11-01', 'completed'),
('990e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 'PAY-2024-0008', 12000.00, '2024-12-04', 'rent', 'upi', '2024-12-01', 'completed'),

-- Rahul Verma's Payments
('990e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 'PAY-2024-0009', 10000.00, '2024-11-01', 'deposit', 'cash', NULL, 'completed'),
('990e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 'PAY-2024-0010', 8500.00, '2024-11-05', 'rent', 'upi', '2024-11-01', 'completed'),
('990e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 'PAY-2024-0011', 8500.00, '2024-12-03', 'rent', 'upi', '2024-12-01', 'completed');

-- ============================================
-- 6. STAFF DATA
-- ============================================

INSERT INTO staff (id, name, email, phone, role, password, permissions, is_active) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'Admin User', 'admin@roomac.com', '+919876543220', 'admin', 'admin123', '{"all": true}', true),
('aa0e8400-e29b-41d4-a716-446655440002', 'Manager One', 'manager@roomac.com', '+919876543221', 'manager', 'manager123', '{"properties": true, "rooms": true, "tenants": true, "bookings": true, "payments": true}', true),
('aa0e8400-e29b-41d4-a716-446655440003', 'Accountant', 'accountant@roomac.com', '+919876543222', 'accountant', 'accountant123', '{"payments": true, "reports": true}', true);

-- ============================================
-- 7. COMPLAINTS DATA
-- ============================================

INSERT INTO complaints (id, tenant_id, property_id, room_id, title, description, category, priority, status) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'AC not cooling properly', 'The air conditioner in my room is not cooling properly. It has been 3 days now.', 'maintenance', 'high', 'open'),
('bb0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'Water pressure issue', 'Low water pressure in bathroom', 'maintenance', 'medium', 'open'),
('bb0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'Light not working', 'Bathroom light is not working', 'maintenance', 'medium', 'in_progress'),
('bb0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', 'Parking slot issue', 'Not getting assigned parking slot', 'amenities', 'low', 'resolved');

-- ============================================
-- 8. SYSTEM NOTIFICATIONS DATA
-- ============================================

INSERT INTO system_notifications (id, recipient_type, recipient_id, title, message, type, priority, is_read) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'tenant', '770e8400-e29b-41d4-a716-446655440001', 'Welcome to ROOMAC', 'Welcome to ROOMAC Hinjawadi Premium! We hope you have a great stay.', 'info', 'normal', false),
('cc0e8400-e29b-41d4-a716-446655440002', 'tenant', '770e8400-e29b-41d4-a716-446655440002', 'Welcome to ROOMAC', 'Welcome to ROOMAC Hinjawadi Premium!', 'info', 'normal', false),
('cc0e8400-e29b-41d4-a716-446655440003', 'tenant', '770e8400-e29b-41d4-a716-446655440002', 'Payment Received', 'Your rent payment of ₹12,000 has been received successfully.', 'success', 'normal', false),
('cc0e8400-e29b-41d4-a716-446655440004', 'tenant', '770e8400-e29b-41d4-a716-446655440002', 'Complaint Update', 'Your complaint regarding light has been assigned to maintenance team.', 'info', 'normal', true),
('cc0e8400-e29b-41d4-a716-446655440005', 'tenant', '770e8400-e29b-41d4-a716-446655440003', 'Welcome to ROOMAC', 'Welcome to ROOMAC Hinjawadi Premium!', 'info', 'normal', false),
('cc0e8400-e29b-41d4-a716-446655440006', 'tenant', '770e8400-e29b-41d4-a716-446655440003', 'Payment Received - December', 'Your December rent payment has been received.', 'success', 'normal', true),
('cc0e8400-e29b-41d4-a716-446655440007', 'tenant', '770e8400-e29b-41d4-a716-446655440003', 'Rent Due Reminder', 'Your rent for January 2025 is due on 5th.', 'warning', 'high', false);

-- ============================================
-- 9. ENQUIRIES DATA
-- ============================================

INSERT INTO enquiries (id, name, email, phone, property_id, preferred_room_type, expected_move_in_date, budget_range, message, status, source) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'Ankit Gupta', 'ankit.gupta@example.com', '+919876543230', '550e8400-e29b-41d4-a716-446655440001', 'single', '2025-01-15', '₹8,000 - ₹10,000', 'Looking for a single room with AC', 'new', 'website'),
('dd0e8400-e29b-41d4-a716-446655440002', 'Neha Kapoor', 'neha.kapoor@example.com', '+919876543231', '550e8400-e29b-41d4-a716-446655440001', 'double', '2025-02-01', '₹10,000 - ₹15,000', 'Need double occupancy room', 'contacted', 'phone'),
('dd0e8400-e29b-41d4-a716-446655440003', 'Rohit Mehta', 'rohit.mehta@example.com', '+919876543232', '550e8400-e29b-41d4-a716-446655440002', 'single', '2025-01-20', '₹7,000 - ₹9,000', 'Looking for affordable room', 'scheduled_visit', 'walk_in');

-- ============================================
-- 10. OFFERS DATA
-- ============================================

INSERT INTO offers (id, title, description, offer_type, discount_type, discount_value, applicable_to, valid_from, valid_to, terms_conditions, is_active) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'New Year Special - 20% Off', 'Get 20% off on your first month rent', 'rent_discount', 'percentage', 20.00, 'new_tenants', '2025-01-01', '2025-01-31', 'Valid for new bookings only', true),
('ee0e8400-e29b-41d4-a716-446655440002', 'Zero Deposit Offer', 'Move in with zero deposit for 3 months lock-in', 'zero_deposit', 'fixed', 0.00, 'new_tenants', '2025-01-01', '2025-02-28', 'Minimum 3 months stay required', true),
('ee0e8400-e29b-41d4-a716-446655440003', 'Referral Cashback', 'Get ₹1,000 cashback for every successful referral', 'cashback', 'fixed', 1000.00, 'existing_tenants', '2024-12-01', '2025-03-31', 'Referee must stay for min 3 months', true);

-- ============================================
-- 11. ADD-ONS DATA
-- ============================================

INSERT INTO addons (id, name, description, category, price, billing_cycle, is_active) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 'Breakfast Package', 'Daily breakfast - South Indian & North Indian options', 'food', 2500.00, 'monthly', true),
('ff0e8400-e29b-41d4-a716-446655440002', 'Laundry Service', 'Washing and ironing service', 'laundry', 500.00, 'monthly', true),
('ff0e8400-e29b-41d4-a716-446655440003', 'Bike Parking', 'Covered bike parking slot', 'parking', 300.00, 'monthly', true),
('ff0e8400-e29b-41d4-a716-446655440004', 'Car Parking', 'Covered car parking slot', 'parking', 1000.00, 'monthly', true),
('ff0e8400-e29b-41d4-a716-446655440005', 'Gym Membership', 'Access to in-house gym', 'gym', 800.00, 'monthly', true),
('ff0e8400-e29b-41d4-a716-446655440006', 'Housekeeping', 'Weekly room cleaning service', 'housekeeping', 600.00, 'monthly', true);

-- ============================================
-- 12. SETTINGS DATA
-- ============================================

INSERT INTO settings (id, site_name, site_tagline, contact_email, contact_phone, currency, currency_symbol, timezone) VALUES
('11111111-e29b-41d4-a716-446655440001', 'ROOMAC', 'Your Home Away From Home', 'info@roomac.com', '+919876543210', 'INR', '₹', 'Asia/Kolkata');

-- ============================================
-- 13. DOCUMENT TEMPLATES DATA
-- ============================================

INSERT INTO document_templates (name, type, description, fields, layout, is_active) VALUES
('Rent Receipt - Standard', 'receipt', 'Standard rent receipt template',
'[
  {"name": "receipt_number", "label": "Receipt Number", "type": "text", "required": true},
  {"name": "date", "label": "Date", "type": "date", "required": true},
  {"name": "tenant_name", "label": "Tenant Name", "type": "text", "required": true},
  {"name": "amount", "label": "Amount", "type": "number", "required": true},
  {"name": "payment_method", "label": "Payment Method", "type": "select", "options": ["Cash", "UPI", "Bank Transfer"], "required": true}
]'::jsonb,
'{"header": {"show": true, "includeImage": true}, "footer": {"show": true, "text": "Thank you"}, "colors": {"primary": "#2563eb"}}'::jsonb,
true);

-- ============================================
-- END OF SAMPLE DATA
-- ============================================
