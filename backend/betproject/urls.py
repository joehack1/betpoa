from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # support both with and without trailing slash to avoid POST -> redirect issues
    path('api/token', TokenObtainPairView.as_view(), name='token_obtain_pair_no_slash'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh', TokenRefreshView.as_view(), name='token_refresh_no_slash'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]