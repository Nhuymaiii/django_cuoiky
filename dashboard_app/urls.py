from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='home'),  # Trang mặc định là dashboard
    path('dashboard/', views.dashboard, name='dashboard'),
    path('listings/', views.listing_list, name='listing_list'),
]