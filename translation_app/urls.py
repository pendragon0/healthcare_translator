from django.urls import path
from .views import translate_text, index

urlpatterns = [
    path("", index, name="index"),
    path("translate/", translate_text, name="translate_text"),
]
