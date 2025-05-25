from django.shortcuts import render
from .models import Listing
from django.db.models import Count, Avg

def listing_list(request):
    listings = Listing.objects.all()
    return render(request, 'listings/listing_list.html', {'listings': listings})

def dashboard(request):
    # Lấy tất cả listings một lần duy nhất
    listings = Listing.objects.all()

    # Kiểm tra nếu không có dữ liệu
    if not listings.exists():
        return render(request, 'dashboard/dashboard.html', {
            'error': 'Không có dữ liệu để hiển thị dashboard. Vui lòng kiểm tra cơ sở dữ liệu.'
        })

    try:
        # Dữ liệu cho Q1: Số lượng listing theo property_type
        q1_data = listings.values('property_type').annotate(count=Count('property_type')).order_by()
        q1_values = [{'property_type': item['property_type'] if item['property_type'] else "Không xác định", 'count': item['count']} for item in q1_data]

        # Dữ liệu cho Q2: Số lượng listing theo room_type
        q2_data = listings.values('room_type').annotate(count=Count('room_type')).order_by()
        q2_values = [{'room_type': item['room_type'] if item['room_type'] else "Không xác định", 'count': item['count']} for item in q2_data]

        # Dữ liệu cho Q3: Số lượng listing theo price_range
        listings_with_price = listings.filter(price__gt=0).exclude(price__isnull=True)
        price_ranges = []
        for listing in listings_with_price:
            price = listing.price
            if price is None or price <= 0 or price >= 1000:
                price_range = "Không xác định"
            else:
                lower_bound = (int(price) // 100) * 100
                price_range = f"${lower_bound} - ${lower_bound + 99}"
            price_ranges.append({'price_range': price_range})

        q3_data = {}
        for item in price_ranges:
            if item['price_range'] not in q3_data:
                q3_data[item['price_range']] = 0
            q3_data[item['price_range']] += 1

        q3_values = [{'price_range': range, 'count': count} for range, count in q3_data.items()]
        q3_values.sort(key=lambda x: float(x['price_range'].replace('Không xác định', '9999').split('$')[1].split(' ')[0]) if x['price_range'] != "Không xác định" else float('inf'))

        # Dữ liệu cho Q4: Giá trung bình theo room_type
        q4_data = (listings.filter(room_type__isnull=False, price__gt=0)
                   .values('room_type')
                   .annotate(avg_price=Avg('price'))
                   .order_by())
        q4_values = [{'room_type': item['room_type'] if item['room_type'] else "Không xác định", 'avg_price': round(item['avg_price'] or 0, 2)} for item in q4_data]

        # Dữ liệu cho Q5: Số lượng theo cancellation_policy
        q5_data = (listings.filter(cancellation_policy__isnull=False)
                   .values('cancellation_policy')
                   .annotate(count=Count('cancellation_policy')))
        total_q5 = sum(item['count'] for item in q5_data) or 1  # Tránh chia cho 0
        q5_values = [{'policy': item['cancellation_policy'] if item['cancellation_policy'] else "Không xác định",
                      'count': item['count'],
                      'percent': round((item['count'] / total_q5) * 100, 2)}
                     for item in q5_data]

        # Dữ liệu cho Q6: Giá trung bình theo property_type (top 10)
        q6_data = (listings.values('property_type')
                   .annotate(avgPrice=Avg('price'))
                   .order_by('-avgPrice')[:10])
        q6_values = [{'type': item['property_type'] if item['property_type'] else "Không xác định", 'avgPrice': round(item['avgPrice'] or 0, 2)} for item in q6_data]

        # Dữ liệu cho Q7: Tỷ lệ nơi lưu trú có tiện ích an toàn
        total_count = listings.count() or 1  # Tránh chia cho 0
        safety_amenities = [
            {'name': "Smoke Detector", 'key': "amenities_smoke_detector"},
            {'name': "Safety Card", 'key': "amenities_safety_card"},
            {'name': "Carbon Monoxide Detector", 'key': "amenities_carbon_monoxide_detector"},
            {'name': "First Aid Kit", 'key': "amenities_first_aid_kit"},
            {'name': "Fire Extinguisher", 'key': "amenities_fire_extinguisher"},
        ]
        q7_values = []
        for amenity in safety_amenities:
            count = listings.filter(**{amenity['key']: True}).count()
            ratio = (count / total_count) * 100
            q7_values.append({
                'name': amenity['name'],
                'count': count,
                'ratio': round(ratio, 2)
            })
        q7_values.sort(key=lambda x: x['ratio'], reverse=True)

        # Dữ liệu cho Q8: Số lượng nơi lưu trú đã/chưa đặt
        booked_count = listings.filter(instant_bookable=True).count()
        not_booked_count = listings.filter(instant_bookable=False).count()
        q8_values = [{'booked_count': booked_count, 'not_booked_count': not_booked_count}]

        # Dữ liệu cho Q9: Số lượng nơi lưu trú theo review_scores_value
        q9_data = (listings.filter(review_scores_value__isnull=False)
                   .values('review_scores_value')
                   .annotate(count=Count('review_scores_value'))
                   .order_by('-review_scores_value'))
        q9_values = [{'score': str(item['review_scores_value']) if item['review_scores_value'] is not None else "Không xác định",
                      'count': item['count']}
                     for item in q9_data]

        # Dữ liệu cho Q10: Số lượng theo property_type (top 10)
        q10_data = (listings.values('property_type')
                    .annotate(count=Count('property_type'))
                    .order_by('-count')[:10])
        q10_values = [{'type': item['property_type'] if item['property_type'] else "Không xác định", 'count': item['count']} for item in q10_data]

        # Dữ liệu cho Q11: Số lượng nơi lưu trú theo host_is_superhost
        q11_data = (listings.filter(host_is_superhost__isnull=False)
                    .values('host_is_superhost')
                    .annotate(count=Count('host_is_superhost')))
        q11_values = []
        for item in q11_data:
            status = "Chưa" if item['host_is_superhost'] in [None, False] else "Rồi" if item['host_is_superhost'] == True else "None"
            q11_values.append({'status': status, 'count': item['count']})
        q11_values.sort(key=lambda x: x['status'], reverse=True)

        # Dữ liệu cho Q12: Số lượng nơi lưu trú theo tiện ích an toàn (tương tự q7_values)
        q12_values = q7_values  # Tái sử dụng q7_values nếu Q12 giống Q7

        # Dữ liệu cho Q13: Trung bình điểm theo property_type (top 15)
        q13_data = (listings.filter(review_scores_value__isnull=False)
                    .values('property_type')
                    .annotate(average=Avg('review_scores_value'))
                    .order_by('-average')[:15])
        q13_values = [{'type': item['property_type'] if item['property_type'] else "Không xác định",
                       'average': round(item['average'] or 0, 2)} for item in q13_data]

        # Dữ liệu cho Q14: Trung bình điểm theo room_type
        q14_data = (listings.filter(review_scores_value__isnull=False, room_type__isnull=False)
                    .values('room_type')
                    .annotate(average=Avg('review_scores_value'))
                    .order_by('-average'))
        q14_values = [{'room_type': item['room_type'] if item['room_type'] else "Không xác định",
                       'average': round(item['average'] or 0, 2)} for item in q14_data]

        # Dữ liệu cho Q15: Trung bình điểm theo cancellation_policy
        q15_data = (listings.filter(review_scores_value__isnull=False, cancellation_policy__isnull=False)
                    .values('cancellation_policy')
                    .annotate(average=Avg('review_scores_value'))
                    .order_by('-average'))
        q15_values = [{'policy': item['cancellation_policy'] if item['cancellation_policy'] else "Không xác định",
                       'average': round(item['average'] or 0, 2)} for item in q15_data]

        # Dữ liệu cho Q16: Số lượng nơi lưu trú theo accommodates (top 10)
        q16_data = (listings.filter(accommodates__isnull=False)
                    .values('accommodates')
                    .annotate(count=Count('accommodates'))
                    .order_by('-count')[:10])
        q16_values = [{'accommodates': str(item['accommodates']) if item['accommodates'] is not None else "Không xác định",
                       'count': item['count']} for item in q16_data]

        context = {
            'q1_values': q1_values if q1_values is not None else [],
            'q2_values': q2_values if q2_values is not None else [],
            'q3_values': q3_values if q3_values is not None else [],
            'q4_values': q4_values if q4_values is not None else [],
            'q5_values': q5_values if q5_values is not None else [],
            'q6_values': q6_values if q6_values is not None else [],
            'q7_values': q7_values if q7_values is not None else [],
            'q8_values': q8_values if q8_values is not None else [],
            'q9_values': q9_values if q9_values is not None else [],
            'q10_values': q10_values if q10_values is not None else [],
            'q11_values': q11_values if q11_values is not None else [],
            'q12_values': q12_values if q12_values is not None else [],
            'q13_values': q13_values if q13_values is not None else [],
            'q14_values': q14_values if q14_values is not None else [],
            'q15_values': q15_values if q15_values is not None else [],
            'q16_values': q16_values if q16_values is not None else [],
        }
        return render(request, 'dashboard/dashboard.html', context)

    except Exception as e:
        # Xử lý lỗi nếu có
        return render(request, 'dashboard/dashboard.html', {
            'error': f'Đã xảy ra lỗi khi xử lý dữ liệu: {str(e)}'
        })