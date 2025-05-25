from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('dashboard_app.urls')),  # Tích hợp URL của ứng dụng dashboard_app
]