import csv
from django.core.management.base import BaseCommand
from django.db import IntegrityError
from dashboard_app.models import Listing

class Command(BaseCommand):
    help = 'Load data from CSV file into Listing model'

    def handle(self, *args, **kwargs):
        csv_file_path = 'data.csv'

        try:
            with open(csv_file_path, newline='', encoding='utf-8-sig') as csvfile:
                reader = csv.DictReader(csvfile, delimiter=',')
                for row in reader:
                    # Xử lý các giá trị số và chuỗi với try-except để tránh lỗi
                    try:
                        listing_id = int(row['index']) if row['index'] else None
                        # Kiểm tra xem id đã tồn tại chưa
                        if Listing.objects.filter(id=listing_id).exists():
                            self.stdout.write(self.style.WARNING(f"Skipping row with id {listing_id}: ID already exists"))
                            continue

                        accommodates = int(row['accommodates']) if row['accommodates'] else None
                        availability_30 = int(row['availability_30']) if row['availability_30'] else None
                        bathrooms = float(row['bathrooms']) if row['bathrooms'] else None
                        bedrooms = float(row['bedrooms']) if row['bedrooms'] else None
                        beds = float(row['beds']) if row['beds'] else None
                        calculated_host_listings_count = int(row['calculated_host_listings_count']) if row['calculated_host_listings_count'] else None
                        guests_included = int(row['guests_included']) if row['guests_included'] else None
                        host_listings_count = float(row['host_listings_count']) if row['host_listings_count'] else None
                        latitude = float(row['latitude(North)']) if row['latitude(North)'] else None
                        longitude = float(row['longitude(East)']) if row['longitude(East)'] else None
                        maximum_nights = int(row['maximum_nights']) if row['maximum_nights'] else None
                        number_of_reviews = int(row['number_of_reviews']) if row['number_of_reviews'] else None
                        review_scores_checkin = float(row['review_scores_checkin']) if row['review_scores_checkin'] else None
                        review_scores_communication = float(row['review_scores_communication']) if row['review_scores_communication'] else None
                        review_scores_location = float(row['review_scores_location']) if row['review_scores_location'] else None
                        review_scores_rating = float(row['review_scores_rating']) if row['review_scores_rating'] else None
                        review_scores_value = float(row['review_scores_value']) if row['review_scores_value'] else None
                        price = float(row['price']) if row['price'] else None
                    except ValueError as e:
                        self.stdout.write(self.style.WARNING(f"Error parsing numeric values in row {row['index']}: {e}"))
                        continue

                    # Tạo bản ghi Listing
                    try:
                        Listing.objects.create(
                            id=listing_id,
                            accommodates=accommodates,
                            availability_30=availability_30,
                            bathrooms=bathrooms,
                            bed_type=row['bed_type'] if row['bed_type'] else None,
                            bedrooms=bedrooms,
                            beds=beds,
                            calculated_host_listings_count=calculated_host_listings_count,
                            cancellation_policy=row['cancellation_policy'] if row['cancellation_policy'] else None,
                            guests_included=guests_included,
                            has_availability=row['has_availability'].lower() == 't',
                            host_is_superhost=row['host_is_superhost'].lower() == 't',
                            host_listings_count=host_listings_count,
                            instant_bookable=row['instant_bookable'].lower() == 't',
                            latitude=latitude,
                            longitude=longitude,
                            maximum_nights=maximum_nights,
                            number_of_reviews=number_of_reviews,
                            property_type=row['property_type'] if row['property_type'] else None,
                            review_scores_checkin=review_scores_checkin,
                            review_scores_communication=review_scores_communication,
                            review_scores_location=review_scores_location,
                            review_scores_rating=review_scores_rating,
                            review_scores_value=review_scores_value,
                            room_type=row['room_type'] if row['room_type'] else None,
                            price=price,
                            # Xử lý cột amenities
                            amenities_wireless_internet='Wireless Internet' in row['amenities'],
                            amenities_fire_extinguisher='Fire Extinguisher' in row['amenities'],
                            amenities_laptop_friendly_workspace='Laptop Friendly Workspace' in row['amenities'],
                            amenities_heating='Heating' in row['amenities'],
                            amenities_wheelchair_accessible='Wheelchair Accessible' in row['amenities'],
                            amenities_elevator_in_building='Elevator in Building' in row['amenities'],
                            amenities_dogs='Dog(s)' in row['amenities'],
                            amenities_cats='Cat(s)' in row['amenities'],
                            amenities_washer_dryer='Washer / Dryer' in row['amenities'],
                            amenities_smoking_allowed='Smoking Allowed' in row['amenities'],
                            amenities_first_aid_kit='First Aid Kit' in row['amenities'],
                            amenities_pets_live_on_this_property='Pets live on this property' in row['amenities'],
                            amenities_pool='Pool' in row['amenities'],
                            amenities_lock_on_bedroom_door='Lock on Bedroom Door' in row['amenities'],
                            amenities_smoke_detector='Smoke Detector' in row['amenities'],
                            amenities_shampoo='Shampoo' in row['amenities'],
                            amenities_buzzer_wireless_intercom='Buzzer/Wireless Intercom' in row['amenities'],
                            amenities_safety_card='Safety Card' in row['amenities'],
                            amenities_breakfast='Breakfast' in row['amenities'],
                            amenities_other_pets='Other pet(s)' in row['amenities'],
                            amenities_indoor_fireplace='Indoor Fireplace' in row['amenities'],
                            amenities_iron='Iron' in row['amenities'],
                            amenities_hair_dryer='Hair Dryer' in row['amenities'],
                            amenities_gym='Gym' in row['amenities'],
                            amenities_family_kid_friendly='Family/Kid Friendly' in row['amenities'],
                            amenities_internet='Internet' in row['amenities'],
                            amenities_hot_tub='Hot Tub' in row['amenities'],
                            amenities_washer='Washer' in row['amenities'],
                            amenities_dryer='Dryer' in row['amenities'],
                            amenities_pets_allowed='Pets Allowed' in row['amenities'],
                            amenities_24_hour_check_in='24-Hour Check-in' in row['amenities'],
                            amenities_cable_tv='Cable TV' in row['amenities'],
                            amenities_air_conditioning='Air Conditioning' in row['amenities'],
                            amenities_hangers='Hangers' in row['amenities'],
                            amenities_doorman='Doorman' in row['amenities'],
                            amenities_essentials='Essentials' in row['amenities'],
                            amenities_carbon_monoxide_detector='Carbon Monoxide Detector' in row['amenities'],
                            amenities_suitable_for_events='Suitable for Events' in row['amenities'],
                            amenities_free_parking_on_premises='Free Parking on Premises' in row['amenities'],
                            amenities_tv='TV' in row['amenities'],
                            amenities_kitchen='Kitchen' in row['amenities'],
                        )
                    except IntegrityError as e:
                        self.stdout.write(self.style.WARNING(f"Skipping row with id {listing_id}: {e}"))
                        continue
            self.stdout.write(self.style.SUCCESS('Successfully loaded data from CSV'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR('File data.csv not found'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error loading data: {e}'))