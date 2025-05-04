from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'students', views.StudentViewSet)
router.register(r'teachers', views.TeacherViewSet)
router.register(r'subjects', views.SubjectViewSet)
router.register(r'tests', views.TestViewSet)
router.register(r'scores', views.ScoreViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('test-results/<int:test_id>/', views.test_results, name='test-results'),
    path('student-results/<str:student_id>/', views.student_results, name='student-results'),
    path('student-login/', views.student_login, name='student-login'),
    path('teacher-login/', views.teacher_login, name='teacher-login'),
    path('test-statistics/<int:test_id>/', views.test_statistics, name='test-statistics'),
]