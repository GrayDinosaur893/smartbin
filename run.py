import os
from werkzeug.security import generate_password_hash
from app import create_app
from app.database import db
from app.models.models import User, DriverProfile, Dustbin, Report, Task, MunicipalZone, SponsorOffer

app = create_app()

def seed_database():
    with app.app_context():
        # Ensure database tables exist in Neon PostgreSQL
        db.create_all()

        if MunicipalZone.query.count() > 0:
            print("[SmartBin] Neon PostgreSQL Database already initialized & seeded!")
            return

        print("[SmartBin] Seeding Chhattisgarh Municipal Corporations & City Zones...")

        # 1. Chhattisgarh Municipal Corporations Database
        cg_zones = [
            MunicipalZone(city_name="Durg", corporation_name="Durg Municipal Corporation", depot_lat=21.1904, depot_lng=81.2849, radius_km=25.0),
            MunicipalZone(city_name="Bhilai", corporation_name="Bhilai Municipal Corporation", depot_lat=21.2167, depot_lng=81.3833, radius_km=25.0),
            MunicipalZone(city_name="Raipur", corporation_name="Raipur Municipal Corporation", depot_lat=21.2514, depot_lng=81.6296, radius_km=30.0),
            MunicipalZone(city_name="Bilaspur", corporation_name="Bilaspur Municipal Corporation", depot_lat=22.0797, depot_lng=82.1391, radius_km=30.0),
            MunicipalZone(city_name="Korba", corporation_name="Korba Municipal Corporation", depot_lat=22.3595, depot_lng=82.7501, radius_km=25.0),
            MunicipalZone(city_name="Rajnandgaon", corporation_name="Rajnandgaon Municipal Corporation", depot_lat=21.1000, depot_lng=81.0333, radius_km=25.0),
        ]
        db.session.add_all(cg_zones)
        db.session.commit()

        # 2. Users (Admin, City Drivers, Citizens)
        admin = User(name="Municipal Admin", email="admin@smartbin.gov.in", password_hash=generate_password_hash("admin123"), role="admin", city_zone="Durg")
        
        driver_durg = User(name="Rajesh Kumar (Durg Driver)", email="driver.durg@smartbin.gov.in", phone="9876543210", password_hash=generate_password_hash("driver123"), role="driver", city_zone="Durg")
        driver_bilaspur = User(name="Suresh Sharma (Bilaspur Driver)", email="driver.bilaspur@smartbin.gov.in", phone="9876543211", password_hash=generate_password_hash("driver123"), role="driver", city_zone="Bilaspur")
        driver_raipur = User(name="Amit Patel (Raipur Driver)", email="driver.raipur@smartbin.gov.in", phone="9876543212", password_hash=generate_password_hash("driver123"), role="driver", city_zone="Raipur")
        
        # Legacy fallback email for single-login testing
        driver_default = User(name="Rajesh Kumar (Driver)", email="driver@smartbin.gov.in", phone="9876543210", password_hash=generate_password_hash("driver123"), role="driver", city_zone="Durg")

        citizen = User(name="Divyansh (Citizen)", email="citizen@smartbin.gov.in", phone="9123456789", password_hash=generate_password_hash("citizen123"), role="citizen", city_zone="Durg", eco_points=250, cash_wallet_balance=2.50)

        db.session.add_all([admin, driver_durg, driver_bilaspur, driver_raipur, driver_default, citizen])
        db.session.commit()

        # Driver Profiles assigned to City Municipal Corporations
        db.session.add_all([
            DriverProfile(user_id=driver_durg.id, vehicle_number="CG-07-G-1042", vehicle_type="Garbage Truck 4T", assigned_zone="Durg Municipal Corporation", city_name="Durg", shift_status="on_duty"),
            DriverProfile(user_id=driver_bilaspur.id, vehicle_number="CG-10-G-2080", vehicle_type="Garbage Truck 6T", assigned_zone="Bilaspur Municipal Corporation", city_name="Bilaspur", shift_status="on_duty"),
            DriverProfile(user_id=driver_raipur.id, vehicle_number="CG-04-G-3050", vehicle_type="Garbage Truck 4T", assigned_zone="Raipur Municipal Corporation", city_name="Raipur", shift_status="on_duty"),
            DriverProfile(user_id=driver_default.id, vehicle_number="CG-07-G-1042", vehicle_type="Garbage Truck 4T", assigned_zone="Durg Municipal Corporation", city_name="Durg", shift_status="on_duty")
        ])
        db.session.commit()

        # 3. Official Registered Dustbins per City
        bins = [
            Dustbin(bin_code="BIN-DURG-101", city_name="Durg", location_name="Nehru Nagar Main Market, Durg", latitude=21.1945, longitude=81.2890, capacity_liters=500),
            Dustbin(bin_code="BIN-DURG-102", city_name="Durg", location_name="Durg Bus Stand Circle", latitude=21.1904, longitude=81.2849, capacity_liters=750),
            Dustbin(bin_code="BIN-BSP-101", city_name="Bilaspur", location_name="Bilaspur Railway Station Road", latitude=22.0797, longitude=82.1391, capacity_liters=750),
            Dustbin(bin_code="BIN-RPR-101", city_name="Raipur", location_name="Clock Tower, Jaistambh Chowk, Raipur", latitude=21.2514, longitude=81.6296, capacity_liters=1000)
        ]
        db.session.add_all(bins)
        db.session.commit()

        # 4. Sample Reports per City Zone
        reports = [
            Report(report_code="#SB1042", citizen_id=citizen.id, city_name="Durg", image_path="uploads/demo_overflow.jpg", gps_lat_detected=21.1945, gps_lng_detected=81.2890, gps_lat_user=21.1945, gps_lng_user=81.2890, user_notes="Durg bin overflow", status="verified", waste_type="Overflowing Bin Waste", severity="high", is_illegal_dumping=False, ai_confidence=94.5),
            Report(report_code="#SB1043", citizen_id=citizen.id, city_name="Durg", image_path="uploads/demo_dumping.jpg", gps_lat_detected=21.2050, gps_lng_detected=81.3020, gps_lat_user=21.2050, gps_lng_user=81.3020, user_notes="Durg illegal dumping", status="verified", waste_type="Illegal Dumping / Construction Debris", severity="high", is_illegal_dumping=True, ai_confidence=97.2),
            Report(report_code="#SB2010", citizen_id=citizen.id, city_name="Bilaspur", image_path="uploads/demo_overflow.jpg", gps_lat_detected=22.0810, gps_lng_detected=82.1400, gps_lat_user=22.0810, gps_lng_user=82.1400, user_notes="Bilaspur market waste", status="verified", waste_type="Market Waste Heap", severity="high", is_illegal_dumping=False, ai_confidence=92.0),
        ]
        db.session.add_all(reports)
        db.session.commit()

        # 5. Corporate Sponsors & CSR Subsidies
        sponsors = [
            SponsorOffer(
                company_name="Jindal Steel & Power CSR",
                contact_email="csr@jindalsteel.com",
                offer_title="₹1,000 Solar Rooftop Subsidy Voucher",
                offer_type="CSR Subsidy",
                description="CSR Clean Energy Grant for active eco-citizens in Chhattisgarh. Valid for rooftop solar installation.",
                city_scope="All Chhattisgarh",
                points_required=100,
                voucher_code_prefix="JINDAL-SOLAR-"
            ),
            SponsorOffer(
                company_name="Tata Power EV CG",
                contact_email="ev.chhattisgarh@tatapower.com",
                offer_title="Free 25km EV Charging Voucher",
                offer_type="Voucher",
                description="Get 100% free charging for electric two-wheelers across Tata Power charging stations in Raipur, Durg & Bhilai.",
                city_scope="Raipur",
                points_required=50,
                voucher_code_prefix="TATA-EV-"
            ),
            SponsorOffer(
                company_name="Bhilai Eco Super Bazaar",
                contact_email="offers@bhilai-superbazaar.com",
                offer_title="15% Flat Discount on Organic Grocery & Cloth Bags",
                offer_type="Discount",
                description="Support plastic-free shopping in Bhilai & Durg. Show voucher at billing counter.",
                city_scope="Bhilai",
                points_required=30,
                voucher_code_prefix="BHILAI-ECO-"
            ),
            SponsorOffer(
                company_name="CG Green Bio-Composters Ltd.",
                contact_email="sales@cggreencompost.in",
                offer_title="₹200 Subsidy on Home Wet-Waste Composter Bin",
                offer_type="Subsidy",
                description="Turn kitchen waste into organic manure. Sponsored by CG Green Bio-Composters.",
                city_scope="Durg",
                points_required=40,
                voucher_code_prefix="CG-COMPOST-"
            ),
            SponsorOffer(
                company_name="Bilaspur City Express EV Bus",
                contact_email="transport@bilaspurexpress.in",
                offer_title="50% OFF Electric City Bus Monthly Pass",
                offer_type="Discount",
                description="Promoting green public transit in Bilaspur Municipal Corporation region.",
                city_scope="Bilaspur",
                points_required=25,
                voucher_code_prefix="BSP-EVBUS-"
            )
        ]
        db.session.add_all(sponsors)
        db.session.commit()

        print("[SmartBin] Chhattisgarh Municipal Corporations & Corporate Sponsors Seeded Successfully!")

if __name__ == '__main__':
    seed_database()
    print("[SmartBin] Starting Application Server on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
