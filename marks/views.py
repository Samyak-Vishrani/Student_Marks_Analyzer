from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.db.models import Avg, Max, Min

from .models import Student, Teacher, Subject, Test, Score
from .serializers import (
    StudentSerializer, TeacherSerializer, SubjectSerializer,
    TestSerializer, ScoreSerializer, TestResultSerializer,
    StudentResultSerializer
)

from django.shortcuts import render

# Frontend views
def index(request):
    return render(request, 'index.html')

def student_dashboard(request):
    return render(request, 'student_dashboard.html')

def teacher_dashboard(request):
    return render(request, 'teacher_dashboard.html')

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    
    def get_queryset(self):
        queryset = Test.objects.all()
        subject_id = self.request.query_params.get('subject')
        class_name = self.request.query_params.get('class')
        
        if subject_id:
            queryset = queryset.filter(subject__id=subject_id)
        if class_name:
            queryset = queryset.filter(class_name=class_name)
            
        return queryset

class ScoreViewSet(viewsets.ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer
    
    def get_queryset(self):
        queryset = Score.objects.all()
        test_id = self.request.query_params.get('test')
        student_id = self.request.query_params.get('student')
        
        if test_id:
            queryset = queryset.filter(test__id=test_id)
        if student_id:
            queryset = queryset.filter(student__sapid=student_id)
            
        return queryset

@api_view(['GET'])
def test_results(request, test_id):
    try:
        test = Test.objects.get(id=test_id)
    except Test.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    serializer = TestResultSerializer(test)
    return Response(serializer.data)

@api_view(['GET'])
def student_results(request, student_id):
    try:
        student = Student.objects.get(sapid=student_id)
    except Student.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    serializer = StudentResultSerializer(student)
    return Response(serializer.data)

@api_view(['POST'])
def student_login(request):
    sapid = request.data.get('sapid')
    password = request.data.get('password')
    
    try:
        student = Student.objects.get(sapid=sapid, password=password)
        serializer = StudentSerializer(student)
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def teacher_login(request):
    sapid = request.data.get('sapid')
    password = request.data.get('password')
    
    try:
        teacher = Teacher.objects.get(sapid=sapid, password=password)
        serializer = TeacherSerializer(teacher)
        return Response(serializer.data)
    except Teacher.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def test_statistics(request, test_id):
    try:
        test = Test.objects.get(id=test_id)
    except Test.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    scores = Score.objects.filter(test=test)
    total_students = scores.count()
    passed_students = scores.filter(is_pass=True).count()
    
    if total_students > 0:
        pass_percentage = (passed_students / total_students) * 100
    else:
        pass_percentage = 0
    
    stats = {
        'test_id': test.id,
        'test_name': test.name,
        'subject': test.subject.name,
        'total_students': total_students,
        'passed_students': passed_students,
        'failed_students': total_students - passed_students,
        'pass_percentage': pass_percentage,
        'highest_score': scores.aggregate(Max('score'))['score__max'] if total_students > 0 else 0,
        'lowest_score': scores.aggregate(Min('score'))['score__min'] if total_students > 0 else 0,
        'average_score': scores.aggregate(Avg('score'))['score__avg'] if total_students > 0 else 0,
    }
    
    return Response(stats)